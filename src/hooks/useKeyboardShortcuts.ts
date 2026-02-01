import { useEffect } from 'react'
import { useDocumentStore } from '../store/useDocumentStore'
import { useEditorStore } from '../store/useEditorStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { useFolderStore } from '../store/useFolderStore'
import { usePiecesStore } from '../store/usePiecesStore'
import { useTocStore } from '../store/useTocStore'
import { usePageStore } from '../store/usePageStore'
import { usePanelStore } from '../store/usePanelStore'
import { useProjectStore } from '../store/useProjectStore'
import { useFileOperations } from './useFileOperations'
import { open } from '@tauri-apps/api/dialog'

export function useKeyboardShortcuts() {
  const addDocument = useDocumentStore((state) => state.addDocument)
  const removeDocument = useDocumentStore((state) => state.removeDocument)
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId)
  const documents = useDocumentStore((state) => state.documents)
  const setActiveDocument = useDocumentStore((state) => state.setActiveDocument)

  const toggleDistractionFree = useEditorStore((state) => state.toggleDistractionFree)
  const increaseZoom = useEditorStore((state) => state.increaseZoom)
  const decreaseZoom = useEditorStore((state) => state.decreaseZoom)
  const resetZoom = useEditorStore((state) => state.resetZoom)
  const findDialogOpen = useEditorStore((state) => state.findDialogOpen)
  const setFindDialogOpen = useEditorStore((state) => state.setFindDialogOpen)
  const setShowReplace = useEditorStore((state) => state.setShowReplace)

  const toggleTheme = useSettingsStore((state) => state.toggleTheme)
  const toggleTypewriterMode = useSettingsStore((state) => state.toggleTypewriterMode)
  const toggleSidebar = useFolderStore((state) => state.toggleSidebar)
  const togglePiecesPanel = usePiecesStore((state) => state.togglePanel)
  const toggleTocPanel = useTocStore((state) => state.togglePanel)
  const toggleViewMode = usePageStore((state) => state.toggleViewMode)

  // Panel store for sidebar panels
  const activePanel = usePanelStore((state) => state.activePanel)
  const openPanel = usePanelStore((state) => state.openPanel)
  const closePanel = usePanelStore((state) => state.closePanel)

  // Project store
  const openProject = useProjectStore((state) => state.openProject)
  const setProjectSearchOpen = useEditorStore((state) => state.setProjectSearchOpen)

  const togglePanel = (panel: 'clauses' | 'variables' | 'codes' | 'deadlines' | 'terms' | 'settings') => {
    if (activePanel === panel) {
      closePanel()
    } else {
      openPanel(panel)
    }
  }

  // Ouvrir un dossier comme projet
  const openProjectFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Sélectionner un dossier projet',
      })

      if (selected && typeof selected === 'string') {
        await openProject(selected)
      }
    } catch (error) {
      console.error('Failed to open project folder:', error)
    }
  }

  const { openFile, saveFile, saveFileAs } = useFileOperations()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey

      // Cmd/Ctrl + N: New document
      if (cmdOrCtrl && e.key === 'n') {
        e.preventDefault()
        addDocument()
        return
      }

      // Cmd/Ctrl + O: Open file
      if (cmdOrCtrl && e.key === 'o' && !e.shiftKey) {
        e.preventDefault()
        openFile()
        return
      }

      // Cmd/Ctrl + Shift + O: Open project folder
      if (cmdOrCtrl && e.shiftKey && e.key === 'O') {
        e.preventDefault()
        openProjectFolder()
        return
      }

      // Cmd/Ctrl + S: Save file
      if (cmdOrCtrl && e.key === 's' && !e.shiftKey) {
        e.preventDefault()
        if (activeDocumentId) {
          saveFile(activeDocumentId)
        }
        return
      }

      // Cmd/Ctrl + Shift + S: Save As
      if (cmdOrCtrl && e.shiftKey && e.key === 'S') {
        e.preventDefault()
        if (activeDocumentId) {
          saveFileAs(activeDocumentId)
        }
        return
      }

      // Cmd/Ctrl + W: Close active tab
      if (cmdOrCtrl && e.key === 'w') {
        e.preventDefault()
        if (activeDocumentId) {
          const doc = documents.find((d) => d.id === activeDocumentId)
          if (doc?.isDirty) {
            const confirmed = window.confirm(
              `Le document "${doc.title}" contient des modifications non sauvegardées. Voulez-vous vraiment le fermer ?`
            )
            if (!confirmed) return
          }
          removeDocument(activeDocumentId)
        }
        return
      }

      // Cmd/Ctrl + ,: Open settings panel
      if (cmdOrCtrl && e.key === ',') {
        e.preventDefault()
        togglePanel('settings')
        return
      }

      // Cmd/Ctrl + \: Toggle sidebar
      if (cmdOrCtrl && e.key === '\\') {
        e.preventDefault()
        toggleSidebar()
        return
      }

      // Cmd/Ctrl + F: Find in document
      if (cmdOrCtrl && e.key === 'f' && !e.shiftKey) {
        e.preventDefault()
        setFindDialogOpen(true)
        return
      }

      // Cmd/Ctrl + Shift + F: Find in project
      if (cmdOrCtrl && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        setProjectSearchOpen(true)
        return
      }

      // Cmd/Ctrl + H: Find and Replace
      if (cmdOrCtrl && e.key === 'h') {
        e.preventDefault()
        setFindDialogOpen(true)
        setShowReplace(true)
        return
      }

      // Escape: Close find dialog
      if (e.key === 'Escape' && findDialogOpen) {
        e.preventDefault()
        setFindDialogOpen(false)
        return
      }

      // Cmd/Ctrl + G: Next match (when find dialog is open)
      if (cmdOrCtrl && e.key === 'g' && !e.shiftKey && findDialogOpen) {
        e.preventDefault()
        // The FindReplacePanel handles this internally via its own event listener
        // Dispatch a custom event that the panel can listen to
        window.dispatchEvent(new CustomEvent('find-next'))
        return
      }

      // Cmd/Ctrl + Shift + G: Previous match (when find dialog is open) or Toggle glossary
      if (cmdOrCtrl && e.shiftKey && e.key === 'G') {
        e.preventDefault()
        if (findDialogOpen) {
          window.dispatchEvent(new CustomEvent('find-previous'))
        } else {
          togglePanel('terms')
        }
        return
      }

      // Cmd/Ctrl + T: Toggle theme
      if (cmdOrCtrl && e.key === 't') {
        e.preventDefault()
        toggleTheme()
        return
      }

      // Cmd/Ctrl + Shift + T: Toggle typewriter mode
      if (cmdOrCtrl && e.shiftKey && e.key === 'T') {
        e.preventDefault()
        toggleTypewriterMode()
        return
      }

      // Cmd/Ctrl + Shift + D: Toggle distraction-free mode
      if (cmdOrCtrl && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        toggleDistractionFree()
        return
      }

      // Cmd/Ctrl + Shift + L: Toggle page view mode
      if (cmdOrCtrl && e.shiftKey && e.key === 'L') {
        e.preventDefault()
        toggleViewMode()
        return
      }

      // Cmd/Ctrl + Shift + P: Toggle pieces panel
      if (cmdOrCtrl && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        togglePiecesPanel()
        return
      }

      // Cmd/Ctrl + Shift + M: Toggle TOC panel
      if (cmdOrCtrl && e.shiftKey && e.key === 'M') {
        e.preventDefault()
        toggleTocPanel()
        return
      }

      // Cmd/Ctrl + Shift + C: Toggle Clauses panel
      if (cmdOrCtrl && e.shiftKey && e.key === 'C') {
        e.preventDefault()
        togglePanel('clauses')
        return
      }

      // Cmd/Ctrl + Shift + V: Toggle Variables panel
      if (cmdOrCtrl && e.shiftKey && e.key === 'V') {
        e.preventDefault()
        togglePanel('variables')
        return
      }

      // Cmd/Ctrl + Shift + K: Toggle Codes panel
      if (cmdOrCtrl && e.shiftKey && e.key === 'K') {
        e.preventDefault()
        togglePanel('codes')
        return
      }

      // Cmd/Ctrl + Shift + E: Toggle Deadlines panel
      if (cmdOrCtrl && e.shiftKey && e.key === 'E') {
        e.preventDefault()
        togglePanel('deadlines')
        return
      }

      // Cmd/Ctrl + =: Zoom in
      if (cmdOrCtrl && (e.key === '=' || e.key === '+')) {
        e.preventDefault()
        increaseZoom()
        return
      }

      // Cmd/Ctrl + -: Zoom out
      if (cmdOrCtrl && e.key === '-') {
        e.preventDefault()
        decreaseZoom()
        return
      }

      // Cmd/Ctrl + 0: Reset zoom
      if (cmdOrCtrl && e.key === '0') {
        e.preventDefault()
        resetZoom()
        return
      }

      // Cmd/Ctrl + Tab: Next tab
      if (cmdOrCtrl && e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault()
        const currentIndex = documents.findIndex((doc) => doc.id === activeDocumentId)
        const nextIndex = (currentIndex + 1) % documents.length
        if (documents[nextIndex]) {
          setActiveDocument(documents[nextIndex].id)
        }
        return
      }

      // Cmd/Ctrl + Shift + Tab: Previous tab
      if (cmdOrCtrl && e.shiftKey && e.key === 'Tab') {
        e.preventDefault()
        const currentIndex = documents.findIndex((doc) => doc.id === activeDocumentId)
        const prevIndex = (currentIndex - 1 + documents.length) % documents.length
        if (documents[prevIndex]) {
          setActiveDocument(documents[prevIndex].id)
        }
        return
      }

      // Cmd/Ctrl + 1-9: Go to tab N
      if (cmdOrCtrl && /^[1-9]$/.test(e.key)) {
        e.preventDefault()
        const index = parseInt(e.key) - 1
        if (documents[index]) {
          setActiveDocument(documents[index].id)
        }
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    addDocument,
    removeDocument,
    activeDocumentId,
    documents,
    setActiveDocument,
    toggleDistractionFree,
    toggleTypewriterMode,
    toggleViewMode,
    toggleSidebar,
    togglePiecesPanel,
    toggleTocPanel,
    togglePanel,
    activePanel,
    openPanel,
    closePanel,
    increaseZoom,
    decreaseZoom,
    resetZoom,
    findDialogOpen,
    setFindDialogOpen,
    setShowReplace,
    toggleTheme,
    openFile,
    saveFile,
    saveFileAs,
    openProjectFolder,
    setProjectSearchOpen,
  ])
}
