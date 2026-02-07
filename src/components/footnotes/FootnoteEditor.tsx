import { useState, useEffect, useRef, useCallback } from 'react'
import { useEditorStore } from '../../store/useEditorStore'

interface FootnoteEditorProps {
  // Controlled externally via events
}

interface FootnoteEditState {
  footnoteId: string
  content: string
  element: HTMLElement
}

export function FootnoteEditor(_props: FootnoteEditorProps) {
  const [editState, setEditState] = useState<FootnoteEditState | null>(null)
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Listen for footnote click events
  useEffect(() => {
    const handleFootnoteClick = (e: Event) => {
      const { footnoteId, element } = (e as CustomEvent).detail
      const editor = useEditorStore.getState().activeEditor
      if (!editor) return

      // Find footnote content from the document
      let footnoteContent = ''
      editor.state.doc.descendants((node) => {
        if (node.type.name === 'footnote' && node.attrs.footnoteId === footnoteId) {
          footnoteContent = node.attrs.content || ''
          return false
        }
      })

      setValue(footnoteContent)
      setEditState({ footnoteId, content: footnoteContent, element })
    }

    window.addEventListener('footnote-click', handleFootnoteClick)
    return () => window.removeEventListener('footnote-click', handleFootnoteClick)
  }, [])

  // Focus textarea when popover opens
  useEffect(() => {
    if (editState && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.setSelectionRange(value.length, value.length)
    }
  }, [editState])

  // Close on click outside
  useEffect(() => {
    if (!editState) return
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        handleSave()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [editState, value])

  const handleSave = useCallback(() => {
    if (!editState) return
    const editor = useEditorStore.getState().activeEditor
    if (editor) {
      editor.commands.updateFootnote(editState.footnoteId, value)
    }
    setEditState(null)
  }, [editState, value])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditState(null)
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave()
    }
  }

  const handleDelete = () => {
    if (!editState) return
    const editor = useEditorStore.getState().activeEditor
    if (!editor) return

    // Find and delete the footnote node
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'footnote' && node.attrs.footnoteId === editState.footnoteId) {
        editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run()
        return false
      }
    })
    setEditState(null)
  }

  if (!editState) return null

  // Position the popover near the footnote element
  const rect = editState.element.getBoundingClientRect()
  const top = rect.bottom + 8
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - 340))

  return (
    <div
      ref={popoverRef}
      className="fixed z-modal bg-[var(--bg)] border border-[var(--border)] rounded-lg shadow-lg p-3 w-80 animate-scaleIn"
      style={{ top: `${top}px`, left: `${left}px` }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          Note de bas de page
        </span>
        <button
          type="button"
          onClick={handleDelete}
          className="text-xs text-red-500 hover:text-red-600 transition-colors"
        >
          Supprimer
        </button>
      </div>
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full h-24 text-sm bg-[var(--editor-bg)] border border-[var(--border)] rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-[var(--text)]"
        placeholder="Contenu de la note (ex: Art. 700 CPC ; Cass. civ. 1re, 12 janv. 2024)"
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-[var(--text-secondary)]">
          {navigator.platform.includes('Mac') ? '\u2318' : 'Ctrl'}+Entree pour valider
        </span>
        <button
          type="button"
          onClick={handleSave}
          className="px-3 py-1 text-xs font-medium bg-[var(--accent)] text-white rounded-md hover:opacity-90 transition-opacity"
        >
          Valider
        </button>
      </div>
    </div>
  )
}
