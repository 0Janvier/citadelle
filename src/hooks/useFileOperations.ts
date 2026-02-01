import { invoke } from '@tauri-apps/api/tauri'
import { open, save } from '@tauri-apps/api/dialog'
import { readBinaryFile } from '@tauri-apps/api/fs'
import { useDocumentStore } from '../store/useDocumentStore'
import { useRecentFilesStore } from '../store/useRecentFilesStore'
import { useToast } from './useToast'
import { useImportDOCX } from './useImportDOCX'
import { JSONContent } from '@tiptap/core'
import { markdownToJson as parseMarkdown, jsonToMarkdown as formatMarkdown } from '../lib/markdownParser'

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
        const content = await invoke<string>('read_file', { path: filePath })
        jsonContent = markdownToJson(content)
        preview = content.substring(0, 100)
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

      // Convert JSON to Markdown and save
      const markdown = jsonToMarkdown(doc.content)
      await invoke('write_file', { path: filePath, content: markdown })

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
