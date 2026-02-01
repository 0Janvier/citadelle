/**
 * Composant de contrôle du zoom avec slider et préréglages
 * Inspiré de Microsoft Word
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Minus, Plus, ChevronDown } from 'lucide-react'

interface ZoomSliderProps {
  zoom: number
  onZoomChange: (zoom: number) => void
  min?: number
  max?: number
}

const ZOOM_PRESETS = [50, 75, 100, 125, 150, 200]

export function ZoomSlider({
  zoom,
  onZoomChange,
  min = 0.5,
  max = 2,
}: ZoomSliderProps) {
  const [showPresets, setShowPresets] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowPresets(false)
      }
    }

    if (showPresets) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPresets])

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(min, zoom - 0.1)
    onZoomChange(Math.round(newZoom * 10) / 10)
  }, [zoom, min, onZoomChange])

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(max, zoom + 0.1)
    onZoomChange(Math.round(newZoom * 10) / 10)
  }, [zoom, max, onZoomChange])

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value) / 100
    onZoomChange(value)
  }, [onZoomChange])

  const handlePresetClick = useCallback((preset: number) => {
    onZoomChange(preset / 100)
    setShowPresets(false)
  }, [onZoomChange])

  const zoomPercent = Math.round(zoom * 100)

  return (
    <div className="zoom-controls">
      <button
        onClick={handleZoomOut}
        disabled={zoom <= min}
        className="zoom-btn"
        title="Réduire (−10%)"
      >
        <Minus size={14} />
      </button>

      <input
        type="range"
        min={min * 100}
        max={max * 100}
        value={zoomPercent}
        onChange={handleSliderChange}
        className="zoom-slider"
        title={`Zoom: ${zoomPercent}%`}
      />

      <button
        onClick={handleZoomIn}
        disabled={zoom >= max}
        className="zoom-btn"
        title="Agrandir (+10%)"
      >
        <Plus size={14} />
      </button>

      <div className="zoom-value-container" ref={dropdownRef}>
        <button
          className="zoom-value"
          onClick={() => setShowPresets(!showPresets)}
          title="Préréglages de zoom"
        >
          <span>{zoomPercent}%</span>
          <ChevronDown size={12} />
        </button>

        {showPresets && (
          <div className="zoom-presets">
            {ZOOM_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => handlePresetClick(preset)}
                className={zoomPercent === preset ? 'active' : ''}
              >
                {preset}%
              </button>
            ))}
            <div className="zoom-presets-divider" />
            <button onClick={() => handlePresetClick(100)}>
              Taille réelle
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
