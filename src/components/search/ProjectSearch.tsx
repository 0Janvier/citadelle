// Recherche multi-documents dans le projet actif
import { useState, useEffect, useCallback, useRef } from 'react'
import { useProjectStore, SearchResult } from '../../store/useProjectStore'
import { useDocumentStore } from '../../store/useDocumentStore'
import { invoke } from '@tauri-apps/api/tauri'

interface ProjectSearchProps {
  isOpen: boolean
  onClose: () => void
}

interface GroupedResults {
  [documentPath: string]: {
    documentName: string
    results: SearchResult[]
  }
}

export function ProjectSearch({ isOpen, onClose }: ProjectSearchProps) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)

  const currentProject = useProjectStore((state) => state.currentProject)
  const searchResults = useProjectStore((state) => state.searchResults)
  const setSearchQuery = useProjectStore((state) => state.setSearchQuery)

  const addDocument = useDocumentStore((state) => state.addDocument)

  // Focus input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Recherche avec debounce
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!currentProject || !searchQuery.trim()) {
      useProjectStore.getState().clearSearchResults()
      return
    }

    setIsSearching(true)
    setSearchQuery(searchQuery)

    try {
      const results = await invoke<SearchResult[]>('search_in_project', {
        rootPath: currentProject.rootPath,
        query: searchQuery.trim(),
        extensions: ['md', 'txt', 'markdown', 'text'],
      })

      useProjectStore.setState({ searchResults: results })

      // Expand all files with results by default
      const paths = new Set(results.map(r => r.documentPath))
      setExpandedFiles(paths)
    } catch (error) {
      console.error('Search failed:', error)
      useProjectStore.setState({ searchResults: [] })
    } finally {
      setIsSearching(false)
    }
  }, [currentProject, setSearchQuery])

  useEffect(() => {
    const timeout = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(timeout)
  }, [query, performSearch])

  // Group results by document
  const groupedResults: GroupedResults = searchResults.reduce((acc, result) => {
    if (!acc[result.documentPath]) {
      acc[result.documentPath] = {
        documentName: result.documentName,
        results: [],
      }
    }
    acc[result.documentPath].results.push(result)
    return acc
  }, {} as GroupedResults)

  const documentPaths = Object.keys(groupedResults)

  // Flatten for keyboard navigation
  const flatResults: { path: string; result?: SearchResult; isHeader: boolean }[] = []
  documentPaths.forEach((path) => {
    flatResults.push({ path, isHeader: true })
    if (expandedFiles.has(path)) {
      groupedResults[path].results.forEach((result) => {
        flatResults.push({ path, result, isHeader: false })
      })
    }
  })

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, flatResults.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const selected = flatResults[selectedIndex]
        if (selected) {
          if (selected.isHeader) {
            toggleFile(selected.path)
          } else if (selected.result) {
            openFileAtLine(selected.result)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, flatResults, selectedIndex, onClose])

  const toggleFile = (path: string) => {
    setExpandedFiles((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const openFileAtLine = async (result: SearchResult) => {
    try {
      // Lire le contenu du fichier
      const content = await invoke<string>('read_file', { path: result.documentPath })

      // Créer un document avec le contenu
      const lines = content.split('\n')
      const jsonContent = {
        type: 'doc',
        content: lines.map((line) => ({
          type: 'paragraph',
          content: line ? [{ type: 'text', text: line }] : [],
        })),
      }

      addDocument({
        title: result.documentName,
        content: jsonContent,
        filePath: result.documentPath,
      })

      onClose()

      // TODO: Scroll to the line (would need editor integration)
    } catch (error) {
      console.error('Failed to open file:', error)
    }
  }

  const highlightMatch = (text: string) => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi')
    return text.replace(
      regex,
      '<mark class="bg-yellow-200 dark:bg-yellow-700/50 px-0.5 rounded">$1</mark>'
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl bg-[var(--bg)] rounded-xl shadow-2xl border border-[var(--border)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
          <SearchIcon className="w-5 h-5 text-[var(--text-secondary)] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              currentProject
                ? `Rechercher dans ${currentProject.name}...`
                : 'Ouvrez un projet pour rechercher'
            }
            className="flex-1 bg-transparent outline-none text-lg text-[var(--text)]"
            disabled={!currentProject}
          />
          {isSearching && (
            <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          )}
          <kbd className="hidden sm:inline-flex px-2 py-1 text-xs bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded border border-[var(--border)]">
            ESC
          </kbd>
        </div>

        {/* Project info */}
        {currentProject && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border)] text-sm">
            <FolderIcon className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-[var(--text-secondary)]">Projet :</span>
            <span className="font-medium text-[var(--text)]">{currentProject.name}</span>
            <span className="text-[var(--text-tertiary)]">
              ({currentProject.documents.length} fichiers)
            </span>
          </div>
        )}

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!currentProject ? (
            <div className="p-8 text-center text-[var(--text-secondary)]">
              <FolderIcon className="mx-auto w-12 h-12 mb-4 opacity-50" />
              <p>Aucun projet ouvert</p>
              <p className="text-sm mt-2">
                Utilisez <kbd className="px-1.5 py-0.5 mx-1 text-xs bg-[var(--bg-secondary)] rounded">Cmd+Shift+O</kbd>
                pour ouvrir un dossier comme projet
              </p>
            </div>
          ) : query && searchResults.length === 0 && !isSearching ? (
            <div className="p-8 text-center text-[var(--text-secondary)]">
              <NoResultsIcon className="mx-auto w-12 h-12 mb-4 opacity-50" />
              <p>Aucun résultat pour "{query}"</p>
            </div>
          ) : query && searchResults.length > 0 ? (
            <div className="divide-y divide-[var(--border)]">
              {documentPaths.map((path) => {
                const group = groupedResults[path]
                const isExpanded = expandedFiles.has(path)
                const headerIndex = flatResults.findIndex(
                  (f) => f.path === path && f.isHeader
                )

                return (
                  <div key={path}>
                    {/* File header */}
                    <button
                      onClick={() => toggleFile(path)}
                      className={`w-full flex items-center gap-2 px-4 py-3 text-left transition-colors ${
                        selectedIndex === headerIndex
                          ? 'bg-[var(--accent)]/10'
                          : 'hover:bg-[var(--bg-secondary)]'
                      }`}
                    >
                      <ChevronIcon
                        className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                      <FileIcon className="w-4 h-4 text-[var(--accent)]" />
                      <span className="font-medium text-[var(--text)]">
                        {group.documentName}
                      </span>
                      <span className="text-xs text-[var(--text-tertiary)] ml-auto">
                        {group.results.length} occurrence{group.results.length > 1 ? 's' : ''}
                      </span>
                    </button>

                    {/* Results in this file */}
                    {isExpanded && (
                      <div className="bg-[var(--bg-secondary)]">
                        {group.results.map((result, idx) => {
                          const resultIndex = flatResults.findIndex(
                            (f) =>
                              f.path === path &&
                              !f.isHeader &&
                              f.result === result
                          )

                          return (
                            <button
                              key={`${path}-${idx}`}
                              onClick={() => openFileAtLine(result)}
                              className={`w-full flex items-start gap-3 px-4 py-2 pl-10 text-left transition-colors ${
                                selectedIndex === resultIndex
                                  ? 'bg-[var(--accent)]/10'
                                  : 'hover:bg-[var(--bg-tertiary)]'
                              }`}
                            >
                              <span className="text-xs text-[var(--text-tertiary)] font-mono w-8 flex-shrink-0">
                                L{result.line}
                              </span>
                              <span
                                className="text-sm text-[var(--text-secondary)] flex-1 truncate font-mono"
                                dangerouslySetInnerHTML={{
                                  __html: highlightMatch(result.context),
                                }}
                              />
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : !query ? (
            <div className="p-8 text-center text-[var(--text-secondary)]">
              <p>Commencez à taper pour rechercher dans le projet</p>
              <p className="text-sm mt-2">
                Utilisez
                <kbd className="px-1.5 py-0.5 mx-1 text-xs bg-[var(--bg-secondary)] rounded">
                  ↑
                </kbd>
                <kbd className="px-1.5 py-0.5 mx-1 text-xs bg-[var(--bg-secondary)] rounded">
                  ↓
                </kbd>
                pour naviguer,
                <kbd className="px-1.5 py-0.5 mx-1 text-xs bg-[var(--bg-secondary)] rounded">
                  Entrée
                </kbd>
                pour ouvrir
              </p>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {searchResults.length > 0 && (
          <div className="px-4 py-2 border-t border-[var(--border)] text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)]">
            {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} dans{' '}
            {documentPaths.length} fichier{documentPaths.length > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}

// Icons
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  )
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
  )
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

function NoResultsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
