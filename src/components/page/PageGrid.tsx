/**
 * Grille pour afficher plusieurs pages côte à côte
 */

import { memo, ReactNode } from 'react'

export type PagesPerRow = 1 | 2 | 3

interface PageGridProps {
  children: ReactNode
  pagesPerRow: PagesPerRow
  pageWidth: number
  zoom: number
}

export const PageGrid = memo(function PageGrid({
  children,
  pagesPerRow,
  pageWidth,
  zoom,
}: PageGridProps) {
  const scaledWidth = pageWidth * zoom
  const gap = 40

  return (
    <div
      className={`page-grid cols-${pagesPerRow}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${pagesPerRow}, ${scaledWidth}px)`,
        gap: `${gap}px`,
        justifyContent: 'center',
        alignItems: 'start',
        padding: '32px',
        minHeight: '100%',
      }}
    >
      {children}
    </div>
  )
})
