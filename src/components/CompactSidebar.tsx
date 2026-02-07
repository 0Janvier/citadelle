// Sidebar compacte avec overlays flottants
import { useEffect, useRef, useCallback } from 'react'
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
import { VariablePanel } from './variables/VariablePanel'
import { DeadlinePanel } from './deadlines/DeadlinePanel'
import { CommentPanel } from './comments/CommentPanel'
import { DefinedTermsPanel } from './terms/DefinedTermsPanel'
import { DocumentMapPanel } from './DocumentMapPanel'
import { CharacterPanel } from './CharacterPanel'
import { BookmarkPanel } from './BookmarkPanel'
import { useCommentStore } from '../store/useCommentStore'
import { useEditorStore } from '../store/useEditorStore'
import { useLawyerProfileStore } from '../store/useLawyerProfileStore'

// Panneaux retenus avec leurs icones et labels
interface CompactPanelConfig {
  id: PanelType
  icon: React.ReactNode
  label: string
  shortcut: string
  group: 'document' | 'juridique' | 'outils'
}

// Panneaux visibles dans la sidebar (les autres restent accessibles via CommandPalette)
const COMPACT_PANELS: CompactPanelConfig[] = [
  // Document
  { id: 'document-map', icon: <DocumentMapIcon />, label: 'Plan', shortcut: '⌘⇧O', group: 'document' },
  { id: 'variables', icon: <VariablesIcon />, label: 'Variables', shortcut: '⌘⇧V', group: 'document' },
  { id: 'versions', icon: <VersionsIcon />, label: 'Versions', shortcut: '⌘⇧H', group: 'document' },
  { id: 'comments', icon: <CommentsIcon />, label: 'Notes', shortcut: '⌘⇧M', group: 'document' },
  // Juridique
  { id: 'clauses', icon: <ClausesIcon />, label: 'Clauses', shortcut: '⌘⇧C', group: 'juridique' },
  { id: 'codes', icon: <CodesIcon />, label: 'Codes', shortcut: '⌘⇧K', group: 'juridique' },
  { id: 'pieces', icon: <PiecesIcon />, label: 'Pièces', shortcut: '⌘⇧J', group: 'juridique' },
  // Outils
  { id: 'settings', icon: <SettingsIcon />, label: 'Prefs', shortcut: '⌘,', group: 'outils' },
]

// Largeur de l'overlay (exportée pour le layout dans App.tsx)
export const OVERLAY_WIDTH = 380
export const OVERLAY_GAP = 8 // gap entre overlay et sidebar

// Tous les panneaux pouvant s'afficher en overlay (sidebar + CommandPalette)
export const COMPACT_PANEL_IDS: PanelType[] = [
  'formatting', 'document-map', 'toc', 'variables', 'bookmarks', 'pageLayout', 'versions', 'comments',
  'clauses', 'codes', 'pieces', 'terms',
  'characters', 'deadlines', 'goldocab', 'settings',
]

export function CompactSidebar() {
  const activePanel = usePanelStore((state) => state.activePanel)
  const togglePanel = usePanelStore((state) => state.togglePanel)
  const closePanel = usePanelStore((state) => state.closePanel)

  // État épinglé depuis le store (partagé avec App.tsx pour le layout)
  const isPinned = usePanelStore((state) => state.isPinned)
  const setIsPinned = usePanelStore((state) => state.setIsPinned)

  const overlayRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

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
  const isCompactPanel = COMPACT_PANEL_IDS.includes(activePanel)
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
        return <GoldocabNotesPanel onClose={closePanel} onOpenDossierPicker={() => window.dispatchEvent(new Event('goldocab-dossier-picker'))} />
      case 'settings':
        return <SettingsPanel onClose={closePanel} />
      case 'variables':
        return <VariablePanel documentId={activeDocumentId || undefined} onClose={closePanel} />
      case 'deadlines':
        return activeDocumentId ? <DeadlinePanel documentId={activeDocumentId} onClose={closePanel} /> : null
      case 'versions':
        return activeDocumentId ? <VersionHistoryPanel documentId={activeDocumentId} onClose={closePanel} /> : null
      case 'comments':
        return <CommentPanelConnected onClose={closePanel} />
      case 'terms':
        return <DefinedTermsPanel onClose={closePanel} />
      case 'document-map':
        return <DocumentMapPanel onClose={closePanel} />
      case 'characters':
        return <CharacterPanel onClose={closePanel} />
      case 'bookmarks':
        return <BookmarkPanel onClose={closePanel} />
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
            right: (sidebarRef.current?.offsetWidth ?? 80) + OVERLAY_GAP,
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

function PinIcon({ isPinned }: { isPinned: boolean }) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isPinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 17v5" />
      <path d="M9 11V6a3 3 0 0 1 6 0v5" />
      <rect x="6" y="11" width="12" height="4" rx="1" />
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

function VariablesIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M7 4l5 16" />
      <path d="M12 4l5 16" />
      <path d="M5 10h14" />
      <path d="M4 16h14" />
    </svg>
  )
}

// Wrapper pour connecter CommentPanel au store
function CommentPanelConnected({ onClose }: { onClose: () => void }) {
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId)
  const comments = useCommentStore((state) => state.comments)
  const addComment = useCommentStore((state) => state.addComment)
  const resolveComment = useCommentStore((state) => state.resolveComment)
  const deleteComment = useCommentStore((state) => state.deleteComment)
  const replyToComment = useCommentStore((state) => state.replyToComment)
  const activeEditor = useEditorStore((state) => state.activeEditor)

  const docComments = activeDocumentId
    ? comments.filter((c) => c.documentId === activeDocumentId)
    : []

  const selectedRange = activeEditor
    ? (() => {
        const { from, to } = activeEditor.state.selection
        return from !== to ? { from, to } : null
      })()
    : null

  const authorName = (() => {
    const profile = useLawyerProfileStore.getState()
    return [profile.prenom, profile.nom].filter(Boolean).join(' ') || 'Auteur'
  })()

  return (
    <CommentPanel
      comments={docComments}
      onAddComment={(content, from, to) => {
        if (activeDocumentId) {
          addComment(activeDocumentId, authorName, content, from, to)
        }
      }}
      onResolveComment={resolveComment}
      onDeleteComment={deleteComment}
      onReplyComment={(parentId, content) => replyToComment(parentId, authorName, content)}
      selectedRange={selectedRange}
      onClose={onClose}
    />
  )
}

function CommentsIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function DocumentMapIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M3 6h4" />
      <path d="M3 10h8" />
      <path d="M3 14h6" />
      <path d="M3 18h10" />
      <path d="M17 4v16" strokeDasharray="2 2" />
    </svg>
  )
}

