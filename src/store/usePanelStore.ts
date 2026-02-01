// Store pour gérer les panneaux latéraux de l'éditeur
import { create } from 'zustand'

export type PanelType =
  | 'formatting'
  | 'clauses'
  | 'variables'
  | 'deadlines'
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
  | 'typography'
  | 'settings'
  | null

interface PanelState {
  activePanel: PanelType
  openPanel: (panel: PanelType) => void
  closePanel: () => void
  togglePanel: (panel: PanelType) => void
}

export const usePanelStore = create<PanelState>((set, get) => ({
  activePanel: null,

  openPanel: (panel) => set({ activePanel: panel }),

  closePanel: () => set({ activePanel: null }),

  togglePanel: (panel) => {
    const { activePanel } = get()
    set({ activePanel: activePanel === panel ? null : panel })
  },
}))
