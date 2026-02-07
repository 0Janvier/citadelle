/**
 * Store pour les onglets recemment fermes.
 * Garde les 10 derniers documents fermes pour Cmd+Shift+T.
 */

import { create } from 'zustand'
import type { JSONContent } from '@tiptap/core'

export interface ClosedTab {
  title: string
  content: JSONContent
  filePath?: string
  closedAt: number
}

const MAX_CLOSED_TABS = 10

interface ClosedTabsStore {
  closedTabs: ClosedTab[]
  pushClosedTab: (tab: ClosedTab) => void
  popClosedTab: () => ClosedTab | null
  clearClosedTabs: () => void
}

export const useClosedTabsStore = create<ClosedTabsStore>((set, get) => ({
  closedTabs: [],

  pushClosedTab: (tab) => {
    set((state) => ({
      closedTabs: [tab, ...state.closedTabs].slice(0, MAX_CLOSED_TABS),
    }))
  },

  popClosedTab: () => {
    const { closedTabs } = get()
    if (closedTabs.length === 0) return null
    const [first, ...rest] = closedTabs
    set({ closedTabs: rest })
    return first
  },

  clearClosedTabs: () => set({ closedTabs: [] }),
}))
