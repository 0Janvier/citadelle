// Sélecteur de couleur pour les cellules de tableau
import { useEffect, useRef } from 'react'
import type { Editor } from '@tiptap/react'

interface TableCellColorPickerProps {
  editor: Editor
  onClose: () => void
}

const CELL_COLORS = [
  { name: 'Aucune', value: null },
  { name: 'Gris clair', value: '#f3f4f6' },
  { name: 'Gris', value: '#e5e7eb' },
  { name: 'Jaune', value: '#fef3c7' },
  { name: 'Vert', value: '#d1fae5' },
  { name: 'Bleu', value: '#dbeafe' },
  { name: 'Rose', value: '#fce7f3' },
  { name: 'Orange', value: '#ffedd5' },
  { name: 'Violet', value: '#ede9fe' },
  { name: 'Rouge', value: '#fee2e2' },
  { name: 'Cyan', value: '#cffafe' },
  { name: 'Lime', value: '#ecfccb' },
]

export function TableCellColorPicker({ editor, onClose }: TableCellColorPickerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const handleColorSelect = (color: string | null) => {
    if (color === null) {
      editor.chain().focus().setCellAttribute('backgroundColor', null).run()
    } else {
      editor.chain().focus().setCellAttribute('backgroundColor', color).run()
    }
    onClose()
  }

  return (
    <div
      ref={ref}
      className="absolute top-full right-0 mt-1 p-2 bg-[var(--bg)] border border-[var(--border)] rounded-hig-lg shadow-hig-popover z-50 animate-scaleIn"
    >
      <div className="text-xs font-medium text-[var(--text-secondary)] mb-2 px-1">
        Couleur de fond
      </div>

      <div className="grid grid-cols-4 gap-1">
        {CELL_COLORS.map((color) => (
          <button
            key={color.name}
            type="button"
            onClick={() => handleColorSelect(color.value)}
            className={`
              w-7 h-7 rounded-hig-sm border transition-all duration-fast
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
              hover:scale-110
              ${color.value === null
                ? 'bg-white dark:bg-gray-800 border-[var(--border)]'
                : 'border-transparent'
              }
            `}
            style={{ backgroundColor: color.value || undefined }}
            title={color.name}
          >
            {color.value === null && (
              <svg className="w-full h-full text-[var(--text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="4" x2="20" y2="20" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
