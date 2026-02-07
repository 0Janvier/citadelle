/**
 * Version Diff View - Affiche les differences entre deux versions
 */

import { useMemo } from 'react'
import { X } from 'lucide-react'
import type { JSONContent } from '@tiptap/core'

interface VersionDiffViewProps {
  oldContent: JSONContent
  newContent: JSONContent
  oldLabel: string
  newLabel: string
  onClose: () => void
}

// Extract plain text from TipTap JSON recursively
function extractText(node: JSONContent): string {
  if (node.type === 'text') {
    return node.text || ''
  }
  if (node.content) {
    const parts = node.content.map(extractText)
    // Add newline after block nodes
    if (['paragraph', 'heading', 'blockquote', 'listItem'].includes(node.type || '')) {
      return parts.join('') + '\n'
    }
    return parts.join('')
  }
  if (node.type === 'hardBreak') return '\n'
  return ''
}

interface DiffLine {
  type: 'same' | 'added' | 'removed'
  text: string
}

// Simple line-based diff algorithm
function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')

  // LCS-based diff
  const m = oldLines.length
  const n = newLines.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack to build diff
  const result: DiffLine[] = []
  let i = m, j = n
  const stack: DiffLine[] = []

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      stack.push({ type: 'same', text: oldLines[i - 1] })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({ type: 'added', text: newLines[j - 1] })
      j--
    } else {
      stack.push({ type: 'removed', text: oldLines[i - 1] })
      i--
    }
  }

  // Reverse since we built it backwards
  while (stack.length > 0) {
    result.push(stack.pop()!)
  }

  return result
}

export function VersionDiffView({ oldContent, newContent, oldLabel, newLabel, onClose }: VersionDiffViewProps) {
  const diff = useMemo(() => {
    const oldText = extractText(oldContent).trim()
    const newText = extractText(newContent).trim()
    return computeDiff(oldText, newText)
  }, [oldContent, newContent])

  const stats = useMemo(() => {
    let added = 0, removed = 0
    for (const line of diff) {
      if (line.type === 'added') added++
      if (line.type === 'removed') removed++
    }
    return { added, removed }
  }, [diff])

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
        <div>
          <h2 className="text-lg font-semibold">Comparaison</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            <span className="text-red-500">-{stats.removed}</span>{' '}
            <span className="text-green-500">+{stats.added}</span>{' '}
            lignes
          </p>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-[var(--bg-secondary)] transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Labels */}
      <div className="flex gap-2 px-4 py-2 border-b border-[var(--border-color)] text-xs">
        <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">{oldLabel}</span>
        <span className="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">{newLabel}</span>
      </div>

      {/* Diff content */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
        {diff.length === 0 ? (
          <p className="text-center text-[var(--text-secondary)] py-8">Aucune difference</p>
        ) : (
          <div className="space-y-0">
            {diff.map((line, index) => {
              if (line.type === 'same') {
                return (
                  <div key={index} className="px-3 py-0.5 text-[var(--text-secondary)]">
                    {line.text || '\u00A0'}
                  </div>
                )
              }
              if (line.type === 'added') {
                return (
                  <div key={index} className="px-3 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-l-2 border-green-500">
                    + {line.text || '\u00A0'}
                  </div>
                )
              }
              return (
                <div key={index} className="px-3 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-l-2 border-red-500">
                  - {line.text || '\u00A0'}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
