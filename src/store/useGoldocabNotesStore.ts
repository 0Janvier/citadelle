// Store pour les notes et tâches GoldoCab
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { invoke } from '@tauri-apps/api/tauri'
import { open } from '@tauri-apps/api/shell'

export interface GoldocabNote {
  id: string
  type: 'note' | 'task'
  content: string
  documentId: string | null     // ID du document Citadelle lié
  documentTitle: string | null  // Titre du document pour affichage
  dossierId: string | null      // Dossier GoldoCab
  dossierName: string | null    // Nom du dossier pour affichage
  priority: 'low' | 'normal' | 'high'
  dueDate: string | null
  createdAt: string
  synced: boolean
}

interface GoldocabNotesStore {
  notes: GoldocabNote[]
  isLoading: boolean
  error: string | null

  // Actions CRUD
  addNote: (note: Omit<GoldocabNote, 'id' | 'createdAt' | 'synced'>) => void
  updateNote: (id: string, updates: Partial<GoldocabNote>) => void
  removeNote: (id: string) => void
  clearSynced: () => void

  // Synchronisation
  syncNote: (id: string) => Promise<void>
  syncAll: () => Promise<void>

  // Utilitaires
  getUnsyncedCount: () => number
  getNotesByDocument: (documentId: string) => GoldocabNote[]
  clearError: () => void
}

// Générer un ID unique
function generateId(): string {
  return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Chemin du répertoire handoff
const HANDOFF_DIR = '~/Documents/Cabinet/03_HANDOFF/'

export const useGoldocabNotesStore = create<GoldocabNotesStore>()(
  persist(
    (set, get) => ({
      notes: [],
      isLoading: false,
      error: null,

      addNote: (noteData) => {
        const newNote: GoldocabNote = {
          ...noteData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          synced: false,
        }
        set((state) => ({
          notes: [newNote, ...state.notes],
        }))
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, ...updates, synced: false } : note
          ),
        }))
      },

      removeNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }))
      },

      clearSynced: () => {
        set((state) => ({
          notes: state.notes.filter((note) => !note.synced),
        }))
      },

      syncNote: async (id) => {
        const { notes } = get()
        const note = notes.find((n) => n.id === id)
        if (!note || note.synced) return

        set({ isLoading: true, error: null })

        try {
          // Créer le fichier JSON dans le répertoire handoff
          const handoffData = {
            type: note.type,
            content: note.content,
            documentTitle: note.documentTitle,
            dossierId: note.dossierId,
            dossierName: note.dossierName,
            priority: note.priority,
            dueDate: note.dueDate,
            createdAt: note.createdAt,
            source: 'citadelle',
          }

          const fileName = `${note.type}_${note.id}.json`
          const filePath = `${HANDOFF_DIR}${fileName}`

          // Écrire le fichier via Tauri
          await invoke('write_file', {
            path: filePath,
            content: JSON.stringify(handoffData, null, 2),
          })

          // Notifier GoldoCab via URL scheme
          const goldocabUrl = `goldocab://${note.type}/new?path=${encodeURIComponent(filePath)}`
          await open(goldocabUrl)

          // Marquer comme synchronisé
          set((state) => ({
            notes: state.notes.map((n) =>
              n.id === id ? { ...n, synced: true } : n
            ),
            isLoading: false,
          }))
        } catch (error) {
          set({
            isLoading: false,
            error: `Erreur de synchronisation: ${error}`,
          })
        }
      },

      syncAll: async () => {
        const { notes, syncNote } = get()
        const unsyncedNotes = notes.filter((n) => !n.synced)

        for (const note of unsyncedNotes) {
          await syncNote(note.id)
        }
      },

      getUnsyncedCount: () => {
        return get().notes.filter((n) => !n.synced).length
      },

      getNotesByDocument: (documentId) => {
        return get().notes.filter((n) => n.documentId === documentId)
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'citadelle-goldocab-notes',
      partialize: (state) => ({
        notes: state.notes,
      }),
    }
  )
)
