import { useMemo } from 'react'
import type { JSONContent } from '@tiptap/react'

interface DocumentDiffProps {
  originalContent: JSONContent
  modifiedContent: JSONContent
  originalTitle?: string
  modifiedTitle?: string
  onClose?: () => void
}

interface DiffLine {
  type: 'unchanged' | 'added' | 'removed' | 'modified'
  originalText?: string
  modifiedText?: string
  lineNumber: {
    original?: number
    modified?: number
  }
}

export function DocumentDiff({
  originalContent,
  modifiedContent,
  originalTitle = 'Original',
  modifiedTitle = 'Modifié',
  onClose,
}: DocumentDiffProps) {
  // Extraire le texte des contenus
  const originalLines = useMemo(
    () => extractLines(originalContent),
    [originalContent]
  )
  const modifiedLines = useMemo(
    () => extractLines(modifiedContent),
    [modifiedContent]
  )

  // Calculer le diff
  const diffResult = useMemo(
    () => computeDiff(originalLines, modifiedLines),
    [originalLines, modifiedLines]
  )

  // Statistiques
  const stats = useMemo(() => {
    let added = 0
    let removed = 0
    let unchanged = 0

    for (const line of diffResult) {
      if (line.type === 'added') added++
      else if (line.type === 'removed') removed++
      else unchanged++
    }

    return { added, removed, unchanged, total: diffResult.length }
  }, [diffResult])

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* En-tête */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
        <div>
          <h2 className="text-lg font-semibold">Comparaison de documents</h2>
          <div className="flex gap-4 mt-1 text-sm">
            <span className="text-green-600">+{stats.added} ajoutées</span>
            <span className="text-red-600">-{stats.removed} supprimées</span>
            <span className="text-gray-500">{stats.unchanged} inchangées</span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Titres des documents */}
      <div className="grid grid-cols-2 border-b border-[var(--border-color)]">
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border-r border-[var(--border-color)]">
          <h3 className="font-medium text-red-700 dark:text-red-300">{originalTitle}</h3>
        </div>
        <div className="p-3 bg-green-50 dark:bg-green-900/20">
          <h3 className="font-medium text-green-700 dark:text-green-300">{modifiedTitle}</h3>
        </div>
      </div>

      {/* Contenu du diff */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm font-mono">
          <tbody>
            {diffResult.map((line, index) => (
              <tr
                key={index}
                className={`${
                  line.type === 'added'
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : line.type === 'removed'
                    ? 'bg-red-50 dark:bg-red-900/20'
                    : line.type === 'modified'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20'
                    : ''
                }`}
              >
                {/* Numéro de ligne original */}
                <td className="w-12 px-2 py-1 text-right text-gray-400 border-r border-[var(--border-color)] select-none">
                  {line.lineNumber.original || ''}
                </td>

                {/* Contenu original */}
                <td className="w-1/2 px-4 py-1 border-r border-[var(--border-color)] whitespace-pre-wrap">
                  {line.type === 'removed' || line.type === 'modified' ? (
                    <span className={line.type === 'removed' ? 'text-red-700 dark:text-red-300' : ''}>
                      {line.type === 'removed' && (
                        <span className="text-red-500 mr-2">-</span>
                      )}
                      {line.originalText}
                    </span>
                  ) : line.type === 'unchanged' ? (
                    <span className="text-gray-600 dark:text-gray-400">{line.originalText}</span>
                  ) : null}
                </td>

                {/* Numéro de ligne modifié */}
                <td className="w-12 px-2 py-1 text-right text-gray-400 border-r border-[var(--border-color)] select-none">
                  {line.lineNumber.modified || ''}
                </td>

                {/* Contenu modifié */}
                <td className="w-1/2 px-4 py-1 whitespace-pre-wrap">
                  {line.type === 'added' || line.type === 'modified' ? (
                    <span className={line.type === 'added' ? 'text-green-700 dark:text-green-300' : ''}>
                      {line.type === 'added' && (
                        <span className="text-green-500 mr-2">+</span>
                      )}
                      {line.modifiedText}
                    </span>
                  ) : line.type === 'unchanged' ? (
                    <span className="text-gray-600 dark:text-gray-400">{line.modifiedText}</span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Légende */}
      <div className="p-4 border-t border-[var(--border-color)] flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-green-200 dark:bg-green-800"></span>
          <span>Ajouté</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-red-200 dark:bg-red-800"></span>
          <span>Supprimé</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-yellow-200 dark:bg-yellow-800"></span>
          <span>Modifié</span>
        </div>
      </div>
    </div>
  )
}

// Extraire les lignes de texte d'un JSONContent
function extractLines(content: JSONContent): string[] {
  const lines: string[] = []

  const extractText = (node: JSONContent): string => {
    if (node.text) return node.text

    if (node.content) {
      return node.content.map(extractText).join('')
    }

    return ''
  }

  const processNode = (node: JSONContent) => {
    if (node.type === 'paragraph' || node.type === 'heading') {
      const text = extractText(node)
      if (text) lines.push(text)
    } else if (node.content) {
      node.content.forEach(processNode)
    }
  }

  if (content.content) {
    content.content.forEach(processNode)
  }

  return lines
}

// Calculer le diff entre deux tableaux de lignes (algorithme simplifié)
function computeDiff(original: string[], modified: string[]): DiffLine[] {
  const result: DiffLine[] = []

  // Utiliser l'algorithme de la plus longue sous-séquence commune (LCS)
  const lcs = computeLCS(original, modified)

  let origIdx = 0
  let modIdx = 0
  let lcsIdx = 0
  let origLineNum = 1
  let modLineNum = 1

  while (origIdx < original.length || modIdx < modified.length) {
    if (lcsIdx < lcs.length && origIdx < original.length && original[origIdx] === lcs[lcsIdx]) {
      if (modIdx < modified.length && modified[modIdx] === lcs[lcsIdx]) {
        // Ligne inchangée
        result.push({
          type: 'unchanged',
          originalText: original[origIdx],
          modifiedText: modified[modIdx],
          lineNumber: { original: origLineNum, modified: modLineNum },
        })
        origIdx++
        modIdx++
        origLineNum++
        modLineNum++
        lcsIdx++
      } else {
        // Ligne ajoutée
        result.push({
          type: 'added',
          modifiedText: modified[modIdx],
          lineNumber: { modified: modLineNum },
        })
        modIdx++
        modLineNum++
      }
    } else if (lcsIdx < lcs.length && modIdx < modified.length && modified[modIdx] === lcs[lcsIdx]) {
      // Ligne supprimée
      result.push({
        type: 'removed',
        originalText: original[origIdx],
        lineNumber: { original: origLineNum },
      })
      origIdx++
      origLineNum++
    } else if (origIdx < original.length && modIdx < modified.length) {
      // Ligne modifiée
      result.push({
        type: 'modified',
        originalText: original[origIdx],
        modifiedText: modified[modIdx],
        lineNumber: { original: origLineNum, modified: modLineNum },
      })
      origIdx++
      modIdx++
      origLineNum++
      modLineNum++
    } else if (origIdx < original.length) {
      // Ligne supprimée à la fin
      result.push({
        type: 'removed',
        originalText: original[origIdx],
        lineNumber: { original: origLineNum },
      })
      origIdx++
      origLineNum++
    } else if (modIdx < modified.length) {
      // Ligne ajoutée à la fin
      result.push({
        type: 'added',
        modifiedText: modified[modIdx],
        lineNumber: { modified: modLineNum },
      })
      modIdx++
      modLineNum++
    }
  }

  return result
}

// Calculer la plus longue sous-séquence commune
function computeLCS(a: string[], b: string[]): string[] {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Reconstruire la LCS
  const lcs: string[] = []
  let i = m
  let j = n

  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      lcs.unshift(a[i - 1])
      i--
      j--
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--
    } else {
      j--
    }
  }

  return lcs
}
