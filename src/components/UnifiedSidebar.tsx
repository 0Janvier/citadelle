// Sidebar unifiée avec système d'onglets verticaux
import { useState, useEffect, useRef } from 'react'
import { usePanelStore, PanelType } from '../store/usePanelStore'
import { useEditorStore } from '../store/useEditorStore'
import { useDocumentStore } from '../store/useDocumentStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { useFileOperations } from '../hooks/useFileOperations'
import { ClauseLibrary } from './clauses/ClauseLibrary'
import { VariablePanel } from './variables/VariablePanel'
import { CodeBrowser } from './codes/CodeBrowser'
import { SignatureEditor } from './signature/SignatureEditor'
import { OcrPanel } from './ocr/OcrPanel'
import { CloudSyncPanel } from './cloud/CloudSyncPanel'
import { PiecesSidebarPanel } from './pieces/PiecesSidebarPanel'
import { TocSidebarPanel } from './toc/TocSidebarPanel'
import { ProjectPanel } from './project/ProjectPanel'
import { DefinedTermsPanel } from './terms/DefinedTermsPanel'
import { LegalPageSettings } from './legal/LegalPageSettings'
import { FormattingPanel } from './formatting/FormattingPanel'
import { SettingsPanel } from './settings/SettingsPanel'

// Configuration des onglets
interface TabConfig {
  id: PanelType
  icon: React.ReactNode
  label: string
  shortcut?: string
}

// Groupes de panneaux organisés par catégorie
interface PanelGroup {
  id: string
  label: string
  icon: React.ReactNode
  panels: TabConfig[]
}

const PANEL_GROUPS: PanelGroup[] = [
  {
    id: 'document',
    label: 'Document',
    icon: <DocumentGroupIcon />,
    panels: [
      { id: 'formatting', icon: <FormattingIcon />, label: 'Mise en forme', shortcut: '⌘⇧F' },
      { id: 'toc', icon: <TocIcon />, label: 'Table des matières', shortcut: '⌘⇧M' },
      { id: 'pageLayout', icon: <PageLayoutIcon />, label: 'Mise en page', shortcut: '⌘⇧L' },
    ],
  },
  {
    id: 'legal',
    label: 'Juridique',
    icon: <LegalGroupIcon />,
    panels: [
      { id: 'clauses', icon: <ClausesIcon />, label: 'Bibliothèque de clauses', shortcut: '⌘⇧C' },
      { id: 'codes', icon: <CodesIcon />, label: 'Codes juridiques', shortcut: '⌘⇧K' },
      { id: 'pieces', icon: <PiecesIcon />, label: 'Pièces justificatives', shortcut: '⌘⇧P' },
      { id: 'terms', icon: <TermsIcon />, label: 'Glossaire', shortcut: '⌘⇧G' },
    ],
  },
  {
    id: 'tools',
    label: 'Outils',
    icon: <ToolsGroupIcon />,
    panels: [
      { id: 'variables', icon: <VariablesIcon />, label: 'Variables dynamiques', shortcut: '⌘⇧V' },
      { id: 'signature', icon: <SignatureIcon />, label: 'Signature électronique' },
    ],
  },
  {
    id: 'files',
    label: 'Fichiers',
    icon: <FilesGroupIcon />,
    panels: [
      { id: 'project', icon: <ProjectIcon />, label: 'Projet', shortcut: '⌘⇧O' },
      { id: 'cloud', icon: <CloudIcon />, label: 'Synchronisation cloud' },
      { id: 'ocr', icon: <OcrIcon />, label: 'OCR - Extraction de texte' },
    ],
  },
]

// Liste plate de tous les panneaux pour la recherche
const ALL_PANELS: TabConfig[] = PANEL_GROUPS.flatMap(g => g.panels)

// Panneau settings séparé (toujours visible en bas)
const SETTINGS_TAB: TabConfig = {
  id: 'settings',
  icon: <SettingsPanelIcon />,
  label: 'Préférences',
  shortcut: '⌘,',
}

// Panneaux exclus (gérés différemment)
const EXCLUDED_PANELS: PanelType[] = ['search', 'comments', 'email', 'diff']

// Largeurs min/max
const MIN_WIDTH = 320
const MAX_WIDTH = 500
const DEFAULT_WIDTH = 384

export function UnifiedSidebar() {
  const activePanel = usePanelStore((state) => state.activePanel)
  const togglePanel = usePanelStore((state) => state.togglePanel)
  const closePanel = usePanelStore((state) => state.closePanel)

  // Actions globales
  const activeEditor = useEditorStore((state) => state.activeEditor)
  const setFindDialogOpen = useEditorStore((state) => state.setFindDialogOpen)
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId)
  const theme = useSettingsStore((state) => state.theme)
  const toggleTheme = useSettingsStore((state) => state.toggleTheme)
  const { openFile, saveFile } = useFileOperations()

  // État local pour la largeur et le repliage
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem('citadelle-sidebar-width')
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH
  })
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('citadelle-sidebar-collapsed')
    return saved === 'true'
  })

  // État pour les groupes repliés
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('citadelle-sidebar-collapsed-groups')
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })

  // État pour la recherche
  const [searchQuery, setSearchQuery] = useState('')

  // État pour les favoris
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('citadelle-sidebar-favorites')
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })

  // Timer pour le clic long (favoris)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sauvegarder les groupes repliés
  useEffect(() => {
    localStorage.setItem('citadelle-sidebar-collapsed-groups', JSON.stringify([...collapsedGroups]))
  }, [collapsedGroups])

  // Sauvegarder les favoris
  useEffect(() => {
    localStorage.setItem('citadelle-sidebar-favorites', JSON.stringify([...favorites]))
  }, [favorites])

  // Toggle un groupe
  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }

  // Toggle favori
  const toggleFavorite = (panelId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(panelId)) {
        next.delete(panelId)
      } else {
        next.add(panelId)
      }
      return next
    })
  }

  // Gestion du clic long pour les favoris
  const handlePanelMouseDown = (panelId: string) => {
    longPressTimer.current = setTimeout(() => {
      toggleFavorite(panelId)
    }, 500)
  }

  const handlePanelMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  // Filtrer les panneaux selon la recherche
  const filteredPanels = searchQuery
    ? ALL_PANELS.filter(p =>
        p.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null

  // Panneaux favoris
  const favoritePanels = ALL_PANELS.filter(p => favorites.has(p.id as string))

  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Sauvegarder l'état
  useEffect(() => {
    localStorage.setItem('citadelle-sidebar-width', width.toString())
  }, [width])

  useEffect(() => {
    localStorage.setItem('citadelle-sidebar-collapsed', isCollapsed.toString())
  }, [isCollapsed])

  // Gestion du redimensionnement
  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!sidebarRef.current) return
      const rect = sidebarRef.current.getBoundingClientRect()
      const newWidth = rect.right - e.clientX
      setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, newWidth)))
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  // Double-clic pour replier/déplier
  const handleDoubleClick = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Vérifie si un panneau exclu est actif
  if (activePanel && EXCLUDED_PANELS.includes(activePanel)) {
    return null
  }

  // Panneau à afficher
  const showPanel = activePanel && !EXCLUDED_PANELS.includes(activePanel) && !isCollapsed

  const renderPanelContent = () => {
    switch (activePanel) {
      case 'formatting':
        return <FormattingPanel />
      case 'project':
        return <ProjectPanel onClose={closePanel} />
      case 'terms':
        return <DefinedTermsPanel onClose={closePanel} />
      case 'toc':
        return <TocSidebarPanel onClose={closePanel} />
      case 'pieces':
        return <PiecesSidebarPanel onClose={closePanel} />
      case 'clauses':
        return <ClauseLibrary onClose={closePanel} />
      case 'variables':
        return <VariablePanel onClose={closePanel} />
      case 'codes':
        return <CodeBrowser onClose={closePanel} />
      case 'signature':
        return <SignatureEditor onClose={closePanel} />
      case 'ocr':
        return <OcrPanel onClose={closePanel} />
      case 'cloud':
        return <CloudSyncPanel onClose={closePanel} />
      case 'pageLayout':
        return <LegalPageSettings onClose={closePanel} />
      case 'settings':
        return <SettingsPanel onClose={closePanel} />
      default:
        return null
    }
  }

  return (
    <div
      ref={sidebarRef}
      className="flex h-full border-l border-[var(--border)] bg-[var(--bg)]"
      style={{ width: isCollapsed ? 'auto' : showPanel ? width : 'auto' }}
    >
      {/* Poignée de redimensionnement */}
      {showPanel && !isCollapsed && (
        <div
          className="w-1 cursor-col-resize hover:bg-[var(--accent)] transition-colors flex-shrink-0"
          onMouseDown={() => setIsResizing(true)}
          onDoubleClick={handleDoubleClick}
          title="Glisser pour redimensionner, double-clic pour replier"
        />
      )}

      {/* Contenu du panneau */}
      {showPanel && !isCollapsed && (
        <div className="flex-1 overflow-hidden flex flex-col min-w-0">
          {renderPanelContent()}
        </div>
      )}

      {/* Barre de navigation avec groupes */}
      <div className="w-52 flex-shrink-0 flex flex-col bg-[var(--bg-secondary)] border-l border-[var(--border)] overflow-hidden">
        {/* Barre de recherche */}
        <div className="px-2 py-2 border-b border-[var(--border)]">
          <div className="relative">
            <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto py-1">
          {/* Favoris (si présents) */}
          {favoritePanels.length > 0 && !searchQuery && (
            <div className="px-2 mb-2">
              <div className="text-xs font-medium text-[var(--text-tertiary)] px-2 py-1 uppercase tracking-wide">
                Favoris
              </div>
              {favoritePanels.map((panel) => (
                <PanelButton
                  key={panel.id}
                  panel={panel}
                  isActive={activePanel === panel.id && !isCollapsed}
                  isFavorite={true}
                  onClick={() => {
                    togglePanel(panel.id)
                    if (isCollapsed) setIsCollapsed(false)
                  }}
                  onMouseDown={() => handlePanelMouseDown(panel.id as string)}
                  onMouseUp={handlePanelMouseUp}
                  onMouseLeave={handlePanelMouseUp}
                />
              ))}
            </div>
          )}

          {/* Résultats de recherche */}
          {searchQuery && filteredPanels && (
            <div className="px-2">
              {filteredPanels.length === 0 ? (
                <div className="text-sm text-[var(--text-tertiary)] text-center py-4">
                  Aucun résultat
                </div>
              ) : (
                filteredPanels.map((panel) => (
                  <PanelButton
                    key={panel.id}
                    panel={panel}
                    isActive={activePanel === panel.id && !isCollapsed}
                    isFavorite={favorites.has(panel.id as string)}
                    onClick={() => {
                      togglePanel(panel.id)
                      if (isCollapsed) setIsCollapsed(false)
                      setSearchQuery('')
                    }}
                    onMouseDown={() => handlePanelMouseDown(panel.id as string)}
                    onMouseUp={handlePanelMouseUp}
                    onMouseLeave={handlePanelMouseUp}
                  />
                ))
              )}
            </div>
          )}

          {/* Groupes de panneaux */}
          {!searchQuery && PANEL_GROUPS.map((group) => (
            <div key={group.id} className="mb-1">
              {/* En-tête du groupe */}
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <span className={`transition-transform ${collapsedGroups.has(group.id) ? '' : 'rotate-90'}`}>
                  <ChevronIcon />
                </span>
                <span className="text-[var(--text-tertiary)]">{group.icon}</span>
                <span>{group.label}</span>
              </button>

              {/* Panneaux du groupe */}
              {!collapsedGroups.has(group.id) && (
                <div className="px-2">
                  {group.panels.map((panel) => (
                    <PanelButton
                      key={panel.id}
                      panel={panel}
                      isActive={activePanel === panel.id && !isCollapsed}
                      isFavorite={favorites.has(panel.id as string)}
                      onClick={() => {
                        togglePanel(panel.id)
                        if (isCollapsed) setIsCollapsed(false)
                      }}
                      onMouseDown={() => handlePanelMouseDown(panel.id as string)}
                      onMouseUp={handlePanelMouseUp}
                      onMouseLeave={handlePanelMouseUp}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions en bas */}
        <div className="border-t border-[var(--border)] p-2 space-y-1">
          {/* Settings */}
          <PanelButton
            panel={SETTINGS_TAB}
            isActive={activePanel === 'settings' && !isCollapsed}
            isFavorite={false}
            onClick={() => {
              togglePanel('settings')
              if (isCollapsed) setIsCollapsed(false)
            }}
          />

          {/* Actions rapides */}
          <div className="flex items-center gap-1 pt-1">
            <button
              onClick={() => activeEditor?.chain().focus().undo().run()}
              disabled={!activeEditor?.can().undo()}
              className="flex-1 p-1.5 rounded hover:bg-[var(--bg-tertiary)] disabled:opacity-30"
              title="Annuler"
            >
              <UndoIcon />
            </button>
            <button
              onClick={() => activeEditor?.chain().focus().redo().run()}
              disabled={!activeEditor?.can().redo()}
              className="flex-1 p-1.5 rounded hover:bg-[var(--bg-tertiary)] disabled:opacity-30"
              title="Rétablir"
            >
              <RedoIcon />
            </button>
            <button
              onClick={() => openFile()}
              className="flex-1 p-1.5 rounded hover:bg-[var(--bg-tertiary)]"
              title="Ouvrir"
            >
              <OpenIcon />
            </button>
            <button
              onClick={() => activeDocumentId && saveFile(activeDocumentId)}
              disabled={!activeDocumentId}
              className="flex-1 p-1.5 rounded hover:bg-[var(--bg-tertiary)] disabled:opacity-30"
              title="Enregistrer"
            >
              <SaveIcon />
            </button>
            <button
              onClick={() => setFindDialogOpen(true)}
              className="flex-1 p-1.5 rounded hover:bg-[var(--bg-tertiary)]"
              title="Rechercher"
            >
              <SearchIconSmall />
            </button>
            <button
              onClick={toggleTheme}
              className="flex-1 p-1.5 rounded hover:bg-[var(--bg-tertiary)]"
              title="Thème"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Composant bouton de panneau
function PanelButton({
  panel,
  isActive,
  isFavorite,
  onClick,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
}: {
  panel: TabConfig
  isActive: boolean
  isFavorite: boolean
  onClick: () => void
  onMouseDown?: () => void
  onMouseUp?: () => void
  onMouseLeave?: () => void
}) {
  return (
    <button
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      className={`
        w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors
        ${isActive
          ? 'bg-[var(--accent)] text-white'
          : 'text-[var(--text)] hover:bg-[var(--bg-tertiary)]'
        }
      `}
      title={`${panel.label}${panel.shortcut ? ` (${panel.shortcut})` : ''}${isFavorite ? ' - Clic long pour retirer des favoris' : ' - Clic long pour ajouter aux favoris'}`}
    >
      <span className={isActive ? 'text-white' : 'text-[var(--text-secondary)]'}>
        {panel.icon}
      </span>
      <span className="flex-1 text-left truncate">{panel.label}</span>
      {isFavorite && (
        <span className="text-yellow-500 text-xs">★</span>
      )}
      {panel.shortcut && (
        <span className={`text-xs ${isActive ? 'text-white/70' : 'text-[var(--text-tertiary)]'}`}>
          {panel.shortcut}
        </span>
      )}
    </button>
  )
}

// Icônes
function TocIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M4 6h16" />
      <path d="M4 10h12" />
      <path d="M4 14h14" />
      <path d="M4 18h10" />
      <circle cx="20" cy="10" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="20" cy="14" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function PiecesIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <circle cx="17" cy="17" r="4" fill="currentColor" stroke="none" />
      <text x="17" y="19" fontSize="5" fill="var(--bg)" textAnchor="middle" fontWeight="bold" fontFamily="system-ui">n°</text>
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

function VariablesIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M7 4v16" />
      <path d="M17 4v16" />
      <path d="M7 8h10" />
      <path d="M7 16h10" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
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

function SignatureIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" />
      <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  )
}

function OcrIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 7h3" />
      <path d="M7 11h10" />
      <path d="M7 15h8" />
      <circle cx="17" cy="7" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function CloudIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
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

function ProjectIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      <circle cx="12" cy="13" r="3" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TermsIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      <text x="12" y="14" fontSize="6" fill="currentColor" textAnchor="middle" fontWeight="bold" fontFamily="system-ui">«»</text>
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

function SettingsPanelIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

// Icônes d'actions globales
function UndoIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M3 10h10a5 5 0 015 5v2" />
      <path d="M3 10l4-4M3 10l4 4" />
    </svg>
  )
}

function RedoIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M21 10H11a5 5 0 00-5 5v2" />
      <path d="M21 10l-4-4M21 10l-4 4" />
    </svg>
  )
}

function OpenIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  )
}

function SaveIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  )
}

// Icônes de groupe
function DocumentGroupIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

function LegalGroupIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  )
}

function ToolsGroupIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  )
}

function FilesGroupIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function SearchIconSmall() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  )
}
