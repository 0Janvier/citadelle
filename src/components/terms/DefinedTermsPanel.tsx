// Panel affichant le glossaire des termes définis du projet
import { useState, useMemo, useEffect } from 'react'
import { useDefinedTermsStore, DefinedTerm, TermConflict } from '../../store/useDefinedTermsStore'
import { useDocumentStore } from '../../store/useDocumentStore'
import { useEditorStore } from '../../store/useEditorStore'

interface DefinedTermsPanelProps {
  onClose: () => void
}

type SortMode = 'alpha' | 'document' | 'recent'
type ViewMode = 'all' | 'conflicts' | 'document'

export function DefinedTermsPanel({ onClose }: DefinedTermsPanelProps) {
  const [filter, setFilter] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('alpha')
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null)

  const terms = useDefinedTermsStore((state) => state.terms)
  const getConflicts = useDefinedTermsStore((state) => state.getConflicts)
  const getUsagesForTerm = useDefinedTermsStore((state) => state.getUsagesForTerm)
  const extractTermsFromText = useDefinedTermsStore((state) => state.extractTermsFromText)

  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId)
  const documents = useDocumentStore((state) => state.documents)
  const activeEditor = useEditorStore((state) => state.activeEditor)

  // Extraire les termes du document actif au montage
  useEffect(() => {
    if (activeEditor && activeDocumentId) {
      const text = activeEditor.getText()
      const doc = documents.find((d) => d.id === activeDocumentId)
      if (text && doc) {
        extractTermsFromText(text, activeDocumentId, doc.title)
      }
    }
  }, [activeDocumentId, activeEditor, documents, extractTermsFromText])

  // Écouter les clics sur les termes dans l'éditeur
  useEffect(() => {
    const handleTermClick = (event: CustomEvent) => {
      const { term } = event.detail
      if (term) {
        setSelectedTermId(term.termId || null)
        // Scroll vers le terme dans le panel
        const element = document.querySelector(`[data-term-panel-id="${term.termId}"]`)
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }

    window.addEventListener('defined-term-click', handleTermClick as EventListener)
    return () => {
      window.removeEventListener('defined-term-click', handleTermClick as EventListener)
    }
  }, [])

  // Filtrer et trier les termes
  const filteredTerms = useMemo(() => {
    let result = [...terms]

    // Filtrer par texte
    if (filter) {
      const lowerFilter = filter.toLowerCase()
      result = result.filter(
        (t) =>
          t.term.toLowerCase().includes(lowerFilter) ||
          t.definition.toLowerCase().includes(lowerFilter)
      )
    }

    // Filtrer par mode de vue
    if (viewMode === 'document' && activeDocumentId) {
      result = result.filter((t) => t.sourceDocumentId === activeDocumentId)
    }

    // Trier
    switch (sortMode) {
      case 'alpha':
        result.sort((a, b) => a.term.localeCompare(b.term, 'fr'))
        break
      case 'document':
        result.sort((a, b) => (a.sourceDocumentName || '').localeCompare(b.sourceDocumentName || ''))
        break
      case 'recent':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    return result
  }, [terms, filter, sortMode, viewMode, activeDocumentId])

  const conflicts = useMemo(() => getConflicts(), [terms, getConflicts])

  const navigateToTerm = (term: DefinedTerm) => {
    if (!activeEditor) return

    // Si le terme est dans un autre document, on ne peut pas naviguer directement
    // Pour l'instant, on scroll vers la position si c'est le même document
    if (term.sourceDocumentId === activeDocumentId) {
      activeEditor.chain().focus().setTextSelection(term.position.from).run()

      // Scroll vers la position
      const domPos = activeEditor.view.coordsAtPos(term.position.from)
      if (domPos) {
        window.scrollTo({
          top: domPos.top - window.innerHeight / 2,
          behavior: 'smooth',
        })
      }
    }
  }

  const refreshTerms = () => {
    if (activeEditor && activeDocumentId) {
      const text = activeEditor.getText()
      const doc = documents.find((d) => d.id === activeDocumentId)
      if (text && doc) {
        extractTermsFromText(text, activeDocumentId, doc.title)
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[var(--border)]">
        <h2 className="font-semibold text-[var(--text)]">Glossaire</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={refreshTerms}
            className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
            title="Actualiser les termes"
          >
            <RefreshIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 px-3 py-2 border-b border-[var(--border)] bg-[var(--bg-secondary)] text-xs">
        <span className="text-[var(--text-secondary)]">
          <strong className="text-[var(--text)]">{terms.length}</strong> terme{terms.length > 1 ? 's' : ''}
        </span>
        {conflicts.length > 0 && (
          <span className="text-amber-600 dark:text-amber-400">
            <strong>{conflicts.length}</strong> conflit{conflicts.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="p-2 border-b border-[var(--border)] space-y-2">
        {/* Search */}
        <div className="relative">
          <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filtrer les termes..."
            className="w-full pl-8 pr-2 py-1.5 text-sm bg-[var(--bg-secondary)] border border-[var(--border)] rounded outline-none focus:border-[var(--accent)]"
          />
        </div>

        {/* View mode */}
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('all')}
            className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
              viewMode === 'all'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setViewMode('document')}
            className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
              viewMode === 'document'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            Document
          </button>
          {conflicts.length > 0 && (
            <button
              onClick={() => setViewMode('conflicts')}
              className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                viewMode === 'conflicts'
                  ? 'bg-amber-500 text-white'
                  : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-amber-600'
              }`}
            >
              Conflits
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <span>Tri:</span>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-0.5 outline-none"
          >
            <option value="alpha">Alphabétique</option>
            <option value="document">Par document</option>
            <option value="recent">Plus récents</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'conflicts' ? (
          <ConflictsList conflicts={conflicts} onNavigate={navigateToTerm} />
        ) : filteredTerms.length === 0 ? (
          <div className="p-4 text-center text-[var(--text-secondary)]">
            {filter ? (
              <p>Aucun terme trouvé pour "{filter}"</p>
            ) : (
              <>
                <BookIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Aucun terme défini</p>
                <p className="text-xs mt-1">
                  Les termes entre « guillemets » seront détectés automatiquement
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {filteredTerms.map((term) => (
              <TermItem
                key={term.id}
                term={term}
                isSelected={selectedTermId === term.id}
                usageCount={getUsagesForTerm(term.id).length}
                onClick={() => setSelectedTermId(term.id)}
                onNavigate={() => navigateToTerm(term)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-[var(--border)] bg-[var(--bg-secondary)] text-xs text-[var(--text-tertiary)] text-center">
        <kbd className="px-1 py-0.5 bg-[var(--bg)] rounded">Cmd+Clic</kbd> sur un terme pour naviguer
      </div>
    </div>
  )
}

// ============================================================================
// Sub-components
// ============================================================================

interface TermItemProps {
  term: DefinedTerm
  isSelected: boolean
  usageCount: number
  onClick: () => void
  onNavigate: () => void
}

function TermItem({ term, isSelected, usageCount, onClick, onNavigate }: TermItemProps) {
  return (
    <div
      data-term-panel-id={term.id}
      onClick={onClick}
      className={`p-3 cursor-pointer transition-colors ${
        isSelected ? 'bg-[var(--accent)]/10' : 'hover:bg-[var(--bg-secondary)]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--text)]">{term.term}</span>
            {usageCount > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                {usageCount} usage{usageCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {term.definition && (
            <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">
              {term.definition}
            </p>
          )}
          {term.sourceDocumentName && (
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Source: {term.sourceDocumentName}
            </p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNavigate()
          }}
          className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
          title="Aller à la définition"
        >
          <ArrowIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

interface ConflictsListProps {
  conflicts: TermConflict[]
  onNavigate: (term: DefinedTerm) => void
}

function ConflictsList({ conflicts, onNavigate }: ConflictsListProps) {
  if (conflicts.length === 0) {
    return (
      <div className="p-4 text-center text-[var(--text-secondary)]">
        <CheckIcon className="w-10 h-10 mx-auto mb-2 text-green-500" />
        <p>Aucun conflit de définition</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-[var(--border)]">
      {conflicts.map((conflict) => (
        <div key={conflict.normalizedTerm} className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <WarningIcon className="w-4 h-4 text-amber-500" />
            <span className="font-medium text-[var(--text)]">{conflict.term}</span>
            <span className="text-xs text-amber-600 dark:text-amber-400">
              {conflict.definitions.length} définitions
            </span>
          </div>
          <div className="space-y-2 ml-6">
            {conflict.definitions.map((def) => (
              <div
                key={def.id}
                className="flex items-start gap-2 p-2 rounded bg-[var(--bg-secondary)] cursor-pointer hover:bg-[var(--bg-tertiary)]"
                onClick={() => onNavigate(def)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-1">
                    {def.definition || def.definitionContext}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {def.sourceDocumentName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// Icons
// ============================================================================

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}
