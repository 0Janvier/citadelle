// Store unifié pour la bibliothèque (clauses + snippets)

import { create } from 'zustand'
import type { JSONContent } from '@tiptap/react'
import type {
  LibraryItem,
  LibraryCategory,
  LibraryMetadata,
  LibraryFilters,
  LibraryItemType,
  SortOption,
  SortDirection,
  ImportResult,
  MigrationResult,
} from '../types/library'
import {
  DEFAULT_FILTERS,
  generateLibraryItemId,
  generateCategoryId,
  jsonContentToSearchText,
  extractVariables,
  normalizeShortcut,
  LEGACY_DOMAINE_TO_CATEGORY,
  LEGACY_SNIPPET_CATEGORY_TO_CATEGORY,
} from '../types/library'
import * as storage from '../lib/libraryStorage'

// ============================================================================
// Store Interface
// ============================================================================

interface LibraryStore {
  // État
  items: LibraryItem[]
  categories: LibraryCategory[]
  metadata: LibraryMetadata | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null

  // Filtres
  filters: LibraryFilters

  // Actions d'initialisation
  initialize: () => Promise<void>
  reload: () => Promise<void>

  // Actions CRUD - Items
  saveItem: (item: LibraryItem) => Promise<void>
  createItem: (item: Omit<LibraryItem, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'usageCount' | 'searchText'>) => Promise<LibraryItem>
  updateItem: (id: string, updates: Partial<LibraryItem>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  duplicateItem: (id: string, newTitle?: string) => Promise<LibraryItem>
  resetToBuiltin: (id: string) => Promise<void>

  // Actions CRUD - Categories
  createCategory: (category: Omit<LibraryCategory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<LibraryCategory>
  updateCategory: (id: string, updates: Partial<LibraryCategory>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>

  // Actions utilisateur
  toggleFavorite: (id: string) => Promise<void>
  incrementUsage: (id: string) => Promise<void>

  // Filtres
  setFilters: (filters: Partial<LibraryFilters>) => void
  resetFilters: () => void
  getFilteredItems: () => LibraryItem[]

  // Recherche pour slash commands
  getSuggestions: (query: string) => LibraryItem[]
  findByShortcut: (shortcut: string) => LibraryItem | undefined
  getAllShortcuts: () => string[]

  // Utilitaires
  getItemById: (id: string) => LibraryItem | undefined
  getItemsByCategory: (categoryId: string) => LibraryItem[]
  getItemsByType: (type: LibraryItemType) => LibraryItem[]
  getCategoryById: (id: string) => LibraryCategory | undefined
  getBuiltinItems: () => LibraryItem[]
  getCustomItems: () => LibraryItem[]

  // Import/Export
  exportLibrary: () => Promise<string>
  exportItems: (ids: string[]) => Promise<string>
  importLibrary: (json: string, merge?: boolean) => Promise<ImportResult>

  // Backup
  createBackup: () => Promise<string>
  listBackups: () => Promise<{ path: string; date: string }[]>
  restoreBackup: (backupPath: string) => Promise<void>

  // Migration
  needsMigration: () => Promise<boolean>
  migrateFromLocalStorage: () => Promise<MigrationResult>
}

// ============================================================================
// Helpers
// ============================================================================

function computeSearchText(item: Partial<LibraryItem>): string {
  let searchText = item.title || ''

  if (item.description) {
    searchText += ' ' + item.description
  }

  if (item.content) {
    if (typeof item.content === 'string') {
      searchText += ' ' + item.content
    } else {
      searchText += ' ' + jsonContentToSearchText(item.content as JSONContent)
    }
  }

  if (item.tags && item.tags.length > 0) {
    searchText += ' ' + item.tags.join(' ')
  }

  if (item.shortcut) {
    searchText += ' ' + item.shortcut
  }

  return searchText.toLowerCase()
}

function sortItems(items: LibraryItem[], sortBy: SortOption, direction: SortDirection): LibraryItem[] {
  const sorted = [...items].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'usage':
        comparison = b.usageCount - a.usageCount
        break
      case 'recent':
        comparison = new Date(b.lastUsedAt || b.updatedAt).getTime() - new Date(a.lastUsedAt || a.updatedAt).getTime()
        break
      case 'created':
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        break
      case 'updated':
        comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        break
    }

    return direction === 'asc' ? comparison : -comparison
  })

  // Toujours mettre les favoris en premier
  return sorted.sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1
    if (!a.isFavorite && b.isFavorite) return 1
    return 0
  })
}

// ============================================================================
// Store
// ============================================================================

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  items: [],
  categories: [],
  metadata: null,
  isLoading: false,
  isInitialized: false,
  error: null,
  filters: DEFAULT_FILTERS,

  // =========================================================================
  // Initialisation
  // =========================================================================

  initialize: async () => {
    if (get().isInitialized) return

    set({ isLoading: true, error: null })

    try {
      await storage.initLibraryDirectory()

      const [items, categories, metadata] = await Promise.all([
        storage.loadAllItems(),
        storage.loadCategories(),
        storage.loadMetadata(),
      ])

      set({
        items,
        categories,
        metadata,
        isLoading: false,
        isInitialized: true,
      })
    } catch (error) {
      set({
        error: `Erreur d'initialisation: ${error}`,
        isLoading: false,
      })
    }
  },

  reload: async () => {
    set({ isLoading: true, error: null })

    try {
      const [items, categories, metadata] = await Promise.all([
        storage.loadAllItems(),
        storage.loadCategories(),
        storage.loadMetadata(),
      ])

      set({
        items,
        categories,
        metadata,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: `Erreur de rechargement: ${error}`,
        isLoading: false,
      })
    }
  },

  // =========================================================================
  // CRUD Items
  // =========================================================================

  saveItem: async (item) => {
    try {
      await storage.saveItem(item)
      set((state) => {
        const index = state.items.findIndex((i) => i.id === item.id)
        if (index >= 0) {
          const newItems = [...state.items]
          newItems[index] = item
          return { items: newItems }
        } else {
          return { items: [...state.items, item] }
        }
      })
    } catch (error) {
      set({ error: `Erreur de sauvegarde: ${error}` })
      throw error
    }
  },

  createItem: async (itemData) => {
    const now = new Date().toISOString()
    const id = generateLibraryItemId(itemData.type)

    // Calculer les variables si c'est un snippet
    let variables = itemData.variables || []
    if (itemData.type === 'snippet' && typeof itemData.content === 'string') {
      variables = extractVariables(itemData.content)
    }

    // Normaliser le raccourci
    let shortcut = itemData.shortcut
    if (shortcut) {
      shortcut = normalizeShortcut(shortcut)
    }

    const item: LibraryItem = {
      ...itemData,
      id,
      version: 1,
      shortcut,
      variables,
      searchText: '',
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    }

    item.searchText = computeSearchText(item)

    await get().saveItem(item)
    return item
  },

  updateItem: async (id, updates) => {
    const existing = get().items.find((i) => i.id === id)
    if (!existing) {
      throw new Error(`Item ${id} non trouvé`)
    }

    // Si on modifie un builtin, changer le source
    let source = existing.source
    let builtinId = existing.builtinId
    if (existing.source === 'builtin') {
      source = 'modified-builtin'
      builtinId = existing.id
    }

    // Recalculer les variables si le contenu change
    let variables = updates.variables || existing.variables
    if (updates.content && typeof updates.content === 'string') {
      variables = extractVariables(updates.content)
    }

    // Normaliser le raccourci
    let shortcut = updates.shortcut !== undefined ? updates.shortcut : existing.shortcut
    if (shortcut) {
      shortcut = normalizeShortcut(shortcut)
    }

    const updatedItem: LibraryItem = {
      ...existing,
      ...updates,
      source,
      builtinId,
      shortcut,
      variables,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
    }

    updatedItem.searchText = computeSearchText(updatedItem)

    await get().saveItem(updatedItem)
  },

  deleteItem: async (id) => {
    const item = get().items.find((i) => i.id === id)
    if (!item) return

    // Empêcher la suppression des builtins non modifiés
    if (item.source === 'builtin') {
      throw new Error('Impossible de supprimer un élément intégré')
    }

    try {
      await storage.deleteItem(id)
      set((state) => ({
        items: state.items.filter((i) => i.id !== id),
      }))
    } catch (error) {
      set({ error: `Erreur de suppression: ${error}` })
      throw error
    }
  },

  duplicateItem: async (id, newTitle) => {
    const original = get().items.find((i) => i.id === id)
    if (!original) {
      throw new Error(`Item ${id} non trouvé`)
    }

    const title = newTitle || `${original.title} (copie)`
    let shortcut = original.shortcut
    if (shortcut) {
      // Ajouter un suffix pour éviter les conflits
      shortcut = normalizeShortcut(shortcut + '-copie')
    }

    return get().createItem({
      type: original.type,
      title,
      description: original.description,
      content: original.content,
      contentFormat: original.contentFormat,
      categoryId: original.categoryId,
      tags: [...original.tags],
      shortcut,
      variables: [...original.variables],
      source: 'custom',
      isFavorite: false,
    })
  },

  resetToBuiltin: async (id) => {
    const item = get().items.find((i) => i.id === id)
    if (!item || item.source !== 'modified-builtin' || !item.builtinId) {
      throw new Error('Cet élément ne peut pas être réinitialisé')
    }

    // Trouver l'original dans les built-ins par défaut
    // Pour l'instant, on supprime simplement l'item modifié
    // L'original sera rechargé lors de la migration
    await get().deleteItem(id)
  },

  // =========================================================================
  // CRUD Categories
  // =========================================================================

  createCategory: async (categoryData) => {
    const now = new Date().toISOString()
    const category: LibraryCategory = {
      ...categoryData,
      id: generateCategoryId(),
      createdAt: now,
      updatedAt: now,
    }

    try {
      await storage.saveCategory(category)
      set((state) => ({
        categories: [...state.categories, category],
      }))
      return category
    } catch (error) {
      set({ error: `Erreur de création de catégorie: ${error}` })
      throw error
    }
  },

  updateCategory: async (id, updates) => {
    const existing = get().categories.find((c) => c.id === id)
    if (!existing) {
      throw new Error(`Catégorie ${id} non trouvée`)
    }

    const updated: LibraryCategory = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    try {
      await storage.saveCategory(updated)
      set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? updated : c)),
      }))
    } catch (error) {
      set({ error: `Erreur de mise à jour de catégorie: ${error}` })
      throw error
    }
  },

  deleteCategory: async (id) => {
    const category = get().categories.find((c) => c.id === id)
    if (!category) return

    if (category.isBuiltin) {
      throw new Error('Impossible de supprimer une catégorie intégrée')
    }

    // Vérifier qu'aucun item n'utilise cette catégorie
    const itemsInCategory = get().items.filter((i) => i.categoryId === id)
    if (itemsInCategory.length > 0) {
      throw new Error(`Impossible de supprimer: ${itemsInCategory.length} éléments utilisent cette catégorie`)
    }

    try {
      await storage.deleteCategory(id)
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
      }))
    } catch (error) {
      set({ error: `Erreur de suppression de catégorie: ${error}` })
      throw error
    }
  },

  // =========================================================================
  // Actions utilisateur
  // =========================================================================

  toggleFavorite: async (id) => {
    const item = get().items.find((i) => i.id === id)
    if (!item) return

    await get().updateItem(id, { isFavorite: !item.isFavorite })
  },

  incrementUsage: async (id) => {
    const item = get().items.find((i) => i.id === id)
    if (!item) return

    const now = new Date().toISOString()

    // Mise à jour optimiste
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id
          ? { ...i, usageCount: i.usageCount + 1, lastUsedAt: now }
          : i
      ),
    }))

    // Sauvegarder en arrière-plan
    try {
      await storage.saveItem({
        ...item,
        usageCount: item.usageCount + 1,
        lastUsedAt: now,
      })
    } catch (error) {
      console.error('Erreur de mise à jour du compteur:', error)
    }
  },

  // =========================================================================
  // Filtres
  // =========================================================================

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }))
  },

  resetFilters: () => {
    set({ filters: DEFAULT_FILTERS })
  },

  getFilteredItems: () => {
    const { items, filters } = get()
    let filtered = items

    // Filtre par type
    if (filters.selectedType !== 'all') {
      filtered = filtered.filter((i) => i.type === filters.selectedType)
    }

    // Filtre par catégorie
    if (filters.selectedCategoryId) {
      filtered = filtered.filter((i) => i.categoryId === filters.selectedCategoryId)
    }

    // Filtre par favoris
    if (filters.showFavoritesOnly) {
      filtered = filtered.filter((i) => i.isFavorite)
    }

    // Filtre builtin/custom
    if (filters.showBuiltinOnly) {
      filtered = filtered.filter((i) => i.source === 'builtin')
    }
    if (filters.showCustomOnly) {
      filtered = filtered.filter((i) => i.source === 'custom' || i.source === 'imported')
    }

    // Recherche textuelle
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter((i) => i.searchText.includes(query))
    }

    // Tri
    return sortItems(filtered, filters.sortBy, filters.sortDirection)
  },

  // =========================================================================
  // Recherche pour slash commands
  // =========================================================================

  getSuggestions: (query) => {
    const { items } = get()
    if (!query) return []

    const lowerQuery = query.toLowerCase()

    // Filtrer les snippets qui ont un raccourci
    const snippetsWithShortcut = items.filter((i) => i.type === 'snippet' && i.shortcut)

    const matches = snippetsWithShortcut.filter((s) => {
      const shortcut = s.shortcut!.toLowerCase()
      // Match par raccourci
      if (shortcut.startsWith(lowerQuery) || shortcut.startsWith('/' + lowerQuery)) {
        return true
      }
      // Match par titre
      if (s.title.toLowerCase().includes(lowerQuery)) {
        return true
      }
      return false
    })

    // Trier par pertinence puis par usage
    return matches
      .sort((a, b) => {
        const aShortcut = a.shortcut!.toLowerCase()
        const bShortcut = b.shortcut!.toLowerCase()

        // Priorité aux raccourcis exacts
        const aExact = aShortcut === '/' + lowerQuery
        const bExact = bShortcut === '/' + lowerQuery
        if (aExact && !bExact) return -1
        if (!aExact && bExact) return 1

        // Puis par raccourci commençant par la query
        const aStarts = aShortcut.startsWith('/' + lowerQuery)
        const bStarts = bShortcut.startsWith('/' + lowerQuery)
        if (aStarts && !bStarts) return -1
        if (!aStarts && bStarts) return 1

        // Puis par usage
        return b.usageCount - a.usageCount
      })
      .slice(0, 10)
  },

  findByShortcut: (shortcut) => {
    const normalized = normalizeShortcut(shortcut)
    return get().items.find((i) => i.shortcut === normalized)
  },

  getAllShortcuts: () => {
    return get()
      .items.filter((i) => i.shortcut)
      .map((i) => i.shortcut!)
  },

  // =========================================================================
  // Utilitaires
  // =========================================================================

  getItemById: (id) => get().items.find((i) => i.id === id),

  getItemsByCategory: (categoryId) => get().items.filter((i) => i.categoryId === categoryId),

  getItemsByType: (type) => get().items.filter((i) => i.type === type),

  getCategoryById: (id) => get().categories.find((c) => c.id === id),

  getBuiltinItems: () => get().items.filter((i) => i.source === 'builtin'),

  getCustomItems: () => get().items.filter((i) => i.source === 'custom' || i.source === 'imported'),

  // =========================================================================
  // Import/Export
  // =========================================================================

  exportLibrary: async () => {
    return storage.exportLibrary()
  },

  exportItems: async (ids) => {
    return storage.exportItems(ids)
  },

  importLibrary: async (json, merge = true) => {
    const result = await storage.importLibrary(json, merge)
    if (result.itemsImported > 0 || result.categoriesImported > 0) {
      await get().reload()
    }
    return result
  },

  // =========================================================================
  // Backup
  // =========================================================================

  createBackup: async () => {
    return storage.createBackup()
  },

  listBackups: async () => {
    return storage.listBackups()
  },

  restoreBackup: async (backupPath) => {
    await storage.restoreBackup(backupPath)
    await get().reload()
  },

  // =========================================================================
  // Migration
  // =========================================================================

  needsMigration: async () => {
    return storage.needsMigration()
  },

  migrateFromLocalStorage: async () => {
    const result: MigrationResult = {
      success: false,
      clausesMigrated: 0,
      snippetsMigrated: 0,
      categoriesCreated: 0,
      errors: [],
    }

    try {
      // Créer un backup avant migration
      result.backupPath = await storage.createBackup()

      const now = new Date().toISOString()

      // Récupérer les clauses du localStorage
      const clausesData = localStorage.getItem('citadelle-clauses')
      if (clausesData) {
        try {
          const parsed = JSON.parse(clausesData)
          const clauses = parsed.state?.clauses || []

          for (const clause of clauses) {
            try {
              const categoryId = LEGACY_DOMAINE_TO_CATEGORY[clause.domaine] || 'cat-clause-autre'

              const item: LibraryItem = {
                id: generateLibraryItemId('clause'),
                type: 'clause',
                version: 1,
                title: clause.titre,
                description: clause.description,
                content: clause.contenu,
                contentFormat: 'richtext',
                searchText: clause.texteRecherche || '',
                categoryId,
                tags: clause.tags || [],
                variables: [],
                legacyDomaine: clause.domaine,
                legacyClauseType: clause.type,
                source: clause.isBuiltin ? 'builtin' : 'custom',
                isFavorite: clause.favoris || false,
                usageCount: clause.usageCount || 0,
                createdAt: clause.createdAt || now,
                updatedAt: clause.updatedAt || now,
              }

              if (!item.searchText) {
                item.searchText = computeSearchText(item)
              }

              await storage.saveItem(item)
              result.clausesMigrated++
            } catch (error) {
              result.errors.push(`Erreur clause "${clause.titre}": ${error}`)
            }
          }
        } catch (error) {
          result.errors.push(`Erreur parsing clauses: ${error}`)
        }
      }

      // Récupérer les snippets du localStorage
      const snippetsData = localStorage.getItem('citadelle-snippets')
      if (snippetsData) {
        try {
          const parsed = JSON.parse(snippetsData)
          const snippets = parsed.state?.snippets || []

          for (const snippet of snippets) {
            try {
              const categoryId = LEGACY_SNIPPET_CATEGORY_TO_CATEGORY[snippet.category] || 'cat-custom'

              const item: LibraryItem = {
                id: generateLibraryItemId('snippet'),
                type: 'snippet',
                version: 1,
                title: snippet.nom,
                description: snippet.description,
                content: snippet.contenu,
                contentFormat: 'plaintext',
                searchText: '',
                categoryId,
                tags: [],
                shortcut: snippet.raccourci,
                variables: snippet.variables || extractVariables(snippet.contenu),
                legacySnippetCategory: snippet.category,
                source: snippet.isBuiltin ? 'builtin' : 'custom',
                isFavorite: false,
                usageCount: snippet.usageCount || 0,
                createdAt: snippet.createdAt || now,
                updatedAt: snippet.updatedAt || now,
              }

              item.searchText = computeSearchText(item)

              await storage.saveItem(item)
              result.snippetsMigrated++
            } catch (error) {
              result.errors.push(`Erreur snippet "${snippet.nom}": ${error}`)
            }
          }
        } catch (error) {
          result.errors.push(`Erreur parsing snippets: ${error}`)
        }
      }

      // Mettre à jour les métadonnées
      const metadata = await storage.loadMetadata()
      metadata.migratedFrom = 'localStorage'
      await storage.saveMetadata(metadata)

      // Recharger les données
      await get().reload()

      result.success = result.errors.length === 0
      return result
    } catch (error) {
      result.errors.push(`Erreur générale: ${error}`)
      return result
    }
  },
}))

// ============================================================================
// Hooks de compatibilité avec les anciens stores
// ============================================================================

// Ces fonctions permettent une transition douce
export function getClausesFromLibrary(): LibraryItem[] {
  return useLibraryStore.getState().getItemsByType('clause')
}

export function getSnippetsFromLibrary(): LibraryItem[] {
  return useLibraryStore.getState().getItemsByType('snippet')
}
