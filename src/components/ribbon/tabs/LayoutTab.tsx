/**
 * Onglet Mise en page du Ribbon
 * Contient : Page (Marges, Orientation, Taille), Espacement
 */

import { useState } from 'react'
import {
  FileText,
  RotateCcw,
  Ruler,
  FileDown,
  Settings2,
} from 'lucide-react'
import { usePageStore } from '../../../store/usePageStore'
import { useEditorStore } from '../../../store/useEditorStore'
import { useDocumentStore } from '../../../store/useDocumentStore'
import { useSettingsStore } from '../../../store/useSettingsStore'
import { useExportPDFNative } from '../../../hooks/useExportPDFNative'
import { RibbonButton } from '../RibbonButton'
import { RibbonGroup, RibbonDivider } from '../RibbonGroup'
import { RibbonTab } from '../RibbonTab'
import { ParagraphSpacingPicker } from '../controls/ParagraphSpacingPicker'

const MARGIN_PRESETS = [
  { label: 'Normal', values: { top: 72, bottom: 72, left: 72, right: 72 }, description: '2.54 cm partout' },
  { label: 'Étroit', values: { top: 36, bottom: 36, left: 36, right: 36 }, description: '1.27 cm partout' },
  { label: 'Large', values: { top: 72, bottom: 72, left: 108, right: 108 }, description: '3.81 cm côtés' },
  { label: 'Miroir', values: { top: 72, bottom: 72, left: 90, right: 54 }, description: 'Pour reliure' },
]

import type { PageFormat } from '../../../store/usePageStore'
import { PAGE_DIMENSIONS } from '../../../store/usePageStore'

const PAGE_SIZES: { label: string; format: PageFormat; description: string }[] = [
  { label: 'A4', format: 'A4', description: '21 × 29.7 cm' },
  { label: 'Letter', format: 'Letter', description: '21.6 × 27.9 cm' },
  { label: 'Legal', format: 'Legal', description: '21.6 × 35.6 cm' },
]

export function LayoutTab() {
  const [showMarginsMenu, setShowMarginsMenu] = useState(false)
  const [showSizeMenu, setShowSizeMenu] = useState(false)

  const margins = usePageStore((state) => state.margins)
  const setMargins = usePageStore((state) => state.setMargins)
  const pageFormat = usePageStore((state) => state.pageFormat)
  const setPageFormat = usePageStore((state) => state.setPageFormat)
  const orientation = usePageStore((state) => state.orientation)
  const setOrientation = usePageStore((state) => state.setOrientation)

  const setPdfExportSettingsOpen = useEditorStore((state) => state.setPdfExportSettingsOpen)
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId)
  const { exportToPDF } = useExportPDFNative()

  const paragraphSpacing = useSettingsStore((state) => state.paragraphSpacing)
  const paragraphIndent = useSettingsStore((state) => state.paragraphIndent)
  const setParagraphSpacing = useSettingsStore((state) => state.setParagraphSpacing)
  const setParagraphIndent = useSettingsStore((state) => state.setParagraphIndent)

  const handleMarginsChange = (preset: typeof MARGIN_PRESETS[number]) => {
    setMargins(preset.values)
    setShowMarginsMenu(false)
  }

  const handleSizeChange = (size: typeof PAGE_SIZES[number]) => {
    setPageFormat(size.format)
    setShowSizeMenu(false)
  }

  const toggleOrientation = () => {
    setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait')
  }

  const getCurrentMarginLabel = () => {
    const preset = MARGIN_PRESETS.find(
      (p) =>
        p.values.top === margins.top &&
        p.values.bottom === margins.bottom &&
        p.values.left === margins.left &&
        p.values.right === margins.right
    )
    return preset?.label || 'Personnalisé'
  }

  const getCurrentSizeLabel = () => {
    return PAGE_DIMENSIONS[pageFormat]?.label || pageFormat
  }

  return (
    <RibbonTab>
      {/* Page */}
      <RibbonGroup label="Page">
        {/* Marges */}
        <div className="relative">
          <RibbonButton
            variant="large"
            onClick={() => setShowMarginsMenu(!showMarginsMenu)}
            tooltip="Marges"
          >
            <Ruler size={20} />
            <span>Marges</span>
          </RibbonButton>
          {showMarginsMenu && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-[var(--bg)] border border-[var(--border)]
              rounded-lg shadow-lg z-dropdown overflow-hidden animate-scaleIn">
              <div className="py-1">
                {MARGIN_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleMarginsChange(preset)}
                    className={`w-full px-3 py-2 text-left hover:bg-[var(--bg-hover)] transition-colors
                      ${getCurrentMarginLabel() === preset.label ? 'bg-[var(--accent)]/10' : ''}`}
                  >
                    <div className="text-sm font-medium">{preset.label}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{preset.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Orientation */}
        <RibbonButton
          variant="large"
          onClick={toggleOrientation}
          tooltip={`Orientation: ${orientation === 'portrait' ? 'Portrait' : 'Paysage'}`}
        >
          <RotateCcw size={20} className={orientation === 'landscape' ? 'rotate-90' : ''} />
          <span>{orientation === 'portrait' ? 'Portrait' : 'Paysage'}</span>
        </RibbonButton>

        {/* Taille */}
        <div className="relative">
          <RibbonButton
            variant="large"
            onClick={() => setShowSizeMenu(!showSizeMenu)}
            tooltip="Taille de page"
          >
            <FileText size={20} />
            <span>{getCurrentSizeLabel()}</span>
          </RibbonButton>
          {showSizeMenu && (
            <div className="absolute top-full left-0 mt-1 w-44 bg-[var(--bg)] border border-[var(--border)]
              rounded-lg shadow-lg z-dropdown overflow-hidden animate-scaleIn">
              <div className="py-1">
                {PAGE_SIZES.map((size) => (
                  <button
                    key={size.label}
                    type="button"
                    onClick={() => handleSizeChange(size)}
                    className={`w-full px-3 py-2 text-left hover:bg-[var(--bg-hover)] transition-colors
                      ${getCurrentSizeLabel() === size.label ? 'bg-[var(--accent)]/10' : ''}`}
                  >
                    <div className="text-sm font-medium">{size.label}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{size.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </RibbonGroup>

      <RibbonDivider />

      {/* Espacement */}
      <RibbonGroup label="Espacement">
        <ParagraphSpacingPicker
          spacingValue={paragraphSpacing}
          indentValue={paragraphIndent}
          onSpacingChange={setParagraphSpacing}
          onIndentChange={setParagraphIndent}
        />
      </RibbonGroup>

      <RibbonDivider />

      {/* Export PDF */}
      <RibbonGroup label="Export PDF">
        <RibbonButton
          variant="large"
          onClick={() => activeDocumentId && exportToPDF(activeDocumentId)}
          disabled={!activeDocumentId}
          tooltip="Exporter en PDF (Cmd+E)"
        >
          <FileDown size={20} />
          <span>Exporter</span>
        </RibbonButton>
        <RibbonButton
          variant="large"
          onClick={() => setPdfExportSettingsOpen(true)}
          tooltip="Paramètres d'export PDF"
        >
          <Settings2 size={20} />
          <span>Paramètres</span>
        </RibbonButton>
      </RibbonGroup>
    </RibbonTab>
  )
}
