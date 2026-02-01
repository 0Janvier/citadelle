import { useState, useEffect, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import type { Clause, ClauseDomaine, ClauseType } from '../../types/editor-features'
import { CLAUSE_DOMAINE_LABELS, CLAUSE_TYPE_LABELS } from '../../types/editor-features'
import type { JSONContent } from '@tiptap/react'

interface ClauseFormDialogProps {
  isOpen: boolean
  onClose: () => void
  clause?: Clause // undefined = création, défini = édition
  onSave: (clause: Omit<Clause, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'texteRecherche'>) => void
}

const DOMAINE_OPTIONS: ClauseDomaine[] = [
  'contrats',
  'baux',
  'societes',
  'travail',
  'famille',
  'immobilier',
  'commercial',
  'autre',
]

const TYPE_OPTIONS: ClauseType[] = [
  'objet',
  'duree',
  'prix',
  'paiement',
  'resiliation',
  'responsabilite',
  'confidentialite',
  'litiges',
  'divers',
]

export function ClauseFormDialog({ isOpen, onClose, clause, onSave }: ClauseFormDialogProps) {
  // État du formulaire
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [domaine, setDomaine] = useState<ClauseDomaine>('contrats')
  const [type, setType] = useState<ClauseType>('divers')
  const [tags, setTags] = useState('')
  const [favoris, setFavoris] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Éditeur TipTap simplifié pour le contenu
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none p-3 min-h-[150px] focus:outline-none',
      },
    },
  })

  // Initialiser les valeurs en mode édition
  useEffect(() => {
    if (clause) {
      setTitre(clause.titre)
      setDescription(clause.description || '')
      setDomaine(clause.domaine)
      setType(clause.type)
      setTags(clause.tags.join(', '))
      setFavoris(clause.favoris)
      if (editor && clause.contenu) {
        editor.commands.setContent(clause.contenu)
      }
    } else {
      // Reset en mode création
      setTitre('')
      setDescription('')
      setDomaine('contrats')
      setType('divers')
      setTags('')
      setFavoris(false)
      if (editor) {
        editor.commands.setContent('')
      }
    }
    setErrors({})
  }, [clause, editor, isOpen])

  // Validation du formulaire
  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!titre.trim()) {
      newErrors.titre = 'Le titre est requis'
    }

    if (!editor?.getText().trim()) {
      newErrors.contenu = 'Le contenu est requis'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [titre, editor])

  // Soumission du formulaire
  const handleSubmit = useCallback(() => {
    if (!validate()) return

    const contenu: JSONContent = editor?.getJSON() || { type: 'doc', content: [] }
    const tagArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    onSave({
      titre: titre.trim(),
      description: description.trim() || undefined,
      contenu,
      domaine,
      type,
      tags: tagArray,
      favoris,
      isBuiltin: clause?.isBuiltin || false,
    })

    onClose()
  }, [validate, editor, tags, titre, description, domaine, type, favoris, clause, onSave, onClose])

  if (!isOpen) return null

  const isEditing = !!clause
  const isBuiltin = clause?.isBuiltin || false

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className="relative bg-[var(--bg)] border border-[var(--border)] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Modifier la clause' : 'Nouvelle clause'}
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
                Cette clause est intégrée. Les modifications seront appliquées mais certains champs peuvent être limités.
              </p>
            </div>
          )}

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg bg-[var(--editor-bg)] ${
                errors.titre ? 'border-red-500' : 'border-[var(--border)]'
              }`}
              placeholder="Ex: Clause de confidentialité"
            />
            {errors.titre && <p className="text-xs text-red-500 mt-1">{errors.titre}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)]"
              placeholder="Description courte de la clause"
            />
          </div>

          {/* Domaine et Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Domaine</label>
              <select
                value={domaine}
                onChange={(e) => setDomaine(e.target.value as ClauseDomaine)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)]"
              >
                {DOMAINE_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {CLAUSE_DOMAINE_LABELS[d]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ClauseType)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)]"
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {CLAUSE_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contenu (éditeur TipTap) */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Contenu <span className="text-red-500">*</span>
            </label>
            <div
              className={`border rounded-lg overflow-hidden ${
                errors.contenu ? 'border-red-500' : 'border-[var(--border)]'
              }`}
            >
              {/* Toolbar simplifiée */}
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-gray-800 border-b border-[var(--border)]">
                <button
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                    editor?.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''
                  }`}
                  title="Gras"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
                  </svg>
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                    editor?.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''
                  }`}
                  title="Italique"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4M14 4l-4 16M6 20h4" />
                  </svg>
                </button>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
                <button
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                  className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                    editor?.isActive('heading', { level: 3 }) ? 'bg-gray-200 dark:bg-gray-700' : ''
                  }`}
                  title="Titre"
                >
                  <span className="text-xs font-bold">H3</span>
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                    editor?.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : ''
                  }`}
                  title="Liste"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
              {/* Zone d'édition */}
              <div className="bg-white dark:bg-gray-900">
                <EditorContent editor={editor} />
              </div>
            </div>
            {errors.contenu && <p className="text-xs text-red-500 mt-1">{errors.contenu}</p>}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1">Tags (séparés par des virgules)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)]"
              placeholder="contrat, commercial, NDA"
            />
          </div>

          {/* Favoris */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={favoris}
              onChange={(e) => setFavoris(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]"
            />
            <span className="text-sm">Marquer comme favori</span>
          </label>
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
