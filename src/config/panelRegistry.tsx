// Panel Registry - Single source of truth for all sidebar panels
import type { PanelType } from '../store/usePanelStore'
import { useDocumentStore } from '../store/useDocumentStore'
import { useCommentStore } from '../store/useCommentStore'
import { useEditorStore } from '../store/useEditorStore'
import { useLawyerProfileStore } from '../store/useLawyerProfileStore'

// Panel components
import { ClauseLibrary } from '../components/clauses/ClauseLibrary'
import { CodeBrowser } from '../components/codes/CodeBrowser'
import { PiecesSidebarPanel } from '../components/pieces/PiecesSidebarPanel'
import { TocSidebarPanel } from '../components/toc/TocSidebarPanel'
import { SettingsPanel } from '../components/settings/SettingsPanel'
import { LegalPageSettings } from '../components/legal/LegalPageSettings'
import { GoldocabNotesPanel } from '../components/GoldoCab/GoldocabNotesPanel'
import { FormattingPanel } from '../components/formatting/FormattingPanel'
import { VersionHistoryPanel } from '../components/versions/VersionHistoryPanel'
import { VariablePanel } from '../components/variables/VariablePanel'
import { DeadlinePanel } from '../components/deadlines/DeadlinePanel'
import { CommentPanel } from '../components/comments/CommentPanel'
import { DefinedTermsPanel } from '../components/terms/DefinedTermsPanel'
import { DocumentMapPanel } from '../components/DocumentMapPanel'
import { CharacterPanel } from '../components/CharacterPanel'
import { BookmarkPanel } from '../components/BookmarkPanel'

// Icons
import {
  ClausesIcon, PiecesIcon, CodesIcon, DocumentMapIcon, FormattingIcon,
  TocIcon, BookmarksIcon, CharactersIcon, PageLayoutIcon,
} from './panelIcons'

// Shared panel props interface
export interface PanelProps {
  onClose: () => void
}

export interface PanelConfig {
  id: NonNullable<PanelType>
  component: React.ComponentType<PanelProps>
  label: string
  icon: React.ComponentType
  shortcut: string
  group: 'document' | 'juridique' | 'outils'
  showInSidebar: boolean
}

// Wrapper components for panels that need extra props

function FormattingPanelWrapper({ onClose: _onClose }: PanelProps) {
  return <FormattingPanel />
}

function VariablePanelWrapper({ onClose }: PanelProps) {
  const activeDocumentId = useDocumentStore((s) => s.activeDocumentId)
  return <VariablePanel documentId={activeDocumentId || undefined} onClose={onClose} />
}

function DeadlinePanelWrapper({ onClose }: PanelProps) {
  const activeDocumentId = useDocumentStore((s) => s.activeDocumentId)
  if (!activeDocumentId) return null
  return <DeadlinePanel documentId={activeDocumentId} onClose={onClose} />
}

function VersionHistoryPanelWrapper({ onClose }: PanelProps) {
  const activeDocumentId = useDocumentStore((s) => s.activeDocumentId)
  if (!activeDocumentId) return null
  return <VersionHistoryPanel documentId={activeDocumentId} onClose={onClose} />
}

function GoldocabNotesPanelWrapper({ onClose }: PanelProps) {
  return (
    <GoldocabNotesPanel
      onClose={onClose}
      onOpenDossierPicker={() => window.dispatchEvent(new Event('goldocab-dossier-picker'))}
    />
  )
}

function CommentPanelWrapper({ onClose }: PanelProps) {
  const activeDocumentId = useDocumentStore((s) => s.activeDocumentId)
  const comments = useCommentStore((s) => s.comments)
  const addComment = useCommentStore((s) => s.addComment)
  const resolveComment = useCommentStore((s) => s.resolveComment)
  const deleteComment = useCommentStore((s) => s.deleteComment)
  const replyToComment = useCommentStore((s) => s.replyToComment)
  const activeEditor = useEditorStore((s) => s.activeEditor)

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

// The registry: single source of truth for all panels
export const PANEL_REGISTRY: PanelConfig[] = [
  // Document group
  { id: 'document-map', component: DocumentMapPanel, label: 'Plan', icon: DocumentMapIcon, shortcut: '\u2318\u21E7O', group: 'document', showInSidebar: true },
  { id: 'formatting', component: FormattingPanelWrapper, label: 'Format', icon: FormattingIcon, shortcut: '', group: 'document', showInSidebar: true },
  { id: 'toc', component: TocSidebarPanel, label: 'Sommaire', icon: TocIcon, shortcut: '', group: 'document', showInSidebar: true },
  { id: 'bookmarks', component: BookmarkPanel, label: 'Signets', icon: BookmarksIcon, shortcut: '\u2318\u21E7B', group: 'document', showInSidebar: true },
  { id: 'characters', component: CharacterPanel, label: 'Caract\u00e8res', icon: CharactersIcon, shortcut: '', group: 'document', showInSidebar: true },
  // Juridique group
  { id: 'clauses', component: ClauseLibrary, label: 'Clauses', icon: ClausesIcon, shortcut: '\u2318\u21E7C', group: 'juridique', showInSidebar: true },
  { id: 'codes', component: CodeBrowser, label: 'Codes', icon: CodesIcon, shortcut: '\u2318\u21E7K', group: 'juridique', showInSidebar: true },
  { id: 'pieces', component: PiecesSidebarPanel, label: 'Pi\u00e8ces', icon: PiecesIcon, shortcut: '\u2318\u21E7J', group: 'juridique', showInSidebar: true },
  // Outils group
  { id: 'pageLayout', component: LegalPageSettings, label: 'Mise en page', icon: PageLayoutIcon, shortcut: '', group: 'outils', showInSidebar: true },
  // CommandPalette-only panels (not visible in sidebar buttons)
  { id: 'variables', component: VariablePanelWrapper, label: 'Variables', icon: FormattingIcon, shortcut: '', group: 'outils', showInSidebar: false },
  { id: 'deadlines', component: DeadlinePanelWrapper, label: '\u00c9ch\u00e9ances', icon: FormattingIcon, shortcut: '\u2318\u21E7E', group: 'outils', showInSidebar: false },
  { id: 'versions', component: VersionHistoryPanelWrapper, label: 'Versions', icon: FormattingIcon, shortcut: '', group: 'outils', showInSidebar: false },
  { id: 'comments', component: CommentPanelWrapper, label: 'Commentaires', icon: FormattingIcon, shortcut: '', group: 'outils', showInSidebar: false },
  { id: 'terms', component: DefinedTermsPanel, label: 'Termes', icon: FormattingIcon, shortcut: '', group: 'outils', showInSidebar: false },
  { id: 'goldocab', component: GoldocabNotesPanelWrapper, label: 'GoldoCab', icon: FormattingIcon, shortcut: '', group: 'outils', showInSidebar: false },
  { id: 'settings', component: SettingsPanel, label: 'R\u00e9glages', icon: FormattingIcon, shortcut: '', group: 'outils', showInSidebar: false },
]

// Derived lookups
export const PANEL_MAP: Record<string, PanelConfig> = Object.fromEntries(
  PANEL_REGISTRY.map((p) => [p.id, p])
)

export const SIDEBAR_PANELS = PANEL_REGISTRY.filter((p) => p.showInSidebar)

export const ALL_PANEL_IDS: NonNullable<PanelType>[] = PANEL_REGISTRY.map((p) => p.id)
