/**
 * Dialogue de configuration des tampons PDF
 * Port React de l'interface KLS StampConfigurator
 */

import { useEffect, useRef } from 'react'
import { useStampStore } from '../../store/useStampStore'
import {
  STAMP_STYLE_LABELS,
  STAMP_POSITION_LABELS,
  STAMP_FONT_LABELS,
} from '../../lib/pdfStamper'
import type { StampStyle, StampPosition, StampFont } from '../../lib/pdfStamper'

const STYLES: StampStyle[] = [
  'elegant',
  'professional',
  'minimal',
  'framed',
  'modern',
  'official',
  'subtle',
  'banner',
]

const POSITIONS: StampPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
]

const FONTS: StampFont[] = ['helvetica', 'times', 'courier']

// Visual representations for each stamp style in the preview
const STYLE_PREVIEW_CLASSES: Record<StampStyle, string> = {
  elegant:
    'border border-[#5a5a73] bg-[#fafaf7]/95 text-[#1a1a2e]',
  professional:
    'border-[1.5px] border-black bg-white text-black',
  minimal: 'text-[#4d4d66]',
  framed:
    'border-2 border-[#26264d] bg-[#f5f5fa]/92 text-[#26264d] ring-1 ring-inset ring-[#26264d]/50',
  modern:
    'bg-[#f0f0fa]/95 text-[#334d80] border-l-[3px] border-l-[#3366b3]',
  official:
    'border-2 border-[#993333] bg-white/90 text-[#993333] ring-1 ring-inset ring-[#993333]/50',
  subtle:
    'border border-[#b3b3b3] bg-[#f7f7f7]/85 text-[#666666]',
  banner: 'bg-[#262633]/92 text-white px-5',
}

// Font preview classes
const FONT_PREVIEW: Record<StampFont, string> = {
  helvetica: 'font-sans',
  times: 'font-serif',
  courier: 'font-mono',
}

export function StampConfigDialog() {
  const open = useStampStore((s) => s.configDialogOpen)
  const setOpen = useStampStore((s) => s.setConfigDialogOpen)
  const config = useStampStore((s) => s.config)
  const recentCabinets = useStampStore((s) => s.recentCabinets)
  const setStyle = useStampStore((s) => s.setStyle)
  const setPosition = useStampStore((s) => s.setPosition)
  const setPrefix = useStampStore((s) => s.setPrefix)
  const setCabinetName = useStampStore((s) => s.setCabinetName)
  const setFontSize = useStampStore((s) => s.setFontSize)
  const setSizeScale = useStampStore((s) => s.setSizeScale)
  const setAllPages = useStampStore((s) => s.setAllPages)
  const setFontFamily = useStampStore((s) => s.setFontFamily)
  const setCustomTextColor = useStampStore((s) => s.setCustomTextColor)
  const setCustomBgColor = useStampStore((s) => s.setCustomBgColor)
  const setCustomBorderColor = useStampStore((s) => s.setCustomBorderColor)
  const setOpacity = useStampStore((s) => s.setOpacity)
  const setMargin = useStampStore((s) => s.setMargin)
  const setAdditionalLine = useStampStore((s) => s.setAdditionalLine)
  const resetConfig = useStampStore((s) => s.resetConfig)

  const dialogRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, setOpen])

  if (!open) return null

  // Build custom preview styles from custom colors
  const previewStyle: React.CSSProperties = {}
  if (config.customTextColor) previewStyle.color = config.customTextColor
  if (config.customBgColor) previewStyle.backgroundColor = config.customBgColor
  if (config.customBorderColor) {
    previewStyle.borderColor = config.customBorderColor
    previewStyle.borderWidth = '1px'
    previewStyle.borderStyle = 'solid'
  }
  if (config.opacity < 100) previewStyle.opacity = config.opacity / 100

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={() => setOpen(false)}
    >
      <div
        ref={dialogRef}
        className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl shadow-2xl w-[580px] max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold text-[var(--text)]">
            Configuration du tampon
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 space-y-5">
          {/* Preview */}
          <div className="relative bg-[#f5f5f0] dark:bg-gray-800 rounded-lg border border-[var(--border)] h-36 flex items-center justify-center overflow-hidden">
            {/* Page simulation */}
            <div className="absolute inset-2 bg-white dark:bg-gray-900 rounded shadow-sm border border-gray-200 dark:border-gray-700" />
            {/* Stamp preview */}
            <div
              className={`absolute ${getPositionClasses(config.position)} ${
                !config.customTextColor && !config.customBgColor && !config.customBorderColor
                  ? STYLE_PREVIEW_CLASSES[config.style]
                  : 'rounded'
              } rounded px-3 py-1.5 text-center ${FONT_PREVIEW[config.fontFamily || 'helvetica']}`}
              style={{
                transform: `scale(${config.sizeScale / 100})`,
                ...previewStyle,
              }}
            >
              <div className="font-bold text-xs whitespace-nowrap">
                {config.prefix} 1
              </div>
              {config.cabinetName && (
                <div className="text-[10px] opacity-75 whitespace-nowrap">
                  {config.cabinetName}
                </div>
              )}
              {config.additionalLine && (
                <div className="text-[9px] opacity-60 whitespace-nowrap">
                  {config.additionalLine}
                </div>
              )}
            </div>
          </div>

          {/* Format section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide">
              Format
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">
                  Prefixe
                </label>
                <input
                  type="text"
                  value={config.prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">
                  Cabinet
                </label>
                <input
                  type="text"
                  value={config.cabinetName}
                  onChange={(e) => setCabinetName(e.target.value)}
                  placeholder="Nom du cabinet"
                  className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
            </div>

            {/* Additional line */}
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">
                Ligne supplementaire
              </label>
              <input
                type="text"
                value={config.additionalLine || ''}
                onChange={(e) => setAdditionalLine(e.target.value)}
                placeholder="Ex: Confidentiel, Reference dossier..."
                className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>

            {/* Recent cabinets */}
            {recentCabinets.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {recentCabinets.map((name) => (
                  <button
                    key={name}
                    onClick={() => setCabinetName(name)}
                    className="px-2 py-0.5 text-xs bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Style selector */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide">
              Style
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {STYLES.map((style) => (
                <button
                  key={style}
                  onClick={() => setStyle(style)}
                  className={`px-2 py-2 text-xs rounded-lg border transition-all ${
                    config.style === style
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] font-medium'
                      : 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--accent)]/50'
                  }`}
                >
                  <div
                    className={`mx-auto mb-1 w-full h-5 rounded-sm flex items-center justify-center ${STYLE_PREVIEW_CLASSES[style]}`}
                  >
                    <span className="text-[6px] font-bold">n 1</span>
                  </div>
                  {STAMP_STYLE_LABELS[style]}
                </button>
              ))}
            </div>
          </div>

          {/* Position & Font row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Position grid */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide">
                Position
              </h3>
              <div className="grid grid-cols-3 gap-2 max-w-[200px]">
                {POSITIONS.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setPosition(pos)}
                    title={STAMP_POSITION_LABELS[pos]}
                    className={`aspect-[3/4] rounded border-2 transition-all relative ${
                      config.position === pos
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                        : 'border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent)]/50'
                    }`}
                  >
                    {/* Dot indicator for position */}
                    <div
                      className={`absolute w-2 h-1.5 rounded-sm ${
                        config.position === pos
                          ? 'bg-[var(--accent)]'
                          : 'bg-[var(--text-secondary)]/40'
                      } ${getPositionDotClasses(pos)}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Font family */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide">
                Police
              </h3>
              <div className="space-y-1.5">
                {FONTS.map((font) => (
                  <button
                    key={font}
                    onClick={() => setFontFamily(font)}
                    className={`w-full px-3 py-1.5 text-sm rounded-lg border transition-all text-left ${
                      (config.fontFamily || 'helvetica') === font
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] font-medium'
                        : 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--accent)]/50'
                    } ${FONT_PREVIEW[font]}`}
                  >
                    {STAMP_FONT_LABELS[font]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Colors section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide">
              Couleurs personnalisees
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Laissez vide pour utiliser les couleurs du style selectionne.
            </p>
            <div className="grid grid-cols-3 gap-3">
              <ColorPicker
                label="Texte"
                value={config.customTextColor}
                onChange={setCustomTextColor}
              />
              <ColorPicker
                label="Fond"
                value={config.customBgColor}
                onChange={setCustomBgColor}
              />
              <ColorPicker
                label="Bordure"
                value={config.customBorderColor}
                onChange={setCustomBorderColor}
              />
            </div>
          </div>

          {/* Size & options */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide">
              Options
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">
                  Taille de police : {config.fontSize}pt
                </label>
                <input
                  type="range"
                  min={8}
                  max={16}
                  value={config.fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full accent-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">
                  Echelle : {config.sizeScale}%
                </label>
                <input
                  type="range"
                  min={50}
                  max={150}
                  step={10}
                  value={config.sizeScale}
                  onChange={(e) => setSizeScale(parseInt(e.target.value))}
                  className="w-full accent-[var(--accent)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">
                  Opacite : {config.opacity ?? 100}%
                </label>
                <input
                  type="range"
                  min={20}
                  max={100}
                  step={5}
                  value={config.opacity ?? 100}
                  onChange={(e) => setOpacity(parseInt(e.target.value))}
                  className="w-full accent-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">
                  Marge : {config.margin ?? 30}pt
                </label>
                <input
                  type="range"
                  min={10}
                  max={80}
                  step={5}
                  value={config.margin ?? 30}
                  onChange={(e) => setMargin(parseInt(e.target.value))}
                  className="w-full accent-[var(--accent)]"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.allPages}
                onChange={(e) => setAllPages(e.target.checked)}
                className="accent-[var(--accent)]"
              />
              <span className="text-sm text-[var(--text)]">
                Tamponner toutes les pages
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)]">
          <button
            onClick={resetConfig}
            className="px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
          >
            Reinitialiser
          </button>
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-sm font-medium bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Valider
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Color Picker sub-component
// ============================================================================

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string
  value: string | undefined
  onChange: (color: string | undefined) => void
}) {
  return (
    <div>
      <label className="block text-xs text-[var(--text-secondary)] mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-8 rounded border border-[var(--border)] cursor-pointer bg-transparent"
          />
          {!value && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-6 h-6 rounded bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center">
                <span className="text-[8px] text-[var(--text-secondary)]">--</span>
              </div>
            </div>
          )}
        </div>
        {value ? (
          <button
            onClick={() => onChange(undefined)}
            className="px-1.5 py-0.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text)] bg-[var(--bg-secondary)] rounded transition-colors"
            title="Utiliser la couleur du style"
          >
            Reset
          </button>
        ) : (
          <span className="text-xs text-[var(--text-secondary)] italic">Auto</span>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Position helpers
// ============================================================================

// Position classes for the preview stamp
function getPositionClasses(position: StampPosition): string {
  const map: Record<StampPosition, string> = {
    'top-left': 'top-3 left-3',
    'top-center': 'top-3 left-1/2 -translate-x-1/2',
    'top-right': 'top-3 right-3',
    'bottom-left': 'bottom-3 left-3',
    'bottom-center': 'bottom-3 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-3 right-3',
  }
  return map[position] || map['top-right']
}

// Position dot classes for the position grid buttons
function getPositionDotClasses(position: StampPosition): string {
  const map: Record<StampPosition, string> = {
    'top-left': 'top-1 left-1',
    'top-center': 'top-1 left-1/2 -translate-x-1/2',
    'top-right': 'top-1 right-1',
    'bottom-left': 'bottom-1 left-1',
    'bottom-center': 'bottom-1 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-1 right-1',
  }
  return map[position] || map['top-right']
}
