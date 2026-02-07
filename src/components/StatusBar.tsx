import { useDocumentStore } from '../store/useDocumentStore'
import { useEditorStore } from '../store/useEditorStore'
import { useSettingsStore } from '../store/useSettingsStore'
import type { SaveStatus } from '../store/useEditorStore'
import { useMemo, useState, useEffect, useCallback, useRef } from 'react'

export function StatusBar() {
  const activeDocument = useDocumentStore((state) => state.getActiveDocument())
  const showStatusBar = useEditorStore((state) => state.showStatusBar)
  const zoomLevel = useEditorStore((state) => state.zoomLevel)
  const activeEditor = useEditorStore((state) => state.activeEditor)
  const saveStatus = useEditorStore((state) => state.saveStatus)
  const saveErrorMessage = useEditorStore((state) => state.saveErrorMessage)
  const lastBackupTime = useEditorStore((state) => state.lastBackupTime)

  // Cursor position tracking
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 })

  const updateCursorPosition = useCallback(() => {
    if (!activeEditor) return
    const { from } = activeEditor.state.selection
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

  // Calculate statistics from document content
  const stats = useMemo(() => {
    if (!activeDocument?.content) {
      return { words: 0, characters: 0, lines: 0, readingTime: 0 }
    }

    // Extract text from TipTap JSON content
    const extractText = (node: any): string => {
      if (node.type === 'text') {
        return node.text || ''
      }
      if (node.content) {
        return node.content.map(extractText).join('')
      }
      return ''
    }

    const text = extractText(activeDocument.content)
    const words = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
    const characters = text.length
    const charactersNoSpaces = text.replace(/\s/g, '').length

    // Count paragraphs (approximate lines)
    const countNodes = (node: any, type: string): number => {
      if (node.type === type) return 1
      if (node.content) {
        return node.content.reduce(
          (sum: number, child: any) => sum + countNodes(child, type),
          0
        )
      }
      return 0
    }

    const lines = Math.max(
      1,
      countNodes(activeDocument.content, 'paragraph') +
        countNodes(activeDocument.content, 'heading')
    )

    // Reading time: average 200 words per minute
    const readingTime = Math.ceil(words / 200)

    return {
      words,
      characters,
      charactersNoSpaces,
      lines,
      readingTime,
    }
  }, [activeDocument?.content])

  if (!showStatusBar) return null

  return (
    <div className="h-6 border-t border-[var(--border)] flex items-center justify-between px-4 text-xs text-gray-600 dark:text-gray-400 bg-[var(--bg)] status-bar">
      <div className="flex items-center gap-4">
        {activeDocument ? (
          <>
            <span>{stats.words} mots</span>
            <span>
              {stats.characters} caractères ({stats.charactersNoSpaces} sans espaces)
            </span>
            <span>{stats.lines} lignes</span>
            <span>{stats.readingTime} min de lecture</span>
          </>
        ) : (
          <span>Prêt</span>
        )}
        <TipRotator />
      </div>

      <div className="flex items-center gap-4">
        {activeDocument && activeEditor && (
          <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
        )}
        {activeDocument?.filePath && (
          <span className="text-gray-500 truncate max-w-xs" title={activeDocument.filePath}>
            {activeDocument.filePath.split('/').slice(-2).join('/')}
          </span>
        )}
        <FocusModeToggle />
        <span>{zoomLevel}%</span>
        {lastBackupTime && (
          <BackupIndicator lastBackupTime={lastBackupTime} />
        )}
        {activeDocument && (
          <SaveIndicator saveStatus={saveStatus} isDirty={activeDocument.isDirty} errorMessage={saveErrorMessage} />
        )}
      </div>
    </div>
  )
}

function FocusModeToggle() {
  const isDistractionFree = useEditorStore((state) => state.isDistractionFree)
  const setDistractionFree = useEditorStore((state) => state.setDistractionFree)
  const typewriterMode = useSettingsStore((state) => state.typewriterMode)
  const toggleTypewriterMode = useSettingsStore((state) => state.toggleTypewriterMode)

  // Cycle: Normal -> Typewriter -> Distraction-free -> Normal
  const handleCycle = () => {
    if (!typewriterMode && !isDistractionFree) {
      toggleTypewriterMode() // Normal -> Typewriter
    } else if (typewriterMode && !isDistractionFree) {
      toggleTypewriterMode()
      setDistractionFree(true) // Typewriter -> Distraction-free
    } else {
      setDistractionFree(false) // Distraction-free -> Normal
    }
  }

  const label = isDistractionFree ? 'Focus' : typewriterMode ? 'Machine' : 'Normal'

  return (
    <button
      onClick={handleCycle}
      className="flex items-center gap-1 hover:text-[var(--text)] transition-colors"
      title={`Mode : ${label} (cliquer pour changer)`}
    >
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" />
      </svg>
      {label}
    </button>
  )
}

const TIPS = [
  'Tapez / pour inserer une clause ou un article de code',
  '\u2318\u21E7P ouvre la palette de commandes',
  '\u2318\u21E7H affiche l\'historique des versions',
  '\u2318/ affiche tous les raccourcis clavier',
  '/art 1240 insere l\'article 1240 du Code civil',
]

function TipRotator() {
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * TIPS.length))
  const [visible, setVisible] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    // Hide after 30 seconds
    timerRef.current = setTimeout(() => setVisible(false), 30000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  if (!visible) return null

  return (
    <span
      className="text-[var(--text-secondary)] italic cursor-pointer hover:text-[var(--text)]"
      onClick={() => {
        setTipIndex((i) => (i + 1) % TIPS.length)
      }}
      title="Cliquer pour une autre astuce"
    >
      {TIPS[tipIndex]}
    </span>
  )
}

function BackupIndicator({ lastBackupTime }: { lastBackupTime: number }) {
  const [, setTick] = useState(0)

  // Update relative time every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000)
    return () => clearInterval(interval)
  }, [])

  const elapsed = Date.now() - lastBackupTime
  const minutes = Math.floor(elapsed / 60000)
  const label = minutes < 1 ? 'il y a moins d\'1 min' : `il y a ${minutes} min`

  return (
    <span className="flex items-center gap-1 text-[var(--text-secondary)]" title={`Dernier backup : ${new Date(lastBackupTime).toLocaleTimeString()}`}>
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
      {label}
    </span>
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
