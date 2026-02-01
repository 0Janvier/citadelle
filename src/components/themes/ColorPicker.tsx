import { useState, useRef, useEffect } from 'react'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  disabled?: boolean
}

const PRESET_COLORS = [
  '#ffffff', '#f5f5f7', '#e5e7eb', '#d4d4d4',
  '#9ca3af', '#6b7280', '#4b5563', '#374151',
  '#1f2937', '#1a1a1a', '#000000',
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e',
]

export function ColorPicker({
  value,
  onChange,
  label,
  disabled = false,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync input value with prop
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue)
    // Only update if it's a valid color
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue) || /^#[0-9A-Fa-f]{3}$/.test(newValue)) {
      onChange(newValue)
    }
  }

  const handleInputBlur = () => {
    // Revert to current value if invalid
    if (!/^#[0-9A-Fa-f]{6}$/.test(inputValue) && !/^#[0-9A-Fa-f]{3}$/.test(inputValue)) {
      setInputValue(value)
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}

      <div className="flex items-center gap-2">
        {/* Color swatch button */}
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: value }}
        />

        {/* Hex input */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={handleInputBlur}
          disabled={disabled}
          className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          placeholder="#000000"
        />
      </div>

      {/* Color picker popup */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* Preset colors grid */}
          <div className="grid grid-cols-9 gap-1.5 mb-3">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => {
                  onChange(color)
                  setInputValue(color)
                }}
                className={`
                  w-6 h-6 rounded border transition-transform hover:scale-110
                  ${value === color
                    ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                    : 'border-gray-200 dark:border-gray-600'
                  }
                `}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>

          {/* Native color picker */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Couleur personnalisée :
            </span>
            <input
              type="color"
              value={value}
              onChange={(e) => {
                onChange(e.target.value)
                setInputValue(e.target.value)
              }}
              className="w-8 h-6 rounded cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  )
}
