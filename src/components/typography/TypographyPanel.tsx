/**
 * Panneau de configuration de la typographie et des paragraphes
 * Permet de modifier la police, la taille, l'interligne et l'alignement
 */

import { useSettingsStore } from '../../store/useSettingsStore'
import { useEditorStore } from '../../store/useEditorStore'

interface TypographyPanelProps {
  onClose?: () => void
}

// Polices disponibles (Garamond par défaut)
const FONT_FAMILIES = [
  { value: 'Garamond, serif', label: 'Garamond', preview: 'Aa' },
  { value: 'Georgia, serif', label: 'Georgia', preview: 'Aa' },
  { value: 'Times New Roman, serif', label: 'Times New Roman', preview: 'Aa' },
  { value: 'Palatino, serif', label: 'Palatino', preview: 'Aa' },
  { value: 'Baskerville, serif', label: 'Baskerville', preview: 'Aa' },
  { value: 'Helvetica, Arial, sans-serif', label: 'Helvetica', preview: 'Aa' },
  { value: 'Arial, sans-serif', label: 'Arial', preview: 'Aa' },
  { value: 'Verdana, sans-serif', label: 'Verdana', preview: 'Aa' },
  { value: 'system-ui', label: 'Système', preview: 'Aa' },
  { value: 'Courier New, monospace', label: 'Courier New', preview: 'Aa' },
]

// Tailles de police prédéfinies
const FONT_SIZES = [10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 24]

// Interlignes prédéfinis
const LINE_HEIGHTS = [
  { value: 1.0, label: 'Simple' },
  { value: 1.15, label: '1,15' },
  { value: 1.5, label: '1,5' },
  { value: 1.6, label: '1,6' },
  { value: 1.8, label: '1,8' },
  { value: 2.0, label: 'Double' },
]

// Valeurs de retrait prédéfinies (en cm)
const PARAGRAPH_INDENTS = [0, 0.5, 1, 1.5, 2, 2.5, 3]

// Valeurs d'espacement entre paragraphes (en em)
const PARAGRAPH_SPACINGS = [0.5, 0.75, 1, 1.25, 1.5, 2]

export function TypographyPanel({ onClose }: TypographyPanelProps) {
  const fontSize = useSettingsStore((s) => s.fontSize)
  const setFontSize = useSettingsStore((s) => s.setFontSize)
  const fontFamily = useSettingsStore((s) => s.fontFamily)
  const setFontFamily = useSettingsStore((s) => s.setFontFamily)
  const lineHeight = useSettingsStore((s) => s.lineHeight)
  const setLineHeight = useSettingsStore((s) => s.setLineHeight)
  const paragraphIndent = useSettingsStore((s) => s.paragraphIndent)
  const setParagraphIndent = useSettingsStore((s) => s.setParagraphIndent)
  const paragraphSpacing = useSettingsStore((s) => s.paragraphSpacing)
  const setParagraphSpacing = useSettingsStore((s) => s.setParagraphSpacing)

  const activeEditor = useEditorStore((s) => s.activeEditor)

  // Actions d'alignement sur l'éditeur
  const handleAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
    if (!activeEditor) return
    activeEditor.chain().focus().setTextAlign(align).run()
  }

  const currentAlign = activeEditor?.isActive({ textAlign: 'left' })
    ? 'left'
    : activeEditor?.isActive({ textAlign: 'center' })
    ? 'center'
    : activeEditor?.isActive({ textAlign: 'right' })
    ? 'right'
    : activeEditor?.isActive({ textAlign: 'justify' })
    ? 'justify'
    : 'left'

  return (
    <div className="flex flex-col h-full bg-[var(--bg)]">
      {/* En-tête */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <h2 className="text-lg font-semibold">Typographie</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--editor-bg)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Police de caractères */}
        <section>
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Police de caractères</h3>
          <div className="grid grid-cols-2 gap-2">
            {FONT_FAMILIES.map((font) => (
              <button
                key={font.value}
                onClick={() => setFontFamily(font.value)}
                className={`
                  flex items-center gap-2 p-2 rounded-lg border text-left transition-all
                  ${fontFamily === font.value
                    ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                    : 'border-[var(--border)] hover:border-gray-400 hover:bg-[var(--editor-bg)]'
                  }
                `}
              >
                <span
                  className="text-lg font-medium w-8"
                  style={{ fontFamily: font.value }}
                >
                  {font.preview}
                </span>
                <span className="text-sm truncate">{font.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Taille de police */}
        <section>
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Taille du texte</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFontSize(fontSize - 1)}
              disabled={fontSize <= 10}
              className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--editor-bg)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>

            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-center font-medium"
            >
              {FONT_SIZES.map((size) => (
                <option key={size} value={size}>{size} px</option>
              ))}
            </select>

            <button
              onClick={() => setFontSize(fontSize + 1)}
              disabled={fontSize >= 24}
              className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--editor-bg)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Slider pour la taille */}
          <input
            type="range"
            min="10"
            max="24"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full mt-3 accent-[var(--accent)]"
          />
        </section>

        {/* Interligne */}
        <section>
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Interligne</h3>
          <div className="flex flex-wrap gap-2">
            {LINE_HEIGHTS.map((lh) => (
              <button
                key={lh.value}
                onClick={() => setLineHeight(lh.value)}
                className={`
                  px-3 py-2 rounded-lg border text-sm transition-all
                  ${lineHeight === lh.value
                    ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                    : 'border-[var(--border)] hover:border-gray-400 hover:bg-[var(--editor-bg)]'
                  }
                `}
              >
                {lh.label}
              </button>
            ))}
          </div>
        </section>

        {/* Alignement du paragraphe */}
        <section>
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Alignement</h3>
          <div className="flex gap-2">
            <button
              onClick={() => handleAlign('left')}
              className={`
                flex-1 p-3 rounded-lg border transition-all flex items-center justify-center
                ${currentAlign === 'left'
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                  : 'border-[var(--border)] hover:bg-[var(--editor-bg)]'
                }
              `}
              title="Aligner à gauche"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M3 6h18M3 10h12M3 14h18M3 18h12" />
              </svg>
            </button>
            <button
              onClick={() => handleAlign('center')}
              className={`
                flex-1 p-3 rounded-lg border transition-all flex items-center justify-center
                ${currentAlign === 'center'
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                  : 'border-[var(--border)] hover:bg-[var(--editor-bg)]'
                }
              `}
              title="Centrer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M3 6h18M6 10h12M3 14h18M6 18h12" />
              </svg>
            </button>
            <button
              onClick={() => handleAlign('right')}
              className={`
                flex-1 p-3 rounded-lg border transition-all flex items-center justify-center
                ${currentAlign === 'right'
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                  : 'border-[var(--border)] hover:bg-[var(--editor-bg)]'
                }
              `}
              title="Aligner à droite"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M3 6h18M9 10h12M3 14h18M9 18h12" />
              </svg>
            </button>
            <button
              onClick={() => handleAlign('justify')}
              className={`
                flex-1 p-3 rounded-lg border transition-all flex items-center justify-center
                ${currentAlign === 'justify'
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                  : 'border-[var(--border)] hover:bg-[var(--editor-bg)]'
                }
              `}
              title="Justifier"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M3 6h18M3 10h18M3 14h18M3 18h18" />
              </svg>
            </button>
          </div>
        </section>

        {/* Retrait et espacement des paragraphes */}
        <section>
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Retrait et espacement</h3>
          <div className="space-y-4">
            {/* Retrait première ligne */}
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                Retrait première ligne
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const currentIndex = PARAGRAPH_INDENTS.indexOf(paragraphIndent)
                    if (currentIndex > 0) {
                      setParagraphIndent(PARAGRAPH_INDENTS[currentIndex - 1])
                    }
                  }}
                  disabled={paragraphIndent <= 0}
                  className="p-1.5 rounded border border-[var(--border)] hover:bg-[var(--editor-bg)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <select
                  value={paragraphIndent}
                  onChange={(e) => setParagraphIndent(Number(e.target.value))}
                  className="flex-1 px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--bg)] text-center text-sm"
                >
                  {PARAGRAPH_INDENTS.map((indent) => (
                    <option key={indent} value={indent}>
                      {indent === 0 ? 'Aucun' : `${indent} cm`}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    const currentIndex = PARAGRAPH_INDENTS.indexOf(paragraphIndent)
                    if (currentIndex < PARAGRAPH_INDENTS.length - 1) {
                      setParagraphIndent(PARAGRAPH_INDENTS[currentIndex + 1])
                    }
                  }}
                  disabled={paragraphIndent >= 3}
                  className="p-1.5 rounded border border-[var(--border)] hover:bg-[var(--editor-bg)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Espacement entre paragraphes */}
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                Espacement entre paragraphes
              </label>
              <div className="flex flex-wrap gap-2">
                {PARAGRAPH_SPACINGS.map((spacing) => (
                  <button
                    key={spacing}
                    onClick={() => setParagraphSpacing(spacing)}
                    className={`
                      px-3 py-1.5 rounded-lg border text-sm transition-all
                      ${paragraphSpacing === spacing
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                        : 'border-[var(--border)] hover:border-gray-400 hover:bg-[var(--editor-bg)]'
                      }
                    `}
                  >
                    {spacing === 1 ? 'Normal' : `${spacing}×`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Aperçu */}
        <section className="mt-6">
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Aperçu</h3>
          <div
            className="p-4 rounded-lg border border-[var(--border)] bg-white dark:bg-gray-900"
            style={{
              fontFamily,
              fontSize: `${fontSize}px`,
              lineHeight,
            }}
          >
            <p style={{
              textIndent: paragraphIndent > 0 ? `${paragraphIndent}cm` : 0,
              marginBottom: `${paragraphSpacing}em`,
            }}>
              <strong>Lorem ipsum dolor sit amet</strong>, consectetur adipiscing elit.
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <p style={{
              textIndent: paragraphIndent > 0 ? `${paragraphIndent}cm` : 0,
              marginBottom: 0,
            }}>
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
