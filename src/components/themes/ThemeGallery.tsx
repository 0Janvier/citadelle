import { memo } from 'react'
import { useThemeStore } from '../../store/useThemeStore'
import type { InterfaceTheme } from '../../types/templates'

interface ThemeGalleryProps {
  onEditTheme?: (theme: InterfaceTheme) => void
}

function ThemeCardComponent({
  theme,
  isActive,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  theme: InterfaceTheme
  isActive: boolean
  onSelect: () => void
  onEdit?: () => void
  onDuplicate: () => void
  onDelete?: () => void
}) {
  return (
    <div
      className={`
        group relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all
        ${isActive
          ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }
      `}
      onClick={onSelect}
    >
      {/* Theme preview */}
      <div
        className="h-24 p-3 flex flex-col"
        style={{ backgroundColor: theme.colors.bg }}
      >
        {/* Mini toolbar */}
        <div
          className="h-3 rounded-sm mb-2"
          style={{ backgroundColor: theme.colors.bgSecondary }}
        />

        {/* Content preview */}
        <div className="flex-1 flex gap-2">
          {/* Sidebar */}
          <div
            className="w-8 rounded-sm"
            style={{ backgroundColor: theme.colors.bgSecondary }}
          />
          {/* Editor area */}
          <div className="flex-1 flex flex-col gap-1 p-1">
            <div
              className="h-2 w-3/4 rounded-sm"
              style={{ backgroundColor: theme.colors.text, opacity: 0.8 }}
            />
            <div
              className="h-1.5 w-full rounded-sm"
              style={{ backgroundColor: theme.colors.textSecondary, opacity: 0.5 }}
            />
            <div
              className="h-1.5 w-5/6 rounded-sm"
              style={{ backgroundColor: theme.colors.textSecondary, opacity: 0.5 }}
            />
            <div
              className="h-1.5 w-4/6 rounded-sm mt-1"
              style={{ backgroundColor: theme.colors.accent, opacity: 0.7 }}
            />
          </div>
        </div>
      </div>

      {/* Theme info */}
      <div className="px-3 py-2 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {theme.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {theme.base === 'dark' ? 'Sombre' : 'Clair'}
            </p>
          </div>

          {isActive && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
              Actif
            </span>
          )}
        </div>
      </div>

      {/* Hover actions */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && !theme.isBuiltin && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="p-1.5 rounded-lg bg-white dark:bg-gray-800 shadow-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
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
            onDuplicate()
          }}
          className="p-1.5 rounded-lg bg-white dark:bg-gray-800 shadow-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          title="Dupliquer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
        {onDelete && !theme.isBuiltin && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="p-1.5 rounded-lg bg-white dark:bg-gray-800 shadow-md text-gray-600 dark:text-gray-400 hover:text-red-500"
            title="Supprimer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        )}
      </div>

      {/* Builtin badge */}
      {theme.isBuiltin && (
        <div className="absolute top-2 left-2">
          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">
            Intégré
          </span>
        </div>
      )}
    </div>
  )
}

const ThemeCard = memo(ThemeCardComponent)

export function ThemeGallery({ onEditTheme }: ThemeGalleryProps) {
  const themes = useThemeStore((state) => state.themes)
  const activeThemeId = useThemeStore((state) => state.activeThemeId)
  const setActiveTheme = useThemeStore((state) => state.setActiveTheme)
  const duplicateThemeAction = useThemeStore((state) => state.duplicateThemeAction)
  const removeTheme = useThemeStore((state) => state.removeTheme)

  const handleDuplicate = async (theme: InterfaceTheme) => {
    try {
      await duplicateThemeAction(theme.id)
    } catch (err) {
      console.error('Failed to duplicate theme:', err)
    }
  }

  const handleDelete = async (theme: InterfaceTheme) => {
    if (confirm(`Supprimer le thème "${theme.name}" ?`)) {
      try {
        await removeTheme(theme.id)
      } catch (err) {
        console.error('Failed to delete theme:', err)
      }
    }
  }

  // Group themes: builtin first, then custom
  const builtinThemes = themes.filter((t) => t.isBuiltin)
  const customThemes = themes.filter((t) => !t.isBuiltin)

  return (
    <div className="space-y-6">
      {/* Builtin themes */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
          Thèmes intégrés
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {builtinThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isActive={theme.id === activeThemeId}
              onSelect={() => setActiveTheme(theme.id)}
              onDuplicate={() => handleDuplicate(theme)}
            />
          ))}
        </div>
      </div>

      {/* Custom themes */}
      {customThemes.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
            Thèmes personnalisés
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {customThemes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isActive={theme.id === activeThemeId}
                onSelect={() => setActiveTheme(theme.id)}
                onEdit={onEditTheme ? () => onEditTheme(theme) : undefined}
                onDuplicate={() => handleDuplicate(theme)}
                onDelete={() => handleDelete(theme)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
