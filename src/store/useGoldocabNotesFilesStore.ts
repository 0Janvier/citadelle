// Store pour les notes GoldoCab stockees en fichiers .md
// Opere directement sur ~/Documents/Cabinet/Notes/ (source de verite partagee)

import { create } from 'zustand'
import { invoke } from '@tauri-apps/api/tauri'

export interface NoteFileEntry {
  path: string
  title: string
  folder: string
  dossier_id: string | null
  client_id: string | null
  tags: string[]
  is_pinned: boolean
  updated_at: string
  created_at: string
  preview: string
}

interface NoteFileContent {
  path: string
  frontmatter: {
    id: string
    title: string
    dossier_id: string | null
    client_id: string | null
    folder_id: string | null
    tags: string[]
    is_pinned: boolean
    color: string | null
    created_at: string
    updated_at: string
  } | null
  body: string
}

interface GoldocabNotesFilesStore {
  notes: NoteFileEntry[]
  folders: string[]
  selectedNotePath: string | null
  isLoading: boolean
  error: string | null

  // Actions
  loadNotes: () => Promise<void>
  loadFolders: () => Promise<void>
  selectNote: (path: string | null) => void
  openNote: (path: string) => Promise<NoteFileContent | null>
  createNote: (opts: {
    title: string
    content: string
    folder?: string
    dossierId?: string
    clientId?: string
    tags?: string[]
  }) => Promise<string | null>
  deleteNote: (path: string) => Promise<boolean>
  refresh: () => Promise<void>
  clearError: () => void
}

export const useGoldocabNotesFilesStore = create<GoldocabNotesFilesStore>()(
  (set, get) => ({
    notes: [],
    folders: [],
    selectedNotePath: null,
    isLoading: false,
    error: null,

    loadNotes: async () => {
      set({ isLoading: true, error: null })
      try {
        const notes = await invoke<NoteFileEntry[]>('list_goldocab_notes')
        set({ notes, isLoading: false })
      } catch (error) {
        set({ isLoading: false, error: `Erreur chargement notes: ${error}` })
      }
    },

    loadFolders: async () => {
      try {
        const folders = await invoke<string[]>('list_note_folders')
        set({ folders })
      } catch (error) {
        console.warn('Erreur chargement dossiers notes:', error)
      }
    },

    selectNote: (path) => {
      set({ selectedNotePath: path })
    },

    openNote: async (path) => {
      try {
        const content = await invoke<NoteFileContent>('read_goldocab_note', { path })
        return content
      } catch (error) {
        set({ error: `Erreur lecture note: ${error}` })
        return null
      }
    },

    createNote: async (opts) => {
      set({ isLoading: true, error: null })
      try {
        const path = await invoke<string>('create_goldocab_note', {
          title: opts.title,
          content: opts.content,
          folder: opts.folder || null,
          dossierId: opts.dossierId || null,
          clientId: opts.clientId || null,
          tags: opts.tags || null,
        })
        // Recharger la liste
        await get().loadNotes()
        set({ isLoading: false })
        return path
      } catch (error) {
        set({ isLoading: false, error: `Erreur creation note: ${error}` })
        return null
      }
    },

    deleteNote: async (path) => {
      try {
        await invoke('delete_goldocab_note', { path })
        set((state) => ({
          notes: state.notes.filter((n) => n.path !== path),
          selectedNotePath: state.selectedNotePath === path ? null : state.selectedNotePath,
        }))
        return true
      } catch (error) {
        set({ error: `Erreur suppression note: ${error}` })
        return false
      }
    },

    refresh: async () => {
      await Promise.all([get().loadNotes(), get().loadFolders()])
    },

    clearError: () => set({ error: null }),
  })
)
