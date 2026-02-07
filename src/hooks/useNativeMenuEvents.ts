import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { listen } from '@tauri-apps/api/event'
import { useDocumentStore } from '../store/useDocumentStore'
import { useEditorStore } from '../store/useEditorStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { usePageStore } from '../store/usePageStore'
import { useFolderStore } from '../store/useFolderStore'
import { usePiecesStore } from '../store/usePiecesStore'
import { useTocStore } from '../store/useTocStore'
import { usePanelStore } from '../store/usePanelStore'
import { useFileOperations } from './useFileOperations'
import { useExportPDFNative } from './useExportPDFNative'
import { useExportDOCX } from './useExportDOCX'
import { useToast } from './useToast'
import { save } from '@tauri-apps/api/dialog'
import { invoke } from '@tauri-apps/api/tauri'

export function useNativeMenuEvents() {
  const { openFile, saveFile, saveFileAs, jsonToMarkdown } = useFileOperations()
  const { exportToPDF } = useExportPDFNative()
  const { exportToDocx } = useExportDOCX()
  const toast = useToast()

  // Document store
  const addDocument = useDocumentStore((s) => s.addDocument)
  const removeDocument = useDocumentStore((s) => s.removeDocument)

  // Editor store
  const {
    toggleDistractionFree, toggleToolbar, toggleStatusBar, toggleTabBar,
    setFindDialogOpen, setShowReplace, setSettingsOpen,
    increaseZoom, decreaseZoom, resetZoom,
  } = useEditorStore(useShallow((s) => ({
    toggleDistractionFree: s.toggleDistractionFree,
    toggleToolbar: s.toggleToolbar,
    toggleStatusBar: s.toggleStatusBar,
    toggleTabBar: s.toggleTabBar,
    setFindDialogOpen: s.setFindDialogOpen,
    setShowReplace: s.setShowReplace,
    setSettingsOpen: s.setSettingsOpen,
    increaseZoom: s.increaseZoom,
    decreaseZoom: s.decreaseZoom,
    resetZoom: s.resetZoom,
  })))

  // Settings store
  const {
    setTheme, toggleTypewriterMode,
    setTypewriterHighlightStyle, setTypewriterScrollPosition,
  } = useSettingsStore(useShallow((s) => ({
    setTheme: s.setTheme,
    toggleTypewriterMode: s.toggleTypewriterMode,
    setTypewriterHighlightStyle: s.setTypewriterHighlightStyle,
    setTypewriterScrollPosition: s.setTypewriterScrollPosition,
  })))

  // Other stores
  const toggleSidebar = useFolderStore((s) => s.toggleSidebar)
  const toggleViewMode = usePageStore((s) => s.toggleViewMode)
  const togglePiecesPanel = usePiecesStore((s) => s.togglePanel)
  const toggleTocPanel = useTocStore((s) => s.togglePanel)
  const togglePanel = usePanelStore((s) => s.togglePanel)

  useEffect(() => {
    const unlisten = listen<string>('menu-event', async (event) => {
      const menuId = event.payload
      const currentActiveDocumentId = useDocumentStore.getState().activeDocumentId
      const currentDocuments = useDocumentStore.getState().documents
      const currentActiveEditor = useEditorStore.getState().activeEditor

      switch (menuId) {
        // ===== File menu =====
        case 'new_document':
          window.dispatchEvent(new CustomEvent('show-new-doc-dialog'))
          break
        case 'open_document':
          openFile()
          break
        case 'save_document':
          if (currentActiveDocumentId) saveFile(currentActiveDocumentId)
          break
        case 'save_document_as':
          if (currentActiveDocumentId) saveFileAs(currentActiveDocumentId)
          break
        case 'save_as_template':
          window.dispatchEvent(new CustomEvent('show-save-as-template'))
          break
        case 'close_tab':
          if (currentActiveDocumentId) {
            const doc = currentDocuments.find((d) => d.id === currentActiveDocumentId)
            if (doc?.isDirty) {
              const confirmed = window.confirm(
                `Le document "${doc.title}" contient des modifications non sauvegardées. Voulez-vous vraiment le fermer ?`
              )
              if (!confirmed) return
            }
            removeDocument(currentActiveDocumentId)
          }
          break

        // Export
        case 'export_markdown':
          await handleExportMarkdown()
          break
        case 'export_html':
          await handleExportHTML()
          break
        case 'export_pdf':
          await handleExportPDF()
          break
        case 'export_docx':
          await handleExportDOCX()
          break

        // ===== Edit menu =====
        case 'undo':
          currentActiveEditor?.chain().focus().undo().run()
          break
        case 'redo':
          currentActiveEditor?.chain().focus().redo().run()
          break
        case 'find':
          setFindDialogOpen(true)
          break
        case 'find_replace':
          setFindDialogOpen(true)
          setShowReplace(true)
          break
        case 'global_search':
          togglePanel('search')
          break

        // ===== View menu - Theme =====
        case 'theme_light':
          setTheme('light')
          break
        case 'theme_dark':
          setTheme('dark')
          break
        case 'theme_sepia':
          setTheme('sepia')
          break
        case 'theme_auto':
          setTheme('auto')
          break

        // ===== View menu - Zoom =====
        case 'zoom_in':
          increaseZoom()
          break
        case 'zoom_out':
          decreaseZoom()
          break
        case 'zoom_reset':
          resetZoom()
          break

        // ===== View menu - Typewriter =====
        case 'typewriter_toggle':
          toggleTypewriterMode()
          break
        case 'tw_focus_paragraph':
          setTypewriterHighlightStyle('paragraph')
          break
        case 'tw_focus_sentence':
          setTypewriterHighlightStyle('sentence')
          break
        case 'tw_focus_line':
          setTypewriterHighlightStyle('line')
          break
        case 'tw_pos_none':
          setTypewriterScrollPosition('none')
          break
        case 'tw_pos_top':
          setTypewriterScrollPosition('top')
          break
        case 'tw_pos_middle':
          setTypewriterScrollPosition('middle')
          break
        case 'tw_pos_bottom':
          setTypewriterScrollPosition('bottom')
          break
        case 'tw_pos_variable':
          setTypewriterScrollPosition('variable')
          break

        // ===== View menu - modes =====
        case 'distraction_free':
          toggleDistractionFree()
          break
        case 'page_mode':
          toggleViewMode()
          break

        // ===== View menu - show/hide =====
        case 'toggle_toolbar':
          toggleToolbar()
          break
        case 'toggle_statusbar':
          toggleStatusBar()
          break
        case 'toggle_tabbar':
          toggleTabBar()
          break
        case 'toggle_sidebar':
          toggleSidebar()
          break

        // ===== Format menu =====
        case 'format_bold':
          currentActiveEditor?.chain().focus().toggleBold().run()
          break
        case 'format_italic':
          currentActiveEditor?.chain().focus().toggleItalic().run()
          break
        case 'format_underline':
          currentActiveEditor?.chain().focus().toggleUnderline().run()
          break
        case 'format_strike':
          currentActiveEditor?.chain().focus().toggleStrike().run()
          break
        case 'format_highlight':
          currentActiveEditor?.chain().focus().toggleHighlight().run()
          break
        case 'format_superscript':
          currentActiveEditor?.chain().focus().toggleSuperscript().run()
          break
        case 'format_subscript':
          currentActiveEditor?.chain().focus().toggleSubscript().run()
          break
        case 'format_h1':
          currentActiveEditor?.chain().focus().toggleHeading({ level: 1 }).run()
          break
        case 'format_h2':
          currentActiveEditor?.chain().focus().toggleHeading({ level: 2 }).run()
          break
        case 'format_h3':
          currentActiveEditor?.chain().focus().toggleHeading({ level: 3 }).run()
          break
        case 'format_bullet_list':
          currentActiveEditor?.chain().focus().toggleBulletList().run()
          break
        case 'format_ordered_list':
          currentActiveEditor?.chain().focus().toggleOrderedList().run()
          break
        case 'format_task_list':
          currentActiveEditor?.chain().focus().toggleTaskList().run()
          break
        case 'format_blockquote':
          currentActiveEditor?.chain().focus().toggleBlockquote().run()
          break
        case 'format_code_inline':
          currentActiveEditor?.chain().focus().toggleCode().run()
          break
        case 'format_code_block':
          currentActiveEditor?.chain().focus().toggleCodeBlock().run()
          break
        case 'format_hr':
          currentActiveEditor?.chain().focus().setHorizontalRule().run()
          break
        case 'format_page_break':
          if (currentActiveEditor?.commands.setPageBreak) {
            currentActiveEditor.chain().focus().setPageBreak().run()
          }
          break

        // ===== Document menu =====
        case 'doc_pieces':
          togglePiecesPanel()
          break
        case 'doc_toc':
          toggleTocPanel()
          break
        case 'doc_clauses':
          togglePanel('clauses')
          break
        case 'doc_variables':
          togglePanel('variables')
          break
        case 'doc_codes':
          togglePanel('codes')
          break
        case 'doc_deadlines':
          togglePanel('deadlines')
          break

        // ===== Settings =====
        case 'preferences':
          setSettingsOpen(true)
          break

        // ===== Help =====
        case 'help_docs':
          import('@tauri-apps/api/shell').then(({ open }) => {
            open('https://github.com/citadelle-editor/docs')
          }).catch(() => {})
          break
        case 'help_shortcuts':
          useEditorStore.getState().setShortcutsDialogOpen(true)
          break

        // ===== App menu =====
        case 'about':
          // Tauri gère nativement "À propos" sur macOS
          break

        default:
          console.log('Unhandled menu event:', menuId)
      }
    })

    return () => {
      unlisten.then((fn) => fn()).catch(() => {})
    }
  }, [
    addDocument,
    removeDocument,
    openFile,
    saveFile,
    saveFileAs,
    setFindDialogOpen,
    setShowReplace,
    setSettingsOpen,
    setTheme,
    toggleTypewriterMode,
    setTypewriterHighlightStyle,
    setTypewriterScrollPosition,
    toggleDistractionFree,
    toggleViewMode,
    toggleToolbar,
    toggleStatusBar,
    toggleTabBar,
    toggleSidebar,
    increaseZoom,
    decreaseZoom,
    resetZoom,
    togglePiecesPanel,
    toggleTocPanel,
    togglePanel,
  ])

  // Helper functions for export
  async function handleExportMarkdown() {
    const docId = useDocumentStore.getState().activeDocumentId
    if (!docId) return
    const doc = useDocumentStore.getState().getDocument(docId)
    if (!doc) return

    const markdown = jsonToMarkdown(doc.content)
    const defaultName = doc.title.replace(/\.(md|txt)$/, '') + '.md'

    const selected = await save({
      defaultPath: defaultName,
      filters: [{ name: 'Markdown', extensions: ['md'] }],
    })

    if (selected) {
      await invoke('write_file', { path: selected, content: markdown })
      toast.success('Markdown exporté avec succès')
    }
  }

  async function handleExportHTML() {
    const docId = useDocumentStore.getState().activeDocumentId
    if (!docId) return
    const doc = useDocumentStore.getState().getDocument(docId)
    if (!doc) return

    const markdown = jsonToMarkdown(doc.content)
    const html = convertMarkdownToBasicHTML(markdown, doc.title)
    const defaultName = doc.title.replace(/\.(md|txt)$/, '') + '.html'

    const selected = await save({
      defaultPath: defaultName,
      filters: [{ name: 'HTML', extensions: ['html'] }],
    })

    if (selected) {
      await invoke('write_file', { path: selected, content: html })
      toast.success('HTML exporté avec succès')
    }
  }

  async function handleExportPDF() {
    const docId = useDocumentStore.getState().activeDocumentId
    if (!docId) return
    await exportToPDF(docId)
  }

  async function handleExportDOCX() {
    const docId = useDocumentStore.getState().activeDocumentId
    if (!docId) return
    const doc = useDocumentStore.getState().getDocument(docId)
    if (!doc) return

    await exportToDocx(doc.content, {
      title: doc.title,
      includeHeader: true,
      includeFooter: true,
      includePageNumbers: true,
    })
  }
}

// Helper function to convert Markdown to basic HTML
function convertMarkdownToBasicHTML(markdown: string, title: string): string {
  let html = markdown

  // Escape HTML first
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Headings
  html = html.replace(/^###### (.+)$/gm, '<h6>$1</h6>')
  html = html.replace(/^##### (.+)$/gm, '<h5>$1</h5>')
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  // Bold and Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>')

  // Code
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // Lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr />')

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p>')
  html = '<p>' + html + '</p>'
  html = html.replace(/<p><\/p>/g, '')
  html = html.replace(/<p>(<h[1-6]>)/g, '$1')
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1')
  html = html.replace(/<p>(<pre>)/g, '$1')
  html = html.replace(/(<\/pre>)<\/p>/g, '$1')

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      max-width: 720px;
      margin: 0 auto;
      padding: 24px;
      color: #1d1d1f;
    }
    h1, h2, h3, h4, h5, h6 { font-weight: 600; line-height: 1.3; margin: 1.5em 0 0.5em; }
    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.25em; }
    p { margin: 0 0 1em; }
    a { color: #007aff; text-decoration: none; }
    code { font-family: monospace; background: #f5f5f5; padding: 0.2em 0.4em; border-radius: 4px; }
    pre { background: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid #e5e5e5; margin: 1em 0; padding-left: 16px; color: #666; }
    ul, ol { padding-left: 24px; margin: 1em 0; }
    li { margin: 0.25em 0; }
    hr { border: none; border-top: 1px solid #e5e5e5; margin: 2em 0; }
  </style>
</head>
<body>
${html}
</body>
</html>`
}
