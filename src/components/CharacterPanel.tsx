/**
 * Panneau de caracteres speciaux juridiques
 * Grille de caracteres frequents en redaction juridique.
 * Clic = insertion au curseur. Section "Recents" en haut.
 */

import { useState, useCallback } from 'react'
import { useEditorStore } from '../store/useEditorStore'
import { X, Type } from 'lucide-react'

interface SpecialChar {
  char: string
  name: string
  category: string
}

const SPECIAL_CHARS: SpecialChar[] = [
  // Ponctuation & typographie
  { char: '\u00AB', name: 'Guillemet ouvrant', category: 'Typographie' },
  { char: '\u00BB', name: 'Guillemet fermant', category: 'Typographie' },
  { char: '\u2014', name: 'Tiret cadratin', category: 'Typographie' },
  { char: '\u2013', name: 'Tiret demi-cadratin', category: 'Typographie' },
  { char: '\u2026', name: 'Points de suspension', category: 'Typographie' },
  { char: '\u00A0', name: 'Espace insecable', category: 'Typographie' },
  { char: '\u2019', name: 'Apostrophe typographique', category: 'Typographie' },
  { char: '\u00B7', name: 'Point median', category: 'Typographie' },

  // Juridique & symboles
  { char: '\u00A7', name: 'Paragraphe (section)', category: 'Juridique' },
  { char: '\u2020', name: 'Obele (dagger)', category: 'Juridique' },
  { char: '\u2021', name: 'Double obele', category: 'Juridique' },
  { char: '\u00A9', name: 'Copyright', category: 'Juridique' },
  { char: '\u00AE', name: 'Marque deposee', category: 'Juridique' },
  { char: '\u2122', name: 'Trademark', category: 'Juridique' },
  { char: '\u2116', name: 'Numero', category: 'Juridique' },

  // Monnaies
  { char: '\u20AC', name: 'Euro', category: 'Monnaies' },
  { char: '\u00A3', name: 'Livre sterling', category: 'Monnaies' },
  { char: '\u00A5', name: 'Yen', category: 'Monnaies' },
  { char: '$', name: 'Dollar', category: 'Monnaies' },

  // Math & mesures
  { char: '\u00B0', name: 'Degre', category: 'Mesures' },
  { char: '\u00B2', name: 'Exposant 2', category: 'Mesures' },
  { char: '\u00B3', name: 'Exposant 3', category: 'Mesures' },
  { char: '\u00BD', name: '1/2', category: 'Mesures' },
  { char: '\u00BC', name: '1/4', category: 'Mesures' },
  { char: '\u00BE', name: '3/4', category: 'Mesures' },
  { char: '\u2030', name: 'Pour mille', category: 'Mesures' },
  { char: '\u00D7', name: 'Multiplication', category: 'Mesures' },
  { char: '\u00F7', name: 'Division', category: 'Mesures' },
  { char: '\u00B1', name: 'Plus ou moins', category: 'Mesures' },

  // Fleches & formes
  { char: '\u2192', name: 'Fleche droite', category: 'Fleches' },
  { char: '\u2190', name: 'Fleche gauche', category: 'Fleches' },
  { char: '\u2194', name: 'Double fleche', category: 'Fleches' },
  { char: '\u2022', name: 'Puce ronde', category: 'Fleches' },
  { char: '\u25CF', name: 'Cercle plein', category: 'Fleches' },
  { char: '\u25CB', name: 'Cercle vide', category: 'Fleches' },
  { char: '\u2713', name: 'Coche', category: 'Fleches' },
  { char: '\u2717', name: 'Croix', category: 'Fleches' },
]

const MAX_RECENTS = 8

export function CharacterPanel({ onClose }: { onClose: () => void }) {
  const editor = useEditorStore((state) => state.activeEditor)
  const [recents, setRecents] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('citadelle-recent-chars') || '[]')
    } catch {
      return []
    }
  })
  const [filter, setFilter] = useState('')

  const insertChar = useCallback((char: string) => {
    if (!editor) return
    editor.chain().focus().insertContent(char).run()

    // Update recents
    setRecents((prev) => {
      const updated = [char, ...prev.filter((c) => c !== char)].slice(0, MAX_RECENTS)
      localStorage.setItem('citadelle-recent-chars', JSON.stringify(updated))
      return updated
    })
  }, [editor])

  const filteredChars = filter
    ? SPECIAL_CHARS.filter((c) =>
        c.name.toLowerCase().includes(filter.toLowerCase()) ||
        c.char.includes(filter) ||
        c.category.toLowerCase().includes(filter.toLowerCase())
      )
    : SPECIAL_CHARS

  // Group by category
  const categories = [...new Set(filteredChars.map((c) => c.category))]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="text-sm font-semibold">Caracteres speciaux</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-2">
        <input
          type="text"
          placeholder="Rechercher..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-[var(--border)] rounded-md bg-[var(--editor-bg)] focus:outline-none focus:border-[var(--accent)]"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Recent chars */}
        {recents.length > 0 && !filter && (
          <div className="mb-4">
            <div className="text-xs text-[var(--text-secondary)] font-medium mb-2">Recents</div>
            <div className="flex flex-wrap gap-1">
              {recents.map((char, i) => (
                <CharButton key={`recent-${i}`} char={char} onClick={() => insertChar(char)} />
              ))}
            </div>
          </div>
        )}

        {/* Grouped chars */}
        {categories.map((category) => (
          <div key={category} className="mb-3">
            <div className="text-xs text-[var(--text-secondary)] font-medium mb-1.5">{category}</div>
            <div className="flex flex-wrap gap-1">
              {filteredChars
                .filter((c) => c.category === category)
                .map((c) => (
                  <CharButton key={c.char + c.name} char={c.char} title={c.name} onClick={() => insertChar(c.char)} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CharButton({ char, title, onClick }: { char: string; title?: string; onClick: () => void }) {
  // Display NBSP as a visible indicator
  const display = char === '\u00A0' ? 'NBSP' : char

  return (
    <button
      onClick={onClick}
      title={title || char}
      className="w-9 h-9 flex items-center justify-center text-base border border-[var(--border)] rounded-md hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] transition-colors bg-[var(--editor-bg)]"
    >
      {display === 'NBSP' ? <span className="text-[9px] font-mono">NBSP</span> : display}
    </button>
  )
}
