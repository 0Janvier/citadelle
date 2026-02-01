/**
 * Sélecteur de police avec preview
 */

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'

interface FontFamilyPickerProps {
  value: string
  onChange: (font: string) => void
  disabled?: boolean
}

const FONT_FAMILIES = {
  'Sans-serif': [
    { name: 'System UI', value: '-apple-system, BlinkMacSystemFont, sans-serif' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Helvetica', value: 'Helvetica, sans-serif' },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
  ],
  'Serif': [
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Times New Roman', value: '"Times New Roman", serif' },
    { name: 'Palatino', value: 'Palatino, serif' },
    { name: 'Garamond', value: 'Garamond, serif' },
  ],
  'Monospace': [
    { name: 'SF Mono', value: '"SF Mono", monospace' },
    { name: 'Consolas', value: 'Consolas, monospace' },
    { name: 'Monaco', value: 'Monaco, monospace' },
    { name: 'Courier New', value: '"Courier New", monospace' },
  ],
}

export function FontFamilyPicker({ value, onChange, disabled }: FontFamilyPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fermer quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      inputRef.current?.focus()
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Trouver le nom de la police actuelle (correspondance exacte ou partielle)
  const getCurrentFontName = () => {
    const valueLower = value.toLowerCase().replace(/['"]/g, '')
    for (const category of Object.values(FONT_FAMILIES)) {
      // Correspondance exacte
      const exactMatch = category.find((f) => f.value === value)
      if (exactMatch) return exactMatch.name
      // Correspondance partielle (la valeur contient le nom de la police)
      const partialMatch = category.find((f) =>
        valueLower.includes(f.name.toLowerCase()) ||
        f.value.toLowerCase().includes(valueLower)
      )
      if (partialMatch) return partialMatch.name
    }
    // Si aucune correspondance, afficher la valeur elle-même ou 'Police'
    return value || 'Police'
  }

  // Filtrer les polices
  const getFilteredFonts = () => {
    if (!search) return FONT_FAMILIES
    const filtered: typeof FONT_FAMILIES = { 'Sans-serif': [], Serif: [], Monospace: [] }
    const searchLower = search.toLowerCase()

    for (const [category, fonts] of Object.entries(FONT_FAMILIES)) {
      filtered[category as keyof typeof FONT_FAMILIES] = fonts.filter((f) =>
        f.name.toLowerCase().includes(searchLower)
      )
    }
    return filtered
  }

  const filteredFonts = getFilteredFonts()

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-1 px-2 py-1.5 min-w-[120px] text-sm rounded-md
          border border-[var(--border)] bg-[var(--bg)]
          hover:bg-[var(--bg-hover)] disabled:opacity-40 disabled:cursor-not-allowed
          transition-colors"
      >
        <span className="flex-1 text-left truncate">{getCurrentFontName()}</span>
        <ChevronDown size={14} className="text-[var(--text-secondary)]" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-[var(--bg)] border border-[var(--border)]
          rounded-lg shadow-lg z-dropdown overflow-hidden animate-scaleIn">
          {/* Recherche */}
          <div className="p-2 border-b border-[var(--border)]">
            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-7 pr-2 py-1.5 text-sm bg-[var(--editor-bg)] border border-[var(--border)]
                  rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
          </div>

          {/* Liste des polices */}
          <div className="max-h-64 overflow-y-auto">
            {Object.entries(filteredFonts).map(([category, fonts]) =>
              fonts.length > 0 && (
                <div key={category}>
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider bg-[var(--bg-secondary)]">
                    {category}
                  </div>
                  {fonts.map((font) => (
                    <button
                      key={font.name}
                      type="button"
                      onClick={() => {
                        onChange(font.value)
                        setIsOpen(false)
                        setSearch('')
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-[var(--bg-hover)] transition-colors
                        ${value === font.value ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : ''}`}
                      style={{ fontFamily: font.value }}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}
