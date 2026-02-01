import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { VariableDefinition, VariableCategory } from '../types/editor-features'
import { DEFAULT_VARIABLES } from '../data/variables/defaults'

interface VariableStore {
  // Définitions de variables
  definitions: VariableDefinition[]

  // Valeurs par défaut (globales)
  globalValues: Record<string, string>

  // Valeurs par document
  documentValues: Record<string, Record<string, string>>

  // État UI
  panelOpen: boolean
  selectedCategory: VariableCategory | 'all'

  // Actions - Définitions
  addDefinition: (definition: Omit<VariableDefinition, 'isBuiltin'>) => void
  updateDefinition: (key: string, updates: Partial<VariableDefinition>) => void
  deleteDefinition: (key: string) => void
  getDefinition: (key: string) => VariableDefinition | undefined

  // Actions - Valeurs
  setGlobalValue: (key: string, value: string) => void
  setDocumentValue: (documentId: string, key: string, value: string) => void
  getValue: (key: string, documentId?: string) => string
  getResolvedValue: (key: string, documentId?: string) => string
  clearDocumentValues: (documentId: string) => void

  // Résolution de texte avec variables
  resolveText: (text: string, documentId?: string) => string
  extractVariables: (text: string) => string[]

  // UI
  setPanelOpen: (open: boolean) => void
  togglePanel: () => void
  setSelectedCategory: (category: VariableCategory | 'all') => void
  getDefinitionsByCategory: () => Record<string, VariableDefinition[]>

  // Import/Export
  exportValues: () => string
  importValues: (json: string) => void

  // Synchronisation avec le profil avocat
  syncFromLawyerProfile: (profile: Record<string, unknown>) => void
}

// Formater une date en français
function formatDateFr(date: Date): string {
  const mois = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ]
  return `${date.getDate()} ${mois[date.getMonth()]} ${date.getFullYear()}`
}

// Valeurs dynamiques calculées
function getDynamicValue(key: string): string | null {
  const now = new Date()

  switch (key) {
    case 'date.jour':
      return now.toISOString().split('T')[0]
    case 'date.jour_lettres':
      return formatDateFr(now)
    default:
      return null
  }
}

export const useVariableStore = create<VariableStore>()(
  persist(
    (set, get) => ({
      definitions: DEFAULT_VARIABLES,
      globalValues: {},
      documentValues: {},
      panelOpen: false,
      selectedCategory: 'all',

      addDefinition: (definition) => {
        const newDef: VariableDefinition = {
          ...definition,
          isBuiltin: false,
        }
        set((state) => ({
          definitions: [...state.definitions, newDef],
        }))
      },

      updateDefinition: (key, updates) => {
        set((state) => ({
          definitions: state.definitions.map((d) =>
            d.key === key ? { ...d, ...updates } : d
          ),
        }))
      },

      deleteDefinition: (key) => {
        const def = get().definitions.find((d) => d.key === key)
        if (def?.isBuiltin) {
          console.warn('Cannot delete builtin variable definition')
          return
        }
        set((state) => ({
          definitions: state.definitions.filter((d) => d.key !== key),
          globalValues: Object.fromEntries(
            Object.entries(state.globalValues).filter(([k]) => k !== key)
          ),
        }))
      },

      getDefinition: (key) => {
        return get().definitions.find((d) => d.key === key)
      },

      setGlobalValue: (key, value) => {
        set((state) => ({
          globalValues: { ...state.globalValues, [key]: value },
        }))
      },

      setDocumentValue: (documentId, key, value) => {
        set((state) => ({
          documentValues: {
            ...state.documentValues,
            [documentId]: {
              ...state.documentValues[documentId],
              [key]: value,
            },
          },
        }))
      },

      getValue: (key, documentId) => {
        const { globalValues, documentValues, definitions } = get()

        // 1. Valeur spécifique au document
        if (documentId && documentValues[documentId]?.[key]) {
          return documentValues[documentId][key]
        }

        // 2. Valeur globale
        if (globalValues[key]) {
          return globalValues[key]
        }

        // 3. Valeur dynamique
        const dynamic = getDynamicValue(key)
        if (dynamic) {
          return dynamic
        }

        // 4. Valeur par défaut de la définition
        const def = definitions.find((d) => d.key === key)
        if (def?.defaultValue) {
          return def.defaultValue
        }

        return ''
      },

      getResolvedValue: (key, documentId) => {
        const value = get().getValue(key, documentId)
        const def = get().getDefinition(key)

        // Formater selon le type
        if (def?.type === 'date' && value) {
          try {
            const date = new Date(value)
            return formatDateFr(date)
          } catch {
            return value
          }
        }

        if (def?.type === 'number' && value) {
          const num = parseFloat(value)
          if (!isNaN(num)) {
            return new Intl.NumberFormat('fr-FR').format(num)
          }
        }

        return value
      },

      clearDocumentValues: (documentId) => {
        set((state) => {
          const newDocValues = { ...state.documentValues }
          delete newDocValues[documentId]
          return { documentValues: newDocValues }
        })
      },

      resolveText: (text, documentId) => {
        const { getResolvedValue } = get()

        // Remplacer toutes les variables {{key}}
        return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
          const value = getResolvedValue(key.trim(), documentId)
          return value || match // Garder le placeholder si pas de valeur
        })
      },

      extractVariables: (text) => {
        const matches = text.match(/\{\{([^}]+)\}\}/g)
        if (!matches) return []

        return [...new Set(matches.map((m) => m.replace(/[{}]/g, '').trim()))]
      },

      setPanelOpen: (open) => set({ panelOpen: open }),

      togglePanel: () => set((state) => ({ panelOpen: !state.panelOpen })),

      setSelectedCategory: (category) => set({ selectedCategory: category }),

      getDefinitionsByCategory: () => {
        const { definitions, selectedCategory } = get()
        const filtered = selectedCategory === 'all'
          ? definitions
          : definitions.filter((d) => d.category === selectedCategory)

        // Grouper par catégorie
        const grouped: Record<string, VariableDefinition[]> = {}
        for (const def of filtered) {
          if (!grouped[def.category]) {
            grouped[def.category] = []
          }
          grouped[def.category].push(def)
        }
        return grouped
      },

      exportValues: () => {
        const { globalValues, documentValues } = get()
        return JSON.stringify({ globalValues, documentValues }, null, 2)
      },

      importValues: (json) => {
        try {
          const { globalValues, documentValues } = JSON.parse(json)
          set({
            globalValues: { ...get().globalValues, ...globalValues },
            documentValues: { ...get().documentValues, ...documentValues },
          })
        } catch (error) {
          console.error('Failed to import values:', error)
          throw new Error('Format de fichier invalide')
        }
      },

      syncFromLawyerProfile: (profile) => {
        const { setGlobalValue } = get()

        // Mapper les champs du profil avocat vers les variables
        const mapping: Record<string, string> = {
          nom: 'avocat.nom',
          prenom: 'avocat.prenom',
          cabinet: 'avocat.cabinet',
          barreau: 'avocat.barreau',
          numeroToque: 'avocat.toque',
          adresse: 'avocat.adresse',
          codePostal: 'avocat.code_postal',
          ville: 'avocat.ville',
          telephone: 'avocat.telephone',
          email: 'avocat.email',
        }

        for (const [profileKey, variableKey] of Object.entries(mapping)) {
          const value = profile[profileKey]
          if (value && typeof value === 'string') {
            setGlobalValue(variableKey, value)
          }
        }
      },
    }),
    {
      name: 'citadelle-variables',
      partialize: (state) => ({
        definitions: state.definitions.filter((d) => !d.isBuiltin),
        globalValues: state.globalValues,
        documentValues: state.documentValues,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<VariableStore>
        return {
          ...currentState,
          definitions: [
            ...DEFAULT_VARIABLES,
            ...(persisted.definitions || []),
          ],
          globalValues: persisted.globalValues || {},
          documentValues: persisted.documentValues || {},
        }
      },
    }
  )
)
