/**
 * Sélecteur de taille de police avec input et presets
 */

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Minus, Plus } from 'lucide-react'

interface FontSizePickerProps {
  value: number
  onChange: (size: number) => void
  disabled?: boolean
}

const SIZE_PRESETS = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48, 72]

export function FontSizePicker({ value, onChange, disabled }: FontSizePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(String(value))
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Synchroniser l'input avec la valeur
  useEffect(() => {
    setInputValue(String(value))
  }, [value])

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputBlur = () => {
    const num = parseInt(inputValue, 10)
    if (!isNaN(num) && num >= 6 && num <= 144) {
      onChange(num)
    } else {
      setInputValue(String(value))
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur()
      ;(e.target as HTMLInputElement).blur()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const newValue = Math.min(144, value + 1)
      onChange(newValue)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const newValue = Math.max(6, value - 1)
      onChange(newValue)
    }
  }

  const handleIncrement = () => {
    const currentIndex = SIZE_PRESETS.findIndex((s) => s >= value)
    if (currentIndex < SIZE_PRESETS.length - 1) {
      onChange(SIZE_PRESETS[currentIndex + 1])
    } else {
      onChange(Math.min(144, value + 2))
    }
  }

  const handleDecrement = () => {
    const currentIndex = SIZE_PRESETS.findIndex((s) => s >= value)
    if (currentIndex > 0) {
      onChange(SIZE_PRESETS[currentIndex - 1])
    } else {
      onChange(Math.max(6, value - 2))
    }
  }

  return (
    <div className="flex items-center gap-0.5" ref={dropdownRef}>
      {/* Bouton - */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= 6}
        className="p-1 rounded hover:bg-[var(--bg-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        title="Réduire la taille"
      >
        <Minus size={12} />
      </button>

      {/* Input + Dropdown */}
      <div className="relative">
        <div className="flex items-center border border-[var(--border)] rounded-md overflow-hidden">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            disabled={disabled}
            className="w-10 px-1.5 py-1 text-sm text-center bg-[var(--bg)]
              focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className="px-1 py-1 border-l border-[var(--border)] hover:bg-[var(--bg-hover)]
              disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronDown size={12} />
          </button>
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-16 bg-[var(--bg)] border border-[var(--border)]
            rounded-lg shadow-lg z-dropdown max-h-48 overflow-y-auto animate-scaleIn">
            {SIZE_PRESETS.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  onChange(size)
                  setIsOpen(false)
                }}
                className={`w-full px-2 py-1.5 text-sm text-center hover:bg-[var(--bg-hover)] transition-colors
                  ${value === size ? 'bg-[var(--accent)]/10 text-[var(--accent)] font-medium' : ''}`}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bouton + */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= 144}
        className="p-1 rounded hover:bg-[var(--bg-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        title="Augmenter la taille"
      >
        <Plus size={12} />
      </button>
    </div>
  )
}
