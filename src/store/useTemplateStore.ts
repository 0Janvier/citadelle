import { create } from 'zustand'
import type {
  DocumentTemplate,
  TemplateCategory,
  TemplateStoreState,
} from '../types/templates'
import {
  listTemplates,
  readTemplate,
  saveTemplate,
  deleteTemplate,
  duplicateTemplate,
  generateTemplateId,
} from '../lib/templateStorage'
import { DEFAULT_TEMPLATES } from '../data/templates/defaults'

interface TemplateStore extends TemplateStoreState {
  // Actions
  loadTemplates: () => Promise<void>
  getTemplate: (id: string) => DocumentTemplate | undefined
  getTemplateAsync: (id: string) => Promise<DocumentTemplate>
  createTemplate: (template: Partial<DocumentTemplate>) => Promise<string>
  updateTemplate: (id: string, updates: Partial<DocumentTemplate>) => Promise<void>
  removeTemplate: (id: string) => Promise<void>
  duplicateTemplateAction: (id: string, newName?: string) => Promise<string>

  // Filtering
  setSelectedCategory: (category: TemplateCategory | null) => void
  setSearchQuery: (query: string) => void
  getFilteredTemplates: () => DocumentTemplate[]

  // Export/Import
  exportTemplate: (id: string) => string | null
  importTemplate: (json: string) => Promise<string>
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  // Initial state
  templates: DEFAULT_TEMPLATES,
  builtinTemplates: DEFAULT_TEMPLATES,
  customTemplates: [],
  selectedCategory: null,
  searchQuery: '',
  isLoading: false,
  error: null,

  // Load templates from storage
  loadTemplates: async () => {
    set({ isLoading: true, error: null })
    try {
      const storedTemplates = await listTemplates()

      // Merge builtin templates with stored custom templates
      const customTemplates: DocumentTemplate[] = []

      for (const meta of storedTemplates) {
        if (!meta.isBuiltin) {
          try {
            const template = await readTemplate(meta.id)
            customTemplates.push(template)
          } catch (e) {
            console.error(`Failed to load template ${meta.id}:`, e)
          }
        }
      }

      set({
        templates: [...DEFAULT_TEMPLATES, ...customTemplates],
        customTemplates,
        isLoading: false,
      })
    } catch (error) {
      console.error('Failed to load templates:', error)
      set({ error: String(error), isLoading: false })
    }
  },

  // Get template by ID (sync, from cache)
  getTemplate: (id: string) => {
    return get().templates.find((t) => t.id === id)
  },

  // Get template by ID (async, from storage if needed)
  getTemplateAsync: async (id: string) => {
    // Check cache first
    const cached = get().templates.find((t) => t.id === id)
    if (cached) return cached

    // Load from storage
    return readTemplate(id)
  },

  // Create a new template
  createTemplate: async (partial: Partial<DocumentTemplate>) => {
    const id = generateTemplateId(partial.name || 'nouveau-template')
    const now = new Date().toISOString()

    const template: DocumentTemplate = {
      id,
      name: partial.name || 'Nouveau template',
      description: partial.description || '',
      category: partial.category || 'custom',
      icon: partial.icon || 'file',
      version: '1.0.0',
      createdAt: now,
      updatedAt: now,
      isBuiltin: false,
      isCustom: true,
      content: partial.content || { type: 'doc', content: [{ type: 'paragraph' }] },
      metadata: {
        defaultStyles: partial.metadata?.defaultStyles || [],
        suggestedLength: partial.metadata?.suggestedLength,
        tags: partial.metadata?.tags || [],
      },
    }

    await saveTemplate(template)

    set((state) => ({
      templates: [...state.templates, template],
      customTemplates: [...state.customTemplates, template],
    }))

    return id
  },

  // Update an existing template
  updateTemplate: async (id: string, updates: Partial<DocumentTemplate>) => {
    const existing = get().getTemplate(id)
    if (!existing) throw new Error(`Template not found: ${id}`)
    if (existing.isBuiltin) throw new Error('Cannot modify builtin template')

    const updated: DocumentTemplate = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await saveTemplate(updated)

    set((state) => ({
      templates: state.templates.map((t) => (t.id === id ? updated : t)),
      customTemplates: state.customTemplates.map((t) => (t.id === id ? updated : t)),
    }))
  },

  // Delete a template
  removeTemplate: async (id: string) => {
    const existing = get().getTemplate(id)
    if (!existing) throw new Error(`Template not found: ${id}`)
    if (existing.isBuiltin) throw new Error('Cannot delete builtin template')

    await deleteTemplate(id)

    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id),
      customTemplates: state.customTemplates.filter((t) => t.id !== id),
    }))
  },

  // Duplicate a template
  duplicateTemplateAction: async (id: string, newName?: string) => {
    const duplicated = await duplicateTemplate(id, newName)

    set((state) => ({
      templates: [...state.templates, duplicated],
      customTemplates: [...state.customTemplates, duplicated],
    }))

    return duplicated.id
  },

  // Filtering
  setSelectedCategory: (category: TemplateCategory | null) => {
    set({ selectedCategory: category })
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
  },

  getFilteredTemplates: () => {
    const { templates, selectedCategory, searchQuery } = get()
    let filtered = templates

    if (selectedCategory) {
      filtered = filtered.filter((t) => t.category === selectedCategory)
    }

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
  },

  // Export template to JSON string
  exportTemplate: (id: string) => {
    const template = get().getTemplate(id)
    if (!template) return null
    return JSON.stringify(template, null, 2)
  },

  // Import template from JSON string
  importTemplate: async (json: string) => {
    const imported = JSON.parse(json) as DocumentTemplate

    // Generate new ID to avoid conflicts
    const id = generateTemplateId(imported.name)
    const now = new Date().toISOString()

    const template: DocumentTemplate = {
      ...imported,
      id,
      isBuiltin: false,
      isCustom: true,
      createdAt: now,
      updatedAt: now,
    }

    await saveTemplate(template)

    set((state) => ({
      templates: [...state.templates, template],
      customTemplates: [...state.customTemplates, template],
    }))

    return id
  },
}))
