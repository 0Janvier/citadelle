// Store pour gérer les panneaux latéraux de l'éditeur
import { create } from 'zustand'

export type PanelType =
  | 'formatting'
  | 'clauses'
  | 'variables'
  | 'search'
  | 'codes'
  | 'comments'
  | 'pieces'
  | 'toc'
  | 'terms'
  | 'pageLayout'
  | 'settings'
  | 'goldocab'
  | 'deadlines'
  | 'versions'
  | 'document-map'
  | 'characters'
  | 'bookmarks'
  | null

interface PanelState {
  activePanel: PanelType
  lastPanel: PanelType
  isPinned: boolean
  openPanel: (panel: PanelType) => void
  closePanel: () => void
  togglePanel: (panel: PanelType) => void
  reopenLastPanel: () => void
  setIsPinned: (pinned: boolean) => void
}

export const usePanelStore = create<PanelState>((set, get) => ({
  activePanel: null,
  lastPanel: null,
  isPinned: localStorage.getItem('citadelle-sidebar-pinned') === 'true',

  openPanel: (panel) => set({ activePanel: panel }),

  closePanel: () => {
    const { activePanel } = get()
    set({ activePanel: null, lastPanel: activePanel })
  },

  togglePanel: (panel) => {
    const { activePanel } = get()
    if (activePanel === panel) {
      set({ activePanel: null, lastPanel: panel })
    } else {
      set({ activePanel: panel })
    }
  },

  reopenLastPanel: () => {
    const { lastPanel } = get()
    if (lastPanel) {
      set({ activePanel: lastPanel })
    }
  },

  setIsPinned: (pinned) => {
    localStorage.setItem('citadelle-sidebar-pinned', pinned.toString())
    set({ isPinned: pinned })
  },
}))
