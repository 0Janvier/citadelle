import { useDocumentStore } from '../store/useDocumentStore'
import { useEditorStore } from '../store/useEditorStore'
import { useMemo } from 'react'

export function StatusBar() {
  const activeDocument = useDocumentStore((state) => state.getActiveDocument())
  const showStatusBar = useEditorStore((state) => state.showStatusBar)
  const zoomLevel = useEditorStore((state) => state.zoomLevel)

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
      </div>

      <div className="flex items-center gap-4">
        {activeDocument?.filePath && (
          <span className="text-gray-500 truncate max-w-xs" title={activeDocument.filePath}>
            {activeDocument.filePath.split('/').slice(-2).join('/')}
          </span>
        )}
        <span>{zoomLevel}%</span>
        {activeDocument && (
          <span>
            {activeDocument.isDirty ? '● Non sauvegardé' : '✓ Sauvegardé'}
          </span>
        )}
      </div>
    </div>
  )
}
