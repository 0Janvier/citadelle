import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { invoke } from '@tauri-apps/api/tauri'

export interface FolderItem {
  id: string
  name: string
  path: string
  type: 'folder' | 'file'
  children?: FolderItem[]
}

interface FolderStore {
  // Root directory
  rootPath: string | null
  setRootPath: (path: string | null) => void

  // Folder hierarchy
  items: FolderItem[]
  setItems: (items: FolderItem[]) => void

  // Expansion state
  expandedFolders: string[]
  toggleFolderExpansion: (id: string) => void
  setFolderExpanded: (id: string, expanded: boolean) => void

  // Sidebar visibility
  sidebarVisible: boolean
  sidebarWidth: number
  setSidebarVisible: (visible: boolean) => void
  toggleSidebar: () => void
  setSidebarWidth: (width: number) => void

  // Selection
  selectedItemId: string | null
  setSelectedItem: (id: string | null) => void

  // Keyboard focus (separate from selection for keyboard navigation)
  focusedItemId: string | null
  setFocusedItem: (id: string | null) => void

  // Quick search filter
  quickSearchQuery: string
  setQuickSearchQuery: (query: string) => void

  // Loading state
  isLoading: boolean
  setIsLoading: (loading: boolean) => void

  // Actions
  refreshFolder: (path?: string) => Promise<void>
  createFolder: (parentPath: string, name: string) => Promise<void>
  renameItem: (oldPath: string, newName: string) => Promise<void>
  moveItem: (sourcePath: string, destinationPath: string) => Promise<void>
  deleteItem: (path: string) => Promise<void>
}

export const useFolderStore = create<FolderStore>()(
  persist(
    (set, get) => ({
      rootPath: null,
      setRootPath: (path) => set({ rootPath: path }),

      items: [],
      setItems: (items) => set({ items }),

      expandedFolders: [],
      toggleFolderExpansion: (id) => {
        const expanded = get().expandedFolders
        if (expanded.includes(id)) {
          set({ expandedFolders: expanded.filter((fid) => fid !== id) })
        } else {
          set({ expandedFolders: [...expanded, id] })
        }
      },
      setFolderExpanded: (id, expanded) => {
        const current = get().expandedFolders
        if (expanded && !current.includes(id)) {
          set({ expandedFolders: [...current, id] })
        } else if (!expanded && current.includes(id)) {
          set({ expandedFolders: current.filter((fid) => fid !== id) })
        }
      },

      sidebarVisible: true,
      sidebarWidth: 240,
      setSidebarVisible: (visible) => set({ sidebarVisible: visible }),
      toggleSidebar: () => set((state) => ({ sidebarVisible: !state.sidebarVisible })),
      setSidebarWidth: (width) => set({ sidebarWidth: Math.max(180, Math.min(400, width)) }),

      selectedItemId: null,
      setSelectedItem: (id) => set({ selectedItemId: id }),

      focusedItemId: null,
      setFocusedItem: (id) => set({ focusedItemId: id }),

      quickSearchQuery: '',
      setQuickSearchQuery: (query) => set({ quickSearchQuery: query }),

      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),

      refreshFolder: async (path?: string) => {
        const rootPath = path || get().rootPath
        if (!rootPath) return

        set({ isLoading: true })
        try {
          const items = await invoke<FolderItem[]>('list_directory', {
            path: rootPath,
            recursive: true,
          })
          set({ items, rootPath })
        } catch (error) {
          console.error('Failed to refresh folder:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      createFolder: async (parentPath, name) => {
        try {
          const newPath = `${parentPath}/${name}`
          await invoke('create_folder', { path: newPath })
          await get().refreshFolder()
        } catch (error) {
          console.error('Failed to create folder:', error)
          throw error
        }
      },

      renameItem: async (oldPath, newName) => {
        try {
          const parts = oldPath.split('/')
          parts.pop()
          const newPath = [...parts, newName].join('/')
          await invoke('rename_item', { oldPath, newPath })
          await get().refreshFolder()
        } catch (error) {
          console.error('Failed to rename item:', error)
          throw error
        }
      },

      moveItem: async (sourcePath, destinationPath) => {
        try {
          await invoke('move_item', { source: sourcePath, destination: destinationPath })
          await get().refreshFolder()
        } catch (error) {
          console.error('Failed to move item:', error)
          throw error
        }
      },

      deleteItem: async (path) => {
        try {
          await invoke('delete_item', { path })
          await get().refreshFolder()
        } catch (error) {
          console.error('Failed to delete item:', error)
          throw error
        }
      },
    }),
    {
      name: 'citadelle-folders',
      partialize: (state) => ({
        rootPath: state.rootPath,
        sidebarVisible: state.sidebarVisible,
        sidebarWidth: state.sidebarWidth,
        expandedFolders: state.expandedFolders,
      }),
    }
  )
)
