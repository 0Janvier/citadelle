import { useMemo, useState } from 'react'
import type { Editor } from '@tiptap/react'
import { useStyleStore } from '../../store/useStyleStore'
import { STYLE_CATEGORY_LABELS, type StyleCategory, type TextStyle } from '../../types/templates'

interface StylePanelProps {
  editor: Editor | null
  isOpen: boolean
  onClose: () => void
  onEditStyle?: (style: TextStyle) => void
  onCreateStyle?: () => void
}

export function StylePanel({
  editor,
  isOpen,
  onClose,
  onEditStyle,
  onCreateStyle,
}: StylePanelProps) {
  const styles = useStyleStore((state) => state.styles)
  const activeStyleId = useStyleStore((state) => state.activeStyleId)
  const applyStyle = useStyleStore((state) => state.applyStyle)
  const duplicateStyle = useStyleStore((state) => state.duplicateStyle)
  const removeStyle = useStyleStore((state) => state.removeStyle)

  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<StyleCategory>>(
    new Set(['headings', 'body', 'blocks'])
  )

  // Filter styles
  const filteredStyles = useMemo(() => {
    if (!searchQuery) return styles

    const query = searchQuery.toLowerCase()
    return styles.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query)
    )
  }, [styles, searchQuery])

  // Group styles by category
  const groupedStyles = useMemo(() => {
    return filteredStyles.reduce((acc, style) => {
      const cat = style.category
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(style)
      return acc
    }, {} as Record<StyleCategory, typeof styles>)
  }, [filteredStyles])

  const toggleCategory = (category: StyleCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const handleApplyStyle = (styleId: string) => {
    if (editor) {
      applyStyle(editor, styleId)
    }
  }

  const handleDuplicateStyle = async (style: TextStyle) => {
    try {
      await duplicateStyle(style.id)
    } catch (err) {
      console.error('Failed to duplicate style:', err)
    }
  }

  const handleDeleteStyle = async (style: TextStyle) => {
    if (style.isBuiltin) return

    if (confirm(`Supprimer le style "${style.name}" ?`)) {
      try {
        await removeStyle(style.id)
      } catch (err) {
        console.error('Failed to delete style:', err)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-lg z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">Styles</h2>
        <div className="flex items-center gap-2">
          {onCreateStyle && (
            <button
              onClick={onCreateStyle}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Nouveau style"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Styles list */}
      <div className="flex-1 overflow-y-auto">
        {Object.keys(groupedStyles).length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Aucun style trouvé
          </div>
        ) : (
          (Object.entries(groupedStyles) as Array<[StyleCategory, TextStyle[]]>).map(
            ([category, categoryStyles]) => (
              <div key={category} className="border-b border-gray-100 dark:border-gray-800">
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-4 py-2 flex items-center justify-between text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <span>{STYLE_CATEGORY_LABELS[category]}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${expandedCategories.has(category) ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {/* Category styles */}
                {expandedCategories.has(category) && (
                  <div className="pb-2">
                    {categoryStyles.map((style) => (
                      <div
                        key={style.id}
                        className={`
                          group px-4 py-2 flex items-center gap-3 cursor-pointer
                          ${activeStyleId === style.id
                            ? 'bg-blue-50 dark:bg-blue-900/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          }
                        `}
                        onClick={() => handleApplyStyle(style.id)}
                      >
                        {/* Style preview */}
                        <div className="flex-1 min-w-0">
                          <div
                            className={`truncate ${
                              activeStyleId === style.id
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-900 dark:text-gray-100'
                            }`}
                            style={{
                              fontWeight: style.formatting.fontWeight || '400',
                              fontStyle: style.formatting.fontStyle || 'normal',
                            }}
                          >
                            {style.name}
                          </div>
                          {style.shortcut && (
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              {style.shortcut.replace('Mod', '⌘')}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onEditStyle && !style.isBuiltin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onEditStyle(style)
                              }}
                              className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                              title="Modifier"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDuplicateStyle(style)
                            }}
                            className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                            title="Dupliquer"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                          </button>
                          {!style.isBuiltin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteStyle(style)
                              }}
                              className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                              title="Supprimer"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          )}
                        </div>

                        {/* Builtin badge */}
                        {style.isBuiltin && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            Intégré
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          )
        )}
      </div>
    </div>
  )
}
