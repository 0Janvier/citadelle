/**
 * Panneau des signets - Permet de poser et naviguer entre des signets dans le document
 */

import { useState } from 'react'
import { useBookmarkStore } from '../store/useBookmarkStore'
import { useDocumentStore } from '../store/useDocumentStore'
import { useEditorStore } from '../store/useEditorStore'
import { X, BookmarkPlus, Trash2, Bookmark } from 'lucide-react'

export function BookmarkPanel({ onClose }: { onClose: () => void }) {
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId)
  const editor = useEditorStore((state) => state.activeEditor)
  const bookmarks = useBookmarkStore((state) =>
    activeDocumentId ? state.getBookmarks(activeDocumentId) : []
  )
  const addBookmark = useBookmarkStore((state) => state.addBookmark)
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark)
  const updateLabel = useBookmarkStore((state) => state.updateLabel)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')

  const handleAddBookmark = () => {
    if (!editor || !activeDocumentId) return
    const pos = editor.state.selection.from

    // Get surrounding text for a smart label
    const $pos = editor.state.doc.resolve(pos)
    const parentText = $pos.parent.textContent.trim()
    const label = parentText.slice(0, 40) || undefined

    addBookmark(activeDocumentId, pos, label)
  }

  const handleNavigate = (pos: number) => {
    if (!editor) return
    // Clamp position to document bounds
    const maxPos = editor.state.doc.content.size
    const safePos = Math.min(pos, maxPos)
    editor.chain().focus().setTextSelection(safePos).run()
    // Scroll into view
    const domPos = editor.view.domAtPos(safePos)
    if (domPos.node) {
      const el = domPos.node instanceof HTMLElement ? domPos.node : domPos.node.parentElement
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handleStartEdit = (id: string, currentLabel: string) => {
    setEditingId(id)
    setEditLabel(currentLabel)
  }

  const handleFinishEdit = () => {
    if (editingId && editLabel.trim()) {
      updateLabel(editingId, editLabel.trim())
    }
    setEditingId(null)
    setEditLabel('')
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="text-sm font-semibold">Signets</h3>
          <span className="text-xs text-[var(--text-secondary)]">
            {bookmarks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleAddBookmark}
            disabled={!editor || !activeDocumentId}
            className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] disabled:opacity-40"
            title="Ajouter un signet a la position du curseur"
          >
            <BookmarkPlus className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bookmark list */}
      <div className="flex-1 overflow-y-auto py-2">
        {bookmarks.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-[var(--text-secondary)]">
            Aucun signet.
            <br />
            <span className="text-xs">
              Cliquez sur + ou utilisez Cmd+Shift+B pour ajouter un signet.
            </span>
          </div>
        ) : (
          bookmarks.map((bm) => (
            <div
              key={bm.id}
              className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--bg-hover)] group"
            >
              <Bookmark className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />

              {editingId === bm.id ? (
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onBlur={handleFinishEdit}
                  onKeyDown={(e) => e.key === 'Enter' && handleFinishEdit()}
                  autoFocus
                  className="flex-1 text-sm px-1.5 py-0.5 border border-[var(--accent)] rounded bg-[var(--editor-bg)] focus:outline-none"
                />
              ) : (
                <button
                  onClick={() => handleNavigate(bm.pos)}
                  onDoubleClick={() => handleStartEdit(bm.id, bm.label)}
                  className="flex-1 text-left text-sm truncate hover:text-[var(--accent)] transition-colors"
                  title={`${bm.label} (double-clic pour renommer)`}
                >
                  {bm.label}
                </button>
              )}

              <button
                onClick={() => removeBookmark(bm.id)}
                className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-opacity"
                title="Supprimer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
