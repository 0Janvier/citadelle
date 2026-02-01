import { create } from 'zustand'
import type { Editor } from '@tiptap/react'

interface EditorStore {
  // Active editor instance (shared between components)
  activeEditor: Editor | null
  setActiveEditor: (editor: Editor | null) => void

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

  // Project search
  projectSearchOpen: boolean
  setProjectSearchOpen: (open: boolean) => void
}

export const useEditorStore = create<EditorStore>((set) => ({
  // Active editor instance
  activeEditor: null,
  setActiveEditor: (editor) => set({ activeEditor: editor }),

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

  // Project search
  projectSearchOpen: false,
  setProjectSearchOpen: (open) => set({ projectSearchOpen: open }),
}))
