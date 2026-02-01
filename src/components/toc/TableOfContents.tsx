import { useEffect, useCallback, useState } from 'react'
import { useTocStore, type TocEntry, type NumberingFormat } from '../../store/useTocStore'
import { useEditorStore } from '../../store/useEditorStore'

const FORMAT_LABELS: Record<NumberingFormat, string> = {
  'roman': 'Romain (I, II, III)',
  'alpha-upper': 'Majuscules (A, B, C)',
  'alpha-lower': 'Minuscules (a, b, c)',
  'numeric': 'Numérique (1, 2, 3)',
  'none': 'Aucun',
}

const FORMAT_OPTIONS: NumberingFormat[] = ['roman', 'alpha-upper', 'alpha-lower', 'numeric', 'none']

export function TableOfContents() {
  const panelOpen = useTocStore((state) => state.panelOpen)
  const setPanelOpen = useTocStore((state) => state.setPanelOpen)
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
    if (!editor || !panelOpen) return

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
  }, [editor, panelOpen, generateToc, settings])

  const handleClose = useCallback(() => {
    setPanelOpen(false)
  }, [setPanelOpen])

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

  if (!panelOpen) return null

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-lg z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">Table des matières</h2>
        <div className="flex items-center gap-1">
          {/* Expand/Collapse all buttons */}
          {entries.length > 0 && (
            <>
              <button
                onClick={expandAllEntries}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Tout déplier"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
              <button
                onClick={collapseAllEntries}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
            className={`p-1.5 rounded-lg transition-colors ${
              showSettings
                ? 'bg-[var(--accent)] text-white'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title="Paramètres de numérotation"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Format de numérotation</h3>
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
            <span className="text-sm text-gray-700 dark:text-gray-300">Afficher la numérotation</span>
          </label>

          {settings.showNumbering && (
            <>
              {/* Level formats */}
              <div className="space-y-3">
                {(['level1Format', 'level2Format', 'level3Format', 'level4Format'] as const).map((key, i) => (
                  <div key={key} className="flex items-center justify-between gap-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Titre {i + 1} (H{i + 1})</label>
                    <select
                      value={settings[key]}
                      onChange={(e) => updateSettings({ [key]: e.target.value as NumberingFormat })}
                      className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 max-w-[150px]"
                    >
                      {FORMAT_OPTIONS.map((format) => (
                        <option key={format} value={format}>
                          {FORMAT_LABELS[format]}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Separator */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">Séparateur :</label>
                <select
                  value={settings.separator}
                  onChange={(e) => updateSettings({ separator: e.target.value })}
                  className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                >
                  <option value=".">Point (.)</option>
                  <option value=")">Parenthèse ())</option>
                  <option value="-">Tiret (-)</option>
                  <option value=" ">Espace</option>
                </select>
              </div>
            </>
          )}
        </div>
      )}

      {/* TOC Content */}
      <div className="flex-1 overflow-y-auto py-2">
        {entries.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M4 6h16M4 12h16M4 18h10" />
            </svg>
            <p>Aucun titre détecté</p>
            <p className="text-sm mt-1">Ajoutez des titres (H1-H4) pour générer la table des matières</p>
          </div>
        ) : (
          <TocEntryList
            entries={entries}
            activeEntryId={activeEntryId}
            onEntryClick={handleEntryClick}
            depth={0}
            expandedEntries={expandedEntries}
            onToggleExpansion={toggleTocEntryExpansion}
          />
        )}
      </div>

      {/* Footer */}
      {entries.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {countHeadings(entries)} titre{countHeadings(entries) > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  )
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
        return 'font-semibold'
      case 2:
        return 'font-medium'
      case 3:
        return 'text-gray-600 dark:text-gray-400'
      case 4:
        return 'text-gray-500 dark:text-gray-500 text-xs'
      default:
        return ''
    }
  }

  return (
    <ul className={depth > 0 ? 'ml-2' : ''}>
      {entries.map((entry) => {
        const hasChildren = entry.children.length > 0
        const isExpanded = expandedEntries.includes(entry.id)

        return (
          <li key={entry.id}>
            <div
              className={`
                flex items-center text-sm transition-colors
                hover:bg-gray-100 dark:hover:bg-gray-800
                ${activeEntryId === entry.id
                  ? 'text-[var(--accent)] font-medium bg-gray-50 dark:bg-gray-800/50 border-l-2 border-[var(--accent)]'
                  : 'text-gray-700 dark:text-gray-300 border-l-2 border-transparent'
                }
              `}
              style={{ paddingLeft: `${8 + depth * 12}px` }}
            >
              {/* Chevron for expand/collapse */}
              {hasChildren ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleExpansion(entry.id)
                  }}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                >
                  <ChevronIcon
                    className={`w-3 h-3 text-gray-400 transition-transform duration-150 ${
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
                className="flex-1 text-left py-1.5 pr-4 min-w-0"
              >
                <div className="flex items-start gap-2">
                  {entry.numbering && (
                    <span className="text-[var(--accent)] font-mono text-xs mt-0.5 flex-shrink-0">
                      {entry.numbering}
                    </span>
                  )}
                  <span className={`truncate ${getLevelStyle(entry.level)}`}>
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
