import { useState, useCallback, useEffect } from 'react'
import { useTemplateStore } from '../../store/useTemplateStore'
import { useDocumentStore } from '../../store/useDocumentStore'
import type { TemplateCategory } from '../../types/templates'
import { TEMPLATE_CATEGORY_LABELS } from '../../types/templates'

interface SaveAsTemplateDialogProps {
  isOpen: boolean
  onClose: () => void
}

const CATEGORY_OPTIONS: Array<{ value: TemplateCategory; label: string }> = [
  { value: 'legal', label: TEMPLATE_CATEGORY_LABELS.legal },
  { value: 'writing', label: TEMPLATE_CATEGORY_LABELS.writing },
  { value: 'business', label: TEMPLATE_CATEGORY_LABELS.business },
  { value: 'academic', label: TEMPLATE_CATEGORY_LABELS.academic },
  { value: 'personal', label: TEMPLATE_CATEGORY_LABELS.personal },
  { value: 'custom', label: TEMPLATE_CATEGORY_LABELS.custom },
]

export function SaveAsTemplateDialog({ isOpen, onClose }: SaveAsTemplateDialogProps) {
  const createTemplate = useTemplateStore((state) => state.createTemplate)
  const updateTemplate = useTemplateStore((state) => state.updateTemplate)
  const getTemplate = useTemplateStore((state) => state.getTemplate)

  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId)
  const documents = useDocumentStore((state) => state.documents)

  const activeDoc = documents.find((d) => d.id === activeDocumentId)
  const existingTemplateId = activeDoc?.metadata?.templateId

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<TemplateCategory>('custom')
  const [tags, setTags] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Pre-fill from active document
  useEffect(() => {
    if (isOpen && activeDoc) {
      const docTitle = activeDoc.title.replace(/^\[Modèle\]\s*/, '')
      setName(docTitle)
      setDescription('')
      setTags('')
      setError(null)
      setSuccess(false)

      // If editing a template, pre-fill from it
      if (existingTemplateId) {
        const tmpl = getTemplate(existingTemplateId)
        if (tmpl) {
          setName(tmpl.name)
          setDescription(tmpl.description)
          setCategory(tmpl.category)
          setTags(tmpl.metadata.tags.join(', '))
        }
      }
    }
  }, [isOpen, activeDoc, existingTemplateId, getTemplate])

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      setError('Le nom est requis')
      return
    }
    if (!activeDoc) {
      setError('Aucun document actif')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const tagsList = tags.split(',').map((t) => t.trim()).filter(Boolean)

      if (existingTemplateId) {
        // Update existing template content
        const existing = getTemplate(existingTemplateId)
        if (existing && !existing.isBuiltin) {
          await updateTemplate(existingTemplateId, {
            name: name.trim(),
            description: description.trim(),
            category,
            content: activeDoc.content,
            metadata: {
              ...existing.metadata,
              tags: tagsList,
            },
          })
        }
      } else {
        // Create new template from document content
        await createTemplate({
          name: name.trim(),
          description: description.trim(),
          category,
          content: activeDoc.content,
          metadata: {
            defaultStyles: [],
            tags: tagsList,
          },
        })
      }

      setSuccess(true)
      setTimeout(() => onClose(), 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }, [name, description, category, tags, activeDoc, existingTemplateId, createTemplate, updateTemplate, getTemplate, onClose])

  // Keyboard
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, handleSave])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {existingTemplateId ? 'Mettre à jour le modèle' : 'Sauvegarder comme modèle'}
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
          {success && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-300">
              Modèle sauvegardé avec succès
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {!activeDoc && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-700 dark:text-yellow-300">
              Aucun document ouvert. Ouvrez ou créez un document d'abord.
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom du modèle <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mon modèle de conclusions"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
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
              placeholder="Description courte du modèle..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
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
              placeholder="conclusions, civil, tribunal"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tip about variables */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-500 dark:text-gray-400">
            <p className="font-medium mb-1">Astuce :</p>
            <p>
              Utilisez <code className="px-1 bg-gray-200 dark:bg-gray-700 rounded">{'{{variable}}'}</code> dans votre document pour créer des champs dynamiques
              (ex: <code className="px-1 bg-gray-200 dark:bg-gray-700 rounded">{'{{client.nom}}'}</code>). Ils seront proposés à la saisie lors de la création d'un document.
            </p>
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
          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim() || !activeDoc || success}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg transition-colors
              ${isSaving || !name.trim() || !activeDoc || success
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
              }
            `}
          >
            {isSaving ? 'Sauvegarde...' : existingTemplateId ? 'Mettre à jour' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  )
}
