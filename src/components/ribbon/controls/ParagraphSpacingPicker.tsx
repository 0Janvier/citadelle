/**
 * Selecteur d'espacement et de retrait de paragraphe
 */

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ArrowUpDown, IndentIncrease } from 'lucide-react'

interface ParagraphSpacingPickerProps {
  spacingValue: number
  indentValue: number
  onSpacingChange: (spacing: number) => void
  onIndentChange: (indent: number) => void
  disabled?: boolean
}

const SPACING_PRESETS = [
  { label: '0.5 em', value: 0.5 },
  { label: '1 em', value: 1 },
  { label: '1.5 em', value: 1.5 },
  { label: '2 em', value: 2 },
]

const INDENT_PRESETS = [
  { label: 'Aucun', value: 0 },
  { label: '0.5 cm', value: 0.5 },
  { label: '1 cm', value: 1 },
  { label: '1.5 cm', value: 1.5 },
  { label: '2 cm', value: 2 },
]

export function ParagraphSpacingPicker({
  spacingValue,
  indentValue,
  onSpacingChange,
  onIndentChange,
  disabled,
}: ParagraphSpacingPickerProps) {
  const [showSpacing, setShowSpacing] = useState(false)
  const [showIndent, setShowIndent] = useState(false)
  const spacingRef = useRef<HTMLDivElement>(null)
  const indentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (spacingRef.current && !spacingRef.current.contains(e.target as Node)) {
        setShowSpacing(false)
      }
      if (indentRef.current && !indentRef.current.contains(e.target as Node)) {
        setShowIndent(false)
      }
    }
    if (showSpacing || showIndent) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSpacing, showIndent])

  const getSpacingLabel = () => {
    const preset = SPACING_PRESETS.find((p) => p.value === spacingValue)
    return preset?.label || `${spacingValue} em`
  }

  const getIndentLabel = () => {
    if (indentValue === 0) return 'Aucun'
    const preset = INDENT_PRESETS.find((p) => p.value === indentValue)
    return preset?.label || `${indentValue} cm`
  }

  return (
    <div className="flex items-center gap-1">
      {/* Espacement */}
      <div className="relative" ref={spacingRef}>
        <button
          type="button"
          onClick={() => !disabled && setShowSpacing(!showSpacing)}
          disabled={disabled}
          className="flex items-center gap-1 px-2 py-1.5 text-sm rounded-md
            hover:bg-[var(--bg-hover)] disabled:opacity-40 disabled:cursor-not-allowed
            transition-colors"
          title="Espacement entre paragraphes"
        >
          <ArrowUpDown size={16} />
          <span className="text-xs">{getSpacingLabel()}</span>
          <ChevronDown size={12} className="text-[var(--text-secondary)]" />
        </button>

        {showSpacing && (
          <div className="absolute top-full left-0 mt-1 w-28 bg-[var(--bg)] border border-[var(--border)]
            rounded-lg shadow-lg z-dropdown overflow-hidden animate-scaleIn">
            <div className="py-1">
              {SPACING_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    onSpacingChange(preset.value)
                    setShowSpacing(false)
                  }}
                  className={`w-full px-3 py-1.5 text-sm text-left hover:bg-[var(--bg-hover)] transition-colors
                    ${spacingValue === preset.value ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : ''}`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Retrait */}
      <div className="relative" ref={indentRef}>
        <button
          type="button"
          onClick={() => !disabled && setShowIndent(!showIndent)}
          disabled={disabled}
          className="flex items-center gap-1 px-2 py-1.5 text-sm rounded-md
            hover:bg-[var(--bg-hover)] disabled:opacity-40 disabled:cursor-not-allowed
            transition-colors"
          title="Retrait de premiere ligne"
        >
          <IndentIncrease size={16} />
          <span className="text-xs">{getIndentLabel()}</span>
          <ChevronDown size={12} className="text-[var(--text-secondary)]" />
        </button>

        {showIndent && (
          <div className="absolute top-full left-0 mt-1 w-28 bg-[var(--bg)] border border-[var(--border)]
            rounded-lg shadow-lg z-dropdown overflow-hidden animate-scaleIn">
            <div className="py-1">
              {INDENT_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    onIndentChange(preset.value)
                    setShowIndent(false)
                  }}
                  className={`w-full px-3 py-1.5 text-sm text-left hover:bg-[var(--bg-hover)] transition-colors
                    ${indentValue === preset.value ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : ''}`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
