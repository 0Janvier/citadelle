import { memo } from 'react'
import type { DocumentTemplate } from '../../types/templates'
import { TEMPLATE_CATEGORY_LABELS } from '../../types/templates'

interface TemplateCardProps {
  template: DocumentTemplate
  isSelected?: boolean
  onSelect: (template: DocumentTemplate) => void
  onDoubleClick?: (template: DocumentTemplate) => void
}

// Icon mapping for templates
const TEMPLATE_ICONS: Record<string, string> = {
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6',
  newspaper: 'M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2 M2 20a2 2 0 0 0 2 2h2V6 M10 8h6 M10 12h6 M10 16h3',
  'clipboard-list': 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2 M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2 M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 M12 11h4 M12 16h4 M8 11h.01 M8 16h.01',
  clipboard: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2 M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z',
  envelope: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  'book-open': 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
  'check-square': 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
}

function TemplateCardComponent({
  template,
  isSelected = false,
  onSelect,
  onDoubleClick,
}: TemplateCardProps) {
  const iconPath = TEMPLATE_ICONS[template.icon] || TEMPLATE_ICONS.file

  return (
    <button
      onClick={() => onSelect(template)}
      onDoubleClick={() => onDoubleClick?.(template)}
      className={`
        group relative flex flex-col items-start p-4 rounded-lg border-2 text-left
        transition-all duration-150 hover:shadow-md
        ${isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
        }
      `}
    >
      {/* Icon */}
      <div
        className={`
          w-10 h-10 rounded-lg flex items-center justify-center mb-3
          ${isSelected
            ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
          }
        `}
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={iconPath} />
        </svg>
      </div>

      {/* Title */}
      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
        {template.name}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
        {template.description}
      </p>

      {/* Category badge */}
      <span
        className={`
          text-xs px-2 py-0.5 rounded-full
          ${isSelected
            ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }
        `}
      >
        {TEMPLATE_CATEGORY_LABELS[template.category]}
      </span>

      {/* Builtin badge */}
      {template.isBuiltin && (
        <span className="absolute top-2 right-2 text-xs text-gray-400 dark:text-gray-500">
          Intégré
        </span>
      )}

      {/* Custom badge */}
      {template.isCustom && (
        <span className="absolute top-2 right-2 text-xs text-purple-500 dark:text-purple-400">
          Personnalisé
        </span>
      )}
    </button>
  )
}

export const TemplateCard = memo(TemplateCardComponent)
