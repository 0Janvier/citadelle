import { useState, useCallback } from 'react'
import { useTemplateStore } from '../../store/useTemplateStore'
import { useDocumentStore } from '../../store/useDocumentStore'
import type { DocumentTemplate, TemplateCategory } from '../../types/templates'
import { TEMPLATE_CATEGORY_LABELS } from '../../types/templates'
import { TemplateEditor } from './TemplateEditor'

interface TemplateManagerProps {
  onBack: () => void
  onClose: () => void
}

const CATEGORY_FILTERS: Array<{ value: TemplateCategory | 'all'; label: string }> = [
  { value: 'all', label: 'Tous' },
  { value: 'legal', label: 'Juridique' },
  { value: 'writing', label: 'Rédaction' },
  { value: 'business', label: 'Professionnel' },
  { value: 'custom', label: 'Personnalisé' },
]

export function TemplateManager({ onBack, onClose }: TemplateManagerProps) {
  const templates = useTemplateStore((state) => state.templates)
  const removeTemplate = useTemplateStore((state) => state.removeTemplate)
  const duplicateTemplateAction = useTemplateStore((state) => state.duplicateTemplateAction)
  const addDocument = useDocumentStore((state) => state.addDocument)

  const [filter, setFilter] = useState<TemplateCategory | 'all'>('all')
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filtered = filter === 'all'
    ? templates
    : templates.filter((t) => t.category === filter)

  const handleDuplicate = useCallback(async (template: DocumentTemplate) => {
    try {
      await duplicateTemplateAction(template.id, `${template.name} (copie)`)
    } catch (err) {
      console.error('Failed to duplicate template:', err)
    }
  }, [duplicateTemplateAction])

  const handleDelete = useCallback(async (id: string) => {
    try {
      await removeTemplate(id)
      setConfirmDelete(null)
    } catch (err) {
      console.error('Failed to delete template:', err)
    }
  }, [removeTemplate])

  const handleEditMetadata = useCallback((template: DocumentTemplate) => {
    setEditingTemplate(template)
    setShowEditor(true)
  }, [])

  const handleEditContent = useCallback((template: DocumentTemplate) => {
    // Open template content as a new document in the editor
    addDocument({
      title: `[Modèle] ${template.name}`,
      content: template.content,
      metadata: {
        templateId: template.id,
        documentType: 'autre',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      },
    })
    onClose()
  }, [addDocument, onClose])

  const handleCreateNew = useCallback(() => {
    setEditingTemplate(null)
    setShowEditor(true)
  }, [])

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Gérer les modèles
            </h2>
          </div>
          <button
            onClick={handleCreateNew}
            className="px-3 py-1.5 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Nouveau modèle
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-1 px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          {CATEGORY_FILTERS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                filter === opt.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Template list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <p>Aucun modèle dans cette catégorie</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium truncate">{template.name}</h4>
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex-shrink-0">
                        {TEMPLATE_CATEGORY_LABELS[template.category]}
                      </span>
                      {template.isBuiltin && (
                        <span className="px-1.5 py-0.5 text-[10px] rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex-shrink-0">
                          Intégré
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {template.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Duplicate — always available */}
                    <button
                      onClick={() => handleDuplicate(template)}
                      title="Dupliquer"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                    </button>

                    {/* Edit metadata — custom only */}
                    {!template.isBuiltin && (
                      <button
                        onClick={() => handleEditMetadata(template)}
                        title="Modifier les propriétés"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    )}

                    {/* Edit content — custom only */}
                    {!template.isBuiltin && (
                      <button
                        onClick={() => handleEditContent(template)}
                        title="Modifier le contenu"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <path d="M14 2v6h6" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <line x1="10" y1="9" x2="8" y2="9" />
                        </svg>
                      </button>
                    )}

                    {/* Delete — custom only */}
                    {!template.isBuiltin && (
                      <>
                        {confirmDelete === template.id ? (
                          <div className="flex items-center gap-1 ml-1">
                            <button
                              onClick={() => handleDelete(template.id)}
                              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                              Supprimer
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                              Non
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(template.id)}
                            title="Supprimer"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400">
          Les modèles intégrés ne peuvent pas être modifiés. Dupliquez-les pour créer une version personnalisée.
          Utilisez <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Cmd+Shift+T</kbd> pour sauvegarder le document actuel comme modèle.
        </div>
      </div>

      {/* Template metadata editor */}
      <TemplateEditor
        template={editingTemplate ?? undefined}
        isOpen={showEditor}
        onClose={() => {
          setShowEditor(false)
          setEditingTemplate(null)
        }}
      />
    </>
  )
}
