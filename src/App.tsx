import { useEffect, useState, useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { TabBar } from './components/TabBar'
import { Editor } from './components/Editor'
import { StatusBar } from './components/StatusBar'
import { FolderSidebar } from './components/FolderSidebar'
import { CommandPalette } from './components/CommandPalette'
import { ToastContainer } from './components/Toast'
import { Settings } from './components/Settings'
import { FindReplacePanel } from './components/FindReplacePanel'
import { NewDocumentDialog } from './components/templates'
import { SaveAsTemplateDialog } from './components/templates/SaveAsTemplateDialog'
import { CompactSidebar } from './components/CompactSidebar'
import { GlobalSearch } from './components/search/GlobalSearch'
import { ProjectSearch } from './components/search/ProjectSearch'
import { PdfExportSettingsDialog } from './components/PdfExportSettingsDialog'
import { KeyboardShortcutsDialog } from './components/KeyboardShortcutsDialog'
import { FootnoteEditor } from './components/footnotes/FootnoteEditor'
import { RecoveryDialog } from './components/recovery/RecoveryDialog'
import { ExportProgressOverlay } from './components/ExportProgressOverlay'
import { WelcomeScreen, useShowWelcome } from './components/WelcomeScreen'
import { CommentPanel } from './components/comments/CommentPanel'
import { useCommentStore } from './store/useCommentStore'
import { useLawyerProfileStore } from './store/useLawyerProfileStore'
import { usePanelStore } from './store/usePanelStore'
import { useDocumentStore } from './store/useDocumentStore'
import { useEditorStore } from './store/useEditorStore'
import { useFolderStore } from './store/useFolderStore'
import { useTemplateStore } from './store/useTemplateStore'
import { useStyleStore } from './store/useStyleStore'
import { useThemeStore } from './store/useThemeStore'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useNativeMenuEvents } from './hooks/useNativeMenuEvents'
import { useToast } from './hooks/useToast'
import { initUserDataDir } from './lib/templateStorage'
import { appWindow } from '@tauri-apps/api/window'
import { confirm } from '@tauri-apps/api/dialog'
import type { JSONContent } from '@tiptap/react'

function App() {
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId)
  const addDocument = useDocumentStore((state) => state.addDocument)

  const {
    isDistractionFree, zoomLevel,
    settingsOpen, setSettingsOpen,
    projectSearchOpen, setProjectSearchOpen,
    pdfExportSettingsOpen, setPdfExportSettingsOpen,
  } = useEditorStore(useShallow((state) => ({
    isDistractionFree: state.isDistractionFree,
    zoomLevel: state.zoomLevel,
    settingsOpen: state.settingsOpen,
    setSettingsOpen: state.setSettingsOpen,
    projectSearchOpen: state.projectSearchOpen,
    setProjectSearchOpen: state.setProjectSearchOpen,
    pdfExportSettingsOpen: state.pdfExportSettingsOpen,
    setPdfExportSettingsOpen: state.setPdfExportSettingsOpen,
  })))

  const { sidebarVisible, toggleSidebar, refreshFolder } = useFolderStore(useShallow((state) => ({
    sidebarVisible: state.sidebarVisible,
    toggleSidebar: state.toggleSidebar,
    refreshFolder: state.refreshFolder,
  })))

  // Template system stores
  const loadTemplates = useTemplateStore((state) => state.loadTemplates)
  const loadStyles = useStyleStore((state) => state.loadStyles)
  const loadThemes = useThemeStore((state) => state.loadThemes)

  const toast = useToast()

  // Welcome screen for first-time users
  const [showWelcome, dismissWelcome] = useShowWelcome()

  // Loading state
  const [isRestoring, setIsRestoring] = useState(true)

  // Dialog states
  const [showNewDocDialog, setShowNewDocDialog] = useState(false)
  const [showSaveAsTemplate, setShowSaveAsTemplate] = useState(false)
  const shortcutsDialogOpen = useEditorStore((state) => state.shortcutsDialogOpen)
  const setShortcutsDialogOpen = useEditorStore((state) => state.setShortcutsDialogOpen)

  // Panel store for advanced features
  const activePanel = usePanelStore((state) => state.activePanel)
  const closePanel = usePanelStore((state) => state.closePanel)

  // Enable global keyboard shortcuts
  useKeyboardShortcuts()

  // Enable native macOS menu events
  useNativeMenuEvents()

  // Listen for show-new-doc-dialog and save-as-template events
  useEffect(() => {
    const showNewDoc = () => setShowNewDocDialog(true)
    const showSaveTemplate = () => setShowSaveAsTemplate(true)
    window.addEventListener('show-new-doc-dialog', showNewDoc)
    window.addEventListener('show-save-as-template', showSaveTemplate)
    return () => {
      window.removeEventListener('show-new-doc-dialog', showNewDoc)
      window.removeEventListener('show-save-as-template', showSaveTemplate)
    }
  }, [])

  // Confirm before closing window with unsaved documents
  useEffect(() => {
    const unlisten = appWindow.onCloseRequested(async (event) => {
      const docs = useDocumentStore.getState().documents
      const hasUnsaved = docs.some(d => d.isDirty)
      if (hasUnsaved) {
        const confirmed = await confirm(
          'Des documents non sauvegardés seront perdus. Quitter ?',
          { title: 'Citadelle', type: 'warning' }
        )
        if (!confirmed) {
          event.preventDefault()
          return
        }
      }
      // Save session before closing
      await useDocumentStore.getState().saveSession()
    })
    return () => { unlisten.then(fn => fn()) }
  }, [])

  // Initialize template system on mount
  useEffect(() => {
    const initTemplateSystem = async () => {
      try {
        await initUserDataDir()
        await Promise.all([
          loadTemplates(),
          loadStyles(),
          loadThemes(),
        ])
      } catch (err) {
        console.error('Failed to initialize template system:', err)
        toast.error('Erreur lors de l\'initialisation des modèles')
      }
    }
    initTemplateSystem()
  }, [loadTemplates, loadStyles, loadThemes])

  // Handle creating document from template
  const handleCreateFromTemplate = useCallback((content: JSONContent, templateName: string) => {
    addDocument({ title: `Nouveau ${templateName}`, content })
  }, [addDocument])

  // Restore session on mount
  const restoreSession = useDocumentStore((state) => state.restoreSession)
  const saveSession = useDocumentStore((state) => state.saveSession)

  useEffect(() => {
    // Check if session restore is enabled in settings
    const settingsData = localStorage.getItem('citadelle-settings')
    let shouldRestore = true

    if (settingsData) {
      try {
        const { state } = JSON.parse(settingsData)
        shouldRestore = state.restoreSession !== false
      } catch (e) {
        shouldRestore = true
      }
    }

    if (shouldRestore) {
      // Restore previous session
      restoreSession().then(() => {
        // If no documents were restored, create initial document
        const currentDocs = useDocumentStore.getState().documents
        if (currentDocs.length === 0) {
          addDocument()
        }
      }).finally(() => {
        setIsRestoring(false)
      })
    } else {
      // Create initial document if restore is disabled
      addDocument()
      setIsRestoring(false)
    }

    // Restore folder sidebar if a root path was persisted
    const folderData = localStorage.getItem('citadelle-folders')
    if (folderData) {
      try {
        const { state } = JSON.parse(folderData)
        if (state.rootPath) {
          refreshFolder(state.rootPath)
        }
      } catch (e) {
        console.error('Failed to restore folder:', e)
        toast.error('Impossible de restaurer le dossier')
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save session every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveSession()
    }, 10000)

    // Save on unmount
    return () => {
      clearInterval(interval)
      saveSession()
    }
  }, [saveSession])

  if (isRestoring) {
    return (
      <div className="h-screen w-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-2xl font-bold text-[var(--text)]">Citadelle</div>
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
            </svg>
            Restauration de la session...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`h-screen w-screen bg-[var(--bg)] text-[var(--text)] flex flex-col ${
        isDistractionFree ? 'distraction-free' : ''
      }`}
      style={{ fontSize: `${zoomLevel}%` }}
    >
      <div className="flex flex-1 min-h-0">
        {/* Sidebar - hidden in distraction-free mode */}
        {!isDistractionFree && sidebarVisible && <FolderSidebar />}

        {/* Toggle button when sidebar is hidden */}
        {!isDistractionFree && !sidebarVisible && (
          <button
            onClick={toggleSidebar}
            className="h-10 w-8 flex items-center justify-center border-r border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--editor-bg)] transition-colors shrink-0"
            title="Afficher la sidebar (Cmd+\)"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
            </svg>
          </button>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* TabBar intégrée avec zone de drag macOS */}
          <div className="shrink-0" data-tauri-drag-region>
            <TabBar />
          </div>

          <div className="flex-1 overflow-hidden relative">
            <FindReplacePanel />
            {activeDocumentId ? (
              <Editor documentId={activeDocumentId} />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 h-full">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Bienvenue dans Citadelle</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Créez un nouveau document pour commencer
                  </p>
                  <button
                    onClick={() => setShowNewDocDialog(true)}
                    className="mt-4 px-4 py-2 bg-[var(--accent)] text-white rounded-md hover:opacity-90"
                  >
                    Nouveau document
                  </button>
                </div>
              </div>
            )}
          </div>

          <StatusBar />
        </div>

        {/* Sidebar compacte avec overlays */}
        {!isDistractionFree && <CompactSidebar />}

        {/* Comment Panel */}
        <CommentPanelSidebar documentId={activeDocumentId} />
      </div>

      <CommandPalette />
      <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ToastContainer />
      <NewDocumentDialog
        isOpen={showNewDocDialog}
        onClose={() => setShowNewDocDialog(false)}
        onCreateDocument={handleCreateFromTemplate}
      />
      <SaveAsTemplateDialog
        isOpen={showSaveAsTemplate}
        onClose={() => setShowSaveAsTemplate(false)}
      />
      <GlobalSearch
        isOpen={activePanel === 'search'}
        onClose={closePanel}
      />
      <ProjectSearch
        isOpen={projectSearchOpen}
        onClose={() => setProjectSearchOpen(false)}
      />
      <PdfExportSettingsDialog
        isOpen={pdfExportSettingsOpen}
        onClose={() => setPdfExportSettingsOpen(false)}
      />
      <KeyboardShortcutsDialog
        open={shortcutsDialogOpen}
        onClose={() => setShortcutsDialogOpen(false)}
      />
      <FootnoteEditor />
      <RecoveryDialog />
      <ExportProgressOverlay />
      {showWelcome && <WelcomeScreen onDismiss={dismissWelcome} />}
    </div>
  )
}

function CommentPanelSidebar({ documentId }: { documentId: string | null }) {
  const showPanel = useCommentStore((s) => s.showPanel)
  const setShowPanel = useCommentStore((s) => s.setShowPanel)
  const comments = useCommentStore((s) => s.comments)
  const addComment = useCommentStore((s) => s.addComment)
  const resolveComment = useCommentStore((s) => s.resolveComment)
  const deleteComment = useCommentStore((s) => s.deleteComment)
  const replyToComment = useCommentStore((s) => s.replyToComment)

  const activeEditor = useEditorStore((s) => s.activeEditor)

  if (!showPanel || !documentId) return null

  const docComments = comments.filter((c) => c.documentId === documentId)
  const selection = activeEditor
    ? { from: activeEditor.state.selection.from, to: activeEditor.state.selection.to }
    : null
  const hasSelection = selection && selection.from !== selection.to

  return (
    <div className="w-80 border-l border-[var(--border)] bg-[var(--bg)] shrink-0 overflow-hidden">
      <CommentPanel
        comments={docComments}
        onAddComment={(content, from, to) => {
          const profile = useLawyerProfileStore.getState()
          const author = [profile.prenom, profile.nom].filter(Boolean).join(' ') || 'Auteur'
          const commentId = addComment(documentId, author, content, from, to)
          if (activeEditor) {
            activeEditor.chain().focus().setComment(commentId).run()
          }
        }}
        onResolveComment={resolveComment}
        onDeleteComment={deleteComment}
        onReplyComment={(parentId, content) => {
          const profile = useLawyerProfileStore.getState()
          const author = [profile.prenom, profile.nom].filter(Boolean).join(' ') || 'Auteur'
          replyToComment(parentId, author, content)
        }}
        selectedRange={hasSelection ? selection : null}
        onClose={() => setShowPanel(false)}
      />
    </div>
  )
}

export default App
