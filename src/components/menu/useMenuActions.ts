import { useCallback } from 'react'
import { useDocumentStore } from '../../store/useDocumentStore'
import { useEditorStore } from '../../store/useEditorStore'
import { useSettingsStore, Theme, TypewriterHighlightStyle, TypewriterScrollPosition } from '../../store/useSettingsStore'
import { usePageStore } from '../../store/usePageStore'
import { useFolderStore } from '../../store/useFolderStore'
import { useTocStore } from '../../store/useTocStore'
import { usePanelStore } from '../../store/usePanelStore'
import { useFileOperations } from '../../hooks/useFileOperations'
import { useExportPDFNative } from '../../hooks/useExportPDFNative'
import { useExportDOCX } from '../../hooks/useExportDOCX'
import { useToast } from '../../hooks/useToast'
import { save } from '@tauri-apps/api/dialog'
import { invoke } from '@tauri-apps/api/tauri'

export function useMenuActions() {
  const { openFile, saveFile, saveFileAs, jsonToMarkdown } = useFileOperations()
  const { exportToPDF } = useExportPDFNative()
  const { exportToDocx } = useExportDOCX()
  const toast = useToast()

  // Document store
  const addDocument = useDocumentStore((s) => s.addDocument)
  const removeDocument = useDocumentStore((s) => s.removeDocument)
  const activeDocumentId = useDocumentStore((s) => s.activeDocumentId)
  const documents = useDocumentStore((s) => s.documents)

  // Editor store
  const activeEditor = useEditorStore((s) => s.activeEditor)
  const toggleDistractionFree = useEditorStore((s) => s.toggleDistractionFree)
  const isDistractionFree = useEditorStore((s) => s.isDistractionFree)
  const showToolbar = useEditorStore((s) => s.showToolbar)
  const toggleToolbar = useEditorStore((s) => s.toggleToolbar)
  const showStatusBar = useEditorStore((s) => s.showStatusBar)
  const toggleStatusBar = useEditorStore((s) => s.toggleStatusBar)
  const showTabBar = useEditorStore((s) => s.showTabBar)
  const toggleTabBar = useEditorStore((s) => s.toggleTabBar)
  const setFindDialogOpen = useEditorStore((s) => s.setFindDialogOpen)
  const setShowReplace = useEditorStore((s) => s.setShowReplace)
  const setSettingsOpen = useEditorStore((s) => s.setSettingsOpen)
  const increaseZoom = useEditorStore((s) => s.increaseZoom)
  const decreaseZoom = useEditorStore((s) => s.decreaseZoom)
  const resetZoom = useEditorStore((s) => s.resetZoom)

  // Settings store
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const typewriterMode = useSettingsStore((s) => s.typewriterMode)
  const toggleTypewriterMode = useSettingsStore((s) => s.toggleTypewriterMode)
  const typewriterHighlightStyle = useSettingsStore((s) => s.typewriterHighlightStyle)
  const setTypewriterHighlightStyle = useSettingsStore((s) => s.setTypewriterHighlightStyle)
  const typewriterScrollPosition = useSettingsStore((s) => s.typewriterScrollPosition)
  const setTypewriterScrollPosition = useSettingsStore((s) => s.setTypewriterScrollPosition)

  // Page store
  const viewMode = usePageStore((s) => s.viewMode)
  const toggleViewMode = usePageStore((s) => s.toggleViewMode)

  // Folder store
  const sidebarVisible = useFolderStore((s) => s.sidebarVisible)
  const toggleSidebar = useFolderStore((s) => s.toggleSidebar)

  // Panels
  const toggleTocPanel = useTocStore((s) => s.togglePanel)
  const tocPanelOpen = useTocStore((s) => s.panelOpen)
  const activePanel = usePanelStore((s) => s.activePanel)
  const togglePanel = usePanelStore((s) => s.togglePanel)

  // File actions
  const newDocument = useCallback(() => addDocument(), [addDocument])
  const openDocument = useCallback(() => openFile(), [openFile])
  const saveDocument = useCallback(() => {
    if (activeDocumentId) saveFile(activeDocumentId)
  }, [activeDocumentId, saveFile])
  const saveDocumentAs = useCallback(() => {
    if (activeDocumentId) saveFileAs(activeDocumentId)
  }, [activeDocumentId, saveFileAs])
  const closeTab = useCallback(() => {
    if (activeDocumentId) {
      const doc = documents.find((d) => d.id === activeDocumentId)
      if (doc?.isDirty) {
        const confirmed = window.confirm(
          `Le document "${doc.title}" contient des modifications non sauvegardees. Voulez-vous vraiment le fermer ?`
        )
        if (!confirmed) return
      }
      removeDocument(activeDocumentId)
    }
  }, [activeDocumentId, documents, removeDocument])

  // Export actions
  const exportMarkdown = useCallback(async () => {
    if (!activeDocumentId) return
    const doc = useDocumentStore.getState().getDocument(activeDocumentId)
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
  }, [activeDocumentId, jsonToMarkdown, toast])

  const exportHTML = useCallback(async () => {
    if (!activeDocumentId) return
    const doc = useDocumentStore.getState().getDocument(activeDocumentId)
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
  }, [activeDocumentId, jsonToMarkdown, toast])

  const exportPDF = useCallback(async () => {
    if (!activeDocumentId) return
    await exportToPDF(activeDocumentId)
  }, [activeDocumentId, exportToPDF])

  const setPdfExportSettingsOpen = useEditorStore((s) => s.setPdfExportSettingsOpen)
  const openPdfExportSettings = useCallback(() => {
    setPdfExportSettingsOpen(true)
  }, [setPdfExportSettingsOpen])

  const exportDOCX = useCallback(async () => {
    if (!activeDocumentId) return
    const doc = useDocumentStore.getState().getDocument(activeDocumentId)
    if (!doc) return

    await exportToDocx(doc.content, {
      title: doc.title,
      includeHeader: true,
      includeFooter: true,
      includePageNumbers: true,
    })
  }, [activeDocumentId, exportToDocx])

  // Edit actions
  const undo = useCallback(() => activeEditor?.chain().focus().undo().run(), [activeEditor])
  const redo = useCallback(() => activeEditor?.chain().focus().redo().run(), [activeEditor])
  const find = useCallback(() => setFindDialogOpen(true), [setFindDialogOpen])
  const findReplace = useCallback(() => {
    setFindDialogOpen(true)
    setShowReplace(true)
  }, [setFindDialogOpen, setShowReplace])
  const globalSearch = useCallback(() => togglePanel('search'), [togglePanel])

  // Format actions
  const toggleBold = useCallback(() => activeEditor?.chain().focus().toggleBold().run(), [activeEditor])
  const toggleItalic = useCallback(() => activeEditor?.chain().focus().toggleItalic().run(), [activeEditor])
  const toggleUnderline = useCallback(() => activeEditor?.chain().focus().toggleUnderline().run(), [activeEditor])
  const toggleStrike = useCallback(() => activeEditor?.chain().focus().toggleStrike().run(), [activeEditor])
  const toggleHighlight = useCallback(() => activeEditor?.chain().focus().toggleHighlight().run(), [activeEditor])
  const setHeading = useCallback((level: 1 | 2 | 3) => {
    activeEditor?.chain().focus().toggleHeading({ level }).run()
  }, [activeEditor])
  const toggleBulletList = useCallback(() => activeEditor?.chain().focus().toggleBulletList().run(), [activeEditor])
  const toggleOrderedList = useCallback(() => activeEditor?.chain().focus().toggleOrderedList().run(), [activeEditor])
  const toggleTaskList = useCallback(() => activeEditor?.chain().focus().toggleTaskList().run(), [activeEditor])
  const toggleBlockquote = useCallback(() => activeEditor?.chain().focus().toggleBlockquote().run(), [activeEditor])
  const toggleCode = useCallback(() => activeEditor?.chain().focus().toggleCode().run(), [activeEditor])
  const toggleCodeBlock = useCallback(() => activeEditor?.chain().focus().toggleCodeBlock().run(), [activeEditor])
  const insertHorizontalRule = useCallback(() => activeEditor?.chain().focus().setHorizontalRule().run(), [activeEditor])
  const insertPageBreak = useCallback(() => {
    if (activeEditor?.commands.setPageBreak) {
      activeEditor.chain().focus().setPageBreak().run()
    }
  }, [activeEditor])

  return {
    // State
    activeDocumentId,
    activeEditor,
    theme,
    typewriterMode,
    typewriterHighlightStyle,
    typewriterScrollPosition,
    isDistractionFree,
    viewMode,
    showToolbar,
    showStatusBar,
    showTabBar,
    sidebarVisible,
    activePanel,
    piecesPanelOpen: activePanel === 'pieces',
    tocPanelOpen,

    // File actions
    newDocument,
    openDocument,
    saveDocument,
    saveDocumentAs,
    closeTab,

    // Export actions
    exportMarkdown,
    exportHTML,
    exportPDF,
    exportDOCX,
    openPdfExportSettings,

    // Edit actions
    undo,
    redo,
    find,
    findReplace,
    globalSearch,

    // View actions
    setTheme: (t: Theme) => setTheme(t),
    toggleTypewriterMode,
    setTypewriterHighlightStyle: (s: TypewriterHighlightStyle) => setTypewriterHighlightStyle(s),
    setTypewriterScrollPosition: (p: TypewriterScrollPosition) => setTypewriterScrollPosition(p),
    toggleDistractionFree,
    toggleViewMode,
    toggleToolbar,
    toggleStatusBar,
    toggleTabBar,
    toggleSidebar,
    increaseZoom,
    decreaseZoom,
    resetZoom,

    // Format actions
    toggleBold,
    toggleItalic,
    toggleUnderline,
    toggleStrike,
    toggleHighlight,
    setHeading,
    toggleBulletList,
    toggleOrderedList,
    toggleTaskList,
    toggleBlockquote,
    toggleCode,
    toggleCodeBlock,
    insertHorizontalRule,
    insertPageBreak,

    // Document panels
    togglePiecesPanel: () => togglePanel('pieces'),
    toggleTocPanel,
    toggleClausesPanel: () => togglePanel('clauses'),
    toggleVariablesPanel: () => togglePanel('variables'),
    toggleCodesPanel: () => togglePanel('codes'),
    togglePageLayoutPanel: () => togglePanel('pageLayout'),

    // Settings
    openSettings: () => setSettingsOpen(true),
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
