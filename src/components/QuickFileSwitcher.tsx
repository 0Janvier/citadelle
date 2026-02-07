/**
 * QuickFileSwitcher - Cmd+K file switcher dialog
 * Shows open documents + recent files with fuzzy search
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import { useDocumentStore } from '../store/useDocumentStore'
import { useRecentFilesStore } from '../store/useRecentFilesStore'
import { useFileOperations } from '../hooks/useFileOperations'

interface SwitcherItem {
  id: string
  title: string
  subtitle?: string
  isOpen: boolean
  isActive: boolean
  filePath?: string
}

export function QuickFileSwitcher() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const documents = useDocumentStore((s) => s.documents)
  const activeDocumentId = useDocumentStore((s) => s.activeDocumentId)
  const setActiveDocument = useDocumentStore((s) => s.setActiveDocument)
  const recentFiles = useRecentFilesStore((s) => s.recentFiles)
  const { openFileFromPath } = useFileOperations()

  // Build items list: open docs first, then recent (non-open) files
  const items: SwitcherItem[] = (() => {
    const openPaths = new Set(documents.map((d) => d.filePath).filter(Boolean))

    const openDocs: SwitcherItem[] = documents.map((doc) => ({
      id: doc.id,
      title: doc.title || 'Sans titre',
      subtitle: doc.filePath ? doc.filePath.split('/').slice(-2).join('/') : undefined,
      isOpen: true,
      isActive: doc.id === activeDocumentId,
      filePath: doc.filePath,
    }))

    const recentItems: SwitcherItem[] = recentFiles
      .filter((f) => !openPaths.has(f.path))
      .slice(0, 10)
      .map((f) => ({
        id: `recent-${f.path}`,
        title: f.title || f.path.split('/').pop() || f.path,
        subtitle: f.path.split('/').slice(-2).join('/'),
        isOpen: false,
        isActive: false,
        filePath: f.path,
      }))

    return [...openDocs, ...recentItems]
  })()

  // Filter by search
  const filtered = search.trim()
    ? items.filter((item) => {
        const q = search.toLowerCase()
        return (
          item.title.toLowerCase().includes(q) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(q))
        )
      })
    : items

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey

      if (cmdOrCtrl && e.key === 'k' && !e.shiftKey) {
        e.preventDefault()
        setOpen((prev) => {
          if (!prev) {
            setSearch('')
            setSelectedIndex(0)
          }
          return !prev
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  // Scroll selected into view
  useEffect(() => {
    if (!listRef.current) return
    const selected = listRef.current.querySelector('[data-selected="true"]')
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  const selectItem = useCallback(
    (item: SwitcherItem) => {
      setOpen(false)
      if (item.isOpen) {
        setActiveDocument(item.id)
      } else if (item.filePath) {
        openFileFromPath(item.filePath)
      }
    },
    [setActiveDocument, openFileFromPath]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = filtered[selectedIndex]
      if (item) selectItem(item)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-[480px] max-h-[400px] bg-[var(--bg)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="p-3 border-b border-[var(--border)]">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher un document..."
            className="w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-secondary)]"
            autoComplete="off"
          />
        </div>

        {/* Results list */}
        <div ref={listRef} className="overflow-y-auto max-h-[320px]">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-sm text-[var(--text-secondary)]">
              Aucun document
            </div>
          ) : (
            filtered.map((item, index) => (
              <button
                key={item.id}
                data-selected={index === selectedIndex}
                onClick={() => selectItem(item)}
                className={`w-full px-3 py-2 text-left flex items-center gap-3 transition-colors ${
                  index === selectedIndex
                    ? 'bg-[var(--accent)]/10'
                    : 'hover:bg-[var(--bg-hover)]'
                }`}
              >
                {/* Icon */}
                <svg
                  className={`w-4 h-4 flex-shrink-0 ${item.isActive ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  {item.isOpen ? (
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6" />
                  ) : (
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <div className={`text-sm truncate ${item.isActive ? 'font-medium text-[var(--accent)]' : 'text-[var(--text)]'}`}>
                    {item.title}
                  </div>
                  {item.subtitle && (
                    <div className="text-xs text-[var(--text-secondary)] truncate">
                      {item.subtitle}
                    </div>
                  )}
                </div>

                {/* Badge */}
                {item.isOpen && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] flex-shrink-0">
                    ouvert
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="px-3 py-1.5 border-t border-[var(--border)] text-[10px] text-[var(--text-secondary)] flex gap-3">
          <span>↑↓ naviguer</span>
          <span>↵ ouvrir</span>
          <span>esc fermer</span>
        </div>
      </div>
    </div>
  )
}
