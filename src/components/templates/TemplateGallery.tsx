import { useMemo, useState } from 'react'
import { TemplateCard } from './TemplateCard'
import { useTemplateStore } from '../../store/useTemplateStore'
import type { DocumentTemplate, TemplateCategory } from '../../types/templates'
import { TEMPLATE_CATEGORY_LABELS } from '../../types/templates'

interface TemplateGalleryProps {
  onSelect: (template: DocumentTemplate) => void
  onDoubleClick?: (template: DocumentTemplate) => void
  selectedTemplateId?: string
}

const CATEGORY_OPTIONS: Array<{ value: TemplateCategory | 'all'; label: string }> = [
  { value: 'all', label: 'Tous' },
  { value: 'writing', label: TEMPLATE_CATEGORY_LABELS.writing },
  { value: 'business', label: TEMPLATE_CATEGORY_LABELS.business },
  { value: 'academic', label: TEMPLATE_CATEGORY_LABELS.academic },
  { value: 'personal', label: TEMPLATE_CATEGORY_LABELS.personal },
  { value: 'custom', label: TEMPLATE_CATEGORY_LABELS.custom },
]

export function TemplateGallery({
  onSelect,
  onDoubleClick,
  selectedTemplateId,
}: TemplateGalleryProps) {
  const templates = useTemplateStore((state) => state.templates)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all')

  // Filter templates based on search and category
  const filteredTemplates = useMemo(() => {
    let filtered = templates

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.metadata.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [templates, selectedCategory, searchQuery])

  // Group templates by category for display
  const groupedTemplates = useMemo(() => {
    if (selectedCategory !== 'all') {
      return { [selectedCategory]: filteredTemplates }
    }

    return filteredTemplates.reduce((acc, template) => {
      const cat = template.category
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(template)
      return acc
    }, {} as Record<TemplateCategory, DocumentTemplate[]>)
  }, [filteredTemplates, selectedCategory])

  return (
    <div className="flex flex-col h-full">
      {/* Search and filters */}
      <div className="flex flex-col gap-3 mb-4">
        {/* Search input */}
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
            placeholder="Rechercher un template..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 flex-wrap">
          {CATEGORY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedCategory(option.value)}
              className={`
                px-3 py-1.5 text-sm rounded-full transition-colors
                ${selectedCategory === option.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates grid */}
      <div className="flex-1 overflow-y-auto">
        {Object.keys(groupedTemplates).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <svg
              className="w-12 h-12 mb-3 opacity-50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6" />
            </svg>
            <p>Aucun template trouvé</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-blue-500 hover:underline text-sm"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {(Object.entries(groupedTemplates) as Array<[TemplateCategory, DocumentTemplate[]]>).map(
              ([category, categoryTemplates]) => (
                <div key={category}>
                  {selectedCategory === 'all' && (
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
                      {TEMPLATE_CATEGORY_LABELS[category]}
                    </h3>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {categoryTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        isSelected={template.id === selectedTemplateId}
                        onSelect={onSelect}
                        onDoubleClick={onDoubleClick}
                      />
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}
