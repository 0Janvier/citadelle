import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { invoke } from '@tauri-apps/api/tauri'

export interface FileItem {
  name: string
  path: string
}

export interface PiecesDocumentState {
  folderPath: string | null
  insertedPieces: Array<{ number: number; filename: string }>
}

interface PiecesStore {
  // Per-document state
  documentsState: Record<string, PiecesDocumentState>

  // Panel visibility
  panelOpen: boolean
  setPanelOpen: (open: boolean) => void
  togglePanel: () => void

  // Files from selected folder
  files: FileItem[]
  isLoading: boolean

  // Search
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Actions
  getDocumentState: (docId: string) => PiecesDocumentState
  setFolderPath: (docId: string, path: string) => void
  loadFiles: (folderPath: string) => Promise<void>
  classifyPiece: (docId: string, file: FileItem) => Promise<void>
  insertPiece: (docId: string, file: FileItem) => { number: number; displayName: string } | null
  unclassifyPiece: (docId: string, file: FileItem) => Promise<void>
}

// Regex pour détecter un fichier classé : P1, P2, P12, etc.
const PIECE_PREFIX_REGEX = /^P(\d+)\s+/

// Extraire le numéro de pièce d'un nom de fichier
export const extractPieceNumber = (filename: string): number | null => {
  const match = filename.match(PIECE_PREFIX_REGEX)
  return match ? parseInt(match[1], 10) : null
}

// Vérifier si un fichier est classé
export const isClassified = (filename: string): boolean => {
  return PIECE_PREFIX_REGEX.test(filename)
}

// Obtenir le prochain numéro disponible
const getNextAvailableNumber = (files: FileItem[]): number => {
  const usedNumbers = files
    .map(f => extractPieceNumber(f.name))
    .filter((n): n is number => n !== null)

  if (usedNumbers.length === 0) return 1
  return Math.max(...usedNumbers) + 1
}

// Extraire le nom d'affichage (sans préfixe ni extension)
export const getDisplayName = (filename: string): string => {
  return filename
    .replace(PIECE_PREFIX_REGEX, '')
    .replace(/\.[^/.]+$/, '')
}

const defaultDocumentState: PiecesDocumentState = {
  folderPath: null,
  insertedPieces: [],
}

export const usePiecesStore = create<PiecesStore>()(
  persist(
    (set, get) => ({
      documentsState: {},

      panelOpen: false,
      setPanelOpen: (open) => set({ panelOpen: open }),
      togglePanel: () => set((state) => ({ panelOpen: !state.panelOpen })),

      files: [],
      isLoading: false,

      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      getDocumentState: (docId) => {
        const state = get().documentsState[docId]
        return state || { ...defaultDocumentState }
      },

      setFolderPath: (docId, path) => {
        set((state) => ({
          documentsState: {
            ...state.documentsState,
            [docId]: {
              ...state.getDocumentState(docId),
              folderPath: path,
            },
          },
        }))
      },

      loadFiles: async (folderPath: string) => {
        set({ isLoading: true })
        try {
          // Utiliser la commande Tauri dédiée aux pièces jointes
          const files = await invoke<Array<{ name: string; path: string }>>('list_exhibit_files', {
            path: folderPath,
          })

          set({ files })
        } catch (error) {
          console.error('Failed to load files:', error)
          set({ files: [] })
        } finally {
          set({ isLoading: false })
        }
      },

      classifyPiece: async (docId: string, file: FileItem) => {
        const { files, getDocumentState, loadFiles } = get()
        const nextNumber = getNextAvailableNumber(files)

        // Construire le nouveau nom
        const ext = file.name.split('.').pop()
        const baseName = file.name.replace(/\.[^/.]+$/, '') // Sans extension
        const newName = `P${nextNumber} ${baseName}.${ext}`

        // Construire le nouveau chemin
        const pathParts = file.path.split('/')
        pathParts[pathParts.length - 1] = newName
        const newPath = pathParts.join('/')

        try {
          // Renommer via Tauri
          await invoke('rename_item', { oldPath: file.path, newPath })

          // Recharger les fichiers
          const docState = getDocumentState(docId)
          if (docState.folderPath) {
            await loadFiles(docState.folderPath)
          }
        } catch (error) {
          console.error('Failed to classify piece:', error)
          throw error
        }
      },

      insertPiece: (docId: string, file: FileItem) => {
        const pieceNumber = extractPieceNumber(file.name)
        if (!pieceNumber) return null // Ne peut pas insérer un fichier non classé

        // Extraire le nom sans préfixe ni extension
        const displayName = getDisplayName(file.name)

        // Enregistrer l'insertion
        const currentState = get().getDocumentState(docId)
        set((state) => ({
          documentsState: {
            ...state.documentsState,
            [docId]: {
              ...currentState,
              insertedPieces: [
                ...currentState.insertedPieces,
                { number: pieceNumber, filename: file.name },
              ],
            },
          },
        }))

        return { number: pieceNumber, displayName }
      },

      unclassifyPiece: async (docId: string, file: FileItem) => {
        const { getDocumentState, loadFiles } = get()

        // Extraire le nom original (sans le préfixe P[N])
        const originalName = file.name.replace(PIECE_PREFIX_REGEX, '')

        // Construire le nouveau chemin
        const pathParts = file.path.split('/')
        pathParts[pathParts.length - 1] = originalName
        const newPath = pathParts.join('/')

        try {
          // Renommer via Tauri
          await invoke('rename_item', { oldPath: file.path, newPath })

          // Recharger les fichiers
          const docState = getDocumentState(docId)
          if (docState.folderPath) {
            await loadFiles(docState.folderPath)
          }
        } catch (error) {
          console.error('Failed to unclassify piece:', error)
          throw error
        }
      },
    }),
    {
      name: 'citadelle-pieces',
      partialize: (state) => ({
        documentsState: state.documentsState,
      }),
    }
  )
)
