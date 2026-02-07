/**
 * Composant Ribbon compact - Barre unique avec onglets dépliables
 */

import { useState, useEffect } from 'react'
import type { Editor } from '@tiptap/react'
import {
  FolderOpen,
  Save,
  Undo2,
  Redo2,
  Settings,
  Search,
  ChevronDown,
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
  const [isExpanded, setIsExpanded] = useState(false)

  const showToolbar = useEditorStore((state) => state.showToolbar)
  const isDistractionFree = useEditorStore((state) => state.isDistractionFree)
  const setSettingsOpen = useEditorStore((state) => state.setSettingsOpen)
  const setFindDialogOpen = useEditorStore((state) => state.setFindDialogOpen)
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId)

  const { openFile, saveFile } = useFileOperations()

  // Raccourcis clavier pour les onglets
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey) {
        const tab = TABS.find((t) => t.shortcut === e.key)
        if (tab) {
          e.preventDefault()
          setActiveTab(tab.id)
          setIsExpanded(true)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!showToolbar || isDistractionFree) {
    return null
  }

  const handleTabClick = (tabId: TabId) => {
    if (activeTab === tabId && isExpanded) {
      setIsExpanded(false)
    } else {
      setActiveTab(tabId)
      setIsExpanded(true)
    }
  }

  return (
    <div className="ribbon bg-[var(--bg)] border-b border-[var(--border)] flex flex-col select-none">
      {/* Barre unique : actions + onglets */}
      <div className="flex items-center h-9 px-2 gap-1">
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
        </div>

        <div className="w-px h-5 bg-[var(--border)]" />

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

        <div className="w-px h-5 bg-[var(--border)]" />

        {/* Onglets */}
        <div className="flex items-center gap-0.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors flex items-center gap-1
                ${activeTab === tab.id && isExpanded
                  ? 'bg-[var(--accent)] text-white font-medium'
                  : activeTab === tab.id
                    ? 'bg-[var(--bg-hover)] text-[var(--text)] font-medium'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)]'
                }`}
              title={`${tab.label} (Cmd+${tab.shortcut})`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <ChevronDown
                  size={12}
                  className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              )}
            </button>
          ))}
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

      {/* Contenu de l'onglet (déplié uniquement au clic) */}
      {isExpanded && (
        <div className="ribbon-content border-t border-[var(--border)] bg-[var(--bg)]">
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
