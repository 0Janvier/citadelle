// LibraryBrowser - Interface principale de la bibliothèque unifiée

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useLibraryStore } from '../../store/useLibraryStore'
import { LibraryItemCard } from './LibraryItemCard'
import { LibraryItemEditor } from './LibraryItemEditor'
import { CategoryManager } from './CategoryManager'
import type { LibraryItem, LibraryItemType } from '../../types/library'
import { ITEM_TYPE_LABELS } from '../../types/library'
import { useToast } from '../../hooks/useToast'

interface LibraryBrowserProps {
  onInsert?: (item: LibraryItem) => void
  insertMode?: boolean
}

export function LibraryBrowser({ onInsert, insertMode = false }: LibraryBrowserProps) {
  const toast = useToast()
  const store = useLibraryStore()

  // États locaux
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<LibraryItem | undefined>()
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Initialiser le store au montage
  useEffect(() => {
    if (!store.isInitialized) {
      store.initialize()
    }
  }, [store])

  // Filtres
  const { filters } = store
  const filteredItems = store.getFilteredItems()

  // Catégories filtrées par type sélectionné
  const visibleCategories = useMemo(() => {
    if (filters.selectedType === 'all') {
      return store.categories
    }
    return store.categories.filter(
      (cat) => cat.itemType === filters.selectedType || cat.itemType === undefined
    )
  }, [store.categories, filters.selectedType])

  // Handlers
  const handleAdd = useCallback(
    (_type: LibraryItemType = 'clause') => {
      setEditingItem(undefined)
      setEditorOpen(true)
    },
    []
  )

  const handleEdit = useCallback((item: LibraryItem) => {
    setEditingItem(item)
    setEditorOpen(true)
  }, [])

  const handleSave = useCallback(
    async (itemData: Partial<LibraryItem>) => {
      try {
        if (editingItem) {
          await store.updateItem(editingItem.id, itemData)
          toast.success('Élément modifié')
        } else {
          await store.createItem(itemData as Omit<LibraryItem, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'usageCount' | 'searchText'>)
          toast.success('Élément créé')
        }
        setEditorOpen(false)
        setEditingItem(undefined)
      } catch (error) {
        toast.error(`Erreur: ${error}`)
      }
    },
    [editingItem, store, toast]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      const item = store.getItemById(id)
      if (!item) return

      if (item.source === 'builtin') {
        toast.error('Impossible de supprimer un élément intégré')
        return
      }

      if (confirm(`Supprimer "${item.title}" ?`)) {
        try {
          await store.deleteItem(id)
          setSelectedItemIds((prev) => prev.filter((sid) => sid !== id))
          toast.success('Élément supprimé')
        } catch (error) {
          toast.error(`Erreur: ${error}`)
        }
      }
    },
    [store, toast]
  )

  const handleDeleteSelected = useCallback(async () => {
    const deletableItems = selectedItemIds.filter((id) => {
      const item = store.getItemById(id)
      return item && item.source !== 'builtin'
    })

    if (deletableItems.length === 0) {
      toast.error('Aucun élément supprimable sélectionné')
      return
    }

    if (confirm(`Supprimer ${deletableItems.length} élément(s) ?`)) {
      for (const id of deletableItems) {
        try {
          await store.deleteItem(id)
        } catch (error) {
          console.error(`Erreur suppression ${id}:`, error)
        }
      }
      setSelectedItemIds([])
      toast.success(`${deletableItems.length} élément(s) supprimé(s)`)
    }
  }, [selectedItemIds, store, toast])

  const handleDuplicate = useCallback(
    async (id: string) => {
      try {
        await store.duplicateItem(id)
        toast.success('Élément dupliqué')
      } catch (error) {
        toast.error(`Erreur: ${error}`)
      }
    },
    [store, toast]
  )

  const handleToggleFavorite = useCallback(
    async (id: string) => {
      await store.toggleFavorite(id)
    },
    [store]
  )

  const handleInsert = useCallback(
    (item: LibraryItem) => {
      store.incrementUsage(item.id)
      onInsert?.(item)
    },
    [store, onInsert]
  )

  const handleExport = useCallback(async () => {
    try {
      const json = await store.exportLibrary()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `citadelle-library-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Bibliothèque exportée')
    } catch (error) {
      toast.error(`Erreur d'export: ${error}`)
    }
  }, [store, toast])

  const handleImport = useCallback(async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const json = await file.text()
        const result = await store.importLibrary(json, true)
        if (result.errors.length > 0) {
          toast.error(`Import partiel: ${result.errors.length} erreur(s)`)
        } else {
          toast.success(`${result.itemsImported} élément(s) importé(s)`)
        }
      } catch (error) {
        toast.error(`Erreur d'import: ${error}`)
      }
    }
    input.click()
  }, [store, toast])

  if (store.isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]" />
      </div>
    )
  }

  if (store.error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-4">
        <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-red-500">{store.error}</p>
        <button onClick={() => store.reload()} className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg">
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* En-tête avec filtres */}
      <div className="flex items-center justify-between mb-4 gap-4">
        {/* Recherche */}
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => store.setFilters({ searchQuery: e.target.value })}
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)]"
          />
        </div>

        {/* Filtre par type */}
        <select
          value={filters.selectedType}
          onChange={(e) => store.setFilters({ selectedType: e.target.value as LibraryItemType | 'all' })}
          className="px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
        >
          <option value="all">Tous les types</option>
          <option value="clause">{ITEM_TYPE_LABELS.clause}</option>
          <option value="snippet">{ITEM_TYPE_LABELS.snippet}</option>
        </select>

        {/* Filtre par catégorie */}
        <select
          value={filters.selectedCategoryId || ''}
          onChange={(e) => store.setFilters({ selectedCategoryId: e.target.value || null })}
          className="px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
        >
          <option value="">Toutes les catégories</option>
          {visibleCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Favoris */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.showFavoritesOnly}
            onChange={(e) => store.setFilters({ showFavoritesOnly: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Favoris</span>
        </label>

        {/* Mode d'affichage */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
            title="Vue grille"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
            title="Vue liste"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Bouton Ajouter */}
        {!insertMode && (
          <button
            onClick={() => handleAdd()}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter
          </button>
        )}
      </div>

      {/* Actions groupées */}
      {selectedItemIds.length > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {selectedItemIds.length} élément(s) sélectionné(s)
          </span>
          <button
            onClick={handleDeleteSelected}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Supprimer
          </button>
          <button
            onClick={() => setSelectedItemIds([])}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Désélectionner
          </button>
        </div>
      )}

      {/* Grille/Liste des éléments */}
      <div className="flex-1 overflow-auto">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-500">
            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-lg font-medium mb-2">Aucun élément trouvé</p>
            <p className="text-sm">
              {filters.searchQuery
                ? 'Essayez une autre recherche'
                : 'Ajoutez votre premier élément'}
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'flex flex-col gap-2'
            }
          >
            {filteredItems.map((item) => (
              <LibraryItemCard
                key={item.id}
                item={item}
                category={store.getCategoryById(item.categoryId)}
                viewMode={viewMode}
                isSelected={selectedItemIds.includes(item.id)}
                insertMode={insertMode}
                onSelect={(selected) => {
                  setSelectedItemIds((prev) =>
                    selected ? [...prev, item.id] : prev.filter((id) => id !== item.id)
                  )
                }}
                onEdit={() => handleEdit(item)}
                onDelete={() => handleDelete(item.id)}
                onDuplicate={() => handleDuplicate(item.id)}
                onToggleFavorite={() => handleToggleFavorite(item.id)}
                onInsert={() => handleInsert(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pied de page */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)] text-sm text-gray-500">
        <span>
          {filteredItems.length} élément(s) affiché(s) sur {store.items.length}
        </span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCategoryManagerOpen(true)}
            className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Catégories
          </button>
          <button onClick={handleImport} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Importer
          </button>
          <button onClick={handleExport} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exporter
          </button>
        </div>
      </div>

      {/* Dialog d'édition */}
      <LibraryItemEditor
        isOpen={editorOpen}
        onClose={() => {
          setEditorOpen(false)
          setEditingItem(undefined)
        }}
        item={editingItem}
        categories={store.categories}
        existingShortcuts={store.getAllShortcuts()}
        onSave={handleSave}
      />

      {/* Dialog de gestion des catégories */}
      <CategoryManager
        isOpen={categoryManagerOpen}
        onClose={() => setCategoryManagerOpen(false)}
        categories={store.categories}
        onCreateCategory={store.createCategory}
        onUpdateCategory={store.updateCategory}
        onDeleteCategory={store.deleteCategory}
      />
    </div>
  )
}
