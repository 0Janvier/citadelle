import { useState, useMemo } from 'react'
import { useEditorStore } from '../../store/useEditorStore'
import {
  searchAllCodes,
  getArticlesByCode,
  formatArticleForInsertion,
  getLegifranceSearchUrl,
  getLegifranceCodeUrl,
  CODE_LABELS,
  CODE_FULL_NAMES,
  type CodeType,
  type Article,
} from '../../data/codes'

interface CodeBrowserProps {
  onClose?: () => void
}

export function CodeBrowser({ onClose }: CodeBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCode, setSelectedCode] = useState<CodeType | 'all'>('all')
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null)

  const activeEditor = useEditorStore((state) => state.activeEditor)

  // Recherche et filtrage
  const articles = useMemo(() => {
    if (searchQuery.trim()) {
      const results = searchAllCodes(searchQuery)
      if (selectedCode !== 'all') {
        return results.filter((r) => r.code === selectedCode)
      }
      return results
    }

    if (selectedCode !== 'all') {
      return getArticlesByCode(selectedCode).map((a) => ({ ...a, code: selectedCode }))
    }

    return []
  }, [searchQuery, selectedCode])

  const handleInsertArticle = (article: Article & { code: CodeType }) => {
    if (!activeEditor) return

    const text = formatArticleForInsertion(article, article.code)
    activeEditor.chain().focus().insertContent(text).run()
    onClose?.()
  }

  const handleCopyArticle = async (article: Article & { code: CodeType }) => {
    const text = formatArticleForInsertion(article, article.code)
    await navigator.clipboard.writeText(text)
  }

  const handleSearchLegifrance = () => {
    const url = getLegifranceSearchUrl(searchQuery, selectedCode === 'all' ? undefined : selectedCode)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleOpenCodeOnLegifrance = (code: CodeType) => {
    const url = getLegifranceCodeUrl(code)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* En-tête */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
        <h2 className="text-lg font-semibold">Codes juridiques</h2>
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

      {/* Recherche et filtres */}
      <div className="p-4 space-y-3 border-b border-[var(--border-color)]">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un article (ex: 1240, L231-1, 121-3...)"
            className="w-full px-4 py-2 pl-10 pr-12 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
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
          {/* Bouton Légifrance */}
          {searchQuery.trim() && (
            <button
              onClick={handleSearchLegifrance}
              title="Rechercher sur Légifrance"
              className="absolute right-2 top-1.5 p-1.5 rounded-md bg-[var(--accent)] text-white hover:opacity-90 transition-colors"
            >
              <LegifranceIcon />
            </button>
          )}
        </div>

        {/* Filtres par code */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCode('all')}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              selectedCode === 'all'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-secondary)] hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Tous
          </button>
          {(Object.entries(CODE_LABELS) as [CodeType, string][]).map(([code, label]) => (
            <button
              key={code}
              onClick={() => setSelectedCode(code)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                selectedCode === code
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg-secondary)] hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Accès rapide Légifrance */}
        <div className="pt-2 border-t border-[var(--border-color)]">
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <LegifranceIcon className="w-3 h-3" />
            Consulter sur Légifrance :
          </p>
          <div className="flex flex-wrap gap-1">
            {(Object.entries(CODE_FULL_NAMES) as [CodeType, string][]).map(([code, name]) => (
              <button
                key={code}
                onClick={() => handleOpenCodeOnLegifrance(code)}
                className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 transition-colors"
                title={`Ouvrir ${name} sur Légifrance`}
              >
                {CODE_LABELS[code]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des articles */}
      <div className="flex-1 overflow-y-auto p-4">
        {!searchQuery && selectedCode === 'all' ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="font-medium">Recherchez un article ou sélectionnez un code</p>
            <p className="text-sm mt-1">Tapez un numéro d'article ou un mot-clé</p>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-left">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Codes disponibles :</p>
              <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                <li>• Code civil - Contrats, responsabilité, propriété</li>
                <li>• Code de procédure civile - Procédures, délais</li>
                <li>• CRPA - Relations avec l'administration</li>
                <li>• Code pénal - Infractions, sanctions</li>
                <li>• Code du travail - Contrats, licenciement, durée</li>
                <li>• Code de commerce - Baux, sociétés, procédures</li>
                <li>• Code de la consommation - Clauses, rétractation</li>
              </ul>
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">Aucun article trouvé dans la base locale</p>
            <button
              onClick={handleSearchLegifrance}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-colors"
            >
              <LegifranceIcon />
              Rechercher sur Légifrance
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map((article) => {
              const isExpanded = expandedArticle === `${article.code}-${article.numero}`

              return (
                <div
                  key={`${article.code}-${article.numero}`}
                  className="border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] overflow-hidden"
                >
                  {/* En-tête de l'article */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                            Art. {article.numero}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getCodeBadgeColor(article.code)}`}>
                            {CODE_LABELS[article.code]}
                          </span>
                        </div>
                        {article.titre && (
                          <h4 className="font-medium mt-1">{article.titre}</h4>
                        )}
                      </div>
                    </div>

                    {/* Extrait ou contenu complet */}
                    <div className="mt-2">
                      <p className={`text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line ${
                        !isExpanded && article.contenu.length > 200 ? 'line-clamp-3' : ''
                      }`}>
                        {article.contenu}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-color)] bg-[var(--bg-primary)]">
                    {article.contenu.length > 200 && (
                      <button
                        onClick={() => setExpandedArticle(
                          isExpanded ? null : `${article.code}-${article.numero}`
                        )}
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
                        {isExpanded ? 'Réduire' : 'Voir plus'}
                      </button>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => handleCopyArticle(article)}
                        className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-1"
                        title="Copier l'article formaté"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copier
                      </button>
                      <button
                        onClick={() => handleInsertArticle(article)}
                        className="px-3 py-1.5 text-sm bg-[var(--accent)] text-white rounded-lg hover:opacity-90 flex items-center gap-1"
                        title="Insérer dans le document"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Insérer
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pied de page */}
      <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {articles.length > 0
              ? `${articles.length} article${articles.length > 1 ? 's' : ''} trouvé${articles.length > 1 ? 's' : ''}`
              : 'Base locale'
            }
          </span>
          <button
            onClick={() => window.open('https://www.legifrance.gouv.fr', '_blank', 'noopener,noreferrer')}
            className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            <LegifranceIcon className="w-4 h-4" />
            Légifrance
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// Couleurs des badges par code
function getCodeBadgeColor(code: CodeType): string {
  switch (code) {
    case 'civil':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
    case 'cpc':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
    case 'crpa':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
    case 'penal':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    case 'travail':
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
    case 'commerce':
      return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
    case 'consommation':
      return 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
  }
}

// Icône Légifrance (République française)
function LegifranceIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      {/* Marianne simplifiée / symbole RF */}
      <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4zm0 2.18l6 3v5.82c0 4.53-3.13 8.79-6 9.82-2.87-1.03-6-5.29-6-9.82V7.18l6-3z" />
      <text x="12" y="15" textAnchor="middle" fontSize="7" fontWeight="bold" fontFamily="serif">RF</text>
    </svg>
  )
}
