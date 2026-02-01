import { useState, useRef, useEffect, useMemo } from 'react'
import type { Editor } from '@tiptap/react'
import { useStyleStore } from '../../store/useStyleStore'
import { STYLE_CATEGORY_LABELS, type StyleCategory } from '../../types/templates'

interface StylePickerProps {
  editor: Editor | null
}

export function StylePicker({ editor }: StylePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const styles = useStyleStore((state) => state.styles)
  const activeStyleId = useStyleStore((state) => state.activeStyleId)
  const recentStyles = useStyleStore((state) => state.recentStyles)
  const applyStyle = useStyleStore((state) => state.applyStyle)
  const getStyleForSelection = useStyleStore((state) => state.getStyleForSelection)
  const setActiveStyleId = useStyleStore((state) => state.setActiveStyleId)

  // Get current style from selection
  useEffect(() => {
    if (editor) {
      const updateStyle = () => {
        const style = getStyleForSelection(editor)
        setActiveStyleId(style?.id || null)
      }

      editor.on('selectionUpdate', updateStyle)
      editor.on('transaction', updateStyle)

      return () => {
        editor.off('selectionUpdate', updateStyle)
        editor.off('transaction', updateStyle)
      }
    }
  }, [editor, getStyleForSelection, setActiveStyleId])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Group styles by category
  const groupedStyles = useMemo(() => {
    return styles.reduce((acc, style) => {
      const cat = style.category
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(style)
      return acc
    }, {} as Record<StyleCategory, typeof styles>)
  }, [styles])

  // Get recent styles objects
  const recentStyleObjects = useMemo(() => {
    return recentStyles
      .map((id) => styles.find((s) => s.id === id))
      .filter(Boolean)
      .slice(0, 3)
  }, [recentStyles, styles])

  const activeStyle = styles.find((s) => s.id === activeStyleId)
  const displayName = activeStyle?.name || 'Corps de texte'

  const handleSelectStyle = (styleId: string) => {
    if (editor) {
      applyStyle(editor, styleId)
    }
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-w-[140px]"
      >
        <span className="truncate flex-1 text-left">{displayName}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 max-h-[400px] overflow-y-auto">
          {/* Recent styles */}
          {recentStyleObjects.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">
                Récents
              </div>
              {recentStyleObjects.map((style) => style && (
                <button
                  key={style.id}
                  onClick={() => handleSelectStyle(style.id)}
                  className={`
                    w-full px-3 py-2 text-left text-sm flex items-center justify-between
                    ${activeStyleId === style.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <span>{style.name}</span>
                  {style.shortcut && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {style.shortcut.replace('Mod', '⌘')}
                    </span>
                  )}
                </button>
              ))}
              <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
            </>
          )}

          {/* Grouped styles */}
          {(Object.entries(groupedStyles) as Array<[StyleCategory, typeof styles]>).map(
            ([category, categoryStyles]) => (
              <div key={category}>
                <div className="px-3 py-1.5 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">
                  {STYLE_CATEGORY_LABELS[category]}
                </div>
                {categoryStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => handleSelectStyle(style.id)}
                    className={`
                      w-full px-3 py-2 text-left text-sm flex items-center justify-between
                      ${activeStyleId === style.id
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <span
                      style={{
                        fontWeight: style.formatting.fontWeight || '400',
                        fontStyle: style.formatting.fontStyle || 'normal',
                        fontSize: style.nodeType === 'heading' ? '1em' : undefined,
                      }}
                    >
                      {style.name}
                    </span>
                    {style.shortcut && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {style.shortcut.replace('Mod', '⌘')}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
