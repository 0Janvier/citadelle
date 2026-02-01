// LibraryItemCard - Carte d'affichage d'un élément de bibliothèque

import { useState } from 'react'
import type { LibraryItem, LibraryCategory } from '../../types/library'
import { ITEM_TYPE_LABELS } from '../../types/library'

interface LibraryItemCardProps {
  item: LibraryItem
  category?: LibraryCategory
  viewMode: 'grid' | 'list'
  isSelected: boolean
  insertMode?: boolean
  onSelect: (selected: boolean) => void
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  onToggleFavorite: () => void
  onInsert: () => void
}

export function LibraryItemCard({
  item,
  category,
  viewMode,
  isSelected,
  insertMode = false,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleFavorite,
  onInsert,
}: LibraryItemCardProps) {
  const [expanded, setExpanded] = useState(false)

  // Extraire un aperçu du contenu
  const getPreview = () => {
    if (typeof item.content === 'string') {
      return item.content.slice(0, 200) + (item.content.length > 200 ? '...' : '')
    }
    // Pour JSONContent, utiliser searchText
    return item.searchText.slice(0, 200) + (item.searchText.length > 200 ? '...' : '')
  }

  const isBuiltin = item.source === 'builtin'
  const isModified = item.source === 'modified-builtin'

  if (viewMode === 'list') {
    return (
      <div
        className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
          isSelected
            ? 'border-[var(--accent)] bg-[var(--accent)]/5'
            : 'border-[var(--border)] hover:border-gray-300 dark:hover:border-gray-600'
        }`}
      >
        {/* Checkbox */}
        {!insertMode && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="rounded"
          />
        )}

        {/* Favori */}
        <button
          onClick={onToggleFavorite}
          className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
            item.isFavorite ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'
          }`}
        >
          <svg className="w-4 h-4" fill={item.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>

        {/* Type badge */}
        <span
          className={`px-2 py-0.5 text-xs rounded-full ${
            item.type === 'clause'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
          }`}
        >
          {ITEM_TYPE_LABELS[item.type]}
        </span>

        {/* Titre et raccourci */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{item.title}</span>
            {item.shortcut && (
              <code className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded">
                {item.shortcut}
              </code>
            )}
            {isBuiltin && (
              <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded">
                Intégré
              </span>
            )}
            {isModified && (
              <span className="px-1.5 py-0.5 text-xs bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 rounded">
                Modifié
              </span>
            )}
          </div>
          {item.description && (
            <p className="text-sm text-gray-500 truncate">{item.description}</p>
          )}
        </div>

        {/* Catégorie */}
        {category && (
          <span
            className="px-2 py-1 text-xs rounded"
            style={{ backgroundColor: category.color + '20', color: category.color }}
          >
            {category.name}
          </span>
        )}

        {/* Usage */}
        <span className="text-sm text-gray-400">{item.usageCount} utilisations</span>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {insertMode ? (
            <button
              onClick={onInsert}
              className="px-3 py-1.5 text-sm bg-[var(--accent)] text-white rounded-lg hover:opacity-90"
            >
              Insérer
            </button>
          ) : (
            <>
              <button
                onClick={onEdit}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Modifier"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={onDuplicate}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Dupliquer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              {!isBuiltin && (
                <button
                  onClick={onDelete}
                  className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                  title="Supprimer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  // Vue grille
  return (
    <div
      className={`flex flex-col rounded-lg border transition-colors ${
        isSelected
          ? 'border-[var(--accent)] bg-[var(--accent)]/5'
          : 'border-[var(--border)] hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      {/* En-tête */}
      <div className="flex items-start justify-between p-3 border-b border-[var(--border)]">
        <div className="flex items-start gap-2 min-w-0">
          {!insertMode && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              className="rounded mt-1"
            />
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  item.type === 'clause'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                }`}
              >
                {ITEM_TYPE_LABELS[item.type]}
              </span>
              {isBuiltin && (
                <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded">
                  Intégré
                </span>
              )}
              {isModified && (
                <span className="px-1.5 py-0.5 text-xs bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 rounded">
                  Modifié
                </span>
              )}
            </div>
            <h3 className="font-medium mt-1 truncate">{item.title}</h3>
            {item.shortcut && (
              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                {item.shortcut}
              </code>
            )}
          </div>
        </div>

        <button
          onClick={onToggleFavorite}
          className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
            item.isFavorite ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'
          }`}
        >
          <svg className="w-5 h-5" fill={item.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      </div>

      {/* Contenu */}
      <div className="p-3 flex-1">
        {item.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.description}</p>
        )}
        <div
          className={`text-sm text-gray-500 ${expanded ? '' : 'line-clamp-3'}`}
          onClick={() => setExpanded(!expanded)}
        >
          <pre className="whitespace-pre-wrap font-sans">{getPreview()}</pre>
        </div>
        {item.searchText.length > 200 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-[var(--accent)] mt-1"
          >
            {expanded ? 'Voir moins' : 'Voir plus'}
          </button>
        )}
      </div>

      {/* Tags et catégorie */}
      <div className="px-3 pb-2 flex flex-wrap gap-1">
        {category && (
          <span
            className="px-2 py-0.5 text-xs rounded"
            style={{ backgroundColor: category.color + '20', color: category.color }}
          >
            {category.name}
          </span>
        )}
        {item.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded">
            {tag}
          </span>
        ))}
        {item.tags.length > 3 && (
          <span className="text-xs text-gray-400">+{item.tags.length - 3}</span>
        )}
      </div>

      {/* Variables pour snippets */}
      {item.type === 'snippet' && item.variables.length > 0 && (
        <div className="px-3 pb-2">
          <span className="text-xs text-gray-400">
            Variables: {item.variables.map((v) => `{{${v}}}`).join(', ')}
          </span>
        </div>
      )}

      {/* Pied de carte */}
      <div className="flex items-center justify-between p-3 border-t border-[var(--border)] bg-gray-50 dark:bg-gray-800/50">
        <span className="text-xs text-gray-400">{item.usageCount} utilisations</span>

        <div className="flex items-center gap-1">
          {insertMode ? (
            <button
              onClick={onInsert}
              className="px-3 py-1.5 text-sm bg-[var(--accent)] text-white rounded-lg hover:opacity-90"
            >
              Insérer
            </button>
          ) : (
            <>
              <button
                onClick={onEdit}
                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Modifier"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={onDuplicate}
                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Dupliquer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              {!isBuiltin && (
                <button
                  onClick={onDelete}
                  className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500"
                  title="Supprimer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
