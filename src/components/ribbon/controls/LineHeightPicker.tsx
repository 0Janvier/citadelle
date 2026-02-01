/**
 * Sélecteur d'interligne
 */

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, AlignJustify } from 'lucide-react'

interface LineHeightPickerProps {
  value: number
  onChange: (lineHeight: number) => void
  disabled?: boolean
}

const LINE_HEIGHT_PRESETS = [
  { label: 'Simple', value: 1 },
  { label: '1.15', value: 1.15 },
  { label: '1.5', value: 1.5 },
  { label: 'Double', value: 2 },
  { label: '2.5', value: 2.5 },
  { label: '3', value: 3 },
]

export function LineHeightPicker({ value, onChange, disabled }: LineHeightPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fermer quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const getCurrentLabel = () => {
    const preset = LINE_HEIGHT_PRESETS.find((p) => p.value === value)
    return preset?.label || value.toString()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-1 px-2 py-1.5 text-sm rounded-md
          hover:bg-[var(--bg-hover)] disabled:opacity-40 disabled:cursor-not-allowed
          transition-colors"
        title="Interligne"
      >
        <AlignJustify size={16} />
        <span className="text-xs">{getCurrentLabel()}</span>
        <ChevronDown size={12} className="text-[var(--text-secondary)]" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-28 bg-[var(--bg)] border border-[var(--border)]
          rounded-lg shadow-lg z-dropdown overflow-hidden animate-scaleIn">
          <div className="py-1">
            {LINE_HEIGHT_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => {
                  onChange(preset.value)
                  setIsOpen(false)
                }}
                className={`w-full px-3 py-1.5 text-sm text-left hover:bg-[var(--bg-hover)] transition-colors
                  ${value === preset.value ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : ''}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
