/**
 * Composant Ribbon principal - Style Word
 * Remplace la Toolbar monolithique par un système d'onglets
 */

import { useState, useEffect } from 'react'
import type { Editor } from '@tiptap/react'
import {
  FolderOpen,
  Save,
  Download,
  Undo2,
  Redo2,
  Settings,
  Search,
} from 'lucide-react'
import { useEditorStore } from '../../store/useEditorStore'
import { useDocumentStore } from '../../store/useDocumentStore'
import { useFileOperations } from '../../hooks/useFileOperations'
import { HomeTab } from './tabs/HomeTab'
import { InsertTab } from './tabs/InsertTab'
import { LayoutTab } from './tabs/LayoutTab'
import { ViewTab } from './tabs/ViewTab'
import { ReviewTab } from './tabs/ReviewTab'

interface RibbonProps {
  editor: Editor | null
}

type TabId = 'home' | 'insert' | 'layout' | 'review' | 'view'

const TABS: { id: TabId; label: string; shortcut: string }[] = [
  { id: 'home', label: 'Accueil', shortcut: '1' },
  { id: 'insert', label: 'Insertion', shortcut: '2' },
  { id: 'layout', label: 'Mise en page', shortcut: '3' },
  { id: 'review', label: 'Révision', shortcut: '4' },
  { id: 'view', label: 'Affichage', shortcut: '5' },
]

export function Ribbon({ editor }: RibbonProps) {
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const [isCollapsed, setIsCollapsed] = useState(false)

  const showToolbar = useEditorStore((state) => state.showToolbar)
  const isDistractionFree = useEditorStore((state) => state.isDistractionFree)
  const setSettingsOpen = useEditorStore((state) => state.setSettingsOpen)
  const setFindDialogOpen = useEditorStore((state) => state.setFindDialogOpen)
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId)

  const { openFile, saveFile } = useFileOperations()

  // Raccourcis clavier pour les onglets
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + chiffre pour changer d'onglet
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey) {
        const tab = TABS.find((t) => t.shortcut === e.key)
        if (tab) {
          e.preventDefault()
          setActiveTab(tab.id)
          if (isCollapsed) setIsCollapsed(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCollapsed])

  // Masquer en mode distraction free
  if (!showToolbar || (isDistractionFree && isCollapsed)) {
    return null
  }

  // Double-clic sur un onglet pour collapse
  const handleTabDoubleClick = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div className="ribbon bg-[var(--bg)] border-b border-[var(--border)] flex flex-col select-none">
      {/* Barre de titre avec actions fichier */}
      <div className="ribbon-title-bar flex items-center h-9 px-2 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        {/* Actions fichier */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => openFile()}
            className="p-1.5 rounded hover:bg-[var(--bg-hover)] transition-colors"
            title="Ouvrir (Cmd+O)"
          >
            <FolderOpen size={16} />
          </button>
          <button
            type="button"
            onClick={() => activeDocumentId && saveFile(activeDocumentId)}
            disabled={!activeDocumentId}
            className="p-1.5 rounded hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-40"
            title="Enregistrer (Cmd+S)"
          >
            <Save size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              // Ouvrir dialog export
              const event = new CustomEvent('open-export-dialog')
              window.dispatchEvent(event)
            }}
            disabled={!activeDocumentId}
            className="p-1.5 rounded hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-40"
            title="Exporter"
          >
            <Download size={16} />
          </button>
        </div>

        <div className="w-px h-5 bg-[var(--border)] mx-2" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
            className="p-1.5 rounded hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-40"
            title="Annuler (Cmd+Z)"
          >
            <Undo2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
            className="p-1.5 rounded hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-40"
            title="Rétablir (Cmd+Shift+Z)"
          >
            <Redo2 size={16} />
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions droite */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setFindDialogOpen(true)}
            className="p-1.5 rounded hover:bg-[var(--bg-hover)] transition-colors"
            title="Rechercher (Cmd+F)"
          >
            <Search size={16} />
          </button>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="p-1.5 rounded hover:bg-[var(--bg-hover)] transition-colors"
            title="Paramètres"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="ribbon-tabs flex items-center h-8 px-2 gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id)
              if (isCollapsed) setIsCollapsed(false)
            }}
            onDoubleClick={handleTabDoubleClick}
            className={`px-3 py-1 text-sm rounded-t-md transition-colors
              ${activeTab === tab.id
                ? 'bg-[var(--bg)] border-t border-x border-[var(--border)] -mb-px text-[var(--text)] font-medium'
                : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)]'
              }`}
            title={`${tab.label} (Cmd+${tab.shortcut})`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu de l'onglet */}
      {!isCollapsed && (
        <div className="ribbon-content border-t border-[var(--border)] bg-[var(--bg)] min-h-[72px]">
          {activeTab === 'home' && <HomeTab editor={editor} />}
          {activeTab === 'insert' && <InsertTab editor={editor} />}
          {activeTab === 'layout' && <LayoutTab />}
          {activeTab === 'review' && <ReviewTab editor={editor} />}
          {activeTab === 'view' && <ViewTab />}
        </div>
      )}
    </div>
  )
}
