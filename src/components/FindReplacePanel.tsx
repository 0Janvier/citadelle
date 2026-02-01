import { useEffect, useRef, useCallback, useState } from 'react'
import { useEditorStore } from '../store/useEditorStore'

interface SearchResult {
  from: number
  to: number
}

export function FindReplacePanel() {
  const findDialogOpen = useEditorStore((state) => state.findDialogOpen)
  const setFindDialogOpen = useEditorStore((state) => state.setFindDialogOpen)
  const findQuery = useEditorStore((state) => state.findQuery)
  const setFindQuery = useEditorStore((state) => state.setFindQuery)
  const replaceQuery = useEditorStore((state) => state.replaceQuery)
  const setReplaceQuery = useEditorStore((state) => state.setReplaceQuery)
  const caseSensitive = useEditorStore((state) => state.caseSensitive)
  const setCaseSensitive = useEditorStore((state) => state.setCaseSensitive)
  const wholeWord = useEditorStore((state) => state.wholeWord)
  const setWholeWord = useEditorStore((state) => state.setWholeWord)
  const showReplace = useEditorStore((state) => state.showReplace)
  const setShowReplace = useEditorStore((state) => state.setShowReplace)
  const currentMatchIndex = useEditorStore((state) => state.currentMatchIndex)
  const setCurrentMatchIndex = useEditorStore((state) => state.setCurrentMatchIndex)
  const totalMatches = useEditorStore((state) => state.totalMatches)
  const setTotalMatches = useEditorStore((state) => state.setTotalMatches)
  const activeEditor = useEditorStore((state) => state.activeEditor)

  const searchInputRef = useRef<HTMLInputElement>(null)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  // Focus search input when panel opens
  useEffect(() => {
    if (findDialogOpen && searchInputRef.current) {
      searchInputRef.current.focus()
      searchInputRef.current.select()
    }
  }, [findDialogOpen])

  // Search function
  const performSearch = useCallback(() => {
    if (!activeEditor || !findQuery) {
      setSearchResults([])
      setTotalMatches(0)
      setCurrentMatchIndex(0)
      clearHighlights()
      return
    }

    const doc = activeEditor.state.doc
    const results: SearchResult[] = []

    // Build search pattern
    let searchText = findQuery
    if (!caseSensitive) {
      searchText = searchText.toLowerCase()
    }

    // Search through document
    doc.descendants((node, pos) => {
      if (node.isText && node.text) {
        let text = node.text
        let searchIn = caseSensitive ? text : text.toLowerCase()
        let index = 0

        while ((index = searchIn.indexOf(searchText, index)) !== -1) {
          const from = pos + index
          const to = from + searchText.length

          // Check whole word if enabled
          if (wholeWord) {
            const beforeChar = index > 0 ? text[index - 1] : ' '
            const afterChar = index + searchText.length < text.length ? text[index + searchText.length] : ' '
            const isWordBoundaryBefore = /\W/.test(beforeChar)
            const isWordBoundaryAfter = /\W/.test(afterChar)

            if (!isWordBoundaryBefore || !isWordBoundaryAfter) {
              index++
              continue
            }
          }

          results.push({ from, to })
          index++
        }
      }
      return true
    })

    setSearchResults(results)
    setTotalMatches(results.length)

    // Adjust current match index if needed
    if (results.length === 0) {
      setCurrentMatchIndex(0)
    } else if (currentMatchIndex >= results.length) {
      setCurrentMatchIndex(results.length - 1)
    }

    // Highlight results
    highlightResults(results, currentMatchIndex)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEditor, findQuery, caseSensitive, wholeWord, currentMatchIndex]) // setters are stable from Zustand

  // Perform search when query or options change
  useEffect(() => {
    performSearch()
  }, [performSearch])

  // Clear highlights helper
  const clearHighlights = useCallback(() => {
    if (!activeEditor) return

    // Remove search highlight marks
    const { state, view } = activeEditor
    const { tr } = state

    // Find and remove all search-highlight marks
    state.doc.descendants((node, pos) => {
      if (node.marks) {
        node.marks.forEach((mark) => {
          if (mark.type.name === 'highlight' && mark.attrs.color === '#ffeb3b') {
            tr.removeMark(pos, pos + node.nodeSize, mark.type)
          }
        })
      }
      return true
    })

    if (tr.docChanged) {
      view.dispatch(tr)
    }
  }, [activeEditor])

  // Highlight results using decorations
  const highlightResults = useCallback((results: SearchResult[], currentIndex: number) => {
    if (!activeEditor) return

    // We'll use TipTap's built-in setMeta to add decorations
    // For now, we'll navigate to the current match
    if (results.length > 0 && results[currentIndex]) {
      const { from, to } = results[currentIndex]
      activeEditor.chain().focus().setTextSelection({ from, to }).run()
    }
  }, [activeEditor])

  // Navigate to next match
  const goToNextMatch = useCallback(() => {
    if (searchResults.length === 0) return

    const nextIndex = (currentMatchIndex + 1) % searchResults.length
    setCurrentMatchIndex(nextIndex)

    const { from, to } = searchResults[nextIndex]
    activeEditor?.chain().focus().setTextSelection({ from, to }).run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEditor, searchResults, currentMatchIndex]) // setCurrentMatchIndex is stable

  // Navigate to previous match
  const goToPreviousMatch = useCallback(() => {
    if (searchResults.length === 0) return

    const prevIndex = (currentMatchIndex - 1 + searchResults.length) % searchResults.length
    setCurrentMatchIndex(prevIndex)

    const { from, to } = searchResults[prevIndex]
    activeEditor?.chain().focus().setTextSelection({ from, to }).run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEditor, searchResults, currentMatchIndex]) // setCurrentMatchIndex is stable

  // Listen for global keyboard events (Cmd+G, Cmd+Shift+G)
  useEffect(() => {
    const handleFindNext = () => goToNextMatch()
    const handleFindPrevious = () => goToPreviousMatch()

    window.addEventListener('find-next', handleFindNext)
    window.addEventListener('find-previous', handleFindPrevious)

    return () => {
      window.removeEventListener('find-next', handleFindNext)
      window.removeEventListener('find-previous', handleFindPrevious)
    }
  }, [goToNextMatch, goToPreviousMatch])

  // Replace current match
  const replaceCurrent = useCallback(() => {
    if (!activeEditor || searchResults.length === 0) return

    const { from, to } = searchResults[currentMatchIndex]

    activeEditor
      .chain()
      .focus()
      .setTextSelection({ from, to })
      .deleteSelection()
      .insertContent(replaceQuery)
      .run()

    // Re-search after replacement
    setTimeout(performSearch, 10)
  }, [activeEditor, searchResults, currentMatchIndex, replaceQuery, performSearch])

  // Replace all matches
  const replaceAll = useCallback(() => {
    if (!activeEditor || searchResults.length === 0) return

    // Replace from end to start to maintain positions
    const sortedResults = [...searchResults].sort((a, b) => b.from - a.from)

    activeEditor.chain().focus()

    sortedResults.forEach(({ from, to }) => {
      activeEditor
        .chain()
        .setTextSelection({ from, to })
        .deleteSelection()
        .insertContent(replaceQuery)
        .run()
    })

    // Clear search after replacing all
    setTimeout(performSearch, 10)
  }, [activeEditor, searchResults, replaceQuery, performSearch])

  // Close panel
  const closePanel = useCallback(() => {
    setFindDialogOpen(false)
    clearHighlights()
    activeEditor?.commands.focus()
  }, [setFindDialogOpen, clearHighlights, activeEditor])

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      closePanel()
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      goToNextMatch()
    } else if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault()
      goToPreviousMatch()
    } else if (e.key === 'g' && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
      e.preventDefault()
      goToNextMatch()
    } else if (e.key === 'g' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
      e.preventDefault()
      goToPreviousMatch()
    }
  }, [closePanel, goToNextMatch, goToPreviousMatch])

  if (!findDialogOpen) return null

  return (
    <div
      className="absolute top-2 right-4 bg-[var(--bg)] border border-[var(--border)] rounded-lg shadow-lg p-3 min-w-[320px] animate-slideInRight"
      style={{ zIndex: 'var(--z-overlay)' }}
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--text)]">
            {showReplace ? 'Rechercher et remplacer' : 'Rechercher'}
          </span>
          <button
            onClick={() => setShowReplace(!showReplace)}
            className="text-xs px-2 py-0.5 rounded bg-[var(--editor-bg)] hover:bg-[var(--border)] text-[var(--text)] opacity-70 hover:opacity-100 transition-opacity"
            title={showReplace ? 'Masquer remplacer' : 'Afficher remplacer'}
          >
            {showReplace ? '▲' : '▼'}
          </button>
        </div>
        <button
          onClick={closePanel}
          className="p-1 rounded hover:bg-[var(--editor-bg)] text-[var(--text)] opacity-60 hover:opacity-100 transition-opacity"
          title="Fermer (Échap)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Search input */}
      <div className="flex items-center gap-2 mb-2">
        <div className="relative flex-1">
          <input
            ref={searchInputRef}
            type="text"
            value={findQuery}
            onChange={(e) => setFindQuery(e.target.value)}
            placeholder="Rechercher..."
            className="w-full px-3 py-1.5 text-sm bg-[var(--editor-bg)] border border-[var(--border)] rounded-md text-[var(--text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
          />
          {findQuery && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--text)] opacity-50">
              {totalMatches > 0 ? `${currentMatchIndex + 1}/${totalMatches}` : '0/0'}
            </span>
          )}
        </div>

        {/* Navigation buttons */}
        <button
          onClick={goToPreviousMatch}
          disabled={totalMatches === 0}
          className="p-1.5 rounded hover:bg-[var(--editor-bg)] text-[var(--text)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Précédent (Maj+Entrée)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          onClick={goToNextMatch}
          disabled={totalMatches === 0}
          className="p-1.5 rounded hover:bg-[var(--editor-bg)] text-[var(--text)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Suivant (Entrée)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Options */}
      <div className="flex items-center gap-3 mb-2">
        <label className="flex items-center gap-1.5 text-xs text-[var(--text)] opacity-70 hover:opacity-100 cursor-pointer">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
            className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
          />
          Aa
        </label>
        <label className="flex items-center gap-1.5 text-xs text-[var(--text)] opacity-70 hover:opacity-100 cursor-pointer">
          <input
            type="checkbox"
            checked={wholeWord}
            onChange={(e) => setWholeWord(e.target.checked)}
            className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
          />
          Mot entier
        </label>
      </div>

      {/* Replace section */}
      {showReplace && (
        <div className="border-t border-[var(--border)] pt-2 mt-2">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              placeholder="Remplacer par..."
              className="flex-1 px-3 py-1.5 text-sm bg-[var(--editor-bg)] border border-[var(--border)] rounded-md text-[var(--text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={replaceCurrent}
              disabled={totalMatches === 0}
              className="px-3 py-1 text-xs rounded bg-[var(--editor-bg)] hover:bg-[var(--border)] text-[var(--text)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Remplacer
            </button>
            <button
              onClick={replaceAll}
              disabled={totalMatches === 0}
              className="px-3 py-1 text-xs rounded bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Tout remplacer
            </button>
          </div>
        </div>
      )}

      {/* Keyboard hints */}
      <div className="mt-2 pt-2 border-t border-[var(--border)] text-[10px] text-[var(--text)] opacity-40">
        Entrée = suivant · Maj+Entrée = précédent · Échap = fermer
      </div>
    </div>
  )
}
