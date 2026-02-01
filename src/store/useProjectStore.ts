// Store pour gérer les projets (dossiers de documents traités comme une suite cohérente)
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { invoke } from '@tauri-apps/api/tauri'

// ============================================================================
// Types
// ============================================================================

export interface ProjectDocument {
  id: string
  path: string
  name: string
  type: 'docx' | 'pdf' | 'md' | 'txt' | 'other'
  lastModified: Date
  size?: number
}

export interface DefinedTerm {
  id: string
  term: string
  normalizedTerm: string
  definition: string
  sourceDocumentId: string
  sourceDocumentPath: string
  sourcePosition: { from: number; to: number }
}

export interface Project {
  id: string
  name: string
  rootPath: string
  documents: ProjectDocument[]
  definedTerms: DefinedTerm[]
  lastOpened: Date
  createdAt: Date
}

export interface SearchResult {
  documentPath: string
  documentName: string
  line: number
  column: number
  matchText: string
  context: string
}

interface ProjectStore {
  // État actuel
  currentProject: Project | null
  recentProjects: Project[]
  isLoading: boolean
  searchResults: SearchResult[]
  searchQuery: string

  // Actions de projet
  openProject: (path: string) => Promise<void>
  closeProject: () => void
  refreshProject: () => Promise<void>

  // Projets récents
  addToRecentProjects: (project: Project) => void
  removeFromRecentProjects: (projectId: string) => void
  clearRecentProjects: () => void

  // Recherche
  searchInProject: (query: string) => Promise<SearchResult[]>
  clearSearchResults: () => void
  setSearchQuery: (query: string) => void

  // Termes définis
  addDefinedTerm: (term: DefinedTerm) => void
  removeDefinedTerm: (termId: string) => void
  updateDefinedTerms: (terms: DefinedTerm[]) => void
  getTermByNormalized: (normalizedTerm: string) => DefinedTerm | undefined

  // Utilitaires
  getDocumentByPath: (path: string) => ProjectDocument | undefined
  isProjectOpen: () => boolean
}

// ============================================================================
// Helper Functions
// ============================================================================

function getFileType(filename: string): ProjectDocument['type'] {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'docx':
    case 'doc':
      return 'docx'
    case 'pdf':
      return 'pdf'
    case 'md':
    case 'markdown':
      return 'md'
    case 'txt':
    case 'text':
      return 'txt'
    default:
      return 'other'
  }
}

function generateProjectId(path: string): string {
  return `project-${path.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}`
}

function normalizeTerm(term: string): string {
  return term
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/^(le|la|les|l'|un|une|des)\s+/i, '') // Enlever les articles
    .trim()
}

// ============================================================================
// Store
// ============================================================================

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      currentProject: null,
      recentProjects: [],
      isLoading: false,
      searchResults: [],
      searchQuery: '',

      openProject: async (path: string) => {
        set({ isLoading: true })

        try {
          // Lister les fichiers du dossier
          const files = await invoke<Array<{
            id: string
            name: string
            path: string
            type: string
          }>>('list_directory', {
            path,
            recursive: true,
          })

          // Filtrer pour ne garder que les fichiers (pas les dossiers)
          const documentFiles = flattenFiles(files).filter(
            (f) => f.type === 'file'
          )

          // Créer les documents du projet
          const documents: ProjectDocument[] = documentFiles.map((f) => ({
            id: f.id,
            path: f.path,
            name: f.name,
            type: getFileType(f.name),
            lastModified: new Date(),
          }))

          // Créer le projet
          const projectName = path.split('/').pop() || 'Projet'
          const project: Project = {
            id: generateProjectId(path),
            name: projectName,
            rootPath: path,
            documents,
            definedTerms: [],
            lastOpened: new Date(),
            createdAt: new Date(),
          }

          set({ currentProject: project, isLoading: false })

          // Ajouter aux projets récents
          get().addToRecentProjects(project)
        } catch (error) {
          console.error('Failed to open project:', error)
          set({ isLoading: false })
          throw error
        }
      },

      closeProject: () => {
        set({
          currentProject: null,
          searchResults: [],
          searchQuery: '',
        })
      },

      refreshProject: async () => {
        const { currentProject } = get()
        if (!currentProject) return

        set({ isLoading: true })

        try {
          const files = await invoke<Array<{
            id: string
            name: string
            path: string
            type: string
          }>>('list_directory', {
            path: currentProject.rootPath,
            recursive: true,
          })

          const documentFiles = flattenFiles(files).filter(
            (f) => f.type === 'file'
          )

          const documents: ProjectDocument[] = documentFiles.map((f) => ({
            id: f.id,
            path: f.path,
            name: f.name,
            type: getFileType(f.name),
            lastModified: new Date(),
          }))

          set({
            currentProject: {
              ...currentProject,
              documents,
              lastOpened: new Date(),
            },
            isLoading: false,
          })
        } catch (error) {
          console.error('Failed to refresh project:', error)
          set({ isLoading: false })
        }
      },

      addToRecentProjects: (project: Project) => {
        set((state) => {
          // Enlever le projet s'il existe déjà
          const filtered = state.recentProjects.filter(
            (p) => p.rootPath !== project.rootPath
          )
          // Ajouter au début et limiter à 10
          const updated = [project, ...filtered].slice(0, 10)
          return { recentProjects: updated }
        })
      },

      removeFromRecentProjects: (projectId: string) => {
        set((state) => ({
          recentProjects: state.recentProjects.filter((p) => p.id !== projectId),
        }))
      },

      clearRecentProjects: () => {
        set({ recentProjects: [] })
      },

      searchInProject: async (query: string) => {
        const { currentProject } = get()
        if (!currentProject || !query.trim()) {
          set({ searchResults: [], searchQuery: query })
          return []
        }

        set({ isLoading: true, searchQuery: query })

        try {
          // Appeler la commande Tauri pour rechercher
          const results = await invoke<SearchResult[]>('search_in_project', {
            rootPath: currentProject.rootPath,
            query: query.trim(),
            extensions: ['md', 'txt', 'markdown', 'text'],
          })

          set({ searchResults: results, isLoading: false })
          return results
        } catch (error) {
          console.error('Search failed:', error)
          set({ searchResults: [], isLoading: false })
          return []
        }
      },

      clearSearchResults: () => {
        set({ searchResults: [], searchQuery: '' })
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query })
      },

      addDefinedTerm: (term: DefinedTerm) => {
        set((state) => {
          if (!state.currentProject) return state

          return {
            currentProject: {
              ...state.currentProject,
              definedTerms: [...state.currentProject.definedTerms, term],
            },
          }
        })
      },

      removeDefinedTerm: (termId: string) => {
        set((state) => {
          if (!state.currentProject) return state

          return {
            currentProject: {
              ...state.currentProject,
              definedTerms: state.currentProject.definedTerms.filter(
                (t) => t.id !== termId
              ),
            },
          }
        })
      },

      updateDefinedTerms: (terms: DefinedTerm[]) => {
        set((state) => {
          if (!state.currentProject) return state

          return {
            currentProject: {
              ...state.currentProject,
              definedTerms: terms,
            },
          }
        })
      },

      getTermByNormalized: (normalizedTerm: string) => {
        const { currentProject } = get()
        if (!currentProject) return undefined

        return currentProject.definedTerms.find(
          (t) => t.normalizedTerm === normalizedTerm
        )
      },

      getDocumentByPath: (path: string) => {
        const { currentProject } = get()
        if (!currentProject) return undefined

        return currentProject.documents.find((d) => d.path === path)
      },

      isProjectOpen: () => {
        return get().currentProject !== null
      },
    }),
    {
      name: 'citadelle-projects',
      partialize: (state) => ({
        recentProjects: state.recentProjects.map((p) => ({
          ...p,
          // Convertir les dates en strings pour le stockage
          lastOpened: p.lastOpened,
          createdAt: p.createdAt,
        })),
      }),
    }
  )
)

// ============================================================================
// Helper pour aplatir l'arborescence des fichiers
// ============================================================================

interface FileTreeItem {
  id: string
  name: string
  path: string
  type: string
  children?: FileTreeItem[]
}

function flattenFiles(files: FileTreeItem[]): FileTreeItem[] {
  const result: FileTreeItem[] = []

  function traverse(items: FileTreeItem[]) {
    for (const item of items) {
      result.push(item)
      if (item.children) {
        traverse(item.children)
      }
    }
  }

  traverse(files)
  return result
}

// Export helper pour normaliser les termes (utilisé ailleurs)
export { normalizeTerm }
