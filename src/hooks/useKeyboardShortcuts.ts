import { useEffect, useRef, useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useDocumentStore } from '../store/useDocumentStore'
import { useEditorStore } from '../store/useEditorStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { useFolderStore } from '../store/useFolderStore'
import { useTocStore } from '../store/useTocStore'
import { usePageStore } from '../store/usePageStore'
import { usePanelStore } from '../store/usePanelStore'
import { useProjectStore } from '../store/useProjectStore'
import { useClosedTabsStore } from '../store/useClosedTabsStore'
import { useFileOperations } from './useFileOperations'
import { usePrint } from './usePrint'
import { open } from '@tauri-apps/api/dialog'
import { handleError } from '../lib/errorHandler'

export function useKeyboardShortcuts() {
  const { addDocument, removeDocument, activeDocumentId, documents, setActiveDocument } =
    useDocumentStore(useShallow((state) => ({
      addDocument: state.addDocument,
      removeDocument: state.removeDocument,
      activeDocumentId: state.activeDocumentId,
      documents: state.documents,
      setActiveDocument: state.setActiveDocument,
    })))

  const {
    toggleDistractionFree, increaseZoom, decreaseZoom, resetZoom,
    findDialogOpen, setFindDialogOpen, setShowReplace, setProjectSearchOpen,
  } = useEditorStore(useShallow((state) => ({
    toggleDistractionFree: state.toggleDistractionFree,
    increaseZoom: state.increaseZoom,
    decreaseZoom: state.decreaseZoom,
    resetZoom: state.resetZoom,
    findDialogOpen: state.findDialogOpen,
    setFindDialogOpen: state.setFindDialogOpen,
    setShowReplace: state.setShowReplace,
    setProjectSearchOpen: state.setProjectSearchOpen,
  })))

  const toggleTheme = useSettingsStore((state) => state.toggleTheme)
  const toggleTypewriterMode = useSettingsStore((state) => state.toggleTypewriterMode)
  const toggleSidebar = useFolderStore((state) => state.toggleSidebar)
  const toggleTocPanel = useTocStore((state) => state.togglePanel)
  const toggleViewMode = usePageStore((state) => state.toggleViewMode)

  // Panel store for sidebar panels
  const { activePanel, openPanel, closePanel } = usePanelStore(useShallow((state) => ({
    activePanel: state.activePanel,
    openPanel: state.openPanel,
    closePanel: state.closePanel,
  })))

  // Project store
  const openProject = useProjectStore((state) => state.openProject)

  const togglePanel = (panel: 'clauses' | 'variables' | 'codes' | 'terms' | 'settings' | 'versions') => {
    if (activePanel === panel) {
      closePanel()
    } else {
      openPanel(panel)
    }
  }

  // Ouvrir un dossier comme projet
  const openProjectFolder = useCallback(async () => {
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
      handleError(error, 'Ouverture du dossier projet')
    }
  }, [openProject])

  const { openFile, saveFile, saveFileAs } = useFileOperations()
  const { printDocument } = usePrint()

  // Refs-based pattern: store all callbacks and reactive state in refs
  // so the useEffect keydown handler never needs to re-register.
  const callbacksRef = useRef<Record<string, (...args: any[]) => void>>({})
  callbacksRef.current = {
    addDocument,
    removeDocument,
    setActiveDocument,
    toggleDistractionFree,
    toggleTypewriterMode,
    toggleViewMode,
    toggleSidebar,
    toggleTocPanel,
    togglePanel,
    openPanel,
    closePanel,
    increaseZoom,
    decreaseZoom,
    resetZoom,
    setFindDialogOpen,
    setShowReplace,
    setProjectSearchOpen,
    toggleTheme,
    openFile,
    saveFile,
    saveFileAs,
    openProjectFolder,
    printDocument,
  }

  const stateRef = useRef({ activeDocumentId, documents, activePanel, findDialogOpen })
  stateRef.current = { activeDocumentId, documents, activePanel, findDialogOpen }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey
      const cb = callbacksRef.current
      const st = stateRef.current

      // Cmd/Ctrl + N: New document (open template dialog)
      if (cmdOrCtrl && e.key === 'n') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('show-new-doc-dialog'))
        return
      }

      // Cmd/Ctrl + Shift + T: Save as template
      if (cmdOrCtrl && e.shiftKey && e.key === 't') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('show-save-as-template'))
        return
      }

      // Cmd/Ctrl + O: Open file
      if (cmdOrCtrl && e.key === 'o' && !e.shiftKey) {
        e.preventDefault()
        cb.openFile()
        return
      }

      // Cmd/Ctrl + Shift + O: Open project folder
      if (cmdOrCtrl && e.shiftKey && e.key === 'O') {
        e.preventDefault()
        cb.openProjectFolder()
        return
      }

      // Cmd/Ctrl + S: Save file
      if (cmdOrCtrl && e.key === 's' && !e.shiftKey) {
        e.preventDefault()
        if (st.activeDocumentId) {
          cb.saveFile(st.activeDocumentId)
        }
        return
      }

      // Cmd/Ctrl + Shift + S: Save As
      if (cmdOrCtrl && e.shiftKey && e.key === 'S') {
        e.preventDefault()
        if (st.activeDocumentId) {
          cb.saveFileAs(st.activeDocumentId)
        }
        return
      }

      // Cmd/Ctrl + P: Print document
      if (cmdOrCtrl && e.key === 'p' && !e.shiftKey) {
        e.preventDefault()
        if (st.activeDocumentId) {
          cb.printDocument(st.activeDocumentId)
        }
        return
      }

      // Cmd/Ctrl + W: Close active tab
      if (cmdOrCtrl && e.key === 'w') {
        e.preventDefault()
        if (st.activeDocumentId) {
          const doc = st.documents.find((d) => d.id === st.activeDocumentId)
          if (doc?.isDirty) {
            const confirmed = window.confirm(
              `Le document "${doc.title}" contient des modifications non sauvegardées. Voulez-vous vraiment le fermer ?`
            )
            if (!confirmed) return
          }
          cb.removeDocument(st.activeDocumentId)
        }
        return
      }

      // Cmd/Ctrl + /: Open keyboard shortcuts dialog
      if (cmdOrCtrl && e.key === '/') {
        e.preventDefault()
        useEditorStore.getState().setShortcutsDialogOpen(true)
        return
      }

      // Cmd/Ctrl + ,: Open settings panel
      if (cmdOrCtrl && e.key === ',') {
        e.preventDefault()
        cb.togglePanel('settings')
        return
      }

      // Cmd/Ctrl + \: Toggle sidebar
      if (cmdOrCtrl && e.key === '\\') {
        e.preventDefault()
        cb.toggleSidebar()
        return
      }

      // Cmd/Ctrl + F: Find in document
      if (cmdOrCtrl && e.key === 'f' && !e.shiftKey) {
        e.preventDefault()
        cb.setFindDialogOpen(true)
        return
      }

      // Cmd/Ctrl + Shift + F: Find in project
      if (cmdOrCtrl && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        cb.setProjectSearchOpen(true)
        return
      }

      // Cmd/Ctrl + H: Find and Replace
      if (cmdOrCtrl && e.key === 'h') {
        e.preventDefault()
        cb.setFindDialogOpen(true)
        cb.setShowReplace(true)
        return
      }

      // Escape: Close find dialog
      if (e.key === 'Escape' && st.findDialogOpen) {
        e.preventDefault()
        cb.setFindDialogOpen(false)
        return
      }

      // Cmd/Ctrl + G: Next match (when find dialog is open)
      if (cmdOrCtrl && e.key === 'g' && !e.shiftKey && st.findDialogOpen) {
        e.preventDefault()
        // The FindReplacePanel handles this internally via its own event listener
        // Dispatch a custom event that the panel can listen to
        window.dispatchEvent(new CustomEvent('find-next'))
        return
      }

      // Cmd/Ctrl + Shift + G: Previous match (when find dialog is open) or Toggle glossary
      if (cmdOrCtrl && e.shiftKey && e.key === 'G') {
        e.preventDefault()
        if (st.findDialogOpen) {
          window.dispatchEvent(new CustomEvent('find-previous'))
        } else {
          cb.togglePanel('terms')
        }
        return
      }

      // Cmd/Ctrl + T: Toggle theme
      if (cmdOrCtrl && e.key === 't') {
        e.preventDefault()
        cb.toggleTheme()
        return
      }

      // Cmd/Ctrl + Shift + T: Toggle typewriter mode
      if (cmdOrCtrl && e.shiftKey && e.key === 'T') {
        e.preventDefault()
        cb.toggleTypewriterMode()
        return
      }

      // Cmd/Ctrl + Shift + D: Toggle distraction-free mode
      if (cmdOrCtrl && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        cb.toggleDistractionFree()
        return
      }

      // Cmd/Ctrl + Shift + L: Toggle page view mode
      if (cmdOrCtrl && e.shiftKey && e.key === 'L') {
        e.preventDefault()
        cb.toggleViewMode()
        return
      }

      // Cmd/Ctrl + Shift + J: Toggle pieces panel
      if (cmdOrCtrl && e.shiftKey && e.key === 'J') {
        e.preventDefault()
        usePanelStore.getState().togglePanel('pieces')
        return
      }

      // Cmd/Ctrl + Shift + M: Toggle Comments panel
      if (cmdOrCtrl && e.shiftKey && e.key === 'M') {
        e.preventDefault()
        usePanelStore.getState().togglePanel('comments')
        return
      }

      // Cmd/Ctrl + Shift + C: Toggle Clauses panel
      if (cmdOrCtrl && e.shiftKey && e.key === 'C') {
        e.preventDefault()
        cb.togglePanel('clauses')
        return
      }

      // Cmd/Ctrl + Shift + V: Toggle Variables panel
      if (cmdOrCtrl && e.shiftKey && e.key === 'V') {
        e.preventDefault()
        cb.togglePanel('variables')
        return
      }

      // Cmd/Ctrl + Shift + E: Toggle Deadlines panel
      if (cmdOrCtrl && e.shiftKey && e.key === 'E') {
        e.preventDefault()
        usePanelStore.getState().togglePanel('deadlines')
        return
      }

      // Cmd/Ctrl + Shift + K: Toggle Codes panel
      if (cmdOrCtrl && e.shiftKey && e.key === 'K') {
        e.preventDefault()
        cb.togglePanel('codes')
        return
      }

      // Cmd/Ctrl + Shift + H: Toggle Versions panel
      if (cmdOrCtrl && e.shiftKey && e.key === 'H') {
        e.preventDefault()
        cb.togglePanel('versions')
        return
      }

      // Cmd/Ctrl + Shift + B: Toggle Bookmarks panel
      if (cmdOrCtrl && e.shiftKey && e.key === 'B') {
        e.preventDefault()
        usePanelStore.getState().togglePanel('bookmarks')
        return
      }

      // Cmd/Ctrl + Shift + R: Reopen last closed tab
      if (cmdOrCtrl && e.shiftKey && e.key === 'R') {
        e.preventDefault()
        const tab = useClosedTabsStore.getState().popClosedTab()
        if (tab) {
          cb.addDocument({
            title: tab.title,
            content: tab.content,
            filePath: tab.filePath,
            isDirty: true,
          })
        }
        return
      }

      // Cmd/Ctrl + Shift + .: Reopen last panel
      if (cmdOrCtrl && e.shiftKey && e.key === '>') {
        e.preventDefault()
        usePanelStore.getState().reopenLastPanel()
        return
      }

      // Cmd/Ctrl + Alt + C: Toggle comment panel (legacy, uses new panel store)
      if (cmdOrCtrl && e.altKey && e.key === 'c') {
        e.preventDefault()
        usePanelStore.getState().togglePanel('comments')
        return
      }

      // Cmd/Ctrl + =: Zoom in
      if (cmdOrCtrl && (e.key === '=' || e.key === '+')) {
        e.preventDefault()
        cb.increaseZoom()
        return
      }

      // Cmd/Ctrl + -: Zoom out
      if (cmdOrCtrl && e.key === '-') {
        e.preventDefault()
        cb.decreaseZoom()
        return
      }

      // Cmd/Ctrl + 0: Reset zoom
      if (cmdOrCtrl && e.key === '0') {
        e.preventDefault()
        cb.resetZoom()
        return
      }

      // Cmd/Ctrl + Tab: Next tab
      if (cmdOrCtrl && e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault()
        const currentIndex = st.documents.findIndex((doc) => doc.id === st.activeDocumentId)
        const nextIndex = (currentIndex + 1) % st.documents.length
        if (st.documents[nextIndex]) {
          cb.setActiveDocument(st.documents[nextIndex].id)
        }
        return
      }

      // Cmd/Ctrl + Shift + Tab: Previous tab
      if (cmdOrCtrl && e.shiftKey && e.key === 'Tab') {
        e.preventDefault()
        const currentIndex = st.documents.findIndex((doc) => doc.id === st.activeDocumentId)
        const prevIndex = (currentIndex - 1 + st.documents.length) % st.documents.length
        if (st.documents[prevIndex]) {
          cb.setActiveDocument(st.documents[prevIndex].id)
        }
        return
      }

      // Cmd/Ctrl + 1-9: Go to tab N
      if (cmdOrCtrl && /^[1-9]$/.test(e.key)) {
        e.preventDefault()
        const index = parseInt(e.key) - 1
        if (st.documents[index]) {
          cb.setActiveDocument(st.documents[index].id)
        }
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
