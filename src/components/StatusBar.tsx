import { useDocumentStore } from '../store/useDocumentStore'
import { useEditorStore } from '../store/useEditorStore'
import type { SaveStatus } from '../store/useEditorStore'
import { useMemo, useState, useEffect, useCallback, useRef } from 'react'

export function StatusBar() {
  const activeDocument = useDocumentStore((state) => state.getActiveDocument())
  const showStatusBar = useEditorStore((state) => state.showStatusBar)
  const zoomLevel = useEditorStore((state) => state.zoomLevel)
  const activeEditor = useEditorStore((state) => state.activeEditor)
  const saveStatus = useEditorStore((state) => state.saveStatus)
  const saveErrorMessage = useEditorStore((state) => state.saveErrorMessage)

  const currentPage = useEditorStore((state) => state.currentPage)
  const totalPages = useEditorStore((state) => state.totalPages)

  // Cursor position + selection word count tracking
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 })
  const [selectionWordCount, setSelectionWordCount] = useState(0)

  const updateCursorPosition = useCallback(() => {
    if (!activeEditor) return
    const { from, to } = activeEditor.state.selection
    const doc = activeEditor.state.doc

    // Calculate line number by counting blocks before cursor
    let line = 1
    let blockStart = 0
    doc.descendants((node, pos) => {
      if (pos >= from) return false
      if (node.isBlock && pos + node.nodeSize <= from) {
        line++
        blockStart = pos + node.nodeSize
      }
      return true
    })

    // Column = offset within current text block
    const col = from - blockStart + 1

    setCursorPos({ line, col })

    // Selection word count
    if (from !== to) {
      const selectedText = doc.textBetween(from, to, ' ')
      const words = selectedText.trim().split(/\s+/).filter((w) => w.length > 0)
      setSelectionWordCount(words.length)
    } else {
      setSelectionWordCount(0)
    }
  }, [activeEditor])

  useEffect(() => {
    if (!activeEditor) return

    activeEditor.on('selectionUpdate', updateCursorPosition)
    activeEditor.on('update', updateCursorPosition)
    updateCursorPosition()

    return () => {
      activeEditor.off('selectionUpdate', updateCursorPosition)
      activeEditor.off('update', updateCursorPosition)
    }
  }, [activeEditor, updateCursorPosition])

  const [showStatsPopover, setShowStatsPopover] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)

  // Close popover on outside click
  useEffect(() => {
    if (!showStatsPopover) return
    const handleClick = (e: MouseEvent) => {
      if (statsRef.current && !statsRef.current.contains(e.target as Node)) {
        setShowStatsPopover(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showStatsPopover])

  // Calculate statistics from document content
  const stats = useMemo(() => {
    if (!activeDocument?.content) {
      return { words: 0, characters: 0, charactersNoSpaces: 0, lines: 0, sentences: 0, pages: 0, readingTime: 0 }
    }

    const extractText = (node: any): string => {
      if (node.type === 'text') return node.text || ''
      if (node.content) return node.content.map(extractText).join('')
      return ''
    }

    const text = extractText(activeDocument.content)
    const words = text.trim().split(/\s+/).filter((word) => word.length > 0).length
    const characters = text.length
    const charactersNoSpaces = text.replace(/\s/g, '').length
    const sentences = text.split(/[.!?]+\s/g).filter((s) => s.trim().length > 0).length

    const countNodes = (node: any, type: string): number => {
      if (node.type === type) return 1
      if (node.content) return node.content.reduce((sum: number, child: any) => sum + countNodes(child, type), 0)
      return 0
    }

    const lines = Math.max(1, countNodes(activeDocument.content, 'paragraph') + countNodes(activeDocument.content, 'heading'))
    const readingTime = Math.ceil(words / 200)
    const pages = Math.max(1, Math.ceil(words / 250))

    return { words, characters, charactersNoSpaces, lines, sentences, pages, readingTime }
  }, [activeDocument?.content])

  if (!showStatusBar) return null

  return (
    <div className="h-6 border-t border-[var(--border)] flex items-center justify-between px-4 text-xs text-[var(--text-secondary)] bg-[var(--bg)] status-bar">
      <div className="flex items-center gap-4">
        {activeDocument ? (
          <div className="relative" ref={statsRef}>
            <button
              onClick={() => setShowStatsPopover(!showStatsPopover)}
              className="hover:text-[var(--text)] transition-colors cursor-pointer"
              title="Statistiques détaillées"
            >
              {selectionWordCount > 0
                ? <>{selectionWordCount} sel. / {stats.words} mots</>
                : <>{stats.words} mots</>}
            </button>
            {showStatsPopover && (
              <div className="absolute bottom-full left-0 mb-2 w-56 bg-[var(--bg)] border border-[var(--border)] rounded-lg shadow-lg z-50 p-3 animate-scaleIn">
                <div className="text-sm font-medium mb-2 text-[var(--text)]">Statistiques</div>
                <div className="space-y-1.5 text-xs">
                  <StatRow label="Mots" value={stats.words.toLocaleString('fr-FR')} />
                  <StatRow label="Caractères" value={stats.characters.toLocaleString('fr-FR')} />
                  <StatRow label="Sans espaces" value={stats.charactersNoSpaces.toLocaleString('fr-FR')} />
                  <StatRow label="Phrases" value={stats.sentences.toLocaleString('fr-FR')} />
                  <StatRow label="Paragraphes" value={stats.lines.toLocaleString('fr-FR')} />
                  <div className="border-t border-[var(--border)] my-1.5" />
                  <StatRow label="Pages estimées" value={`~${stats.pages}`} />
                  <StatRow label="Temps de lecture" value={`~${stats.readingTime} min`} />
                  {totalPages > 0 && (
                    <StatRow label="Page actuelle" value={`${currentPage} / ${totalPages}`} />
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <span>Prêt</span>
        )}
        {totalPages > 0 && (
          <span>Page {currentPage}/{totalPages}</span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {activeDocument && activeEditor && (
          <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
        )}
        <span>{zoomLevel}%</span>
        {activeDocument && (
          <SaveIndicator saveStatus={saveStatus} isDirty={activeDocument.isDirty} errorMessage={saveErrorMessage} />
        )}
      </div>
    </div>
  )
}

function SaveIndicator({ saveStatus, isDirty, errorMessage }: { saveStatus: SaveStatus; isDirty: boolean; errorMessage: string | null }) {
  if (saveStatus === 'saving') {
    return (
      <span className="flex items-center gap-1 text-[var(--text-secondary)]">
        <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
        </svg>
        Sauvegarde...
      </span>
    )
  }

  if (saveStatus === 'saved') {
    return (
      <span className="flex items-center gap-1 text-green-600 dark:text-green-400 animate-fadeIn">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Sauvegardé
      </span>
    )
  }

  if (saveStatus === 'error') {
    return (
      <span className="flex items-center gap-1 text-red-500" title={errorMessage || 'Erreur de sauvegarde'}>
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" />
          <line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round" />
        </svg>
        Erreur
      </span>
    )
  }

  // Default idle state — show dirty/clean
  return (
    <span className={isDirty ? 'text-amber-500' : 'text-[var(--text-secondary)]'}>
      {isDirty ? '● Non sauvegardé' : '✓ Sauvegardé'}
    </span>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <span className="font-medium text-[var(--text)]">{value}</span>
    </div>
  )
}
