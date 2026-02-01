/**
 * Mini barre d'outils compacte
 * Contient uniquement les actions essentielles (fichier, undo/redo, recherche)
 */

import type { Editor } from '@tiptap/react'
import {
  FolderOpen,
  Save,
  Download,
  Undo2,
  Redo2,
  Search,
  Settings,
  Sun,
  Moon,
} from 'lucide-react'
import { useEditorStore } from '../store/useEditorStore'
import { useDocumentStore } from '../store/useDocumentStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { useFileOperations } from '../hooks/useFileOperations'

interface MiniToolbarProps {
  editor: Editor | null
}

export function MiniToolbar({ editor }: MiniToolbarProps) {
  const setFindDialogOpen = useEditorStore((state) => state.setFindDialogOpen)
  const setSettingsOpen = useEditorStore((state) => state.setSettingsOpen)
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId)
  const theme = useSettingsStore((state) => state.theme)
  const toggleTheme = useSettingsStore((state) => state.toggleTheme)

  const { openFile, saveFile } = useFileOperations()

  return (
    <div className="h-9 flex items-center px-2 gap-1 border-b border-[var(--border)] bg-[var(--bg)]">
      {/* Actions fichier */}
      <button
        type="button"
        onClick={() => openFile()}
        className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] transition-colors text-[var(--text)]"
        title="Ouvrir (Cmd+O)"
      >
        <FolderOpen size={16} />
      </button>
      <button
        type="button"
        onClick={() => activeDocumentId && saveFile(activeDocumentId)}
        disabled={!activeDocumentId}
        className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] transition-colors text-[var(--text)] disabled:opacity-40"
        title="Enregistrer (Cmd+S)"
      >
        <Save size={16} />
      </button>
      <button
        type="button"
        onClick={() => {
          const event = new CustomEvent('open-export-dialog')
          window.dispatchEvent(event)
        }}
        disabled={!activeDocumentId}
        className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] transition-colors text-[var(--text)] disabled:opacity-40"
        title="Exporter"
      >
        <Download size={16} />
      </button>

      <div className="w-px h-5 bg-[var(--border)] mx-1" />

      {/* Undo/Redo */}
      <button
        type="button"
        onClick={() => editor?.chain().focus().undo().run()}
        disabled={!editor?.can().undo()}
        className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] transition-colors text-[var(--text)] disabled:opacity-40"
        title="Annuler (Cmd+Z)"
      >
        <Undo2 size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor?.chain().focus().redo().run()}
        disabled={!editor?.can().redo()}
        className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] transition-colors text-[var(--text)] disabled:opacity-40"
        title="Rétablir (Cmd+Shift+Z)"
      >
        <Redo2 size={16} />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions droite */}
      <button
        type="button"
        onClick={() => setFindDialogOpen(true)}
        className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] transition-colors text-[var(--text)]"
        title="Rechercher (Cmd+F)"
      >
        <Search size={16} />
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] transition-colors text-[var(--text)]"
        title="Changer le thème"
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      <button
        type="button"
        onClick={() => setSettingsOpen(true)}
        className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] transition-colors text-[var(--text)]"
        title="Paramètres"
      >
        <Settings size={16} />
      </button>
    </div>
  )
}
