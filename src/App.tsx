import { useEffect, useState, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { TabBar } from './components/TabBar'
import { Editor } from './components/Editor'
import { StatusBar } from './components/StatusBar'
import { FolderSidebar } from './components/FolderSidebar'
import { ToastContainer } from './components/Toast'
import { FindReplacePanel } from './components/FindReplacePanel'
import { CompactSidebar, OVERLAY_WIDTH, OVERLAY_GAP, COMPACT_PANEL_IDS } from './components/CompactSidebar'
import { WelcomeScreen, useShowWelcome } from './components/WelcomeScreen'
import { DialogManager } from './components/DialogManager'
import { CommentPanelSidebar } from './components/comments/CommentPanelSidebar'
import { usePanelStore } from './store/usePanelStore'
import { useDocumentStore } from './store/useDocumentStore'
import { useEditorStore } from './store/useEditorStore'
import { useFolderStore } from './store/useFolderStore'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useNativeMenuEvents } from './hooks/useNativeMenuEvents'
import { useAppLifecycle } from './hooks/useAppLifecycle'

function App() {
  const activeDocumentId = useDocumentStore((s) => s.activeDocumentId)

  const { isDistractionFree, zoomLevel } = useEditorStore(useShallow((s) => ({
    isDistractionFree: s.isDistractionFree,
    zoomLevel: s.zoomLevel,
  })))

  const { sidebarVisible, toggleSidebar } = useFolderStore(useShallow((s) => ({
    sidebarVisible: s.sidebarVisible,
    toggleSidebar: s.toggleSidebar,
  })))

  const activePanel = usePanelStore((s) => s.activePanel)
  const isPanelPinned = usePanelStore((s) => s.isPinned)

  const showPinnedSpacer = !isDistractionFree && isPanelPinned && activePanel && COMPACT_PANEL_IDS.includes(activePanel)

  // Welcome screen for first-time users
  const [showWelcome, dismissWelcome] = useShowWelcome()

  // Flash overlay for distraction-free transition
  const [dfFlash, setDfFlash] = useState(false)
  const prevDistractionFree = useRef(isDistractionFree)
  useEffect(() => {
    if (prevDistractionFree.current !== isDistractionFree) {
      setDfFlash(true)
      const timer = setTimeout(() => setDfFlash(false), 400)
      prevDistractionFree.current = isDistractionFree
      return () => clearTimeout(timer)
    }
  }, [isDistractionFree])

  // Lifecycle: session restore, template init, auto-save, window close confirm
  const { isRestoring } = useAppLifecycle()

  // Global keyboard shortcuts and native menu events
  useKeyboardShortcuts()
  useNativeMenuEvents()

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
          <div className="shrink-0" data-tauri-drag-region>
            <TabBar />
          </div>

          <div className="flex-1 overflow-hidden relative">
            <FindReplacePanel />
            {activeDocumentId ? (
              <div key={activeDocumentId} className="h-full animate-crossFadeIn">
                <Editor documentId={activeDocumentId} />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 h-full">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Bienvenue dans Citadelle</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Creez un nouveau document pour commencer
                  </p>
                  <button
                    onClick={() => window.dispatchEvent(new Event('show-new-doc-dialog'))}
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

        {/* Spacer for pinned right panel */}
        {showPinnedSpacer && (
          <div
            className="shrink-0 transition-all duration-300"
            style={{ width: OVERLAY_WIDTH + OVERLAY_GAP }}
          />
        )}

        {/* Compact sidebar with panel overlays */}
        {!isDistractionFree && <CompactSidebar />}

        {/* Comment Panel */}
        <CommentPanelSidebar documentId={activeDocumentId} />
      </div>

      {/* Distraction-free flash overlay */}
      {dfFlash && (
        <div className="fixed inset-0 z-[999] bg-[var(--bg)] pointer-events-none animate-dfFlash" />
      )}

      <DialogManager />
      <ToastContainer />
      {showWelcome && <WelcomeScreen onDismiss={dismissWelcome} />}
    </div>
  )
}

export default App
