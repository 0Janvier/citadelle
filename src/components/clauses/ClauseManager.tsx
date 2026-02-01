import { useState, useMemo, useCallback } from 'react'
import { useClauseStore } from '../../store/useClauseStore'
import { useSnippetStore } from '../../store/useSnippetStore'
import { ClauseTable } from './ClauseTable'
import { ClauseFormDialog } from './ClauseFormDialog'
import { SnippetFormDialog } from './SnippetFormDialog'
import type { Clause, ClauseDomaine, ClauseType, Snippet, SnippetCategory } from '../../types/editor-features'
import { CLAUSE_DOMAINE_LABELS, CLAUSE_TYPE_LABELS, SNIPPET_CATEGORY_LABELS } from '../../types/editor-features'
import { useToast } from '../../hooks/useToast'

type ActiveTab = 'clauses' | 'snippets'

export function ClauseManager() {
  const toast = useToast()

  // Stores
  const clauseStore = useClauseStore()
  const snippetStore = useSnippetStore()

  // État local
  const [activeTab, setActiveTab] = useState<ActiveTab>('clauses')
  const [selectedClauseIds, setSelectedClauseIds] = useState<string[]>([])
  const [selectedSnippetIds, setSelectedSnippetIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [domaineFilter, setDomaineFilter] = useState<ClauseDomaine | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ClauseType | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<SnippetCategory | 'all'>('all')

  // États des dialogs
  const [clauseDialogOpen, setClauseDialogOpen] = useState(false)
  const [snippetDialogOpen, setSnippetDialogOpen] = useState(false)
  const [editingClause, setEditingClause] = useState<Clause | undefined>()
  const [editingSnippet, setEditingSnippet] = useState<Snippet | undefined>()

  // Filtrage des clauses
  const filteredClauses = useMemo(() => {
    let result = clauseStore.clauses

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.titre.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query) ||
          c.tags.some((t) => t.toLowerCase().includes(query))
      )
    }

    if (domaineFilter !== 'all') {
      result = result.filter((c) => c.domaine === domaineFilter)
    }

    if (typeFilter !== 'all') {
      result = result.filter((c) => c.type === typeFilter)
    }

    return result
  }, [clauseStore.clauses, searchQuery, domaineFilter, typeFilter])

  // Filtrage des snippets
  const filteredSnippets = useMemo(() => {
    let result = snippetStore.snippets

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (s) =>
          s.nom.toLowerCase().includes(query) ||
          s.raccourci.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query)
      )
    }

    if (categoryFilter !== 'all') {
      result = result.filter((s) => s.category === categoryFilter)
    }

    return result
  }, [snippetStore.snippets, searchQuery, categoryFilter])

  // Handlers pour les clauses
  const handleAddClause = useCallback(() => {
    setEditingClause(undefined)
    setClauseDialogOpen(true)
  }, [])

  const handleEditClause = useCallback((clause: Clause) => {
    setEditingClause(clause)
    setClauseDialogOpen(true)
  }, [])

  const handleSaveClause = useCallback(
    (clauseData: Omit<Clause, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'texteRecherche'>) => {
      if (editingClause) {
        clauseStore.updateClause(editingClause.id, clauseData)
        toast.success('Clause modifiée')
      } else {
        clauseStore.addClause(clauseData)
        toast.success('Clause créée')
      }
    },
    [editingClause, clauseStore, toast]
  )

  const handleDeleteClause = useCallback(
    (id: string) => {
      const clause = clauseStore.clauses.find((c) => c.id === id)
      if (clause?.isBuiltin) {
        toast.error('Impossible de supprimer une clause intégrée')
        return
      }
      if (confirm('Supprimer cette clause ?')) {
        clauseStore.deleteClause(id)
        setSelectedClauseIds((prev) => prev.filter((sid) => sid !== id))
        toast.success('Clause supprimée')
      }
    },
    [clauseStore, toast]
  )

  const handleDeleteSelectedClauses = useCallback(() => {
    const deletableIds = selectedClauseIds.filter((id) => {
      const clause = clauseStore.clauses.find((c) => c.id === id)
      return clause && !clause.isBuiltin
    })

    if (deletableIds.length === 0) {
      toast.error('Aucune clause supprimable sélectionnée')
      return
    }

    if (confirm(`Supprimer ${deletableIds.length} clause(s) ?`)) {
      deletableIds.forEach((id) => clauseStore.deleteClause(id))
      setSelectedClauseIds([])
      toast.success(`${deletableIds.length} clause(s) supprimée(s)`)
    }
  }, [selectedClauseIds, clauseStore, toast])

  // Handlers pour les snippets
  const handleAddSnippet = useCallback(() => {
    setEditingSnippet(undefined)
    setSnippetDialogOpen(true)
  }, [])

  const handleEditSnippet = useCallback((snippet: Snippet) => {
    setEditingSnippet(snippet)
    setSnippetDialogOpen(true)
  }, [])

  const handleSaveSnippet = useCallback(
    (snippetData: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => {
      if (editingSnippet) {
        snippetStore.updateSnippet(editingSnippet.id, snippetData)
        toast.success('Snippet modifié')
      } else {
        snippetStore.addSnippet(snippetData)
        toast.success('Snippet créé')
      }
    },
    [editingSnippet, snippetStore, toast]
  )

  const handleDeleteSnippet = useCallback(
    (id: string) => {
      const snippet = snippetStore.snippets.find((s) => s.id === id)
      if (snippet?.isBuiltin) {
        toast.error('Impossible de supprimer un snippet intégré')
        return
      }
      if (confirm('Supprimer ce snippet ?')) {
        snippetStore.deleteSnippet(id)
        setSelectedSnippetIds((prev) => prev.filter((sid) => sid !== id))
        toast.success('Snippet supprimé')
      }
    },
    [snippetStore, toast]
  )

  const handleDeleteSelectedSnippets = useCallback(() => {
    const deletableIds = selectedSnippetIds.filter((id) => {
      const snippet = snippetStore.snippets.find((s) => s.id === id)
      return snippet && !snippet.isBuiltin
    })

    if (deletableIds.length === 0) {
      toast.error('Aucun snippet supprimable sélectionné')
      return
    }

    if (confirm(`Supprimer ${deletableIds.length} snippet(s) ?`)) {
      deletableIds.forEach((id) => snippetStore.deleteSnippet(id))
      setSelectedSnippetIds([])
      toast.success(`${deletableIds.length} snippet(s) supprimé(s)`)
    }
  }, [selectedSnippetIds, snippetStore, toast])

  // Changer d'onglet
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab)
    setSearchQuery('')
    setSelectedClauseIds([])
    setSelectedSnippetIds([])
  }

  return (
    <div className="flex flex-col h-full">
      {/* Onglets et bouton Ajouter */}
      <div className="flex items-center justify-between mb-4">
        {/* Onglets */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <button
            onClick={() => handleTabChange('clauses')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'clauses'
                ? 'bg-white dark:bg-gray-700 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Clauses ({clauseStore.clauses.length})
          </button>
          <button
            onClick={() => handleTabChange('snippets')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'snippets'
                ? 'bg-white dark:bg-gray-700 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Snippets ({snippetStore.snippets.length})
          </button>
        </div>

        {/* Bouton Ajouter */}
        <button
          onClick={activeTab === 'clauses' ? handleAddClause : handleAddSnippet}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter
        </button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex items-center gap-3 mb-4">
        {/* Recherche */}
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Rechercher ${activeTab === 'clauses' ? 'une clause' : 'un snippet'}...`}
            className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)]"
          />
        </div>

        {/* Filtres pour clauses */}
        {activeTab === 'clauses' && (
          <>
            <select
              value={domaineFilter}
              onChange={(e) => setDomaineFilter(e.target.value as ClauseDomaine | 'all')}
              className="px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
            >
              <option value="all">Tous les domaines</option>
              {Object.entries(CLAUSE_DOMAINE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ClauseType | 'all')}
              className="px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
            >
              <option value="all">Tous les types</option>
              {Object.entries(CLAUSE_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </>
        )}

        {/* Filtres pour snippets */}
        {activeTab === 'snippets' && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as SnippetCategory | 'all')}
            className="px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
          >
            <option value="all">Toutes les catégories</option>
            {Object.entries(SNIPPET_CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Actions groupées */}
      {((activeTab === 'clauses' && selectedClauseIds.length > 0) ||
        (activeTab === 'snippets' && selectedSnippetIds.length > 0)) && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {activeTab === 'clauses'
              ? `${selectedClauseIds.length} clause(s) sélectionnée(s)`
              : `${selectedSnippetIds.length} snippet(s) sélectionné(s)`}
          </span>
          <button
            onClick={activeTab === 'clauses' ? handleDeleteSelectedClauses : handleDeleteSelectedSnippets}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Supprimer la sélection
          </button>
        </div>
      )}

      {/* Tableau */}
      <div className="flex-1 overflow-hidden border border-[var(--border)] rounded-lg">
        {activeTab === 'clauses' ? (
          <ClauseTable
            items={filteredClauses}
            type="clause"
            selectedIds={selectedClauseIds}
            onSelectionChange={setSelectedClauseIds}
            onEdit={handleEditClause}
            onDelete={handleDeleteClause}
            onToggleFavorite={clauseStore.toggleFavorite}
          />
        ) : (
          <ClauseTable
            items={filteredSnippets}
            type="snippet"
            selectedIds={selectedSnippetIds}
            onSelectionChange={setSelectedSnippetIds}
            onEdit={handleEditSnippet}
            onDelete={handleDeleteSnippet}
          />
        )}
      </div>

      {/* Statistiques */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
        <span>
          {activeTab === 'clauses'
            ? `${filteredClauses.length} clause(s) affichée(s) sur ${clauseStore.clauses.length}`
            : `${filteredSnippets.length} snippet(s) affiché(s) sur ${snippetStore.snippets.length}`}
        </span>
        <span>
          {activeTab === 'clauses'
            ? `${clauseStore.clauses.filter((c) => c.isBuiltin).length} intégrée(s)`
            : `${snippetStore.snippets.filter((s) => s.isBuiltin).length} intégré(s)`}
        </span>
      </div>

      {/* Dialogs */}
      <ClauseFormDialog
        isOpen={clauseDialogOpen}
        onClose={() => setClauseDialogOpen(false)}
        clause={editingClause}
        onSave={handleSaveClause}
      />

      <SnippetFormDialog
        isOpen={snippetDialogOpen}
        onClose={() => setSnippetDialogOpen(false)}
        snippet={editingSnippet}
        onSave={handleSaveSnippet}
        existingRaccourcis={snippetStore.getAllRaccourcis()}
      />
    </div>
  )
}
