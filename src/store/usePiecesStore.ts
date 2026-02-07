import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { invoke } from '@tauri-apps/api/tauri'
import type { PieceNature, Piece } from '../types/legal'
import { genererReferencePiece } from '../types/legal'

// ============================================================================
// Types
// ============================================================================

export interface FileItem {
  name: string
  path: string
}

export interface PieceMetadata {
  filename: string        // Nom P[N] sur disque (source de verite)
  titre: string           // Titre personnalise (defaut = getDisplayName)
  nature: PieceNature     // Import depuis types/legal.ts, defaut 'autre'
  dateDocument?: string   // Date ISO du document
  description?: string    // Colonne "Observations" du bordereau
}

export interface BordereauInfo {
  demandeur: string
  defendeur: string
  juridiction?: string
  numeroRG?: string
}

export interface PiecesDocumentState {
  folderPath: string | null
  insertedPieces: Array<{ number: number; filename: string }>
  pieceMetadata: Record<string, PieceMetadata>  // cle = nom fichier P[N]
  bordereauInfo: BordereauInfo | null
}

interface PiecesStore {
  // Per-document state
  documentsState: Record<string, PiecesDocumentState>

  // Panel visibility (legacy, will be migrated to usePanelStore in Phase 5)
  panelOpen: boolean
  setPanelOpen: (open: boolean) => void
  togglePanel: () => void

  // Files from selected folder
  files: FileItem[]
  isLoading: boolean
  isRenaming: boolean

  // Search
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Actions - state access
  getDocumentState: (docId: string) => PiecesDocumentState
  setFolderPath: (docId: string, path: string) => void

  // Actions - file operations
  loadFiles: (folderPath: string) => Promise<void>
  classifyPiece: (docId: string, file: FileItem) => Promise<void>
  insertPiece: (docId: string, file: FileItem) => { number: number; displayName: string } | null
  unclassifyPiece: (docId: string, file: FileItem) => Promise<void>

  // Actions - metadata
  setPieceTitle: (docId: string, filename: string, title: string) => void
  setPieceNature: (docId: string, filename: string, nature: PieceNature) => void
  setPieceDateDocument: (docId: string, filename: string, date: string | undefined) => void
  setPieceDescription: (docId: string, filename: string, desc: string | undefined) => void
  getEffectiveTitle: (filename: string, docId: string) => string

  // Actions - renumerotation (algorithme Phase 2)
  reorderPieces: (docId: string, fromIndex: number, toIndex: number) => Promise<void>
  renumberPieces: (docId: string) => Promise<void>
  removePieceAndRenumber: (docId: string, file: FileItem) => Promise<void>

  // Actions - bordereau
  setBordereauInfo: (docId: string, info: BordereauInfo) => void
  buildPiecesForBordereau: (docId: string) => Piece[]
}

// ============================================================================
// Helpers
// ============================================================================

// Regex pour detecter un fichier classe : P1, P2, P12, etc.
const PIECE_PREFIX_REGEX = /^P(\d+)\s+/

// Extraire le numero de piece d'un nom de fichier
export const extractPieceNumber = (filename: string): number | null => {
  const match = filename.match(PIECE_PREFIX_REGEX)
  return match ? parseInt(match[1], 10) : null
}

// Verifier si un fichier est classe
export const isClassified = (filename: string): boolean => {
  return PIECE_PREFIX_REGEX.test(filename)
}

// Obtenir le prochain numero disponible
const getNextAvailableNumber = (files: FileItem[]): number => {
  const usedNumbers = files
    .map((f) => extractPieceNumber(f.name))
    .filter((n): n is number => n !== null)

  if (usedNumbers.length === 0) return 1
  return Math.max(...usedNumbers) + 1
}

// Extraire le nom d'affichage (sans prefixe ni extension)
export const getDisplayName = (filename: string): string => {
  return filename.replace(PIECE_PREFIX_REGEX, '').replace(/\.[^/.]+$/, '')
}

// Extraire l'extension d'un fichier
const getExtension = (filename: string): string => {
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1] : ''
}

// Extraire le nom de base sans le prefix P[N] (mais avec extension)
const getBaseName = (filename: string): string => {
  return filename.replace(PIECE_PREFIX_REGEX, '')
}

// ============================================================================
// Algorithme de renumerotation en deux passes (Phase 2)
// ============================================================================

interface RenameOp {
  oldPath: string
  newPath: string
  oldName: string
  newName: string
}

/**
 * Renomme des fichiers en deux passes pour eviter les collisions.
 * Passe 1: rename vers noms temporaires __TEMP_<ts>_N
 * Passe 2: rename depuis temporaires vers noms finaux
 * Rollback si passe 1 echoue.
 */
async function safeReorderRename(
  operations: Array<{ file: FileItem; newNumber: number }>
): Promise<{ success: boolean; renamedFiles: RenameOp[] }> {
  if (operations.length === 0) return { success: true, renamedFiles: [] }

  const ts = Date.now()
  const pass1Done: Array<{ oldPath: string; tempPath: string }> = []
  const finalOps: RenameOp[] = []

  // Passe 1: vers noms temporaires
  for (let i = 0; i < operations.length; i++) {
    const { file, newNumber } = operations[i]
    const baseName = getBaseName(file.name)
    const dir = file.path.substring(0, file.path.lastIndexOf('/'))
    const tempName = `__TEMP_${ts}_${i} ${baseName}`
    const tempPath = `${dir}/${tempName}`
    const finalName = `P${newNumber} ${baseName}`
    const finalPath = `${dir}/${finalName}`

    try {
      await invoke('rename_item', { oldPath: file.path, newPath: tempPath })
      pass1Done.push({ oldPath: file.path, tempPath })
      finalOps.push({ oldPath: tempPath, newPath: finalPath, oldName: file.name, newName: finalName })
    } catch (error) {
      // Rollback passe 1
      console.error(`Rename pass 1 failed at index ${i}:`, error)
      for (const done of pass1Done.reverse()) {
        try {
          await invoke('rename_item', { oldPath: done.tempPath, newPath: done.oldPath })
        } catch (rollbackErr) {
          console.error('Rollback failed:', rollbackErr)
        }
      }
      return { success: false, renamedFiles: [] }
    }
  }

  // Passe 2: temporaires vers noms finaux
  const renamedFiles: RenameOp[] = []
  for (const op of finalOps) {
    try {
      await invoke('rename_item', { oldPath: op.oldPath, newPath: op.newPath })
      renamedFiles.push(op)
    } catch (error) {
      console.error(`Rename pass 2 failed for ${op.oldPath}:`, error)
      // Situation critique - fichiers en __TEMP sur disque
      // On continue quand meme pour les autres
    }
  }

  return { success: renamedFiles.length === finalOps.length, renamedFiles }
}

// ============================================================================
// Default state
// ============================================================================

const defaultDocumentState: PiecesDocumentState = {
  folderPath: null,
  insertedPieces: [],
  pieceMetadata: {},
  bordereauInfo: null,
}

// ============================================================================
// Store
// ============================================================================

export const usePiecesStore = create<PiecesStore>()(
  persist(
    (set, get) => ({
      documentsState: {},

      panelOpen: false,
      setPanelOpen: (open) => set({ panelOpen: open }),
      togglePanel: () => set((state) => ({ panelOpen: !state.panelOpen })),

      files: [],
      isLoading: false,
      isRenaming: false,

      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      getDocumentState: (docId) => {
        const state = get().documentsState[docId]
        if (!state) return { ...defaultDocumentState }
        // Migration: ensure pieceMetadata and bordereauInfo exist
        return {
          ...defaultDocumentState,
          ...state,
          pieceMetadata: state.pieceMetadata || {},
          bordereauInfo: state.bordereauInfo ?? null,
        }
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

      // ================================================================
      // loadFiles - with metadata initialization (Phase 1.3)
      // ================================================================
      loadFiles: async (folderPath: string) => {
        set({ isLoading: true })
        try {
          const files = await invoke<Array<{ name: string; path: string }>>('list_exhibit_files', {
            path: folderPath,
          })

          // Find which docId uses this folderPath to sync metadata
          const { documentsState } = get()
          let targetDocId: string | null = null
          for (const [docId, docState] of Object.entries(documentsState)) {
            if (docState.folderPath === folderPath) {
              targetDocId = docId
              break
            }
          }

          if (targetDocId) {
            const docState = get().getDocumentState(targetDocId)
            const existingMetadata = { ...docState.pieceMetadata }
            const classifiedNames = new Set<string>()

            // Create metadata for classified files that don't have it yet
            for (const file of files) {
              if (isClassified(file.name)) {
                classifiedNames.add(file.name)
                if (!existingMetadata[file.name]) {
                  existingMetadata[file.name] = {
                    filename: file.name,
                    titre: getDisplayName(file.name),
                    nature: 'autre',
                  }
                }
              }
            }

            // Clean up metadata for files that no longer exist on disk
            const cleanedMetadata: Record<string, PieceMetadata> = {}
            for (const [key, value] of Object.entries(existingMetadata)) {
              if (classifiedNames.has(key)) {
                cleanedMetadata[key] = value
              }
            }

            set((state) => ({
              files,
              documentsState: {
                ...state.documentsState,
                [targetDocId!]: {
                  ...docState,
                  pieceMetadata: cleanedMetadata,
                },
              },
            }))
          } else {
            set({ files })
          }
        } catch (error) {
          console.error('Failed to load files:', error)
          set({ files: [] })
        } finally {
          set({ isLoading: false })
        }
      },

      // ================================================================
      // classifyPiece - with metadata creation (Phase 1.4)
      // ================================================================
      classifyPiece: async (docId: string, file: FileItem) => {
        const { files, getDocumentState, loadFiles } = get()
        const nextNumber = getNextAvailableNumber(files)

        const ext = getExtension(file.name)
        const baseName = file.name.replace(/\.[^/.]+$/, '')
        const newName = `P${nextNumber} ${baseName}.${ext}`

        const pathParts = file.path.split('/')
        pathParts[pathParts.length - 1] = newName
        const newPath = pathParts.join('/')

        try {
          await invoke('rename_item', { oldPath: file.path, newPath })

          // Create metadata entry for the newly classified piece
          const docState = getDocumentState(docId)
          const updatedMetadata = { ...docState.pieceMetadata }
          updatedMetadata[newName] = {
            filename: newName,
            titre: baseName, // Original filename without extension
            nature: 'autre',
          }

          set((state) => ({
            documentsState: {
              ...state.documentsState,
              [docId]: {
                ...docState,
                pieceMetadata: updatedMetadata,
              },
            },
          }))

          // Reload files
          if (docState.folderPath) {
            await loadFiles(docState.folderPath)
          }
        } catch (error) {
          console.error('Failed to classify piece:', error)
          throw error
        }
      },

      // ================================================================
      // insertPiece
      // ================================================================
      insertPiece: (docId: string, file: FileItem) => {
        const pieceNumber = extractPieceNumber(file.name)
        if (!pieceNumber) return null

        const { getEffectiveTitle } = get()
        const displayName = getEffectiveTitle(file.name, docId)

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

      // ================================================================
      // unclassifyPiece
      // ================================================================
      unclassifyPiece: async (docId: string, file: FileItem) => {
        const { getDocumentState, loadFiles } = get()

        const originalName = file.name.replace(PIECE_PREFIX_REGEX, '')
        const pathParts = file.path.split('/')
        pathParts[pathParts.length - 1] = originalName
        const newPath = pathParts.join('/')

        try {
          await invoke('rename_item', { oldPath: file.path, newPath })

          // Remove metadata for this piece
          const docState = getDocumentState(docId)
          const updatedMetadata = { ...docState.pieceMetadata }
          delete updatedMetadata[file.name]

          set((state) => ({
            documentsState: {
              ...state.documentsState,
              [docId]: {
                ...docState,
                pieceMetadata: updatedMetadata,
              },
            },
          }))

          if (docState.folderPath) {
            await loadFiles(docState.folderPath)
          }
        } catch (error) {
          console.error('Failed to unclassify piece:', error)
          throw error
        }
      },

      // ================================================================
      // Metadata actions (Phase 1.2)
      // ================================================================

      setPieceTitle: (docId: string, filename: string, title: string) => {
        const docState = get().getDocumentState(docId)
        const meta = docState.pieceMetadata[filename]
        if (!meta) return

        set((state) => ({
          documentsState: {
            ...state.documentsState,
            [docId]: {
              ...docState,
              pieceMetadata: {
                ...docState.pieceMetadata,
                [filename]: {
                  ...meta,
                  titre: title || getDisplayName(filename),
                },
              },
            },
          },
        }))
      },

      setPieceNature: (docId: string, filename: string, nature: PieceNature) => {
        const docState = get().getDocumentState(docId)
        const meta = docState.pieceMetadata[filename]
        if (!meta) return

        set((state) => ({
          documentsState: {
            ...state.documentsState,
            [docId]: {
              ...docState,
              pieceMetadata: {
                ...docState.pieceMetadata,
                [filename]: { ...meta, nature },
              },
            },
          },
        }))
      },

      setPieceDateDocument: (docId: string, filename: string, date: string | undefined) => {
        const docState = get().getDocumentState(docId)
        const meta = docState.pieceMetadata[filename]
        if (!meta) return

        set((state) => ({
          documentsState: {
            ...state.documentsState,
            [docId]: {
              ...docState,
              pieceMetadata: {
                ...docState.pieceMetadata,
                [filename]: { ...meta, dateDocument: date },
              },
            },
          },
        }))
      },

      setPieceDescription: (docId: string, filename: string, desc: string | undefined) => {
        const docState = get().getDocumentState(docId)
        const meta = docState.pieceMetadata[filename]
        if (!meta) return

        set((state) => ({
          documentsState: {
            ...state.documentsState,
            [docId]: {
              ...docState,
              pieceMetadata: {
                ...docState.pieceMetadata,
                [filename]: { ...meta, description: desc },
              },
            },
          },
        }))
      },

      getEffectiveTitle: (filename: string, docId: string): string => {
        const docState = get().getDocumentState(docId)
        const meta = docState.pieceMetadata[filename]
        return meta?.titre || getDisplayName(filename)
      },

      // ================================================================
      // Renumerotation actions (Phase 2 algorithm)
      // ================================================================

      reorderPieces: async (docId: string, fromIndex: number, toIndex: number) => {
        if (fromIndex === toIndex) return

        const { files, getDocumentState, loadFiles } = get()

        // Get classified files sorted by number
        const classified = files
          .filter((f) => isClassified(f.name))
          .sort((a, b) => (extractPieceNumber(a.name) || 0) - (extractPieceNumber(b.name) || 0))

        if (fromIndex < 0 || fromIndex >= classified.length || toIndex < 0 || toIndex >= classified.length) return

        // Reorder the array
        const reordered = [...classified]
        const [moved] = reordered.splice(fromIndex, 1)
        reordered.splice(toIndex, 0, moved)

        // Build rename operations: each file gets its new sequential number
        const operations = reordered.map((file, index) => ({
          file,
          newNumber: index + 1,
        }))

        // Only rename files whose number actually changes
        const toRename = operations.filter((op) => {
          const currentNum = extractPieceNumber(op.file.name)
          return currentNum !== op.newNumber
        })

        if (toRename.length === 0) return

        set({ isRenaming: true })
        try {
          const { success, renamedFiles } = await safeReorderRename(toRename)

          if (success || renamedFiles.length > 0) {
            // Update metadata keys to match new filenames
            const docState = getDocumentState(docId)
            const oldMetadata = docState.pieceMetadata
            const newMetadata: Record<string, PieceMetadata> = {}

            for (const op of renamedFiles) {
              const oldMeta = oldMetadata[op.oldName]
              if (oldMeta) {
                newMetadata[op.newName] = { ...oldMeta, filename: op.newName }
              }
            }

            // Keep metadata for files that weren't renamed
            for (const [key, value] of Object.entries(oldMetadata)) {
              if (!renamedFiles.some((op) => op.oldName === key)) {
                newMetadata[key] = value
              }
            }

            set((state) => ({
              documentsState: {
                ...state.documentsState,
                [docId]: {
                  ...docState,
                  pieceMetadata: newMetadata,
                },
              },
            }))
          }

          // Reload files from disk
          const docState = getDocumentState(docId)
          if (docState.folderPath) {
            await loadFiles(docState.folderPath)
          }
        } finally {
          set({ isRenaming: false })
        }
      },

      renumberPieces: async (docId: string) => {
        const { files, getDocumentState, loadFiles } = get()

        // Get classified files sorted by current number
        const classified = files
          .filter((f) => isClassified(f.name))
          .sort((a, b) => (extractPieceNumber(a.name) || 0) - (extractPieceNumber(b.name) || 0))

        if (classified.length === 0) return

        // Build operations: sequential numbering 1, 2, 3...
        const toRename = classified
          .map((file, index) => ({
            file,
            newNumber: index + 1,
          }))
          .filter((op) => extractPieceNumber(op.file.name) !== op.newNumber)

        if (toRename.length === 0) return

        set({ isRenaming: true })
        try {
          const { success, renamedFiles } = await safeReorderRename(toRename)

          if (success || renamedFiles.length > 0) {
            const docState = getDocumentState(docId)
            const oldMetadata = docState.pieceMetadata
            const newMetadata: Record<string, PieceMetadata> = {}

            for (const op of renamedFiles) {
              const oldMeta = oldMetadata[op.oldName]
              if (oldMeta) {
                newMetadata[op.newName] = { ...oldMeta, filename: op.newName }
              }
            }

            for (const [key, value] of Object.entries(oldMetadata)) {
              if (!renamedFiles.some((op) => op.oldName === key)) {
                newMetadata[key] = value
              }
            }

            set((state) => ({
              documentsState: {
                ...state.documentsState,
                [docId]: {
                  ...docState,
                  pieceMetadata: newMetadata,
                },
              },
            }))
          }

          const docState = getDocumentState(docId)
          if (docState.folderPath) {
            await loadFiles(docState.folderPath)
          }
        } finally {
          set({ isRenaming: false })
        }
      },

      removePieceAndRenumber: async (docId: string, file: FileItem) => {
        const { unclassifyPiece, renumberPieces } = get()

        // Step 1: Unclassify (strip P[N] prefix)
        await unclassifyPiece(docId, file)

        // Step 2: Renumber remaining pieces to fill the gap
        await renumberPieces(docId)
      },

      // ================================================================
      // Bordereau actions (Phase 1.5)
      // ================================================================

      setBordereauInfo: (docId: string, info: BordereauInfo) => {
        const docState = get().getDocumentState(docId)
        set((state) => ({
          documentsState: {
            ...state.documentsState,
            [docId]: {
              ...docState,
              bordereauInfo: info,
            },
          },
        }))
      },

      buildPiecesForBordereau: (docId: string): Piece[] => {
        const { files, getDocumentState } = get()
        const docState = getDocumentState(docId)

        const classified = files
          .filter((f) => isClassified(f.name))
          .sort((a, b) => (extractPieceNumber(a.name) || 0) - (extractPieceNumber(b.name) || 0))

        return classified.map((file) => {
          const numero = extractPieceNumber(file.name) || 0
          const meta = docState.pieceMetadata[file.name]
          const now = new Date().toISOString()

          return {
            id: `piece_${numero}`,
            numero,
            reference: genererReferencePiece(numero),
            titre: meta?.titre || getDisplayName(file.name),
            description: meta?.description,
            nature: meta?.nature || 'autre',
            provenance: 'demandeur' as const,
            dateDocument: meta?.dateDocument,
            confidentiel: false,
            fichierPath: file.path,
            createdAt: now,
            updatedAt: now,
          }
        })
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
