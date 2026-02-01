import { useState } from 'react'
import { useClauseStore } from '../../store/useClauseStore'
import { useEditorStore } from '../../store/useEditorStore'
import { ClauseCard } from './ClauseCard'
import {
  CLAUSE_DOMAINE_LABELS,
  CLAUSE_TYPE_LABELS,
  type ClauseDomaine,
  type ClauseType,
} from '../../types/editor-features'

interface ClauseLibraryProps {
  onClose?: () => void
}

export function ClauseLibrary({ onClose }: ClauseLibraryProps) {
  const {
    searchQuery,
    setSearchQuery,
    selectedDomaine,
    setSelectedDomaine,
    selectedType,
    setSelectedType,
    showFavoritesOnly,
    setShowFavoritesOnly,
    getFilteredClauses,
    incrementUsage,
  } = useClauseStore()

  const activeEditor = useEditorStore((state) => state.activeEditor)
  const [isInserting, setIsInserting] = useState(false)

  const filteredClauses = getFilteredClauses()

  const handleInsertClause = (clauseId: string) => {
    const clause = useClauseStore.getState().getClauseById(clauseId)
    if (!clause || !activeEditor) return

    setIsInserting(true)

    // Insérer le contenu de la clause dans l'éditeur
    activeEditor.chain().focus().insertContent(clause.contenu).run()

    // Incrémenter le compteur d'usage
    incrementUsage(clauseId)

    setIsInserting(false)
    onClose?.()
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* En-tête */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
        <h2 className="text-lg font-semibold">Bibliothèque de clauses</h2>
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

      {/* Filtres */}
      <div className="p-4 space-y-3 border-b border-[var(--border-color)]">
        {/* Recherche */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une clause..."
            className="w-full px-4 py-2 pl-10 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
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
        </div>

        {/* Filtres par domaine et type */}
        <div className="flex gap-2">
          <select
            value={selectedDomaine}
            onChange={(e) => setSelectedDomaine(e.target.value as ClauseDomaine | 'all')}
            className="flex-1 px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les domaines</option>
            {Object.entries(CLAUSE_DOMAINE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as ClauseType | 'all')}
            className="flex-1 px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les types</option>
            {Object.entries(CLAUSE_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Favoris */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showFavoritesOnly}
            onChange={(e) => setShowFavoritesOnly(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm">Afficher uniquement les favoris</span>
        </label>
      </div>

      {/* Liste des clauses */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredClauses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p>Aucune clause trouvée</p>
            <p className="text-sm mt-1">Essayez d'ajuster vos filtres</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredClauses.map((clause) => (
              <ClauseCard
                key={clause.id}
                clause={clause}
                onInsert={() => handleInsertClause(clause.id)}
                isInserting={isInserting}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pied de page */}
      <div className="p-4 border-t border-[var(--border-color)] text-sm text-gray-500">
        {filteredClauses.length} clause{filteredClauses.length > 1 ? 's' : ''} trouvée
        {filteredClauses.length > 1 ? 's' : ''}
      </div>
    </div>
  )
}
