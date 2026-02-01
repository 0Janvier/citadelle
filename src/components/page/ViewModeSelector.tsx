/**
 * Sélecteur de mode d'affichage (Scroll / Continu / Page)
 * Inspiré de Microsoft Word
 */

import { FileText, ScrollText, LayoutGrid, AlignJustify } from 'lucide-react'
import { usePageStore } from '../../store/usePageStore'

interface ViewModeSelectorProps {
  pagesPerRow?: 1 | 2 | 3 | 'auto'
  onPagesPerRowChange?: (value: 1 | 2 | 3 | 'auto') => void
}

export function ViewModeSelector({
  pagesPerRow,
  onPagesPerRowChange,
}: ViewModeSelectorProps) {
  const viewMode = usePageStore((state) => state.viewMode)
  const setViewMode = usePageStore((state) => state.setViewMode)

  return (
    <div className="view-mode-selector">
      <button
        onClick={() => setViewMode('scroll')}
        className={`view-mode-btn ${viewMode === 'scroll' ? 'active' : ''}`}
        title="Mode brouillon (sans pagination)"
      >
        <ScrollText size={16} />
      </button>

      <button
        onClick={() => setViewMode('continuous')}
        className={`view-mode-btn ${viewMode === 'continuous' ? 'active' : ''}`}
        title="Mode continu (scroll avec séparateurs de page)"
      >
        <AlignJustify size={16} />
      </button>

      <button
        onClick={() => setViewMode('page')}
        className={`view-mode-btn ${viewMode === 'page' ? 'active' : ''}`}
        title="Mode page (pages séparées)"
      >
        <FileText size={16} />
      </button>

      {/* Sélecteur de pages par ligne (visible uniquement en mode page) */}
      {viewMode === 'page' && pagesPerRow !== undefined && onPagesPerRowChange && (
        <>
          <div className="view-mode-divider" />
          <div className="pages-per-row-selector">
            {([1, 2, 3] as const).map((num) => (
              <button
                key={num}
                onClick={() => onPagesPerRowChange(num)}
                className={`pages-btn ${pagesPerRow === num ? 'active' : ''}`}
                title={`${num} page${num > 1 ? 's' : ''} par ligne`}
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => onPagesPerRowChange('auto')}
              className={`pages-btn pages-btn-auto ${pagesPerRow === 'auto' ? 'active' : ''}`}
              title="Automatique"
            >
              <LayoutGrid size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
