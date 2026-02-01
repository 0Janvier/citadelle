import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ModelExportTemplate, ExportModelType, UnifiedExportFormat } from '../export/core/types'
import { BUILTIN_MODEL_TEMPLATES } from '../export/core/types'

// ============================================================================
// Store State
// ============================================================================

interface ModelExportTemplateState {
  // Templates
  templates: ModelExportTemplate[]

  // Selection par modèle
  selectedTemplateByModel: Record<ExportModelType, string | null>

  // Actions
  getTemplatesForModel: (modelType: ExportModelType) => ModelExportTemplate[]
  getTemplatesForFormat: (format: UnifiedExportFormat) => ModelExportTemplate[]
  getTemplate: (id: string) => ModelExportTemplate | undefined
  getSelectedTemplate: (modelType: ExportModelType) => ModelExportTemplate | undefined

  setSelectedTemplate: (modelType: ExportModelType, templateId: string | null) => void

  addTemplate: (template: Omit<ModelExportTemplate, 'id' | 'isBuiltin'>) => void
  updateTemplate: (id: string, updates: Partial<ModelExportTemplate>) => void
  deleteTemplate: (id: string) => void
  duplicateTemplate: (id: string, newName: string) => ModelExportTemplate | undefined

  resetToDefaults: () => void
}

// ============================================================================
// Helpers
// ============================================================================

function generateId(): string {
  return `model-template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ============================================================================
// Store
// ============================================================================

export const useModelExportTemplateStore = create<ModelExportTemplateState>()(
  persist(
    (set, get) => ({
      templates: [...BUILTIN_MODEL_TEMPLATES],

      selectedTemplateByModel: {
        document: null,
        clause: 'clauses-catalogue',
        bordereau: 'bordereau-standard',
        jurisprudence: 'jurisprudence-bibliographie',
        'defined-term': null,
      },

      getTemplatesForModel: (modelType) => {
        return get().templates.filter(t => t.modelType === modelType)
      },

      getTemplatesForFormat: (format) => {
        return get().templates.filter(t => t.formats.includes(format))
      },

      getTemplate: (id) => {
        return get().templates.find(t => t.id === id)
      },

      getSelectedTemplate: (modelType) => {
        const selectedId = get().selectedTemplateByModel[modelType]
        if (!selectedId) return undefined
        return get().templates.find(t => t.id === selectedId)
      },

      setSelectedTemplate: (modelType, templateId) => {
        set(state => ({
          selectedTemplateByModel: {
            ...state.selectedTemplateByModel,
            [modelType]: templateId,
          },
        }))
      },

      addTemplate: (template) => {
        const newTemplate: ModelExportTemplate = {
          ...template,
          id: generateId(),
          isBuiltin: false,
        }

        set(state => ({
          templates: [...state.templates, newTemplate],
        }))
      },

      updateTemplate: (id, updates) => {
        const template = get().templates.find(t => t.id === id)
        if (!template) return
        if (template.isBuiltin) {
          console.warn('Cannot update builtin template')
          return
        }

        set(state => ({
          templates: state.templates.map(t =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }))
      },

      deleteTemplate: (id) => {
        const template = get().templates.find(t => t.id === id)
        if (!template) return
        if (template.isBuiltin) {
          console.warn('Cannot delete builtin template')
          return
        }

        set(state => ({
          templates: state.templates.filter(t => t.id !== id),
          // Reset selection if deleted template was selected
          selectedTemplateByModel: Object.fromEntries(
            Object.entries(state.selectedTemplateByModel).map(([key, value]) => [
              key,
              value === id ? null : value,
            ])
          ) as Record<ExportModelType, string | null>,
        }))
      },

      duplicateTemplate: (id, newName) => {
        const template = get().templates.find(t => t.id === id)
        if (!template) return undefined

        const newTemplate: ModelExportTemplate = {
          ...template,
          id: generateId(),
          name: newName,
          description: `Copie de ${template.name}`,
          isBuiltin: false,
        }

        set(state => ({
          templates: [...state.templates, newTemplate],
        }))

        return newTemplate
      },

      resetToDefaults: () => {
        set({
          templates: [...BUILTIN_MODEL_TEMPLATES],
          selectedTemplateByModel: {
            document: null,
            clause: 'clauses-catalogue',
            bordereau: 'bordereau-standard',
            jurisprudence: 'jurisprudence-bibliographie',
            'defined-term': null,
          },
        })
      },
    }),
    {
      name: 'citadelle-model-export-templates',
      partialize: (state) => ({
        templates: state.templates.filter(t => !t.isBuiltin),
        selectedTemplateByModel: state.selectedTemplateByModel,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<ModelExportTemplateState>

        // Merge custom templates with builtins
        const customTemplates = persisted.templates || []
        const allTemplates = [...BUILTIN_MODEL_TEMPLATES, ...customTemplates]

        return {
          ...currentState,
          templates: allTemplates,
          selectedTemplateByModel: persisted.selectedTemplateByModel || currentState.selectedTemplateByModel,
        }
      },
    }
  )
)
