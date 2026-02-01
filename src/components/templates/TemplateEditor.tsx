import { useState, useCallback } from 'react'
import { useTemplateStore } from '../../store/useTemplateStore'
import type { DocumentTemplate, TemplateCategory } from '../../types/templates'
import { TEMPLATE_CATEGORY_LABELS } from '../../types/templates'

interface TemplateEditorProps {
  template?: DocumentTemplate
  isOpen: boolean
  onClose: () => void
}

const CATEGORY_OPTIONS: Array<{ value: TemplateCategory; label: string }> = [
  { value: 'writing', label: TEMPLATE_CATEGORY_LABELS.writing },
  { value: 'business', label: TEMPLATE_CATEGORY_LABELS.business },
  { value: 'academic', label: TEMPLATE_CATEGORY_LABELS.academic },
  { value: 'personal', label: TEMPLATE_CATEGORY_LABELS.personal },
  { value: 'custom', label: TEMPLATE_CATEGORY_LABELS.custom },
]

const ICON_OPTIONS = [
  { value: 'file', label: 'Document' },
  { value: 'newspaper', label: 'Article' },
  { value: 'clipboard-list', label: 'Rapport' },
  { value: 'clipboard', label: 'Notes' },
  { value: 'envelope', label: 'Lettre' },
  { value: 'book-open', label: 'Livre' },
  { value: 'check-square', label: 'Liste' },
  { value: 'star', label: 'Favori' },
]

export function TemplateEditor({
  template,
  isOpen,
  onClose,
}: TemplateEditorProps) {
  const createTemplate = useTemplateStore((state) => state.createTemplate)
  const updateTemplate = useTemplateStore((state) => state.updateTemplate)

  const isEditing = !!template
  const isBuiltin = template?.isBuiltin ?? false

  const [name, setName] = useState(template?.name || '')
  const [description, setDescription] = useState(template?.description || '')
  const [category, setCategory] = useState<TemplateCategory>(template?.category || 'custom')
  const [icon, setIcon] = useState(template?.icon || 'file')
  const [tags, setTags] = useState(template?.metadata.tags.join(', ') || '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      setError('Le nom est requis')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const tagsList = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      if (isEditing && template) {
        // Update existing template
        await updateTemplate(template.id, {
          name: name.trim(),
          description: description.trim(),
          category,
          icon,
          metadata: {
            ...template.metadata,
            tags: tagsList,
          },
        })
      } else {
        // Create new template
        await createTemplate({
          name: name.trim(),
          description: description.trim(),
          category,
          icon,
          content: { type: 'doc', content: [{ type: 'paragraph' }] },
          metadata: {
            defaultStyles: [],
            tags: tagsList,
          },
        })
      }

      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsSaving(false)
    }
  }, [name, description, category, icon, tags, isEditing, template, createTemplate, updateTemplate, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {isEditing ? 'Modifier le template' : 'Nouveau template'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {isBuiltin && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-700 dark:text-yellow-300">
              Les templates intégrés ne peuvent pas être modifiés. Dupliquez-le pour créer une version personnalisée.
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isBuiltin}
              placeholder="Mon template"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isBuiltin}
              placeholder="Description du template..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Catégorie
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TemplateCategory)}
              disabled={isBuiltin}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Icône
            </label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              disabled={isBuiltin}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {ICON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags (séparés par des virgules)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={isBuiltin}
              placeholder="tag1, tag2, tag3"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Annuler
          </button>
          {!isBuiltin && (
            <button
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className={`
                px-4 py-2 text-sm font-medium rounded-lg transition-colors
                ${isSaving || !name.trim()
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
                }
              `}
            >
              {isSaving ? 'Enregistrement...' : isEditing ? 'Enregistrer' : 'Créer'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
