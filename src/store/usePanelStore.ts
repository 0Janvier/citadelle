// Store pour gérer les panneaux latéraux de l'éditeur
import { create } from 'zustand'

export type PanelType =
  | 'formatting'
  | 'clauses'
  | 'variables'
  | 'search'
  | 'codes'
  | 'comments'
  | 'signature'
  | 'email'
  | 'diff'
  | 'ocr'
  | 'cloud'
  | 'pieces'
  | 'toc'
  | 'project'
  | 'terms'
  | 'pageLayout'
  | 'settings'
  | 'goldocab'
  | 'deadlines'
  | 'versions'
  | null

interface PanelState {
  activePanel: PanelType
  lastPanel: PanelType
  openPanel: (panel: PanelType) => void
  closePanel: () => void
  togglePanel: (panel: PanelType) => void
  reopenLastPanel: () => void
}

export const usePanelStore = create<PanelState>((set, get) => ({
  activePanel: null,
  lastPanel: null,

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
}))
