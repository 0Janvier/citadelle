import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { JSONContent } from '@tiptap/core'

export interface DocumentVersion {
  id: string
  documentId: string
  label: string
  content: JSONContent
  timestamp: number
  isAuto: boolean
}

interface VersionStore {
  versions: DocumentVersion[]
  showPanel: boolean

  // Actions
  createVersion: (documentId: string, label: string, content: JSONContent, isAuto?: boolean) => void
  deleteVersion: (id: string) => void
  getVersionsForDocument: (documentId: string) => DocumentVersion[]

  // Panel
  setShowPanel: (show: boolean) => void
  togglePanel: () => void
}

function generateId(): string {
  return `ver-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
}

export const useVersionStore = create<VersionStore>()(
  persist(
    (set, get) => ({
      versions: [],
      showPanel: false,

      createVersion: (documentId, label, content, isAuto = false) => {
        const version: DocumentVersion = {
          id: generateId(),
          documentId,
          label,
          content,
          timestamp: Date.now(),
          isAuto,
        }

        set((state) => {
          // Keep max 50 versions per document (auto-prune oldest auto versions)
          const docVersions = state.versions.filter((v) => v.documentId === documentId)
          const others = state.versions.filter((v) => v.documentId !== documentId)

          if (docVersions.length >= 50) {
            // Remove oldest auto version
            const autoVersions = docVersions.filter((v) => v.isAuto).sort((a, b) => a.timestamp - b.timestamp)
            if (autoVersions.length > 0) {
              const toRemove = autoVersions[0].id
              return {
                versions: [...others, ...docVersions.filter((v) => v.id !== toRemove), version],
              }
            }
          }

          return { versions: [...state.versions, version] }
        })
      },

      deleteVersion: (id) => {
        set((state) => ({
          versions: state.versions.filter((v) => v.id !== id),
        }))
      },

      getVersionsForDocument: (documentId) => {
        return get()
          .versions.filter((v) => v.documentId === documentId)
          .sort((a, b) => b.timestamp - a.timestamp)
      },

      setShowPanel: (show) => set({ showPanel: show }),
      togglePanel: () => set((s) => ({ showPanel: !s.showPanel })),
    }),
    {
      name: 'citadelle-versions',
      version: 1,
    }
  )
)
