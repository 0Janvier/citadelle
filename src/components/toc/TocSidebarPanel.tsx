// Panneau Table des matières pour la sidebar unifiée
import { useEffect, useCallback, useState } from 'react'
import { useTocStore, type TocEntry, type NumberingFormat } from '../../store/useTocStore'
import { useEditorStore } from '../../store/useEditorStore'

interface TocSidebarPanelProps {
  onClose?: () => void
}

const FORMAT_LABELS: Record<NumberingFormat, string> = {
  'roman': 'Romain (I, II, III)',
  'alpha-upper': 'Majuscules (A, B, C)',
  'alpha-lower': 'Minuscules (a, b, c)',
  'numeric': 'Numérique (1, 2, 3)',
  'none': 'Aucun',
}

const FORMAT_OPTIONS: NumberingFormat[] = ['roman', 'alpha-upper', 'alpha-lower', 'numeric', 'none']

export function TocSidebarPanel({ onClose }: TocSidebarPanelProps) {
  const entries = useTocStore((state) => state.entries)
  const activeEntryId = useTocStore((state) => state.activeEntryId)
  const generateToc = useTocStore((state) => state.generateToc)
  const navigateToEntry = useTocStore((state) => state.navigateToEntry)
  const settings = useTocStore((state) => state.settings)
  const updateSettings = useTocStore((state) => state.updateSettings)
  const resetSettings = useTocStore((state) => state.resetSettings)
  const expandedEntries = useTocStore((state) => state.expandedEntries)
  const toggleTocEntryExpansion = useTocStore((state) => state.toggleTocEntryExpansion)
  const expandAllEntries = useTocStore((state) => state.expandAllEntries)
  const collapseAllEntries = useTocStore((state) => state.collapseAllEntries)

  const editor = useEditorStore((state) => state.activeEditor)

  const [showSettings, setShowSettings] = useState(false)

  // Regenerate TOC when editor content changes or settings change
  useEffect(() => {
    if (!editor) return

    // Generate initial TOC
    generateToc(editor)

    // Listen for document changes
    const handleUpdate = () => {
      generateToc(editor)
    }

    editor.on('update', handleUpdate)
    return () => {
      editor.off('update', handleUpdate)
    }
  }, [editor, generateToc, settings])

  const handleEntryClick = useCallback(
    (entry: TocEntry) => {
      if (editor) {
        navigateToEntry(editor, entry)
      }
    },
    [editor, navigateToEntry]
  )

  // Count total headings (recursive)
  const countHeadings = (entries: TocEntry[]): number => {
    return entries.reduce((sum, entry) => sum + 1 + countHeadings(entry.children), 0)
  }

  const totalHeadings = countHeadings(entries)

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <h2 className="text-lg font-semibold">Table des matières</h2>
        <div className="flex items-center gap-1">
          {/* Expand/Collapse all buttons */}
          {entries.length > 0 && (
            <>
              <button
                onClick={expandAllEntries}
                className="p-1.5 rounded hover:bg-[var(--bg-secondary)] transition-colors"
                title="Tout déplier"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
              <button
                onClick={collapseAllEntries}
                className="p-1.5 rounded hover:bg-[var(--bg-secondary)] transition-colors"
                title="Tout replier"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                </svg>
              </button>
            </>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded transition-colors ${
              showSettings
                ? 'bg-[var(--accent)] text-white'
                : 'hover:bg-[var(--bg-secondary)]'
            }`}
            title="Paramètres de numérotation"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-secondary)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Format de numérotation</h3>
            <button
              onClick={resetSettings}
              className="text-xs text-[var(--accent)] hover:underline"
            >
              Réinitialiser
            </button>
          </div>

          {/* Toggle numbering */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showNumbering}
              onChange={(e) => updateSettings({ showNumbering: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]"
            />
            <span className="text-sm">Afficher la numérotation</span>
          </label>

          {settings.showNumbering && (
            <>
              {/* Level formats */}
              <div className="space-y-3">
                <LevelFormatSelect
                  label="Titre 1 (H1)"
                  value={settings.level1Format}
                  onChange={(v) => updateSettings({ level1Format: v })}
                />
                <LevelFormatSelect
                  label="Titre 2 (H2)"
                  value={settings.level2Format}
                  onChange={(v) => updateSettings({ level2Format: v })}
                />
                <LevelFormatSelect
                  label="Titre 3 (H3)"
                  value={settings.level3Format}
                  onChange={(v) => updateSettings({ level3Format: v })}
                />
                <LevelFormatSelect
                  label="Titre 4 (H4)"
                  value={settings.level4Format}
                  onChange={(v) => updateSettings({ level4Format: v })}
                />
              </div>

              {/* Separator */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-[var(--text-secondary)]">Séparateur :</label>
                <select
                  value={settings.separator}
                  onChange={(e) => updateSettings({ separator: e.target.value })}
                  className="px-2 py-1 text-sm rounded border border-[var(--border)] bg-[var(--bg-primary)]"
                >
                  <option value=".">Point (.)</option>
                  <option value=")">Parenthèse ())</option>
                  <option value="-">Tiret (-)</option>
                  <option value=" ">Espace</option>
                </select>
              </div>

              {/* Preview */}
              <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
                <p className="text-xs text-[var(--text-secondary)] mb-2">Aperçu :</p>
                <div className="text-sm space-y-1 font-mono">
                  <PreviewLine level={1} settings={settings} />
                  <PreviewLine level={2} settings={settings} indent={1} />
                  <PreviewLine level={3} settings={settings} indent={2} />
                  <PreviewLine level={4} settings={settings} indent={3} />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TOC Content */}
      <div className="flex-1 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="p-8 text-center text-[var(--text-secondary)]">
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path d="M4 6h16" />
              <path d="M4 10h12" />
              <path d="M4 14h14" />
              <path d="M4 18h10" />
            </svg>
            <p className="font-medium mb-1">Aucun titre détecté</p>
            <p className="text-xs">Ajoutez des titres (H1-H4) pour générer la table des matières</p>
          </div>
        ) : (
          <div className="py-2">
            <TocEntryList
              entries={entries}
              activeEntryId={activeEntryId}
              onEntryClick={handleEntryClick}
              depth={0}
              expandedEntries={expandedEntries}
              onToggleExpansion={toggleTocEntryExpansion}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      {entries.length > 0 && (
        <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--bg-secondary)]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">
              Titres détectés
            </span>
            <span className="text-sm font-medium text-[var(--accent)]">
              {totalHeadings}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Level format selector component
interface LevelFormatSelectProps {
  label: string
  value: NumberingFormat
  onChange: (value: NumberingFormat) => void
}

function LevelFormatSelect({ label, value, onChange }: LevelFormatSelectProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="text-sm text-[var(--text-secondary)]">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as NumberingFormat)}
        className="px-2 py-1 text-sm rounded border border-[var(--border)] bg-[var(--bg-primary)] max-w-[160px]"
      >
        {FORMAT_OPTIONS.map((format) => (
          <option key={format} value={format}>
            {FORMAT_LABELS[format]}
          </option>
        ))}
      </select>
    </div>
  )
}

// Preview line component
interface PreviewLineProps {
  level: number
  settings: { level1Format: NumberingFormat; level2Format: NumberingFormat; level3Format: NumberingFormat; level4Format: NumberingFormat; separator: string }
  indent?: number
}

function PreviewLine({ level, settings, indent = 0 }: PreviewLineProps) {
  const formats = [settings.level1Format, settings.level2Format, settings.level3Format, settings.level4Format]
  const format = formats[level - 1]
  const numbering = format !== 'none' ? formatPreviewNumber(1, format) + settings.separator : ''

  return (
    <div style={{ paddingLeft: `${indent * 16}px` }} className="flex items-center gap-2">
      <span className="text-[var(--accent)]">{numbering}</span>
      <span className="text-[var(--text-secondary)]">Titre {level}</span>
    </div>
  )
}

function formatPreviewNumber(_num: number, format: NumberingFormat): string {
  switch (format) {
    case 'roman': return 'I'
    case 'alpha-upper': return 'A'
    case 'alpha-lower': return 'a'
    case 'numeric': return '1'
    case 'none': return ''
    default: return '1'
  }
}

// Recursive component for TOC entries
interface TocEntryListProps {
  entries: TocEntry[]
  activeEntryId: string | null
  onEntryClick: (entry: TocEntry) => void
  depth: number
  expandedEntries: string[]
  onToggleExpansion: (id: string) => void
}

function TocEntryList({
  entries,
  activeEntryId,
  onEntryClick,
  depth,
  expandedEntries,
  onToggleExpansion,
}: TocEntryListProps) {
  // Get level indicator styling
  const getLevelStyle = (level: number) => {
    switch (level) {
      case 1:
        return 'font-semibold text-[var(--text)]'
      case 2:
        return 'font-medium text-[var(--text)]'
      case 3:
        return 'text-[var(--text-secondary)]'
      case 4:
        return 'text-[var(--text-secondary)] text-xs'
      default:
        return ''
    }
  }

  return (
    <ul>
      {entries.map((entry) => {
        const hasChildren = entry.children.length > 0
        const isExpanded = expandedEntries.includes(entry.id)

        return (
          <li key={entry.id}>
            <div
              className={`
                flex items-center text-sm transition-all
                hover:bg-[var(--bg-secondary)]
                ${activeEntryId === entry.id
                  ? 'bg-[var(--accent)]/10 border-l-2 border-[var(--accent)]'
                  : 'border-l-2 border-transparent'
                }
              `}
              style={{ paddingLeft: `${8 + depth * 16}px` }}
            >
              {/* Chevron for expand/collapse */}
              {hasChildren ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleExpansion(entry.id)
                  }}
                  className="p-1 rounded hover:bg-[var(--bg-secondary)] transition-colors flex-shrink-0"
                >
                  <ChevronIcon
                    className={`w-3 h-3 text-[var(--text-secondary)] transition-transform duration-150 ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </button>
              ) : (
                <span className="w-5 flex-shrink-0" />
              )}

              {/* Entry text - clickable for navigation */}
              <button
                onClick={() => onEntryClick(entry)}
                className="flex-1 text-left py-2 pr-4 min-w-0"
              >
                <div className="flex items-start gap-2">
                  {entry.numbering && (
                    <span className="text-[var(--accent)] font-mono text-xs mt-0.5 flex-shrink-0">
                      {entry.numbering}
                    </span>
                  )}
                  <span className={`truncate ${getLevelStyle(entry.level)} ${activeEntryId === entry.id ? 'text-[var(--accent)]' : ''}`}>
                    {entry.text}
                  </span>
                </div>
              </button>
            </div>

            {/* Children - only render if expanded */}
            {hasChildren && isExpanded && (
              <TocEntryList
                entries={entry.children}
                activeEntryId={activeEntryId}
                onEntryClick={onEntryClick}
                depth={depth + 1}
                expandedEntries={expandedEntries}
                onToggleExpansion={onToggleExpansion}
              />
            )}
          </li>
        )
      })}
    </ul>
  )
}

// Chevron icon component
function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}
