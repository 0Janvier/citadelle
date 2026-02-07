// Sidebar compacte avec overlays flottants
import { useState, useEffect, useRef, useCallback } from 'react'
import { usePanelStore, PanelType } from '../store/usePanelStore'
import { useDocumentStore } from '../store/useDocumentStore'
import { ClauseLibrary } from './clauses/ClauseLibrary'
import { CodeBrowser } from './codes/CodeBrowser'
import { PiecesSidebarPanel } from './pieces/PiecesSidebarPanel'
import { TocSidebarPanel } from './toc/TocSidebarPanel'
import { SettingsPanel } from './settings/SettingsPanel'
import { LegalPageSettings } from './legal/LegalPageSettings'
import { GoldocabNotesPanel } from './GoldoCab/GoldocabNotesPanel'
import { FormattingPanel } from './formatting/FormattingPanel'
import { VersionHistoryPanel } from './versions/VersionHistoryPanel'

// Panneaux retenus avec leurs icones et labels
interface CompactPanelConfig {
  id: PanelType
  icon: React.ReactNode
  label: string
  shortcut: string
  group: 'document' | 'juridique' | 'outils'
}

const COMPACT_PANELS: CompactPanelConfig[] = [
  // Document
  { id: 'formatting', icon: <FormattingIcon />, label: 'Format', shortcut: '⌘⇧F', group: 'document' },
  { id: 'toc', icon: <TocIcon />, label: 'Sommaire', shortcut: '⌘⇧T', group: 'document' },
  { id: 'pageLayout', icon: <PageLayoutIcon />, label: 'Page', shortcut: '⌘⇧L', group: 'document' },
  { id: 'versions', icon: <VersionsIcon />, label: 'Versions', shortcut: '⌘⇧H', group: 'document' },
  // Juridique
  { id: 'clauses', icon: <ClausesIcon />, label: 'Clauses', shortcut: '⌘⇧C', group: 'juridique' },
  { id: 'codes', icon: <CodesIcon />, label: 'Codes', shortcut: '⌘⇧K', group: 'juridique' },
  { id: 'pieces', icon: <PiecesIcon />, label: 'Pièces', shortcut: '⌘⇧J', group: 'juridique' },
  // Outils
  { id: 'goldocab', icon: <GoldocabIcon />, label: 'GoldoCab', shortcut: '⌘⇧G', group: 'outils' },
  { id: 'settings', icon: <SettingsIcon />, label: 'Prefs', shortcut: '⌘,', group: 'outils' },
]

// Largeur de l'overlay
const OVERLAY_WIDTH = 380

export function CompactSidebar() {
  const activePanel = usePanelStore((state) => state.activePanel)
  const togglePanel = usePanelStore((state) => state.togglePanel)
  const closePanel = usePanelStore((state) => state.closePanel)

  // État pour épingler l'overlay
  const [isPinned, setIsPinned] = useState(() => {
    const saved = localStorage.getItem('citadelle-sidebar-pinned')
    return saved === 'true'
  })

  const overlayRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Sauvegarder l'état épinglé
  useEffect(() => {
    localStorage.setItem('citadelle-sidebar-pinned', isPinned.toString())
  }, [isPinned])

  // Fermer l'overlay au clic extérieur (sauf si épinglé)
  useEffect(() => {
    if (!activePanel || isPinned) return

    const handleClickOutside = (e: MouseEvent) => {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(e.target as Node) &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        closePanel()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPinned) {
        closePanel()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [activePanel, closePanel, isPinned])

  // Vérifier si le panneau actif est dans notre liste
  const isCompactPanel = COMPACT_PANELS.some(p => p.id === activePanel)
  const showOverlay = activePanel && isCompactPanel

  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId)

  const renderPanelContent = useCallback(() => {
    switch (activePanel) {
      case 'formatting':
        return <FormattingPanel />
      case 'toc':
        return <TocSidebarPanel onClose={closePanel} />
      case 'pieces':
        return <PiecesSidebarPanel onClose={closePanel} />
      case 'clauses':
        return <ClauseLibrary onClose={closePanel} />
      case 'codes':
        return <CodeBrowser onClose={closePanel} />
      case 'pageLayout':
        return <LegalPageSettings onClose={closePanel} />
      case 'goldocab':
        return <GoldocabNotesPanel onClose={closePanel} />
      case 'settings':
        return <SettingsPanel onClose={closePanel} />
      case 'versions':
        return activeDocumentId ? <VersionHistoryPanel documentId={activeDocumentId} onClose={closePanel} /> : null
      default:
        return null
    }
  }, [activePanel, closePanel, activeDocumentId])

  return (
    <>
      {/* Overlay flottant */}
      {showOverlay && (
        <div
          ref={overlayRef}
          className={`fixed z-50 bg-[var(--bg)] border rounded-lg shadow-2xl overflow-hidden animate-slideInRight ${
            isPinned ? 'border-[var(--accent)]' : 'border-[var(--border)]'
          }`}
          style={{
            width: OVERLAY_WIDTH,
            right: 88, // 80px sidebar + 8px gap
            top: 48,
            bottom: 48,
          }}
        >
          {/* Bouton épingler */}
          <button
            onClick={() => setIsPinned(!isPinned)}
            className={`absolute top-2 right-2 z-10 p-1.5 rounded-md transition-colors ${
              isPinned
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            }`}
            title={isPinned ? 'Désépingler (clic extérieur fermera)' : 'Épingler (garder ouvert)'}
          >
            <PinIcon isPinned={isPinned} />
          </button>
          {renderPanelContent()}
        </div>
      )}

      {/* Barre compacte */}
      <div
        ref={sidebarRef}
        className="w-20 flex-shrink-0 flex flex-col bg-[var(--bg-secondary)] border-l border-[var(--border)]"
      >
        {/* Panneaux groupés */}
        <div className="flex-1 flex flex-col items-center py-3 gap-1">
          {COMPACT_PANELS.map((panel, index) => {
            const prevPanel = COMPACT_PANELS[index - 1]
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

// Bouton de panneau compact
function CompactPanelButton({
  panel,
  isActive,
  onClick,
}: {
  panel: CompactPanelConfig
  isActive: boolean
  onClick: () => void
}) {
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
      title={`${panel.label} (${panel.shortcut})`}
    >
      <span className={`transition-transform ${isActive ? 'scale-110' : ''}`}>
        {panel.icon}
      </span>
      <span className="text-[10px] font-medium truncate w-full text-center">
        {panel.label}
      </span>
    </button>
  )
}

// Icones (versions simplifiees)
function TocIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M4 6h16" />
      <path d="M4 10h12" />
      <path d="M4 14h14" />
      <path d="M4 18h10" />
    </svg>
  )
}

function ClausesIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M8 13h8" />
      <path d="M8 17h8" />
    </svg>
  )
}

function PiecesIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <circle cx="17" cy="17" r="3" fill="currentColor" stroke="none" />
    </svg>
  )
}

function CodesIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
      <path d="M8 15h4" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function PageLayoutIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="4" y="2" width="16" height="20" rx="1" />
      <path d="M4 6h16" strokeDasharray="2 2" />
      <path d="M4 18h16" strokeDasharray="2 2" />
      <path d="M8 2v20" strokeDasharray="2 2" />
      <path d="M16 2v20" strokeDasharray="2 2" />
    </svg>
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

function GoldocabIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
      <circle cx="12" cy="10" r="3" fill="currentColor" strokeWidth={0} />
    </svg>
  )
}

function VersionsIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function FormattingIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M6 4h8l4 4v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
      <path d="M14 4v4h4" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
      <path d="M8 9h4" strokeWidth={2} />
    </svg>
  )
}
