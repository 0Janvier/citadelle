import { useState } from 'react'
import { useClauseStore } from '../../store/useClauseStore'
import type { Clause } from '../../types/editor-features'
import { CLAUSE_DOMAINE_LABELS, CLAUSE_TYPE_LABELS } from '../../types/editor-features'

interface ClauseCardProps {
  clause: Clause
  onInsert: () => void
  isInserting?: boolean
}

export function ClauseCard({ clause, onInsert, isInserting }: ClauseCardProps) {
  const toggleFavorite = useClauseStore((state) => state.toggleFavorite)
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className="border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/citadelle-clause', JSON.stringify(clause.contenu))
        e.dataTransfer.setData('text/plain', clause.texteRecherche)
        e.dataTransfer.effectAllowed = 'copy'
      }}
    >
      {/* En-tête */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">{clause.titre}</h3>
              {clause.isBuiltin && (
                <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded">
                  Builtin
                </span>
              )}
            </div>
            {clause.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{clause.description}</p>
            )}
          </div>

          {/* Bouton favori */}
          <button
            onClick={() => toggleFavorite(clause.id)}
            className="p-1.5 rounded-full hover:bg-[var(--bg-primary)] transition-colors"
            title={clause.favoris ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <svg
              className={`w-5 h-5 ${clause.favoris ? 'text-yellow-500 fill-current' : 'text-gray-400'}`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
            {CLAUSE_DOMAINE_LABELS[clause.domaine]}
          </span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            {CLAUSE_TYPE_LABELS[clause.type]}
          </span>
          {clause.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Aperçu (extensible) */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="p-3 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] max-h-48 overflow-y-auto">
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-sm"
              style={{ fontSize: '13px' }}
            >
              {clause.texteRecherche.slice(0, 500)}
              {clause.texteRecherche.length > 500 && '...'}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-color)] bg-[var(--bg-primary)] rounded-b-lg">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
        >
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {isExpanded ? 'Masquer' : 'Aperçu'}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {clause.usageCount} utilisation{clause.usageCount > 1 ? 's' : ''}
          </span>
          <button
            onClick={onInsert}
            disabled={isInserting}
            className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isInserting ? 'Insertion...' : 'Insérer'}
          </button>
        </div>
      </div>
    </div>
  )
}
