/**
 * Onglet Affichage du Ribbon
 * Contient : Vues, Zoom, Outils
 */

import {
  FileText,
  ScrollText,
  Type,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Ruler,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react'
import { usePageStore } from '../../../store/usePageStore'
import { useSettingsStore } from '../../../store/useSettingsStore'
import { useEditorStore } from '../../../store/useEditorStore'
import { RibbonButton } from '../RibbonButton'
import { RibbonGroup, RibbonSeparator, RibbonDivider } from '../RibbonGroup'
import { RibbonTab } from '../RibbonTab'

export function ViewTab() {
  const viewMode = usePageStore((state) => state.viewMode)
  const setViewMode = usePageStore((state) => state.setViewMode)
  const pageZoom = usePageStore((state) => state.pageZoom)
  const setPageZoom = usePageStore((state) => state.setPageZoom)

  const theme = useSettingsStore((state) => state.theme)
  const setTheme = useSettingsStore((state) => state.setTheme)
  const typewriterMode = useSettingsStore((state) => state.typewriterMode)
  const toggleTypewriterMode = useSettingsStore((state) => state.toggleTypewriterMode)

  const isDistractionFree = useEditorStore((state) => state.isDistractionFree)
  const toggleDistractionFree = useEditorStore((state) => state.toggleDistractionFree)

  const handleZoomIn = () => setPageZoom(Math.min(2, pageZoom + 0.1))
  const handleZoomOut = () => setPageZoom(Math.max(0.5, pageZoom - 0.1))
  const handleZoomReset = () => setPageZoom(1)

  return (
    <RibbonTab>
      {/* Vues */}
      <RibbonGroup label="Vues">
        <RibbonButton
          variant="large"
          isActive={viewMode === 'scroll'}
          onClick={() => setViewMode('scroll')}
          tooltip="Mode défilement"
        >
          <ScrollText size={20} />
          <span>Défiler</span>
        </RibbonButton>
        <RibbonButton
          variant="large"
          isActive={viewMode === 'page'}
          onClick={() => setViewMode('page')}
          tooltip="Mode page (comme Word)"
        >
          <FileText size={20} />
          <span>Page</span>
        </RibbonButton>
        <RibbonSeparator />
        <RibbonButton
          variant="large"
          isActive={typewriterMode}
          onClick={toggleTypewriterMode}
          tooltip="Mode machine à écrire"
        >
          <Type size={20} />
          <span>Typewriter</span>
        </RibbonButton>
        <RibbonButton
          variant="large"
          isActive={isDistractionFree}
          onClick={toggleDistractionFree}
          tooltip="Mode sans distraction"
        >
          <Maximize2 size={20} />
          <span>Focus</span>
        </RibbonButton>
      </RibbonGroup>

      <RibbonDivider />

      {/* Zoom */}
      <RibbonGroup label="Zoom">
        <div className="flex items-center gap-1">
          <RibbonButton
            variant="icon"
            onClick={handleZoomOut}
            disabled={pageZoom <= 0.5}
            tooltip="Réduire"
          >
            <ZoomOut size={16} />
          </RibbonButton>
          <button
            type="button"
            onClick={handleZoomReset}
            className="px-2 py-1 min-w-[50px] text-sm text-center rounded-md
              hover:bg-[var(--bg-hover)] transition-colors"
            title="Réinitialiser à 100%"
          >
            {Math.round(pageZoom * 100)}%
          </button>
          <RibbonButton
            variant="icon"
            onClick={handleZoomIn}
            disabled={pageZoom >= 2}
            tooltip="Agrandir"
          >
            <ZoomIn size={16} />
          </RibbonButton>
        </div>
      </RibbonGroup>

      <RibbonDivider />

      {/* Outils */}
      <RibbonGroup label="Outils">
        <RibbonButton
          variant="large"
          onClick={() => {
            // TODO: Toggle règles
            console.log('Toggle rulers')
          }}
          tooltip="Afficher/Masquer les règles"
        >
          <Ruler size={20} />
          <span>Règles</span>
        </RibbonButton>
      </RibbonGroup>

      <RibbonDivider />

      {/* Thème */}
      <RibbonGroup label="Thème">
        <div className="flex items-center gap-0.5">
          <RibbonButton
            variant="icon"
            isActive={theme === 'light'}
            onClick={() => setTheme('light')}
            tooltip="Thème clair"
          >
            <Sun size={16} />
          </RibbonButton>
          <RibbonButton
            variant="icon"
            isActive={theme === 'dark'}
            onClick={() => setTheme('dark')}
            tooltip="Thème sombre"
          >
            <Moon size={16} />
          </RibbonButton>
          <RibbonButton
            variant="icon"
            isActive={theme === 'auto'}
            onClick={() => setTheme('auto')}
            tooltip="Thème automatique"
          >
            <Monitor size={16} />
          </RibbonButton>
        </div>
      </RibbonGroup>
    </RibbonTab>
  )
}
