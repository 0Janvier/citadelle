/**
 * Composant de navigation entre pages
 * Inspiré de Microsoft Word
 */

import { useState, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PageNavigatorProps {
  currentPage: number
  totalPages: number
  onNavigate: (page: number) => void
}

export function PageNavigator({
  currentPage,
  totalPages,
  onNavigate,
}: PageNavigatorProps) {
  const [inputValue, setInputValue] = useState(String(currentPage + 1))
  const [isEditing, setIsEditing] = useState(false)

  // Synchroniser l'input avec la page courante
  useEffect(() => {
    if (!isEditing) {
      setInputValue(String(currentPage + 1))
    }
  }, [currentPage, isEditing])

  const handlePrevious = useCallback(() => {
    if (currentPage > 0) {
      onNavigate(currentPage - 1)
    }
  }, [currentPage, onNavigate])

  const handleNext = useCallback(() => {
    if (currentPage < totalPages - 1) {
      onNavigate(currentPage + 1)
    }
  }, [currentPage, totalPages, onNavigate])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  const handleInputFocus = useCallback(() => {
    setIsEditing(true)
  }, [])

  const handleInputBlur = useCallback(() => {
    setIsEditing(false)
    const pageNum = parseInt(inputValue, 10)
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onNavigate(pageNum - 1)
    } else {
      setInputValue(String(currentPage + 1))
    }
  }, [inputValue, totalPages, currentPage, onNavigate])

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    } else if (e.key === 'Escape') {
      setInputValue(String(currentPage + 1))
      e.currentTarget.blur()
    }
  }, [currentPage])

  return (
    <div className="page-navigator">
      <button
        onClick={handlePrevious}
        disabled={currentPage <= 0}
        className="nav-btn"
        title="Page précédente"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="page-info">
        <span className="page-label">Page</span>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          className="page-input"
          title="Aller à la page..."
        />
        <span className="page-separator">/</span>
        <span className="page-total">{totalPages}</span>
      </div>

      <button
        onClick={handleNext}
        disabled={currentPage >= totalPages - 1}
        className="nav-btn"
        title="Page suivante"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
