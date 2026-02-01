// LibraryItemEditor - Formulaire de création/édition d'un élément

import { useState, useEffect, useCallback } from 'react'
import type { LibraryItem, LibraryCategory, LibraryItemType, ContentFormat } from '../../types/library'
import { ITEM_TYPE_LABELS, extractVariables, isValidShortcut, normalizeShortcut } from '../../types/library'

interface LibraryItemEditorProps {
  isOpen: boolean
  onClose: () => void
  item?: LibraryItem
  categories: LibraryCategory[]
  existingShortcuts: string[]
  onSave: (item: Partial<LibraryItem>) => void
}

interface FormData {
  type: LibraryItemType
  title: string
  description: string
  content: string
  contentFormat: ContentFormat
  categoryId: string
  tags: string
  shortcut: string
  isFavorite: boolean
}

interface FormErrors {
  title?: string
  content?: string
  shortcut?: string
  categoryId?: string
}

export function LibraryItemEditor({
  isOpen,
  onClose,
  item,
  categories,
  existingShortcuts,
  onSave,
}: LibraryItemEditorProps) {
  const isEditing = !!item

  const [formData, setFormData] = useState<FormData>({
    type: 'clause',
    title: '',
    description: '',
    content: '',
    contentFormat: 'plaintext',
    categoryId: '',
    tags: '',
    shortcut: '',
    isFavorite: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [detectedVariables, setDetectedVariables] = useState<string[]>([])

  // Charger les données de l'élément en édition
  useEffect(() => {
    if (isOpen) {
      if (item) {
        // Convertir le contenu en string si nécessaire
        let contentString = ''
        if (typeof item.content === 'string') {
          contentString = item.content
        } else if (item.content) {
          // Pour JSONContent, extraire le texte (simplifié)
          contentString = item.searchText
        }

        setFormData({
          type: item.type,
          title: item.title,
          description: item.description || '',
          content: contentString,
          contentFormat: item.contentFormat,
          categoryId: item.categoryId,
          tags: item.tags.join(', '),
          shortcut: item.shortcut || '',
          isFavorite: item.isFavorite,
        })
        setDetectedVariables(item.variables)
      } else {
        // Réinitialiser pour une nouvelle création
        setFormData({
          type: 'clause',
          title: '',
          description: '',
          content: '',
          contentFormat: 'plaintext',
          categoryId: categories[0]?.id || '',
          tags: '',
          shortcut: '',
          isFavorite: false,
        })
        setDetectedVariables([])
      }
      setErrors({})
    }
  }, [isOpen, item, categories])

  // Détecter les variables dans le contenu
  useEffect(() => {
    if (formData.type === 'snippet' && formData.contentFormat === 'plaintext') {
      const vars = extractVariables(formData.content)
      setDetectedVariables(vars)
    }
  }, [formData.content, formData.type, formData.contentFormat])

  // Filtrer les catégories par type
  const filteredCategories = categories.filter(
    (cat) => cat.itemType === formData.type || cat.itemType === undefined
  )

  // Validation
  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Le contenu est requis'
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'La catégorie est requise'
    }

    if (formData.type === 'snippet' && formData.shortcut) {
      const normalized = normalizeShortcut(formData.shortcut)
      if (!isValidShortcut(normalized)) {
        newErrors.shortcut = 'Le raccourci doit commencer par / et ne contenir que des lettres, chiffres, - ou _'
      } else if (
        existingShortcuts.includes(normalized) &&
        (!item || item.shortcut !== normalized)
      ) {
        newErrors.shortcut = 'Ce raccourci est déjà utilisé'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, existingShortcuts, item])

  // Soumission
  const handleSubmit = useCallback(() => {
    if (!validate()) return

    const itemData: Partial<LibraryItem> = {
      type: formData.type,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      content: formData.content,
      contentFormat: formData.contentFormat,
      categoryId: formData.categoryId,
      tags: formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      isFavorite: formData.isFavorite,
      variables: detectedVariables,
    }

    if (formData.type === 'snippet' && formData.shortcut) {
      itemData.shortcut = normalizeShortcut(formData.shortcut)
    }

    // Conserver le source si en édition
    if (item) {
      itemData.source = item.source
    } else {
      itemData.source = 'custom'
    }

    onSave(itemData)
  }, [formData, detectedVariables, validate, item, onSave])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-[var(--bg)] rounded-xl shadow-xl">
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Modifier' : 'Nouvel'} élément
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulaire */}
        <div className="p-4 space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Type *</label>
            <div className="flex gap-2">
              {(['clause', 'snippet'] as LibraryItemType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      type,
                      contentFormat: type === 'clause' ? 'richtext' : 'plaintext',
                      categoryId: '',
                    }))
                  }}
                  disabled={isEditing}
                  className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                    formData.type === type
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                      : 'border-[var(--border)] hover:border-gray-300'
                  } ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {ITEM_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium mb-1">Titre *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg bg-[var(--editor-bg)] ${
                errors.title ? 'border-red-500' : 'border-[var(--border)]'
              }`}
              placeholder={formData.type === 'clause' ? 'Ex: Clause de confidentialité' : 'Ex: Plaise au Tribunal'}
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)]"
              placeholder="Description courte (optionnel)"
            />
          </div>

          {/* Raccourci (snippets uniquement) */}
          {formData.type === 'snippet' && (
            <div>
              <label className="block text-sm font-medium mb-1">Raccourci</label>
              <input
                type="text"
                value={formData.shortcut}
                onChange={(e) => setFormData((prev) => ({ ...prev, shortcut: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg bg-[var(--editor-bg)] font-mono ${
                  errors.shortcut ? 'border-red-500' : 'border-[var(--border)]'
                }`}
                placeholder="/monraccourci"
              />
              {errors.shortcut && <p className="mt-1 text-sm text-red-500">{errors.shortcut}</p>}
              <p className="mt-1 text-xs text-gray-500">
                Tapez ce raccourci dans l'éditeur pour insérer le contenu
              </p>
            </div>
          )}

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium mb-1">Catégorie *</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg bg-[var(--editor-bg)] ${
                errors.categoryId ? 'border-red-500' : 'border-[var(--border)]'
              }`}
            >
              <option value="">Sélectionner une catégorie</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="mt-1 text-sm text-red-500">{errors.categoryId}</p>}
          </div>

          {/* Contenu */}
          <div>
            <label className="block text-sm font-medium mb-1">Contenu *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              rows={8}
              className={`w-full px-3 py-2 border rounded-lg bg-[var(--editor-bg)] font-mono text-sm resize-y ${
                errors.content ? 'border-red-500' : 'border-[var(--border)]'
              }`}
              placeholder={
                formData.type === 'snippet'
                  ? 'Contenu avec {{variables}} optionnelles'
                  : 'Contenu de la clause'
              }
            />
            {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
            {formData.type === 'snippet' && (
              <p className="mt-1 text-xs text-gray-500">
                Utilisez {'{{variable}}'} pour créer des champs à remplir
              </p>
            )}
          </div>

          {/* Variables détectées */}
          {formData.type === 'snippet' && detectedVariables.length > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                Variables détectées:
              </p>
              <div className="flex flex-wrap gap-2">
                {detectedVariables.map((v) => (
                  <code
                    key={v}
                    className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-800 rounded"
                  >
                    {`{{${v}}}`}
                  </code>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)]"
              placeholder="Séparez les tags par des virgules"
            />
          </div>

          {/* Favori */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isFavorite}
              onChange={(e) => setFormData((prev) => ({ ...prev, isFavorite: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm">Ajouter aux favoris</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-[var(--border)]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            {isEditing ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  )
}
