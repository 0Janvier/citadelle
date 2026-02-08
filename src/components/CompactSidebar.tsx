// Sidebar compacte avec overlays flottants - driven by panel registry
import { useEffect, useRef } from 'react'
import { usePanelStore } from '../store/usePanelStore'
import { PANEL_MAP, SIDEBAR_PANELS, ALL_PANEL_IDS, type PanelConfig } from '../config/panelRegistry'

// Largeur de l'overlay (exportee pour le layout dans App.tsx)
export const OVERLAY_WIDTH = 380
export const OVERLAY_GAP = 8

export { ALL_PANEL_IDS as COMPACT_PANEL_IDS }

export function CompactSidebar() {
  const activePanel = usePanelStore((state) => state.activePanel)
  const togglePanel = usePanelStore((state) => state.togglePanel)
  const closePanel = usePanelStore((state) => state.closePanel)

  const isPinned = usePanelStore((state) => state.isPinned)
  const setIsPinned = usePanelStore((state) => state.setIsPinned)

  const overlayRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Fermer l'overlay avec Escape (sauf si epingle)
  useEffect(() => {
    if (!activePanel || isPinned) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [activePanel, closePanel, isPinned])

  const isCompactPanel = activePanel ? ALL_PANEL_IDS.includes(activePanel) : false
  const showOverlay = activePanel && isCompactPanel

  // Resolve panel component from registry
  const panelEntry = activePanel ? PANEL_MAP[activePanel] : null
  const PanelComponent = panelEntry?.component ?? null

  return (
    <>
      {/* Backdrop semi-transparent (seulement si non epingle) */}
      {showOverlay && !isPinned && (
        <div
          className="fixed inset-0 z-40 bg-black/8 dark:bg-black/20 animate-fadeIn"
          onClick={closePanel}
        />
      )}

      {/* Overlay flottant */}
      {showOverlay && PanelComponent && (
        <div
          ref={overlayRef}
          className={`fixed z-50 bg-[var(--bg)] border rounded-lg shadow-2xl overflow-hidden animate-slideInRight ${
            isPinned ? 'border-[var(--accent)]' : 'border-[var(--border)]'
          }`}
          style={{
            width: OVERLAY_WIDTH,
            right: (sidebarRef.current?.offsetWidth ?? 80) + OVERLAY_GAP,
            top: 48,
            bottom: 48,
          }}
        >
          {/* Bouton epingler */}
          <button
            onClick={() => setIsPinned(!isPinned)}
            className={`absolute top-2 right-2 z-10 p-1.5 rounded-md transition-colors ${
              isPinned
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            }`}
            title={isPinned ? 'Desepingler (clic exterieur fermera)' : 'Epingler (garder ouvert)'}
          >
            <PinIcon isPinned={isPinned} />
          </button>
          <PanelComponent onClose={closePanel} />
        </div>
      )}

      {/* Barre compacte */}
      <div
        ref={sidebarRef}
        className="w-20 flex-shrink-0 flex flex-col bg-[var(--bg-secondary)] border-l border-[var(--border)]"
      >
        <div className="flex-1 flex flex-col items-center py-3 gap-1">
          {SIDEBAR_PANELS.map((panel, index) => {
            const prevPanel = SIDEBAR_PANELS[index - 1]
            const showSeparator = prevPanel && prevPanel.group !== panel.group
            return (
              <div key={panel.id} className="w-full flex flex-col items-center">
                {showSeparator && <div className="w-10 h-px bg-[var(--border)] my-1.5" />}
                <CompactPanelButton
                  panel={panel}
                  isActive={activePanel === panel.id}
                  onClick={() => togglePanel(panel.id)}
                />
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

function CompactPanelButton({
  panel,
  isActive,
  onClick,
}: {
  panel: PanelConfig
  isActive: boolean
  onClick: () => void
}) {
  const Icon = panel.icon
  return (
    <button
      onClick={onClick}
      className={`
        w-16 flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all duration-150
        ${isActive
          ? 'bg-[var(--accent)] text-white shadow-md'
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text)]'
        }
      `}
      title={`${panel.label}${panel.shortcut ? ` (${panel.shortcut})` : ''}`}
    >
      <span className={`transition-transform ${isActive ? 'scale-110' : ''}`}>
        <Icon />
      </span>
      <span className="text-[10px] font-medium truncate w-full text-center">
        {panel.label}
      </span>
    </button>
  )
}

function PinIcon({ isPinned }: { isPinned: boolean }) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isPinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 17v5" />
      <path d="M9 11V6a3 3 0 0 1 6 0v5" />
      <rect x="6" y="11" width="12" height="4" rx="1" />
    </svg>
  )
}
