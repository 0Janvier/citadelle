import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Snippet, SnippetCategory } from '../types/editor-features'
import { ALL_FORMULES } from '../data/formules'

interface SnippetStore {
  // État
  snippets: Snippet[]
  isLoading: boolean
  searchQuery: string
  selectedCategory: SnippetCategory | 'all'

  // Actions CRUD
  addSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => void
  updateSnippet: (id: string, updates: Partial<Snippet>) => void
  deleteSnippet: (id: string) => void
  incrementUsage: (id: string) => void

  // Recherche
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: SnippetCategory | 'all') => void
  getFilteredSnippets: () => Snippet[]

  // Raccourcis
  findByRaccourci: (raccourci: string) => Snippet | undefined
  getAllRaccourcis: () => string[]

  // Suggestions pour l'autocomplétion
  getSuggestions: (query: string) => Snippet[]

  // Import/Export
  exportSnippets: () => string
  importSnippets: (json: string) => void
  resetToDefaults: () => void
}

// Générer un ID unique
function generateId(): string {
  return `snippet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Convertir les formules builtin en snippets
function getBuiltinSnippets(): Snippet[] {
  const now = new Date().toISOString()
  return ALL_FORMULES.map((formule, index) => ({
    id: `builtin-${index}`,
    ...formule,
    usageCount: 0,
    createdAt: now,
    updatedAt: now,
  }))
}

export const useSnippetStore = create<SnippetStore>()(
  persist(
    (set, get) => ({
      snippets: getBuiltinSnippets(),
      isLoading: false,
      searchQuery: '',
      selectedCategory: 'all',

      addSnippet: (snippet) => {
        const now = new Date().toISOString()
        const newSnippet: Snippet = {
          ...snippet,
          id: generateId(),
          usageCount: 0,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          snippets: [...state.snippets, newSnippet],
        }))
      },

      updateSnippet: (id, updates) => {
        set((state) => ({
          snippets: state.snippets.map((s) =>
            s.id === id
              ? { ...s, ...updates, updatedAt: new Date().toISOString() }
              : s
          ),
        }))
      },

      deleteSnippet: (id) => {
        const snippet = get().snippets.find((s) => s.id === id)
        if (snippet?.isBuiltin) {
          console.warn('Cannot delete builtin snippet')
          return
        }
        set((state) => ({
          snippets: state.snippets.filter((s) => s.id !== id),
        }))
      },

      incrementUsage: (id) => {
        set((state) => ({
          snippets: state.snippets.map((s) =>
            s.id === id ? { ...s, usageCount: s.usageCount + 1 } : s
          ),
        }))
      },

      setSearchQuery: (query) => set({ searchQuery: query }),

      setSelectedCategory: (category) => set({ selectedCategory: category }),

      getFilteredSnippets: () => {
        const { snippets, searchQuery, selectedCategory } = get()
        let filtered = snippets

        // Filtrer par catégorie
        if (selectedCategory !== 'all') {
          filtered = filtered.filter((s) => s.category === selectedCategory)
        }

        // Filtrer par recherche
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          filtered = filtered.filter(
            (s) =>
              s.nom.toLowerCase().includes(query) ||
              s.raccourci.toLowerCase().includes(query) ||
              s.contenu.toLowerCase().includes(query) ||
              s.description?.toLowerCase().includes(query)
          )
        }

        // Trier par usage puis par nom
        return filtered.sort((a, b) => {
          if (b.usageCount !== a.usageCount) {
            return b.usageCount - a.usageCount
          }
          return a.nom.localeCompare(b.nom)
        })
      },

      findByRaccourci: (raccourci) => {
        return get().snippets.find((s) => s.raccourci === raccourci)
      },

      getAllRaccourcis: () => {
        return get().snippets.map((s) => s.raccourci)
      },

      getSuggestions: (query) => {
        const { snippets } = get()
        if (!query) return []

        const lowerQuery = query.toLowerCase()

        // Chercher les snippets qui correspondent
        const matches = snippets.filter((s) => {
          // Match par raccourci (sans le /)
          if (s.raccourci.toLowerCase().startsWith(lowerQuery)) return true
          if (s.raccourci.toLowerCase().startsWith('/' + lowerQuery)) return true

          // Match par nom
          if (s.nom.toLowerCase().includes(lowerQuery)) return true

          return false
        })

        // Trier par pertinence puis par usage
        return matches
          .sort((a, b) => {
            // Priorité aux raccourcis exacts
            const aExact = a.raccourci.toLowerCase() === '/' + lowerQuery
            const bExact = b.raccourci.toLowerCase() === '/' + lowerQuery
            if (aExact && !bExact) return -1
            if (!aExact && bExact) return 1

            // Puis par raccourci commençant par la query
            const aStartsRaccourci = a.raccourci
              .toLowerCase()
              .startsWith('/' + lowerQuery)
            const bStartsRaccourci = b.raccourci
              .toLowerCase()
              .startsWith('/' + lowerQuery)
            if (aStartsRaccourci && !bStartsRaccourci) return -1
            if (!aStartsRaccourci && bStartsRaccourci) return 1

            // Puis par usage
            return b.usageCount - a.usageCount
          })
          .slice(0, 10) // Limiter à 10 suggestions
      },

      exportSnippets: () => {
        const customSnippets = get().snippets.filter((s) => !s.isBuiltin)
        return JSON.stringify(customSnippets, null, 2)
      },

      importSnippets: (json) => {
        try {
          const imported = JSON.parse(json) as Snippet[]
          const now = new Date().toISOString()

          const newSnippets = imported.map((s) => ({
            ...s,
            id: generateId(),
            isBuiltin: false,
            createdAt: now,
            updatedAt: now,
          }))

          set((state) => ({
            snippets: [...state.snippets, ...newSnippets],
          }))
        } catch (error) {
          console.error('Failed to import snippets:', error)
          throw new Error('Format de fichier invalide')
        }
      },

      resetToDefaults: () => {
        set({ snippets: getBuiltinSnippets() })
      },
    }),
    {
      name: 'citadelle-snippets',
      partialize: (state) => ({
        // Ne persister que les snippets custom et les compteurs d'usage
        snippets: state.snippets.filter((s) => !s.isBuiltin || s.usageCount > 0),
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<SnippetStore>
        const builtins = getBuiltinSnippets()

        // Fusionner les builtins avec les données persistées
        const mergedSnippets = builtins.map((builtin) => {
          const persisted_snippet = persisted.snippets?.find(
            (s) => s.raccourci === builtin.raccourci && s.isBuiltin
          )
          if (persisted_snippet) {
            return { ...builtin, usageCount: persisted_snippet.usageCount }
          }
          return builtin
        })

        // Ajouter les snippets custom
        const customSnippets =
          persisted.snippets?.filter((s) => !s.isBuiltin) || []

        return {
          ...currentState,
          snippets: [...mergedSnippets, ...customSnippets],
        }
      },
    }
  )
)
