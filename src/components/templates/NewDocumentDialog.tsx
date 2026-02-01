import { useState, useCallback, useEffect } from 'react'
import { TemplateGallery } from './TemplateGallery'
import { useTemplateStore } from '../../store/useTemplateStore'
import type { DocumentTemplate } from '../../types/templates'

interface NewDocumentDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreateDocument: (content: DocumentTemplate['content'], templateName: string) => void
}

export function NewDocumentDialog({
  isOpen,
  onClose,
  onCreateDocument,
}: NewDocumentDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null)
  const templates = useTemplateStore((state) => state.templates)

  // Select the first template by default when dialog opens
  useEffect(() => {
    if (isOpen && !selectedTemplate && templates.length > 0) {
      setSelectedTemplate(templates[0])
    }
  }, [isOpen, selectedTemplate, templates])

  // Reset selection when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedTemplate(null)
    }
  }, [isOpen])

  const handleSelect = useCallback((template: DocumentTemplate) => {
    setSelectedTemplate(template)
  }, [])

  const handleCreate = useCallback(() => {
    if (selectedTemplate) {
      onCreateDocument(selectedTemplate.content, selectedTemplate.name)
      onClose()
    }
  }, [selectedTemplate, onCreateDocument, onClose])

  const handleDoubleClick = useCallback((template: DocumentTemplate) => {
    onCreateDocument(template.content, template.name)
    onClose()
  }, [onCreateDocument, onClose])

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'Enter' && selectedTemplate) {
        handleCreate()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedTemplate, handleCreate, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Nouveau document
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-6">
          <TemplateGallery
            onSelect={handleSelect}
            onDoubleClick={handleDoubleClick}
            selectedTemplateId={selectedTemplate?.id}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {selectedTemplate ? (
              <span>
                Template sélectionné : <strong className="text-gray-700 dark:text-gray-300">{selectedTemplate.name}</strong>
              </span>
            ) : (
              <span>Sélectionnez un template pour commencer</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleCreate}
              disabled={!selectedTemplate}
              className={`
                px-4 py-2 text-sm font-medium rounded-lg transition-colors
                ${selectedTemplate
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Créer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
