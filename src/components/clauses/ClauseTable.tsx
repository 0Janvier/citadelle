import { useState, useMemo } from 'react'
import type { Clause, ClauseDomaine, ClauseType } from '../../types/editor-features'
import type { Snippet, SnippetCategory } from '../../types/editor-features'
import { CLAUSE_DOMAINE_LABELS, CLAUSE_TYPE_LABELS, SNIPPET_CATEGORY_LABELS } from '../../types/editor-features'

// Types génériques pour supporter clauses et snippets
type SortDirection = 'asc' | 'desc'

interface ClauseTableProps {
  items: Clause[]
  type: 'clause'
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  onEdit: (item: Clause) => void
  onDelete: (id: string) => void
  onToggleFavorite?: (id: string) => void
}

interface SnippetTableProps {
  items: Snippet[]
  type: 'snippet'
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  onEdit: (item: Snippet) => void
  onDelete: (id: string) => void
}

type TableProps = ClauseTableProps | SnippetTableProps

type ClauseSortKey = 'titre' | 'domaine' | 'type' | 'usageCount' | 'createdAt' | 'favoris'
type SnippetSortKey = 'nom' | 'raccourci' | 'category' | 'usageCount' | 'isBuiltin'

export function ClauseTable(props: TableProps) {
  const { items, type, selectedIds, onSelectionChange, onEdit, onDelete } = props

  // État du tri
  const [sortKey, setSortKey] = useState<ClauseSortKey | SnippetSortKey>(
    type === 'clause' ? 'titre' : 'nom'
  )
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Tri des éléments
  const sortedItems = useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      let comparison = 0

      if (type === 'clause') {
        const clauseA = a as Clause
        const clauseB = b as Clause
        const key = sortKey as ClauseSortKey

        switch (key) {
          case 'titre':
            comparison = clauseA.titre.localeCompare(clauseB.titre)
            break
          case 'domaine':
            comparison = clauseA.domaine.localeCompare(clauseB.domaine)
            break
          case 'type':
            comparison = clauseA.type.localeCompare(clauseB.type)
            break
          case 'usageCount':
            comparison = clauseA.usageCount - clauseB.usageCount
            break
          case 'createdAt':
            comparison = new Date(clauseA.createdAt).getTime() - new Date(clauseB.createdAt).getTime()
            break
          case 'favoris':
            comparison = (clauseA.favoris ? 1 : 0) - (clauseB.favoris ? 1 : 0)
            break
        }
      } else {
        const snippetA = a as Snippet
        const snippetB = b as Snippet
        const key = sortKey as SnippetSortKey

        switch (key) {
          case 'nom':
            comparison = snippetA.nom.localeCompare(snippetB.nom)
            break
          case 'raccourci':
            comparison = snippetA.raccourci.localeCompare(snippetB.raccourci)
            break
          case 'category':
            comparison = snippetA.category.localeCompare(snippetB.category)
            break
          case 'usageCount':
            comparison = snippetA.usageCount - snippetB.usageCount
            break
          case 'isBuiltin':
            comparison = (snippetA.isBuiltin ? 1 : 0) - (snippetB.isBuiltin ? 1 : 0)
            break
        }
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [items, sortKey, sortDirection, type])

  // Gestion du tri au clic sur colonne
  const handleSort = (key: ClauseSortKey | SnippetSortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  // Gestion de la sélection
  const handleSelectAll = () => {
    if (selectedIds.length === items.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(items.map((item) => item.id))
    }
  }

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((sid) => sid !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  // Composant d'en-tête de colonne triable
  const SortableHeader = ({
    label,
    sortKeyValue,
    className = '',
  }: {
    label: string
    sortKeyValue: ClauseSortKey | SnippetSortKey
    className?: string
  }) => (
    <th
      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none ${className}`}
      onClick={() => handleSort(sortKeyValue)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortKey === sortKeyValue && (
          <svg
            className={`w-3 h-3 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        )}
      </div>
    </th>
  )

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>Aucun élément trouvé</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {/* Checkbox pour tout sélectionner - HIG compliant touch target */}
            <th className="w-12 px-2 py-3">
              <label className="flex items-center justify-center w-10 h-10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.length === items.length && items.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)] focus:ring-offset-2"
                />
              </label>
            </th>

            {type === 'clause' ? (
              <>
                {/* Favoris */}
                <SortableHeader label="" sortKeyValue="favoris" className="w-10" />
                {/* Titre */}
                <SortableHeader label="Titre" sortKeyValue="titre" />
                {/* Domaine */}
                <SortableHeader label="Domaine" sortKeyValue="domaine" className="w-32" />
                {/* Type */}
                <SortableHeader label="Type" sortKeyValue="type" className="w-32" />
                {/* Usages */}
                <SortableHeader label="Usages" sortKeyValue="usageCount" className="w-20" />
              </>
            ) : (
              <>
                {/* Nom */}
                <SortableHeader label="Nom" sortKeyValue="nom" />
                {/* Raccourci */}
                <SortableHeader label="Raccourci" sortKeyValue="raccourci" className="w-32" />
                {/* Catégorie */}
                <SortableHeader label="Catégorie" sortKeyValue="category" className="w-32" />
                {/* Usages */}
                <SortableHeader label="Usages" sortKeyValue="usageCount" className="w-20" />
                {/* Intégré */}
                <SortableHeader label="Intégré" sortKeyValue="isBuiltin" className="w-20" />
              </>
            )}

            {/* Actions */}
            <th className="w-24 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {sortedItems.map((item) => {
            const isSelected = selectedIds.includes(item.id)
            const isBuiltin = 'isBuiltin' in item && item.isBuiltin

            return (
              <tr
                key={item.id}
                className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  isSelected ? 'bg-[var(--accent)]/5' : ''
                }`}
              >
                {/* Checkbox - HIG compliant touch target */}
                <td className="px-2 py-3">
                  <label className="flex items-center justify-center w-10 h-10 cursor-pointer -m-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectOne(item.id)}
                      className="w-4 h-4 rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)] focus:ring-offset-2"
                    />
                  </label>
                </td>

                {type === 'clause' ? (
                  <>
                    {/* Favoris - HIG compliant touch target */}
                    <td className="px-2 py-3">
                      <button
                        onClick={() => (props as ClauseTableProps).onToggleFavorite?.((item as Clause).id)}
                        className="
                          w-9 h-9 flex items-center justify-center
                          rounded-hig-md
                          text-gray-400 hover:text-yellow-500
                          hover:bg-[var(--bg-hover)]
                          transition-colors duration-fast
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
                        "
                      >
                        {(item as Clause).favoris ? (
                          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        )}
                      </button>
                    </td>
                    {/* Titre */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                          {(item as Clause).titre}
                        </span>
                        {isBuiltin && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 rounded">
                            Intégré
                          </span>
                        )}
                      </div>
                      {(item as Clause).description && (
                        <p className="text-xs text-gray-500 truncate max-w-[300px]">
                          {(item as Clause).description}
                        </p>
                      )}
                    </td>
                    {/* Domaine */}
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {CLAUSE_DOMAINE_LABELS[(item as Clause).domaine as ClauseDomaine]}
                    </td>
                    {/* Type */}
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {CLAUSE_TYPE_LABELS[(item as Clause).type as ClauseType]}
                    </td>
                    {/* Usages */}
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-center">
                      {(item as Clause).usageCount}
                    </td>
                  </>
                ) : (
                  <>
                    {/* Nom */}
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {(item as Snippet).nom}
                      </span>
                      {(item as Snippet).description && (
                        <p className="text-xs text-gray-500 truncate max-w-[300px]">
                          {(item as Snippet).description}
                        </p>
                      )}
                    </td>
                    {/* Raccourci */}
                    <td className="px-4 py-3">
                      <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">
                        {(item as Snippet).raccourci}
                      </code>
                    </td>
                    {/* Catégorie */}
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {SNIPPET_CATEGORY_LABELS[(item as Snippet).category as SnippetCategory]}
                    </td>
                    {/* Usages */}
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-center">
                      {(item as Snippet).usageCount}
                    </td>
                    {/* Intégré */}
                    <td className="px-4 py-3 text-center">
                      {isBuiltin ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30">
                          <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700">
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </span>
                      )}
                    </td>
                  </>
                )}

                {/* Actions - HIG compliant touch targets */}
                <td className="px-2 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(item as any)}
                      className="
                        w-9 h-9 flex items-center justify-center
                        rounded-hig-md
                        hover:bg-[var(--bg-hover)]
                        text-[var(--text-secondary)] hover:text-[var(--accent)]
                        transition-colors duration-fast
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
                      "
                      title="Modifier"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      disabled={isBuiltin}
                      className={`
                        w-9 h-9 flex items-center justify-center
                        rounded-hig-md
                        transition-colors duration-fast
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
                        ${isBuiltin
                          ? 'text-[var(--text-muted)] cursor-not-allowed opacity-50'
                          : 'hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--text-secondary)] hover:text-[var(--status-error)]'
                        }
                      `}
                      title={isBuiltin ? 'Impossible de supprimer un élément intégré' : 'Supprimer'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
