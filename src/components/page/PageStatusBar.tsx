/**
 * Barre de statut pour le mode page
 * Inspirée de Microsoft Word - regroupe tous les contrôles en bas
 */

import { ZoomSlider } from './ZoomSlider'
import { PageNavigator } from './PageNavigator'
import { ViewModeSelector } from './ViewModeSelector'

interface PageStatusBarProps {
  // Navigation
  currentPage: number
  totalPages: number
  onNavigate: (page: number) => void
  // Zoom
  zoom: number
  onZoomChange: (zoom: number) => void
  // Layout
  pagesPerRow: 1 | 2 | 3 | 'auto'
  onPagesPerRowChange: (value: 1 | 2 | 3 | 'auto') => void
}

export function PageStatusBar({
  currentPage,
  totalPages,
  onNavigate,
  zoom,
  onZoomChange,
  pagesPerRow,
  onPagesPerRowChange,
}: PageStatusBarProps) {
  return (
    <div className="page-status-bar">
      {/* Section gauche : Mode de vue et pages par ligne */}
      <div className="status-section">
        <ViewModeSelector
          pagesPerRow={pagesPerRow}
          onPagesPerRowChange={onPagesPerRowChange}
        />
      </div>

      <div className="status-divider" />

      {/* Section centre : Navigation */}
      <div className="status-section">
        <PageNavigator
          currentPage={currentPage}
          totalPages={totalPages}
          onNavigate={onNavigate}
        />
      </div>

      <div className="status-divider" />

      {/* Section droite : Zoom */}
      <div className="status-section status-section-right">
        <ZoomSlider
          zoom={zoom}
          onZoomChange={onZoomChange}
        />
      </div>
    </div>
  )
}
