import { invoke } from '@tauri-apps/api/tauri'
import { open, save } from '@tauri-apps/api/dialog'
import { readBinaryFile } from '@tauri-apps/api/fs'
import { useDocumentStore } from '../store/useDocumentStore'
import { useRecentFilesStore } from '../store/useRecentFilesStore'
import { useToast } from './useToast'
import { useImportDOCX } from './useImportDOCX'
import { JSONContent } from '@tiptap/core'
import { markdownToJson as parseMarkdown, jsonToMarkdown as formatMarkdown, parseFrontmatter, serializeFrontmatter, NoteFrontmatter } from '../lib/markdownParser'
import { open as shellOpen } from '@tauri-apps/api/shell'

// Cache frontmatter pour les notes GoldoCab ouvertes
// Permet de preserver les metadonnees lors de la sauvegarde
const noteFrontmatterCache = new Map<string, NoteFrontmatter>()

// Notifier GoldoCab qu'une note a ete modifiee
async function notifyGoldocabNoteModified(filePath: string, noteId: string) {
  try {
    const url = `goldocab://note/modified?path=${encodeURIComponent(filePath)}&noteID=${noteId}`
    await shellOpen(url)
  } catch (err) {
    console.warn('[Citadelle] Notification GoldoCab echouee:', err)
  }
}

// Exporter le cache pour usage externe
export function getFrontmatterForDocument(documentId: string): NoteFrontmatter | undefined {
  return noteFrontmatterCache.get(documentId)
}

export function useFileOperations() {
  const addDocument = useDocumentStore((state) => state.addDocument)
  const setFilePath = useDocumentStore((state) => state.setFilePath)
  const markAsSaved = useDocumentStore((state) => state.markAsSaved)
  const addRecentFile = useRecentFilesStore((state) => state.addRecentFile)
  const toast = useToast()
  const { importDocx } = useImportDOCX()

  // Convert TipTap JSON to Markdown (using shared formatter)
  const jsonToMarkdown = (json: JSONContent): string => {
    return formatMarkdown(json)
  }

  // Convert Markdown to TipTap JSON (using shared parser)
  const markdownToJson = (markdown: string): JSONContent => {
    return parseMarkdown(markdown)
  }

  // Open file from dialog
  const openFile = async (): Promise<void> => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: 'Documents',
            extensions: ['txt', 'md', 'markdown', 'docx'],
          },
        ],
      })

      if (selected && typeof selected === 'string') {
        await openFileFromPath(selected)
      }
    } catch (error) {
      console.error('Error opening file:', error)
      toast.error(`Erreur lors de l'ouverture du fichier: ${error}`)
    }
  }

  // Open file from path (used by sidebar)
  const openFileFromPath = async (filePath: string): Promise<void> => {
    try {
      // Check if file is already open
      const documents = useDocumentStore.getState().documents
      const existingDoc = documents.find((doc) => doc.filePath === filePath)
      if (existingDoc) {
        useDocumentStore.getState().setActiveDocument(existingDoc.id)
        return
      }

      const fileName = filePath.split('/').pop() || 'Untitled'
      const extension = fileName.split('.').pop()?.toLowerCase()

      let jsonContent: JSONContent
      let preview: string

      // Handle DOCX files (binary) differently from text files
      if (extension === 'docx') {
        const binaryContent = await readBinaryFile(filePath)
        const imported = await importDocx(binaryContent.buffer as ArrayBuffer)
        if (!imported) return // Import failed, error already shown by hook
        jsonContent = imported
        preview = '[Document Word]'
      } else {
        // Text files (md, txt, etc.)
        const rawContent = await invoke<string>('read_file', { path: filePath })

        // Check for GoldoCab note frontmatter
        const { frontmatter, body } = parseFrontmatter(rawContent)
        const contentToParse = frontmatter ? body : rawContent
        jsonContent = markdownToJson(contentToParse)
        preview = contentToParse.substring(0, 100)

        // Store frontmatter in metadata if present
        if (frontmatter) {
          const id = addDocument({
            title: frontmatter.title || fileName,
            content: jsonContent,
            filePath: filePath,
            isDirty: false,
            metadata: {
              createdAt: frontmatter.createdAt,
              modifiedAt: frontmatter.updatedAt,
              tags: frontmatter.tags,
            },
          })
          // Store frontmatter reference for later save
          noteFrontmatterCache.set(id, frontmatter)
          markAsSaved(id)
          addRecentFile({ path: filePath, title: frontmatter.title || fileName, preview })
          return
        }
      }

      const id = addDocument({
        title: fileName,
        content: jsonContent,
        filePath: filePath,
        isDirty: false,
      })

      markAsSaved(id)

      // Add to recent files
      addRecentFile({
        path: filePath,
        title: fileName,
        preview,
      })
    } catch (error) {
      console.error('Error opening file:', error)
      toast.error(`Erreur lors de l'ouverture du fichier: ${error}`)
    }
  }

  // Save file
  const saveFile = async (documentId: string): Promise<void> => {
    try {
      const doc = useDocumentStore.getState().getDocument(documentId)
      if (!doc) return

      let filePath = doc.filePath

      // If no file path, prompt for Save As
      if (!filePath) {
        const selected = await save({
          defaultPath: doc.title.endsWith('.md') ? doc.title : `${doc.title}.md`,
          filters: [
            {
              name: 'Markdown',
              extensions: ['md', 'markdown'],
            },
            {
              name: 'Text',
              extensions: ['txt'],
            },
          ],
        })

        if (!selected) return // User cancelled
        filePath = selected
      }

      // Convert JSON to Markdown
      const markdown = jsonToMarkdown(doc.content)

      // Check if this document has frontmatter (GoldoCab note)
      const frontmatter = noteFrontmatterCache.get(documentId)
      let contentToWrite: string

      if (frontmatter) {
        // Update the updatedAt timestamp
        frontmatter.updatedAt = new Date().toISOString()
        contentToWrite = serializeFrontmatter(frontmatter) + '\n\n' + markdown.trim() + '\n'
      } else {
        contentToWrite = markdown
      }

      await invoke('write_file', { path: filePath, content: contentToWrite })

      // Notify GoldoCab if this is a note file
      if (frontmatter) {
        notifyGoldocabNoteModified(filePath, frontmatter.id)
      }

      // Update document state
      setFilePath(documentId, filePath)
      markAsSaved(documentId)
      toast.success('Fichier sauvegardé')
    } catch (error) {
      console.error('Error saving file:', error)
      toast.error(`Erreur lors de la sauvegarde: ${error}`)
    }
  }

  // Save As (force dialog)
  const saveFileAs = async (documentId: string): Promise<void> => {
    try {
      const doc = useDocumentStore.getState().getDocument(documentId)
      if (!doc) return

      const selected = await save({
        defaultPath: doc.title.endsWith('.md') ? doc.title : `${doc.title}.md`,
        filters: [
          {
            name: 'Markdown',
            extensions: ['md', 'markdown'],
          },
          {
            name: 'Text',
            extensions: ['txt'],
          },
        ],
      })

      if (!selected) return

      const markdown = jsonToMarkdown(doc.content)
      await invoke('write_file', { path: selected, content: markdown })

      setFilePath(documentId, selected)
      markAsSaved(documentId)
      toast.success('Fichier sauvegardé')
    } catch (error) {
      console.error('Error saving file:', error)
      toast.error(`Erreur lors de la sauvegarde: ${error}`)
    }
  }

  return {
    openFile,
    openFileFromPath,
    saveFile,
    saveFileAs,
    jsonToMarkdown,
    markdownToJson,
  }
}
