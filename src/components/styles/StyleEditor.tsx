import { useState, useCallback } from 'react'
import { useStyleStore } from '../../store/useStyleStore'
import type { TextStyle, StyleCategory, StyleNodeType, TextStyleFormatting } from '../../types/templates'
import { STYLE_CATEGORY_LABELS } from '../../types/templates'

interface StyleEditorProps {
  style?: TextStyle
  isOpen: boolean
  onClose: () => void
}

const NODE_TYPE_OPTIONS: Array<{ value: StyleNodeType; label: string }> = [
  { value: 'heading', label: 'Titre' },
  { value: 'paragraph', label: 'Paragraphe' },
  { value: 'blockquote', label: 'Citation' },
  { value: 'codeBlock', label: 'Bloc de code' },
]

const CATEGORY_OPTIONS: Array<{ value: StyleCategory; label: string }> = [
  { value: 'headings', label: STYLE_CATEGORY_LABELS.headings },
  { value: 'body', label: STYLE_CATEGORY_LABELS.body },
  { value: 'blocks', label: STYLE_CATEGORY_LABELS.blocks },
  { value: 'custom', label: STYLE_CATEGORY_LABELS.custom },
]

const FONT_FAMILY_OPTIONS = [
  { value: 'system-ui, sans-serif', label: 'System (Sans-serif)' },
  { value: 'Georgia, serif', label: 'Georgia (Serif)' },
  { value: '"Times New Roman", serif', label: 'Times New Roman' },
  { value: '"SF Mono", Monaco, monospace', label: 'Monospace' },
]

const FONT_WEIGHT_OPTIONS = [
  { value: '400', label: 'Normal' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semibold' },
  { value: '700', label: 'Bold' },
]

const TEXT_ALIGN_OPTIONS = [
  { value: 'left', label: 'Gauche' },
  { value: 'center', label: 'Centre' },
  { value: 'right', label: 'Droite' },
  { value: 'justify', label: 'Justifié' },
]

export function StyleEditor({ style, isOpen, onClose }: StyleEditorProps) {
  const createStyle = useStyleStore((state) => state.createStyle)
  const updateStyle = useStyleStore((state) => state.updateStyle)

  const isEditing = !!style
  const isBuiltin = style?.isBuiltin ?? false

  const [name, setName] = useState(style?.name || '')
  const [shortcut, setShortcut] = useState(style?.shortcut || '')
  const [category, setCategory] = useState<StyleCategory>(style?.category || 'custom')
  const [nodeType, setNodeType] = useState<StyleNodeType>(style?.nodeType || 'paragraph')
  const [headingLevel, setHeadingLevel] = useState(
    style?.nodeType === 'heading' ? (style.attrs?.level as number || 1) : 1
  )

  const [formatting, setFormatting] = useState<TextStyleFormatting>({
    fontFamily: style?.formatting.fontFamily || 'system-ui, sans-serif',
    fontSize: style?.formatting.fontSize || '1rem',
    fontWeight: style?.formatting.fontWeight || '400',
    fontStyle: style?.formatting.fontStyle || 'normal',
    lineHeight: style?.formatting.lineHeight || '1.6',
    letterSpacing: style?.formatting.letterSpacing || '0',
    marginTop: style?.formatting.marginTop || '0',
    marginBottom: style?.formatting.marginBottom || '1rem',
    textAlign: style?.formatting.textAlign || 'left',
  })

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateFormatting = (key: keyof TextStyleFormatting, value: string) => {
    setFormatting((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      setError('Le nom est requis')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const styleData: Partial<TextStyle> = {
        name: name.trim(),
        shortcut: shortcut.trim() || undefined,
        category,
        nodeType,
        attrs: nodeType === 'heading' ? { level: headingLevel } : undefined,
        formatting,
      }

      if (isEditing && style) {
        await updateStyle(style.id, styleData)
      } else {
        await createStyle(styleData)
      }

      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsSaving(false)
    }
  }, [name, shortcut, category, nodeType, headingLevel, formatting, isEditing, style, createStyle, updateStyle, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {isEditing ? 'Modifier le style' : 'Nouveau style'}
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
        <div className="flex-1 overflow-y-auto p-6">
          {isBuiltin && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-700 dark:text-yellow-300">
              Les styles intégrés ne peuvent pas être modifiés. Dupliquez-le pour créer une version personnalisée.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isBuiltin}
                  placeholder="Mon style"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Raccourci
                </label>
                <input
                  type="text"
                  value={shortcut}
                  onChange={(e) => setShortcut(e.target.value)}
                  disabled={isBuiltin}
                  placeholder="Mod-Alt-X"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Catégorie
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as StyleCategory)}
                  disabled={isBuiltin}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={nodeType}
                  onChange={(e) => setNodeType(e.target.value as StyleNodeType)}
                  disabled={isBuiltin}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {NODE_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {nodeType === 'heading' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Niveau de titre
                </label>
                <select
                  value={headingLevel}
                  onChange={(e) => setHeadingLevel(parseInt(e.target.value))}
                  disabled={isBuiltin}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {[1, 2, 3, 4, 5, 6].map((level) => (
                    <option key={level} value={level}>H{level}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Formatage
              </h3>
            </div>

            {/* Typography */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Police
                </label>
                <select
                  value={formatting.fontFamily}
                  onChange={(e) => updateFormatting('fontFamily', e.target.value)}
                  disabled={isBuiltin}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {FONT_FAMILY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Taille
                </label>
                <input
                  type="text"
                  value={formatting.fontSize}
                  onChange={(e) => updateFormatting('fontSize', e.target.value)}
                  disabled={isBuiltin}
                  placeholder="1rem"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Graisse
                </label>
                <select
                  value={formatting.fontWeight}
                  onChange={(e) => updateFormatting('fontWeight', e.target.value)}
                  disabled={isBuiltin}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {FONT_WEIGHT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Interligne
                </label>
                <input
                  type="text"
                  value={formatting.lineHeight}
                  onChange={(e) => updateFormatting('lineHeight', e.target.value)}
                  disabled={isBuiltin}
                  placeholder="1.6"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Alignement
                </label>
                <select
                  value={formatting.textAlign || 'left'}
                  onChange={(e) => updateFormatting('textAlign', e.target.value)}
                  disabled={isBuiltin}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {TEXT_ALIGN_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Marge haut
                </label>
                <input
                  type="text"
                  value={formatting.marginTop}
                  onChange={(e) => updateFormatting('marginTop', e.target.value)}
                  disabled={isBuiltin}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Marge bas
                </label>
                <input
                  type="text"
                  value={formatting.marginBottom}
                  onChange={(e) => updateFormatting('marginBottom', e.target.value)}
                  disabled={isBuiltin}
                  placeholder="1rem"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Aperçu
              </h3>
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div
                  style={{
                    fontFamily: formatting.fontFamily || 'system-ui',
                    fontSize: formatting.fontSize || '1rem',
                    fontWeight: (formatting.fontWeight || '400') as React.CSSProperties['fontWeight'],
                    fontStyle: (formatting.fontStyle || 'normal') as React.CSSProperties['fontStyle'],
                    lineHeight: formatting.lineHeight || '1.6',
                    textAlign: (formatting.textAlign || 'left') as React.CSSProperties['textAlign'],
                  }}
                  className="text-gray-900 dark:text-gray-100"
                >
                  {name || 'Aperçu du style'}
                </div>
              </div>
            </div>
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
