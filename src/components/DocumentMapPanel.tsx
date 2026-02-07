/**
 * Plan du document - Affiche l'arborescence des titres (H1-H6)
 * Clic = scroll vers le titre. Indicateur visuel du titre actif.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useEditorStore } from '../store/useEditorStore'
import { X, Map } from 'lucide-react'

interface HeadingEntry {
  id: string
  level: number
  text: string
  pos: number
}

export function DocumentMapPanel({ onClose }: { onClose: () => void }) {
  const editor = useEditorStore((state) => state.activeEditor)
  const [headings, setHeadings] = useState<HeadingEntry[]>([])
  const [activeHeadingPos, setActiveHeadingPos] = useState<number>(0)
  const activeRef = useRef<HTMLButtonElement>(null)

  // Extract headings from editor content
  const extractHeadings = useCallback(() => {
    if (!editor) return

    const entries: HeadingEntry[] = []
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        const text = node.textContent
        const level = node.attrs.level || 1
        const id = node.attrs.id || `h-${pos}`
        entries.push({ id, level, text: text || '(vide)', pos })
      }
    })
    setHeadings(entries)
  }, [editor])

  // Track active heading based on cursor position
  const updateActiveHeading = useCallback(() => {
    if (!editor || headings.length === 0) return
    const cursorPos = editor.state.selection.from

    // Find the heading just before or at the cursor
    let activePos = headings[0]?.pos || 0
    for (const h of headings) {
      if (h.pos <= cursorPos) {
        activePos = h.pos
      } else {
        break
      }
    }
    setActiveHeadingPos(activePos)
  }, [editor, headings])

  // Listen to editor updates
  useEffect(() => {
    if (!editor) return

    extractHeadings()

    const handleUpdate = () => extractHeadings()
    const handleSelection = () => updateActiveHeading()

    editor.on('update', handleUpdate)
    editor.on('selectionUpdate', handleSelection)

    return () => {
      editor.off('update', handleUpdate)
      editor.off('selectionUpdate', handleSelection)
    }
  }, [editor, extractHeadings, updateActiveHeading])

  // Update active heading when headings change
  useEffect(() => {
    updateActiveHeading()
  }, [headings, updateActiveHeading])

  // Scroll active heading into view in the panel
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [activeHeadingPos])

  const handleClick = (pos: number) => {
    if (!editor) return
    // Set cursor to heading position and scroll into view
    editor.chain().focus().setTextSelection(pos + 1).run()
    // Scroll the editor view to show the heading
    const domPos = editor.view.domAtPos(pos + 1)
    if (domPos.node) {
      const el = domPos.node instanceof HTMLElement ? domPos.node : domPos.node.parentElement
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const minLevel = headings.length > 0 ? Math.min(...headings.map((h) => h.level)) : 1

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="text-sm font-semibold">Plan du document</h3>
          <span className="text-xs text-[var(--text-secondary)]">
            {headings.length} titre{headings.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Heading list */}
      <div className="flex-1 overflow-y-auto py-2">
        {headings.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-[var(--text-secondary)]">
            Aucun titre dans le document.
            <br />
            <span className="text-xs">Utilisez les styles Titre 1-6 pour structurer votre document.</span>
          </div>
        ) : (
          headings.map((h) => {
            const indent = (h.level - minLevel) * 16
            const isActive = h.pos === activeHeadingPos

            return (
              <button
                key={h.pos}
                ref={isActive ? activeRef : undefined}
                onClick={() => handleClick(h.pos)}
                className={`w-full text-left px-4 py-1.5 text-sm transition-colors hover:bg-[var(--bg-hover)] ${
                  isActive
                    ? 'bg-[var(--accent-light)] text-[var(--accent)] font-medium border-l-2 border-[var(--accent)]'
                    : 'text-[var(--text)] border-l-2 border-transparent'
                }`}
                style={{ paddingLeft: `${16 + indent}px` }}
                title={h.text}
              >
                <span className={`${h.level <= 2 ? 'font-medium' : ''} ${h.level >= 4 ? 'text-xs' : ''} truncate block`}>
                  {h.text}
                </span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
