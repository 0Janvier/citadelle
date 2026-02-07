import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Clause, ClauseDomaine, ClauseType } from '../types/editor-features'
import { extractTextFromContent, getDefaultClauses } from '../data/clauses/defaults'

interface ClauseStore {
  // État
  clauses: Clause[]
  isLoading: boolean
  searchQuery: string
  selectedDomaine: ClauseDomaine | 'all'
  selectedType: ClauseType | 'all'
  showFavoritesOnly: boolean

  // Actions CRUD
  addClause: (clause: Omit<Clause, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'texteRecherche'>) => void
  updateClause: (id: string, updates: Partial<Clause>) => void
  deleteClause: (id: string) => void
  toggleFavorite: (id: string) => void
  incrementUsage: (id: string) => void

  // Recherche et filtres
  setSearchQuery: (query: string) => void
  setSelectedDomaine: (domaine: ClauseDomaine | 'all') => void
  setSelectedType: (type: ClauseType | 'all') => void
  setShowFavoritesOnly: (show: boolean) => void
  getFilteredClauses: () => Clause[]

  // Utilitaires
  getClauseById: (id: string) => Clause | undefined
  getClausesByDomaine: (domaine: ClauseDomaine) => Clause[]
  getRecentClauses: (limit?: number) => Clause[]
  getFavoriteClauses: () => Clause[]

  // Import/Export
  exportClauses: () => string
  importClauses: (json: string) => void
  resetToDefaults: () => void
}

// Générer un ID unique
function generateId(): string {
  return `clause-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const useClauseStore = create<ClauseStore>()(
  persist(
    (set, get) => ({
      clauses: getDefaultClauses(),
      isLoading: false,
      searchQuery: '',
      selectedDomaine: 'all',
      selectedType: 'all',
      showFavoritesOnly: false,

      addClause: (clause) => {
        const now = new Date().toISOString()
        const texteRecherche = extractTextFromContent(clause.contenu)

        const newClause: Clause = {
          ...clause,
          id: generateId(),
          texteRecherche,
          usageCount: 0,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          clauses: [...state.clauses, newClause],
        }))
      },

      updateClause: (id, updates) => {
        set((state) => ({
          clauses: state.clauses.map((c) => {
            if (c.id !== id) return c

            const updated = { ...c, ...updates, updatedAt: new Date().toISOString() }

            // Recalculer le texte de recherche si le contenu a changé
            if (updates.contenu) {
              updated.texteRecherche = extractTextFromContent(updates.contenu)
            }

            return updated
          }),
        }))
      },

      deleteClause: (id) => {
        const clause = get().clauses.find((c) => c.id === id)
        if (clause?.isBuiltin) {
          console.warn('Cannot delete builtin clause')
          return
        }
        set((state) => ({
          clauses: state.clauses.filter((c) => c.id !== id),
        }))
      },

      toggleFavorite: (id) => {
        set((state) => ({
          clauses: state.clauses.map((c) =>
            c.id === id ? { ...c, favoris: !c.favoris } : c
          ),
        }))
      },

      incrementUsage: (id) => {
        set((state) => ({
          clauses: state.clauses.map((c) =>
            c.id === id ? { ...c, usageCount: c.usageCount + 1 } : c
          ),
        }))
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedDomaine: (domaine) => set({ selectedDomaine: domaine }),
      setSelectedType: (type) => set({ selectedType: type }),
      setShowFavoritesOnly: (show) => set({ showFavoritesOnly: show }),

      getFilteredClauses: () => {
        const { clauses, searchQuery, selectedDomaine, selectedType, showFavoritesOnly } = get()
        let filtered = clauses

        // Filtrer par favoris
        if (showFavoritesOnly) {
          filtered = filtered.filter((c) => c.favoris)
        }

        // Filtrer par domaine
        if (selectedDomaine !== 'all') {
          filtered = filtered.filter((c) => c.domaine === selectedDomaine)
        }

        // Filtrer par type
        if (selectedType !== 'all') {
          filtered = filtered.filter((c) => c.type === selectedType)
        }

        // Filtrer par recherche
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          filtered = filtered.filter(
            (c) =>
              c.titre.toLowerCase().includes(query) ||
              c.description?.toLowerCase().includes(query) ||
              c.texteRecherche.toLowerCase().includes(query) ||
              c.tags.some((t) => t.toLowerCase().includes(query))
          )
        }

        // Trier : favoris d'abord, puis par usage, puis par titre
        return filtered.sort((a, b) => {
          if (a.favoris !== b.favoris) return a.favoris ? -1 : 1
          if (b.usageCount !== a.usageCount) return b.usageCount - a.usageCount
          return a.titre.localeCompare(b.titre)
        })
      },

      getClauseById: (id) => get().clauses.find((c) => c.id === id),

      getClausesByDomaine: (domaine) =>
        get().clauses.filter((c) => c.domaine === domaine),

      getRecentClauses: (limit = 5) =>
        [...get().clauses]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, limit),

      getFavoriteClauses: () => get().clauses.filter((c) => c.favoris),

      exportClauses: () => {
        const customClauses = get().clauses.filter((c) => !c.isBuiltin)
        return JSON.stringify(customClauses, null, 2)
      },

      importClauses: (json) => {
        try {
          const imported = JSON.parse(json) as Clause[]
          const now = new Date().toISOString()

          const newClauses = imported.map((c) => ({
            ...c,
            id: generateId(),
            isBuiltin: false,
            texteRecherche: extractTextFromContent(c.contenu),
            createdAt: now,
            updatedAt: now,
          }))

          set((state) => ({
            clauses: [...state.clauses, ...newClauses],
          }))
        } catch (error) {
          console.error('Failed to import clauses:', error)
          throw new Error('Format de fichier invalide')
        }
      },

      resetToDefaults: () => {
        set({ clauses: getDefaultClauses() })
      },
    }),
    {
      name: 'citadelle-clauses',
      partialize: (state) => ({
        clauses: state.clauses,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<ClauseStore>
        const defaults = getDefaultClauses()

        // Fusionner les builtins avec les données persistées
        const builtinIds = new Set(defaults.map((c) => c.id))
        const customClauses = persisted.clauses?.filter((c) => !builtinIds.has(c.id)) || []

        // Mettre à jour les builtins avec les favoris et usageCount persistés
        const mergedBuiltins = defaults.map((builtin) => {
          const persisted_clause = persisted.clauses?.find((c) => c.id === builtin.id)
          if (persisted_clause) {
            return {
              ...builtin,
              favoris: persisted_clause.favoris,
              usageCount: persisted_clause.usageCount,
            }
          }
          return builtin
        })

        return {
          ...currentState,
          clauses: [...mergedBuiltins, ...customClauses],
        }
      },
    }
  )
)
