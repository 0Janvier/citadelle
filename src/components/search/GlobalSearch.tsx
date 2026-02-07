import { useState, useEffect, useCallback } from 'react'
import { useDocumentStore } from '../../store/useDocumentStore'
import { useClauseStore } from '../../store/useClauseStore'
import { useSnippetStore } from '../../store/useSnippetStore'
import type { SearchResult, SearchResultType } from '../../types/editor-features'

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
  onSelectDocument?: (documentId: string) => void
}

export function GlobalSearch({ isOpen, onClose, onSelectDocument }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const [filterType, setFilterType] = useState<SearchResultType | 'all'>('all')

  const documents = useDocumentStore((state) => state.documents)
  const setActiveDocument = useDocumentStore((state) => state.setActiveDocument)
  const clauses = useClauseStore((state) => state.clauses)
  const snippets = useSnippetStore((state) => state.snippets)

  // Fonction de recherche
  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    const query = searchQuery.toLowerCase()
    const searchResults: SearchResult[] = []

    // Recherche dans les documents
    if (filterType === 'all' || filterType === 'document') {
      documents.forEach((doc) => {
        const titleMatch = doc.title.toLowerCase().includes(query)

        // Extraire le texte du contenu JSON
        const contentText = extractTextFromContent(doc.content)
        const contentMatch = contentText.toLowerCase().includes(query)

        if (titleMatch || contentMatch) {
          const extrait = contentMatch
            ? highlightMatch(contentText, query)
            : doc.title

          searchResults.push({
            id: doc.id,
            type: 'document',
            titre: doc.title,
            extrait,
            score: titleMatch ? 100 : 50,
            path: doc.filePath,
            createdAt: doc.lastSaved?.toISOString(),
          })
        }
      })
    }

    // Recherche dans les clauses
    if (filterType === 'all' || filterType === 'clause') {
      clauses.forEach((clause) => {
        const titleMatch = clause.titre.toLowerCase().includes(query)
        const contentMatch = clause.texteRecherche.toLowerCase().includes(query)
        const tagMatch = clause.tags.some((t) => t.toLowerCase().includes(query))

        if (titleMatch || contentMatch || tagMatch) {
          searchResults.push({
            id: clause.id,
            type: 'clause',
            titre: clause.titre,
            extrait: highlightMatch(clause.texteRecherche, query),
            score: titleMatch ? 90 : tagMatch ? 70 : 40,
            createdAt: clause.createdAt,
          })
        }
      })
    }

    // Recherche dans les snippets
    if (filterType === 'all' || filterType === 'snippet') {
      snippets.forEach((snippet) => {
        const nameMatch = snippet.nom.toLowerCase().includes(query)
        const raccourciMatch = snippet.raccourci.toLowerCase().includes(query)
        const contentMatch = snippet.contenu.toLowerCase().includes(query)

        if (nameMatch || raccourciMatch || contentMatch) {
          searchResults.push({
            id: snippet.id,
            type: 'snippet',
            titre: `${snippet.nom} (${snippet.raccourci})`,
            extrait: highlightMatch(typeof snippet.contenu === 'string' ? snippet.contenu : snippet.nom, query),
            score: raccourciMatch ? 95 : nameMatch ? 85 : 35,
            createdAt: snippet.createdAt,
          })
        }
      })
    }

    // Trier par score décroissant
    searchResults.sort((a, b) => b.score - a.score)

    setResults(searchResults.slice(0, 50))
    setSelectedIndex(0)
    setIsSearching(false)
  }, [documents, clauses, snippets, filterType])

  // Debounce la recherche
  useEffect(() => {
    const timeout = setTimeout(() => {
      performSearch(query)
    }, 200)

    return () => clearTimeout(timeout)
  }, [query, performSearch])

  // Gestion du clavier
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        handleSelect(results[selectedIndex])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, onClose])

  const handleSelect = (result: SearchResult) => {
    if (result.type === 'document') {
      setActiveDocument(result.id)
      onSelectDocument?.(result.id)
    }
    // Pour les clauses et snippets, on pourrait ouvrir un panneau ou copier le contenu
    onClose()
  }

  const getTypeIcon = (type: SearchResultType) => {
    switch (type) {
      case 'document':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'clause':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        )
      case 'snippet':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        )
      default:
        return null
    }
  }

  const getTypeLabel = (type: SearchResultType) => {
    switch (type) {
      case 'document':
        return 'Document'
      case 'clause':
        return 'Clause'
      case 'snippet':
        return 'Snippet'
      case 'jurisprudence':
        return 'Jurisprudence'
      case 'article':
        return 'Article'
      default:
        return type
    }
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
      <div className="relative w-full max-w-2xl bg-[var(--bg-primary)] rounded-xl shadow-2xl border border-[var(--border-color)] overflow-hidden">
        {/* Barre de recherche */}
        <div className="flex items-center gap-3 p-4 border-b border-[var(--border-color)]">
          <svg
            className="w-5 h-5 text-gray-400 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher dans les documents, clauses, snippets..."
            className="flex-1 bg-transparent outline-none text-lg"
            autoFocus
          />
          {isSearching && (
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}
          <kbd className="hidden sm:inline-flex px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded">
            ESC
          </kbd>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 p-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
          {(['all', 'document', 'clause', 'snippet'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filterType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-[var(--bg-primary)] hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {type === 'all' ? 'Tout' : getTypeLabel(type)}
            </button>
          ))}
        </div>

        {/* Résultats */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query && results.length === 0 && !isSearching ? (
            <div className="p-8 text-center text-gray-500">
              <svg
                className="mx-auto w-12 h-12 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p>Aucun résultat pour "{query}"</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-color)]">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelect(result)}
                  className={`w-full p-4 text-left flex items-start gap-3 transition-colors ${
                    index === selectedIndex
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  <div className="flex-shrink-0 p-2 rounded-lg bg-[var(--bg-secondary)]">
                    {getTypeIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate">{result.titre}</h4>
                      <span className="px-1.5 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                        {getTypeLabel(result.type)}
                      </span>
                    </div>
                    <p
                      className="text-sm text-gray-500 mt-1 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: result.extrait }}
                    />
                    {result.path && (
                      <p className="text-xs text-gray-400 mt-1 truncate">{result.path}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {!query && (
            <div className="p-8 text-center text-gray-500">
              <p>Commencez à taper pour rechercher</p>
              <p className="text-sm mt-2">
                Utilisez les touches <kbd className="px-1.5 py-0.5 mx-1 text-xs bg-gray-100 dark:bg-gray-800 rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 mx-1 text-xs bg-gray-100 dark:bg-gray-800 rounded">↓</kbd>
                pour naviguer
              </p>
            </div>
          )}
        </div>

        {/* Pied de page */}
        {results.length > 0 && (
          <div className="p-3 border-t border-[var(--border-color)] text-sm text-gray-500 bg-[var(--bg-secondary)]">
            {results.length} résultat{results.length > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}

// Utilitaires
function extractTextFromContent(content: unknown): string {
  if (!content || typeof content !== 'object') return ''

  let text = ''
  const node = content as { text?: string; content?: unknown[] }

  if (node.text) {
    text += node.text + ' '
  }

  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      text += extractTextFromContent(child)
    }
  }

  return text.trim()
}

function highlightMatch(text: string, query: string): string {
  const maxLength = 150
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const index = lowerText.indexOf(lowerQuery)

  if (index === -1) {
    return text.slice(0, maxLength) + (text.length > maxLength ? '...' : '')
  }

  const start = Math.max(0, index - 40)
  const end = Math.min(text.length, index + query.length + 60)

  let excerpt = text.slice(start, end)
  if (start > 0) excerpt = '...' + excerpt
  if (end < text.length) excerpt = excerpt + '...'

  // Surligner le match
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi')
  return excerpt.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">$1</mark>')
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
