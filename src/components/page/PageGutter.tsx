/**
 * Marge gauche avec indicateurs de numéro de page
 * Affiche les numéros de page au niveau des séparateurs
 */

import { useMemo } from 'react'

interface PageGutterProps {
  pages: Array<{ index: number; startOffset: number }>
  gutterWidth?: number
}

export function PageGutter({
  pages,
  gutterWidth = 40,
}: PageGutterProps) {
  // Calculer les positions des indicateurs
  const pageIndicators = useMemo(() => {
    return pages.map((page, idx) => ({
      pageNumber: idx + 1,
      top: page.startOffset,
    }))
  }, [pages])

  return (
    <div
      className="page-gutter"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: gutterWidth,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      {pageIndicators.map(({ pageNumber, top }) => (
        <div
          key={pageNumber}
          className="page-gutter-indicator"
          style={{
            position: 'absolute',
            top: top,
            left: 0,
            width: gutterWidth,
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 600,
            color: 'var(--text-tertiary, #999)',
            background: 'var(--bg, white)',
            borderRadius: '0 4px 4px 0',
            boxShadow: '1px 0 2px rgba(0,0,0,0.05)',
          }}
        >
          {pageNumber}
        </div>
      ))}
    </div>
  )
}
