import { useEffect, useState, useCallback } from 'react'
import { TabBar } from './components/TabBar'
import { Editor } from './components/Editor'
import { StatusBar } from './components/StatusBar'
import { FolderSidebar } from './components/FolderSidebar'
import { CommandPalette } from './components/CommandPalette'
import { ToastContainer } from './components/Toast'
import { Settings } from './components/Settings'
import { FindReplacePanel } from './components/FindReplacePanel'
import { NewDocumentDialog } from './components/templates'
import { UnifiedSidebar } from './components/UnifiedSidebar'
import { GlobalSearch } from './components/search/GlobalSearch'
import { ProjectSearch } from './components/search/ProjectSearch'
import { usePanelStore } from './store/usePanelStore'
import { useDocumentStore } from './store/useDocumentStore'
import { useEditorStore } from './store/useEditorStore'
import { useFolderStore } from './store/useFolderStore'
import { useTemplateStore } from './store/useTemplateStore'
import { useStyleStore } from './store/useStyleStore'
import { useThemeStore } from './store/useThemeStore'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useNativeMenuEvents } from './hooks/useNativeMenuEvents'
import { initUserDataDir } from './lib/templateStorage'
import type { JSONContent } from '@tiptap/react'

function App() {
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId)
  const addDocument = useDocumentStore((state) => state.addDocument)
  const isDistractionFree = useEditorStore((state) => state.isDistractionFree)
  const zoomLevel = useEditorStore((state) => state.zoomLevel)
  const settingsOpen = useEditorStore((state) => state.settingsOpen)
  const setSettingsOpen = useEditorStore((state) => state.setSettingsOpen)
  const projectSearchOpen = useEditorStore((state) => state.projectSearchOpen)
  const setProjectSearchOpen = useEditorStore((state) => state.setProjectSearchOpen)
  const sidebarVisible = useFolderStore((state) => state.sidebarVisible)
  const toggleSidebar = useFolderStore((state) => state.toggleSidebar)
  const refreshFolder = useFolderStore((state) => state.refreshFolder)

  // Template system stores
  const loadTemplates = useTemplateStore((state) => state.loadTemplates)
  const loadStyles = useStyleStore((state) => state.loadStyles)
  const loadThemes = useThemeStore((state) => state.loadThemes)

  // New document dialog state
  const [showNewDocDialog, setShowNewDocDialog] = useState(false)

  // Panel store for advanced features
  const activePanel = usePanelStore((state) => state.activePanel)
  const closePanel = usePanelStore((state) => state.closePanel)

  // Enable global keyboard shortcuts
  useKeyboardShortcuts()

  // Enable native macOS menu events
  useNativeMenuEvents()

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
      })
    } else {
      // Create initial document if restore is disabled
      addDocument()
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

        {/* Sidebar unifiée avec onglets verticaux */}
        <UnifiedSidebar />
      </div>

      <CommandPalette />
      <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ToastContainer />
      <NewDocumentDialog
        isOpen={showNewDocDialog}
        onClose={() => setShowNewDocDialog(false)}
        onCreateDocument={handleCreateFromTemplate}
      />
      <GlobalSearch
        isOpen={activePanel === 'search'}
        onClose={closePanel}
      />
      <ProjectSearch
        isOpen={projectSearchOpen}
        onClose={() => setProjectSearchOpen(false)}
      />
    </div>
  )
}

export default App
