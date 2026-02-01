import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CollapsibleState {
  // Map of documentId -> Set of collapsed heading IDs
  collapsedByDocument: Record<string, string[]>

  // Actions
  toggleSection: (documentId: string, headingId: string) => void
  collapseAll: (documentId: string, headingIds: string[]) => void
  expandAll: (documentId: string) => void
  isCollapsed: (documentId: string, headingId: string) => boolean
  getCollapsedSections: (documentId: string) => string[]
}

export const useCollapsibleStore = create<CollapsibleState>()(
  persist(
    (set, get) => ({
      collapsedByDocument: {},

      toggleSection: (documentId: string, headingId: string) => {
        set((state) => {
          const current = state.collapsedByDocument[documentId] || []
          const isCurrentlyCollapsed = current.includes(headingId)

          const newCollapsed = isCurrentlyCollapsed
            ? current.filter((id) => id !== headingId)
            : [...current, headingId]

          return {
            collapsedByDocument: {
              ...state.collapsedByDocument,
              [documentId]: newCollapsed,
            },
          }
        })
      },

      collapseAll: (documentId: string, headingIds: string[]) => {
        set((state) => ({
          collapsedByDocument: {
            ...state.collapsedByDocument,
            [documentId]: headingIds,
          },
        }))
      },

      expandAll: (documentId: string) => {
        set((state) => ({
          collapsedByDocument: {
            ...state.collapsedByDocument,
            [documentId]: [],
          },
        }))
      },

      isCollapsed: (documentId: string, headingId: string) => {
        const collapsed = get().collapsedByDocument[documentId] || []
        return collapsed.includes(headingId)
      },

      getCollapsedSections: (documentId: string) => {
        return get().collapsedByDocument[documentId] || []
      },
    }),
    {
      name: 'citadelle-collapsible-sections',
    }
  )
)
