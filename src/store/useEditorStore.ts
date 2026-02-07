import { create } from 'zustand'
import type { Editor } from '@tiptap/react'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface EditorStore {
  // Active editor instance (shared between components)
  activeEditor: Editor | null
  setActiveEditor: (editor: Editor | null) => void

  // Save status for animated indicator
  saveStatus: SaveStatus
  saveErrorMessage: string | null
  setSaveStatus: (status: SaveStatus, errorMessage?: string | null) => void

  // Export status
  isExporting: boolean
  exportFormat: string | null
  setExporting: (exporting: boolean, format?: string | null) => void

  // Backup tracking
  lastBackupTime: number | null
  setLastBackupTime: (time: number) => void

  // View mode
  viewMode: 'edit' | 'preview' | 'split'
  setViewMode: (mode: 'edit' | 'preview' | 'split') => void

  // Distraction-free mode
  isDistractionFree: boolean
  toggleDistractionFree: () => void
  setDistractionFree: (value: boolean) => void

  // UI visibility
  showToolbar: boolean
  showStatusBar: boolean
  showTabBar: boolean
  toggleToolbar: () => void
  toggleStatusBar: () => void
  toggleTabBar: () => void

  // Zoom level
  zoomLevel: number
  setZoomLevel: (level: number) => void
  increaseZoom: () => void
  decreaseZoom: () => void
  resetZoom: () => void

  // Find/Replace
  findDialogOpen: boolean
  setFindDialogOpen: (open: boolean) => void
  findQuery: string
  setFindQuery: (query: string) => void
  replaceQuery: string
  setReplaceQuery: (query: string) => void
  caseSensitive: boolean
  setCaseSensitive: (value: boolean) => void
  wholeWord: boolean
  setWholeWord: (value: boolean) => void
  showReplace: boolean
  setShowReplace: (value: boolean) => void
  currentMatchIndex: number
  setCurrentMatchIndex: (index: number) => void
  totalMatches: number
  setTotalMatches: (count: number) => void

  // Settings
  settingsOpen: boolean
  setSettingsOpen: (open: boolean) => void

  // PDF Export Settings
  pdfExportSettingsOpen: boolean
  setPdfExportSettingsOpen: (open: boolean) => void

  // Project search
  projectSearchOpen: boolean
  setProjectSearchOpen: (open: boolean) => void

  // Keyboard shortcuts dialog
  shortcutsDialogOpen: boolean
  setShortcutsDialogOpen: (open: boolean) => void
}

export const useEditorStore = create<EditorStore>((set) => ({
  // Active editor instance
  activeEditor: null,
  setActiveEditor: (editor) => set({ activeEditor: editor }),

  // Save status
  saveStatus: 'idle' as SaveStatus,
  saveErrorMessage: null,
  setSaveStatus: (status, errorMessage = null) => {
    set({ saveStatus: status, saveErrorMessage: errorMessage })
    // Auto-reset 'saved' to 'idle' after 3 seconds
    if (status === 'saved') {
      setTimeout(() => {
        const current = useEditorStore.getState().saveStatus
        if (current === 'saved') {
          set({ saveStatus: 'idle', saveErrorMessage: null })
        }
      }, 3000)
    }
  },

  // Export status
  isExporting: false,
  exportFormat: null,
  setExporting: (exporting, format = null) => set({ isExporting: exporting, exportFormat: format }),

  // Backup tracking
  lastBackupTime: null,
  setLastBackupTime: (time) => set({ lastBackupTime: time }),

  // View mode
  viewMode: 'edit',
  setViewMode: (mode) => set({ viewMode: mode }),

  // Distraction-free mode
  isDistractionFree: false,
  toggleDistractionFree: () =>
    set((state) => ({ isDistractionFree: !state.isDistractionFree })),
  setDistractionFree: (value) => set({ isDistractionFree: value }),

  // UI visibility
  showToolbar: true,
  showStatusBar: true,
  showTabBar: true,
  toggleToolbar: () => set((state) => ({ showToolbar: !state.showToolbar })),
  toggleStatusBar: () =>
    set((state) => ({ showStatusBar: !state.showStatusBar })),
  toggleTabBar: () => set((state) => ({ showTabBar: !state.showTabBar })),

  // Zoom level
  zoomLevel: 100,
  setZoomLevel: (level) => set({ zoomLevel: Math.max(50, Math.min(200, level)) }),
  increaseZoom: () =>
    set((state) => ({
      zoomLevel: Math.min(200, state.zoomLevel + 10),
    })),
  decreaseZoom: () =>
    set((state) => ({
      zoomLevel: Math.max(50, state.zoomLevel - 10),
    })),
  resetZoom: () => set({ zoomLevel: 100 }),

  // Find/Replace
  findDialogOpen: false,
  setFindDialogOpen: (open) => set({ findDialogOpen: open }),
  findQuery: '',
  setFindQuery: (query) => set({ findQuery: query }),
  replaceQuery: '',
  setReplaceQuery: (query) => set({ replaceQuery: query }),
  caseSensitive: false,
  setCaseSensitive: (value) => set({ caseSensitive: value }),
  wholeWord: false,
  setWholeWord: (value) => set({ wholeWord: value }),
  showReplace: false,
  setShowReplace: (value) => set({ showReplace: value }),
  currentMatchIndex: 0,
  setCurrentMatchIndex: (index) => set({ currentMatchIndex: index }),
  totalMatches: 0,
  setTotalMatches: (count) => set({ totalMatches: count }),

  // Settings
  settingsOpen: false,
  setSettingsOpen: (open) => set({ settingsOpen: open }),

  // PDF Export Settings
  pdfExportSettingsOpen: false,
  setPdfExportSettingsOpen: (open) => set({ pdfExportSettingsOpen: open }),

  // Project search
  projectSearchOpen: false,
  setProjectSearchOpen: (open) => set({ projectSearchOpen: open }),

  // Keyboard shortcuts dialog
  shortcutsDialogOpen: false,
  setShortcutsDialogOpen: (open) => set({ shortcutsDialogOpen: open }),
}))
