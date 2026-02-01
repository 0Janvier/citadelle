import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface RecentFile {
  path: string
  title: string
  lastOpened: Date
  preview: string // 100 premiers caractères
}

interface RecentFilesStore {
  recentFiles: RecentFile[]
  addRecentFile: (file: Omit<RecentFile, 'lastOpened'>) => void
  removeRecentFile: (path: string) => void
  clearRecent: () => void
  getRecentFiles: () => RecentFile[]
}

export const useRecentFilesStore = create<RecentFilesStore>()(
  persist(
    (set, get) => ({
      recentFiles: [],

      addRecentFile: (file) => {
        set((state) => {
          // Remove if already exists
          const filtered = state.recentFiles.filter((f) => f.path !== file.path)

          // Add at the beginning (MRU - Most Recently Used)
          const newFile: RecentFile = {
            ...file,
            lastOpened: new Date(),
          }

          // Keep max 20 files
          const updated = [newFile, ...filtered].slice(0, 20)

          return { recentFiles: updated }
        })
      },

      removeRecentFile: (path) => {
        set((state) => ({
          recentFiles: state.recentFiles.filter((f) => f.path !== path),
        }))
      },

      clearRecent: () => {
        set({ recentFiles: [] })
      },

      getRecentFiles: () => {
        return get().recentFiles
      },
    }),
    {
      name: 'citadelle-recent-files',
      version: 1,
    }
  )
)
