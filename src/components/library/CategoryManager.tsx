// CategoryManager - Gestion des catégories de la bibliothèque

import { useState, useCallback } from 'react'
import type { LibraryCategory, LibraryItemType } from '../../types/library'
import { ITEM_TYPE_LABELS } from '../../types/library'
import { useToast } from '../../hooks/useToast'

interface CategoryManagerProps {
  isOpen: boolean
  onClose: () => void
  categories: LibraryCategory[]
  onCreateCategory: (category: Omit<LibraryCategory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<LibraryCategory>
  onUpdateCategory: (id: string, updates: Partial<LibraryCategory>) => Promise<void>
  onDeleteCategory: (id: string) => Promise<void>
}

interface CategoryFormData {
  name: string
  description: string
  color: string
  icon: string
  itemType: LibraryItemType | ''
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#6b7280', // gray
]

const DEFAULT_ICONS = [
  'file-text',
  'folder',
  'briefcase',
  'home',
  'users',
  'heart',
  'building',
  'shopping-cart',
  'mail',
  'gavel',
  'handshake',
  'star',
]

export function CategoryManager({
  isOpen,
  onClose,
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}: CategoryManagerProps) {
  const toast = useToast()

  const [editingCategory, setEditingCategory] = useState<LibraryCategory | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    color: DEFAULT_COLORS[0],
    icon: DEFAULT_ICONS[0],
    itemType: '',
  })

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      color: DEFAULT_COLORS[0],
      icon: DEFAULT_ICONS[0],
      itemType: '',
    })
    setEditingCategory(null)
    setShowForm(false)
  }, [])

  const handleEdit = useCallback((category: LibraryCategory) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || DEFAULT_COLORS[0],
      icon: category.icon || DEFAULT_ICONS[0],
      itemType: category.itemType || '',
    })
    setShowForm(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!formData.name.trim()) {
      toast.error('Le nom est requis')
      return
    }

    try {
      if (editingCategory) {
        await onUpdateCategory(editingCategory.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          color: formData.color,
          icon: formData.icon,
          itemType: formData.itemType || undefined,
        })
        toast.success('Catégorie modifiée')
      } else {
        await onCreateCategory({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          color: formData.color,
          icon: formData.icon,
          itemType: formData.itemType || undefined,
          isBuiltin: false,
          order: categories.length + 1,
          parentId: null,
        })
        toast.success('Catégorie créée')
      }
      resetForm()
    } catch (error) {
      toast.error(`Erreur: ${error}`)
    }
  }, [formData, editingCategory, onCreateCategory, onUpdateCategory, categories.length, toast, resetForm])

  const handleDelete = useCallback(
    async (category: LibraryCategory) => {
      if (category.isBuiltin) {
        toast.error('Impossible de supprimer une catégorie intégrée')
        return
      }

      if (confirm(`Supprimer la catégorie "${category.name}" ?`)) {
        try {
          await onDeleteCategory(category.id)
          toast.success('Catégorie supprimée')
        } catch (error) {
          toast.error(`Erreur: ${error}`)
        }
      }
    },
    [onDeleteCategory, toast]
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-xl max-h-[80vh] overflow-auto bg-[var(--bg)] rounded-xl shadow-xl">
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold">Gestion des catégories</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Liste des catégories */}
        <div className="p-4">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full mb-4 py-2 px-4 border-2 border-dashed border-[var(--border)] rounded-lg text-gray-500 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
            >
              + Nouvelle catégorie
            </button>
          )}

          {/* Formulaire */}
          {showForm && (
            <div className="mb-4 p-4 border border-[var(--border)] rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <h3 className="font-medium mb-3">
                {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </h3>

              <div className="space-y-3">
                {/* Nom */}
                <div>
                  <label className="block text-sm mb-1">Nom *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)]"
                    placeholder="Nom de la catégorie"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)]"
                    placeholder="Description (optionnel)"
                  />
                </div>

                {/* Type d'élément */}
                <div>
                  <label className="block text-sm mb-1">Type d'élément</label>
                  <select
                    value={formData.itemType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, itemType: e.target.value as LibraryItemType | '' }))}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)]"
                  >
                    <option value="">Tous les types</option>
                    <option value="clause">{ITEM_TYPE_LABELS.clause}</option>
                    <option value="snippet">{ITEM_TYPE_LABELS.snippet}</option>
                  </select>
                </div>

                {/* Couleur */}
                <div>
                  <label className="block text-sm mb-1">Couleur</label>
                  <div className="flex gap-2">
                    {DEFAULT_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${
                          formData.color === color
                            ? 'border-gray-800 dark:border-white scale-110'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={resetForm}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-3 py-1.5 text-sm bg-[var(--accent)] text-white rounded-lg hover:opacity-90"
                  >
                    {editingCategory ? 'Enregistrer' : 'Créer'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Liste */}
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 border border-[var(--border)] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: category.color || '#6b7280' }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{category.name}</span>
                      {category.isBuiltin && (
                        <span className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded">
                          Intégré
                        </span>
                      )}
                      {category.itemType && (
                        <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded">
                          {ITEM_TYPE_LABELS[category.itemType]}
                        </span>
                      )}
                    </div>
                    {category.description && (
                      <p className="text-sm text-gray-500">{category.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Modifier"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {!category.isBuiltin && (
                    <button
                      onClick={() => handleDelete(category)}
                      className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500"
                      title="Supprimer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pied */}
        <div className="flex justify-end p-4 border-t border-[var(--border)]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
