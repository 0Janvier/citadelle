import { useState, useEffect, useCallback } from 'react'
import type { Snippet, SnippetCategory } from '../../types/editor-features'
import { SNIPPET_CATEGORY_LABELS } from '../../types/editor-features'

interface SnippetFormDialogProps {
  isOpen: boolean
  onClose: () => void
  snippet?: Snippet // undefined = création, défini = édition
  onSave: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => void
  existingRaccourcis: string[] // Pour vérifier l'unicité
}

const CATEGORY_OPTIONS: SnippetCategory[] = [
  'contentieux',
  'contractuel',
  'courrier',
  'general',
  'custom',
]

export function SnippetFormDialog({
  isOpen,
  onClose,
  snippet,
  onSave,
  existingRaccourcis,
}: SnippetFormDialogProps) {
  // État du formulaire
  const [nom, setNom] = useState('')
  const [description, setDescription] = useState('')
  const [raccourci, setRaccourci] = useState('')
  const [contenu, setContenu] = useState('')
  const [category, setCategory] = useState<SnippetCategory>('custom')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialiser les valeurs en mode édition
  useEffect(() => {
    if (snippet) {
      setNom(snippet.nom)
      setDescription(snippet.description || '')
      setRaccourci(snippet.raccourci)
      setContenu(typeof snippet.contenu === 'string' ? snippet.contenu : JSON.stringify(snippet.contenu))
      setCategory(snippet.category)
    } else {
      // Reset en mode création
      setNom('')
      setDescription('')
      setRaccourci('/')
      setContenu('')
      setCategory('custom')
    }
    setErrors({})
  }, [snippet, isOpen])

  // Formater le raccourci (doit commencer par /)
  const handleRaccourciChange = (value: string) => {
    let formatted = value.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (!formatted.startsWith('/')) {
      formatted = '/' + formatted
    } else if (value.startsWith('/')) {
      formatted = value.toLowerCase()
    }
    setRaccourci(formatted)
  }

  // Extraire les variables du contenu (format {{variable}})
  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{([^}]+)\}\}/g)
    if (!matches) return []
    return matches.map((m) => m.replace(/\{\{|\}\}/g, '').trim())
  }

  // Validation du formulaire
  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!nom.trim()) {
      newErrors.nom = 'Le nom est requis'
    }

    if (!raccourci || raccourci === '/') {
      newErrors.raccourci = 'Le raccourci est requis'
    } else if (raccourci.length < 2) {
      newErrors.raccourci = 'Le raccourci doit contenir au moins 2 caractères'
    } else {
      // Vérifier l'unicité (sauf si c'est le même snippet en mode édition)
      const isUnique =
        !existingRaccourcis.includes(raccourci) ||
        (snippet && snippet.raccourci === raccourci)
      if (!isUnique) {
        newErrors.raccourci = 'Ce raccourci est déjà utilisé'
      }
    }

    if (!contenu.trim()) {
      newErrors.contenu = 'Le contenu est requis'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [nom, raccourci, contenu, existingRaccourcis, snippet])

  // Soumission du formulaire
  const handleSubmit = useCallback(() => {
    if (!validate()) return

    const variables = extractVariables(contenu)

    onSave({
      nom: nom.trim(),
      description: description.trim() || undefined,
      raccourci: raccourci.trim(),
      contenu: contenu.trim(),
      category,
      variables,
      isBuiltin: snippet?.isBuiltin || false,
    })

    onClose()
  }, [validate, nom, description, raccourci, contenu, category, snippet, onSave, onClose])

  if (!isOpen) return null

  const isEditing = !!snippet
  const isBuiltin = snippet?.isBuiltin || false

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className="relative bg-[var(--bg)] border border-[var(--border)] rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Modifier le snippet' : 'Nouveau snippet'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--editor-bg)] rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isBuiltin && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Ce snippet est intégré. Le raccourci ne peut pas être modifié.
              </p>
            </div>
          )}

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg bg-[var(--editor-bg)] ${
                errors.nom ? 'border-red-500' : 'border-[var(--border)]'
              }`}
              placeholder="Ex: Formule de politesse"
            />
            {errors.nom && <p className="text-xs text-red-500 mt-1">{errors.nom}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)]"
              placeholder="Description courte du snippet"
            />
          </div>

          {/* Raccourci et Catégorie */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Raccourci <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={raccourci}
                onChange={(e) => handleRaccourciChange(e.target.value)}
                disabled={isBuiltin}
                className={`w-full px-3 py-2 border rounded-lg font-mono ${
                  errors.raccourci ? 'border-red-500' : 'border-[var(--border)]'
                } ${isBuiltin ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : 'bg-[var(--editor-bg)]'}`}
                placeholder="/monraccourci"
              />
              {errors.raccourci && <p className="text-xs text-red-500 mt-1">{errors.raccourci}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SnippetCategory)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)]"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {SNIPPET_CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contenu */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Contenu <span className="text-red-500">*</span>
            </label>
            <textarea
              value={contenu}
              onChange={(e) => setContenu(e.target.value)}
              rows={6}
              className={`w-full px-3 py-2 border rounded-lg bg-[var(--editor-bg)] resize-none ${
                errors.contenu ? 'border-red-500' : 'border-[var(--border)]'
              }`}
              placeholder="Tapez le contenu du snippet..."
            />
            {errors.contenu && <p className="text-xs text-red-500 mt-1">{errors.contenu}</p>}
          </div>

          {/* Variables détectées */}
          {contenu && extractVariables(contenu).length > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                Variables détectées :
              </p>
              <div className="flex flex-wrap gap-2">
                {extractVariables(contenu).map((v, i) => (
                  <code
                    key={i}
                    className="px-2 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded text-xs"
                  >
                    {`{{${v}}}`}
                  </code>
                ))}
              </div>
            </div>
          )}

          {/* Aide */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-500">
            <p className="font-medium mb-1">Astuce :</p>
            <p>
              Utilisez <code className="px-1 bg-gray-200 dark:bg-gray-700 rounded">{`{{variable}}`}</code> pour
              créer des variables dynamiques qui seront remplacées lors de l'insertion.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border)]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-[var(--border)] rounded-lg hover:bg-[var(--editor-bg)] transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            {isEditing ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  )
}
