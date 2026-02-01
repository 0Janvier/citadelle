import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Clause, ClauseDomaine, ClauseType } from '../types/editor-features'
import type { JSONContent } from '@tiptap/react'

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

// Extraire le texte d'un JSONContent pour la recherche
function extractTextFromContent(content: JSONContent): string {
  let text = ''

  if (content.text) {
    text += content.text + ' '
  }

  if (content.content) {
    for (const node of content.content) {
      text += extractTextFromContent(node)
    }
  }

  return text.trim()
}

// Clauses par défaut
function getDefaultClauses(): Clause[] {
  const now = new Date().toISOString()

  const defaults: Omit<Clause, 'id' | 'createdAt' | 'updatedAt' | 'texteRecherche'>[] = [
    // === CONTRATS ===
    {
      titre: 'Clause de confidentialité standard',
      description: 'Clause de confidentialité pour contrats commerciaux',
      contenu: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'ARTICLE X – CONFIDENTIALITÉ' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Chaque Partie s\'engage à considérer comme strictement confidentielles toutes les informations de quelque nature qu\'elles soient, écrites ou orales, relatives à l\'autre Partie, dont elle aura eu connaissance à l\'occasion de la négociation, de la conclusion ou de l\'exécution du présent contrat.',
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Les Parties s\'interdisent de divulguer ces informations à des tiers, sauf accord préalable et écrit de l\'autre Partie.',
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Cette obligation de confidentialité perdurera pendant une durée de [DURÉE] à compter de la fin du présent contrat, pour quelque cause que ce soit.',
              },
            ],
          },
        ],
      },
      domaine: 'contrats',
      type: 'confidentialite',
      tags: ['NDA', 'secret', 'commercial'],
      favoris: true,
      usageCount: 0,
      isBuiltin: true,
    },
    {
      titre: 'Clause de non-concurrence',
      description: 'Clause de non-concurrence pour contrats commerciaux ou de travail',
      contenu: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'ARTICLE X – NON-CONCURRENCE' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: '[LA PARTIE] s\'engage, pendant toute la durée du présent contrat et pendant une période de [DURÉE] suivant son terme, pour quelque cause que ce soit, à ne pas exercer, directement ou indirectement, une activité concurrente de celle de [L\'AUTRE PARTIE].',
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Cette interdiction s\'applique sur le territoire de [TERRITOIRE].',
              },
            ],
          },
        ],
      },
      domaine: 'contrats',
      type: 'divers',
      tags: ['concurrence', 'restriction'],
      favoris: false,
      usageCount: 0,
      isBuiltin: true,
    },
    {
      titre: 'Clause de force majeure',
      description: 'Clause de force majeure conforme à l\'article 1218 du Code civil',
      contenu: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'ARTICLE X – FORCE MAJEURE' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Aucune des Parties ne sera tenue pour responsable d\'un manquement à l\'une quelconque de ses obligations si ce manquement est provoqué par un événement de force majeure au sens de l\'article 1218 du Code civil.',
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'La Partie invoquant un événement de force majeure devra en informer l\'autre Partie dans un délai de [DÉLAI] jours ouvrés à compter de sa survenance, en précisant la nature de l\'événement et sa durée prévisible.',
              },
            ],
          },
        ],
      },
      domaine: 'contrats',
      type: 'responsabilite',
      tags: ['force majeure', 'exonération', 'responsabilité'],
      favoris: true,
      usageCount: 0,
      isBuiltin: true,
    },

    // === BAUX ===
    {
      titre: 'Clause de destination des lieux',
      description: 'Clause définissant l\'usage des locaux loués',
      contenu: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'ARTICLE X – DESTINATION DES LIEUX' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Les lieux loués sont destinés à l\'usage exclusif de [DESTINATION]. Le Preneur s\'interdit d\'exercer ou de faire exercer dans les lieux loués toute autre activité.',
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Toute modification de la destination des lieux devra faire l\'objet d\'un accord préalable et écrit du Bailleur.',
              },
            ],
          },
        ],
      },
      domaine: 'baux',
      type: 'objet',
      tags: ['bail', 'destination', 'locaux'],
      favoris: false,
      usageCount: 0,
      isBuiltin: true,
    },
    {
      titre: 'Clause résolutoire bail',
      description: 'Clause résolutoire pour défaut de paiement du loyer',
      contenu: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'ARTICLE X – CLAUSE RÉSOLUTOIRE' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'À défaut de paiement à son échéance d\'un seul terme de loyer ou de charges, ou à défaut d\'exécution de l\'une quelconque des conditions du présent bail, celui-ci sera résilié de plein droit, si bon semble au Bailleur, un mois après un commandement de payer demeuré infructueux, contenant déclaration par le Bailleur de son intention d\'user du bénéfice de la présente clause.',
              },
            ],
          },
        ],
      },
      domaine: 'baux',
      type: 'resiliation',
      tags: ['bail', 'résiliation', 'loyer', 'impayé'],
      favoris: true,
      usageCount: 0,
      isBuiltin: true,
    },

    // === SOCIÉTÉS ===
    {
      titre: 'Clause d\'agrément',
      description: 'Clause d\'agrément pour cession de parts sociales',
      contenu: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'ARTICLE X – CLAUSE D\'AGRÉMENT' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Les parts sociales sont librement cessibles entre associés. Toute cession de parts sociales à un tiers étranger à la société est soumise à l\'agrément préalable de la collectivité des associés statuant à la majorité des [FRACTION] des parts sociales.',
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'L\'associé cédant doit notifier le projet de cession à la société et à chacun des associés par lettre recommandée avec accusé de réception.',
              },
            ],
          },
        ],
      },
      domaine: 'societes',
      type: 'divers',
      tags: ['société', 'cession', 'parts', 'agrément'],
      favoris: false,
      usageCount: 0,
      isBuiltin: true,
    },

    // === LITIGES ===
    {
      titre: 'Clause attributive de juridiction',
      description: 'Clause d\'attribution de compétence territoriale',
      contenu: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'ARTICLE X – ATTRIBUTION DE JURIDICTION' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'TOUT LITIGE RELATIF À LA VALIDITÉ, L\'INTERPRÉTATION, L\'EXÉCUTION OU LA RÉSILIATION DU PRÉSENT CONTRAT SERA SOUMIS À LA COMPÉTENCE EXCLUSIVE DES TRIBUNAUX DE [VILLE], Y COMPRIS EN CAS DE RÉFÉRÉ, D\'APPEL EN GARANTIE OU DE PLURALITÉ DE DÉFENDEURS.',
              },
            ],
          },
        ],
      },
      domaine: 'contrats',
      type: 'litiges',
      tags: ['juridiction', 'compétence', 'tribunal'],
      favoris: true,
      usageCount: 0,
      isBuiltin: true,
    },
    {
      titre: 'Clause compromissoire (arbitrage)',
      description: 'Clause d\'arbitrage pour les litiges commerciaux',
      contenu: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'ARTICLE X – ARBITRAGE' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Tout différend découlant du présent contrat ou en relation avec celui-ci sera tranché définitivement suivant le Règlement d\'arbitrage de [CENTRE D\'ARBITRAGE], par un ou plusieurs arbitres nommés conformément à ce Règlement.',
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Le siège de l\'arbitrage sera [VILLE]. La langue de l\'arbitrage sera le français.',
              },
            ],
          },
        ],
      },
      domaine: 'commercial',
      type: 'litiges',
      tags: ['arbitrage', 'CCI', 'litige', 'international'],
      favoris: false,
      usageCount: 0,
      isBuiltin: true,
    },
  ]

  return defaults.map((clause, index) => ({
    ...clause,
    id: `builtin-clause-${index}`,
    texteRecherche: extractTextFromContent(clause.contenu),
    createdAt: now,
    updatedAt: now,
  }))
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
