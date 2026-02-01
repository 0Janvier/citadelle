import { useState, useCallback } from 'react'
import { useThemeStore } from '../../store/useThemeStore'
import { ColorPicker } from './ColorPicker'
import type { InterfaceTheme, ThemeBase, ThemeColors } from '../../types/templates'

interface ThemeEditorProps {
  theme?: InterfaceTheme
  isOpen: boolean
  onClose: () => void
}


export function ThemeEditor({ theme, isOpen, onClose }: ThemeEditorProps) {
  const createTheme = useThemeStore((state) => state.createTheme)
  const updateTheme = useThemeStore((state) => state.updateTheme)

  const isEditing = !!theme
  const isBuiltin = theme?.isBuiltin ?? false

  // Form state
  const [name, setName] = useState(theme?.name || '')
  const [base, setBase] = useState<ThemeBase>(theme?.base || 'light')
  const [colors, setColors] = useState<ThemeColors>(
    theme?.colors || {
      bg: '#ffffff',
      bgSecondary: '#f5f5f7',
      editorBg: '#ffffff',
      text: '#1d1d1f',
      textSecondary: '#6e6e73',
      textMuted: '#8e8e93',
      accent: '#007aff',
      accentHover: '#0066d6',
      border: '#e5e7eb',
      selection: 'rgba(0, 122, 255, 0.2)',
      highlight: {
        yellow: '#fef08a',
        green: '#bbf7d0',
        blue: '#bfdbfe',
        pink: '#fbcfe8',
        orange: '#fed7aa',
        purple: '#ddd6fe',
      },
    }
  )
  const [editorFont, setEditorFont] = useState(theme?.typography.fontFamily.editor || 'system-ui, sans-serif')
  const [editorMaxWidth, setEditorMaxWidth] = useState(theme?.spacing.editorMaxWidth || '720px')
  const [editorPadding, setEditorPadding] = useState(theme?.spacing.editorPadding || '2rem')

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing'>('colors')

  const updateColor = (key: keyof ThemeColors, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }))
  }

  const updateHighlightColor = (key: string, value: string) => {
    setColors((prev) => ({
      ...prev,
      highlight: { ...prev.highlight, [key]: value },
    }))
  }

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      setError('Le nom est requis')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const themeData: Partial<InterfaceTheme> = {
        name: name.trim(),
        description: '',
        base,
        colors,
        typography: {
          fontFamily: {
            ui: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            editor: editorFont,
            mono: '"SF Mono", Monaco, "Cascadia Code", monospace',
          },
          fontSize: {
            base: '16px',
            small: '14px',
            large: '18px',
          },
          lineHeight: {
            tight: '1.3',
            normal: '1.6',
            relaxed: '1.8',
          },
        },
        spacing: {
          editorPadding,
          editorMaxWidth,
          sidebarWidth: '240px',
        },
        effects: {
          borderRadius: '8px',
          shadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          blur: '8px',
        },
      }

      if (isEditing && theme) {
        await updateTheme(theme.id, themeData)
      } else {
        await createTheme(themeData)
      }

      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsSaving(false)
    }
  }, [name, base, colors, editorFont, editorMaxWidth, editorPadding, isEditing, theme, createTheme, updateTheme, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {isEditing ? 'Modifier le thème' : 'Nouveau thème'}
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
              Les thèmes intégrés ne peuvent pas être modifiés. Dupliquez-le pour créer une version personnalisée.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Basic info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isBuiltin}
                placeholder="Mon thème"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Base
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setBase('light')}
                  disabled={isBuiltin}
                  className={`
                    flex-1 px-3 py-2 text-sm rounded-lg border transition-colors
                    ${base === 'light'
                      ? 'bg-white border-blue-500 text-blue-600'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }
                    disabled:opacity-50
                  `}
                >
                  Clair
                </button>
                <button
                  onClick={() => setBase('dark')}
                  disabled={isBuiltin}
                  className={`
                    flex-1 px-3 py-2 text-sm rounded-lg border transition-colors
                    ${base === 'dark'
                      ? 'bg-gray-800 border-blue-500 text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }
                    disabled:opacity-50
                  `}
                >
                  Sombre
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 border-b border-gray-200 dark:border-gray-700">
            {(['colors', 'typography', 'spacing'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-4 py-2 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === tab
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }
                `}
              >
                {tab === 'colors' ? 'Couleurs' : tab === 'typography' ? 'Typographie' : 'Espacement'}
              </button>
            ))}
          </div>

          {/* Colors tab */}
          {activeTab === 'colors' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <ColorPicker label="Arrière-plan" value={colors.bg} onChange={(v) => updateColor('bg', v)} disabled={isBuiltin} />
                <ColorPicker label="Arrière-plan secondaire" value={colors.bgSecondary} onChange={(v) => updateColor('bgSecondary', v)} disabled={isBuiltin} />
                <ColorPicker label="Arrière-plan éditeur" value={colors.editorBg} onChange={(v) => updateColor('editorBg', v)} disabled={isBuiltin} />
                <ColorPicker label="Bordures" value={colors.border} onChange={(v) => updateColor('border', v)} disabled={isBuiltin} />
                <ColorPicker label="Texte principal" value={colors.text} onChange={(v) => updateColor('text', v)} disabled={isBuiltin} />
                <ColorPicker label="Texte secondaire" value={colors.textSecondary} onChange={(v) => updateColor('textSecondary', v)} disabled={isBuiltin} />
                <ColorPicker label="Texte atténué" value={colors.textMuted} onChange={(v) => updateColor('textMuted', v)} disabled={isBuiltin} />
                <ColorPicker label="Accent" value={colors.accent} onChange={(v) => updateColor('accent', v)} disabled={isBuiltin} />
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Couleurs de surlignage
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <ColorPicker label="Jaune" value={colors.highlight.yellow} onChange={(v) => updateHighlightColor('yellow', v)} disabled={isBuiltin} />
                  <ColorPicker label="Vert" value={colors.highlight.green} onChange={(v) => updateHighlightColor('green', v)} disabled={isBuiltin} />
                  <ColorPicker label="Bleu" value={colors.highlight.blue} onChange={(v) => updateHighlightColor('blue', v)} disabled={isBuiltin} />
                  <ColorPicker label="Rose" value={colors.highlight.pink} onChange={(v) => updateHighlightColor('pink', v)} disabled={isBuiltin} />
                  <ColorPicker label="Orange" value={colors.highlight.orange} onChange={(v) => updateHighlightColor('orange', v)} disabled={isBuiltin} />
                  <ColorPicker label="Violet" value={colors.highlight.purple} onChange={(v) => updateHighlightColor('purple', v)} disabled={isBuiltin} />
                </div>
              </div>
            </div>
          )}

          {/* Typography tab */}
          {activeTab === 'typography' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Police de l'éditeur
                </label>
                <select
                  value={editorFont}
                  onChange={(e) => setEditorFont(e.target.value)}
                  disabled={isBuiltin}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="system-ui, sans-serif">System Sans</option>
                  <option value="Georgia, serif">Georgia (Serif)</option>
                  <option value='"Times New Roman", serif'>Times New Roman</option>
                  <option value='"Helvetica Neue", Helvetica, Arial, sans-serif'>Helvetica</option>
                </select>
              </div>
            </div>
          )}

          {/* Spacing tab */}
          {activeTab === 'spacing' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Largeur max de l'éditeur
                </label>
                <input
                  type="text"
                  value={editorMaxWidth}
                  onChange={(e) => setEditorMaxWidth(e.target.value)}
                  disabled={isBuiltin}
                  placeholder="720px"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Padding de l'éditeur
                </label>
                <input
                  type="text"
                  value={editorPadding}
                  onChange={(e) => setEditorPadding(e.target.value)}
                  disabled={isBuiltin}
                  placeholder="2rem"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Aperçu
            </h4>
            <div
              className="rounded-lg border overflow-hidden"
              style={{
                backgroundColor: colors.bg,
                borderColor: colors.border,
              }}
            >
              <div
                className="h-6 px-3 flex items-center gap-2"
                style={{ backgroundColor: colors.bgSecondary }}
              >
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              <div className="p-4" style={{ fontFamily: editorFont }}>
                <h1 style={{ color: colors.text, fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Titre de document
                </h1>
                <p style={{ color: colors.textSecondary, marginBottom: '0.5rem' }}>
                  Ceci est un aperçu du thème avec du texte d'exemple.
                </p>
                <p style={{ color: colors.textMuted, fontSize: '0.875rem' }}>
                  Texte atténué pour les informations secondaires.
                </p>
                <a href="#" style={{ color: colors.accent }}>
                  Lien d'exemple
                </a>
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
