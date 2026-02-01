// Grille visuelle pour l'insertion de tableaux (style Word/Google Docs)
import { useState, useCallback, useRef, useEffect } from 'react'
import type { Editor } from '@tiptap/react'

interface TableGridPickerProps {
  editor: Editor
  isOpen: boolean
  onClose: () => void
}

const GRID_SIZE = 8
const CELL_SIZE = 20
const GAP = 2

export function TableGridPicker({ editor, isOpen, onClose }: TableGridPickerProps) {
  const [hoveredRows, setHoveredRows] = useState(0)
  const [hoveredCols, setHoveredCols] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setHoveredRows(0)
      setHoveredCols(0)
    }
  }, [isOpen])

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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
  }, [isOpen, onClose])

  const handleCellHover = useCallback((row: number, col: number) => {
    setHoveredRows(row)
    setHoveredCols(col)
  }, [])

  const handleCellClick = useCallback((row: number, col: number) => {
    editor.chain().focus().insertTable({ rows: row, cols: col, withHeaderRow: true }).run()
    onClose()
  }, [editor, onClose])

  const handleMouseLeave = useCallback(() => {
    setHoveredRows(0)
    setHoveredCols(0)
  }, [])

  if (!isOpen) return null

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 mt-1 p-3 bg-[var(--bg)] border border-[var(--border)] rounded-hig-lg shadow-hig-popover z-50 animate-scaleIn"
      onMouseLeave={handleMouseLeave}
    >
      {/* Titre */}
      <div className="text-xs font-medium text-[var(--text-secondary)] mb-2">
        Insérer un tableau
      </div>

      {/* Grille */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
          gap: `${GAP}px`,
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const row = Math.floor(index / GRID_SIZE) + 1
          const col = (index % GRID_SIZE) + 1
          const isSelected = row <= hoveredRows && col <= hoveredCols

          return (
            <button
              key={index}
              type="button"
              className={`
                transition-colors duration-instant
                border rounded-sm
                ${isSelected
                  ? 'bg-[var(--accent)] border-[var(--accent)]'
                  : 'bg-[var(--bg-secondary)] border-[var(--border)] hover:border-[var(--accent)]'
                }
              `}
              style={{ width: CELL_SIZE, height: CELL_SIZE }}
              onMouseEnter={() => handleCellHover(row, col)}
              onClick={() => handleCellClick(row, col)}
              aria-label={`${col} colonnes × ${row} lignes`}
            />
          )
        })}
      </div>

      {/* Indicateur de taille */}
      <div className="mt-2 text-center text-xs text-[var(--text-secondary)]">
        {hoveredRows > 0 && hoveredCols > 0 ? (
          <span className="font-medium text-[var(--accent)]">
            {hoveredCols} × {hoveredRows} tableau
          </span>
        ) : (
          <span>Survolez pour sélectionner</span>
        )}
      </div>
    </div>
  )
}
