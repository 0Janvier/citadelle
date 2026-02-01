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

// Default templates that are bundled with the app
const BUILTIN_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'blank',
    name: 'Document vide',
    description: 'Un document vide pour commencer de zéro',
    category: 'writing',
    icon: 'file',
    version: '1.0.0',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isBuiltin: true,
    isCustom: false,
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
        },
      ],
    },
    metadata: {
      defaultStyles: [],
      tags: ['vide', 'blank'],
    },
  },
  {
    id: 'article',
    name: 'Article',
    description: 'Structure classique pour un article de blog ou de presse',
    category: 'writing',
    icon: 'newspaper',
    version: '1.0.0',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isBuiltin: true,
    isCustom: false,
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Titre de l\'article' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              marks: [{ type: 'italic' }],
              text: 'Chapeau introductif qui résume l\'article en quelques lignes...',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Première section' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Contenu de la première section...' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Deuxième section' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Contenu de la deuxième section...' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Conclusion' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Résumé et conclusion de l\'article...' }],
        },
      ],
    },
    metadata: {
      defaultStyles: ['title', 'lead', 'heading2', 'body'],
      suggestedLength: 'medium',
      tags: ['article', 'blog', 'presse'],
    },
  },
  {
    id: 'report',
    name: 'Rapport',
    description: 'Structure professionnelle pour un rapport détaillé',
    category: 'business',
    icon: 'clipboard-list',
    version: '1.0.0',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isBuiltin: true,
    isCustom: false,
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Titre du rapport' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Date : ' },
            { type: 'text', text: '[Date]' },
          ],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Auteur : ' },
            { type: 'text', text: '[Nom de l\'auteur]' },
          ],
        },
        {
          type: 'horizontalRule',
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Résumé exécutif' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Synthèse des points clés du rapport...' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '1. Introduction' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Contexte et objectifs du rapport...' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '2. Analyse' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Détail de l\'analyse et des observations...' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '3. Recommandations' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Première recommandation' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Deuxième recommandation' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Troisième recommandation' }] }],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '4. Conclusion' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Synthèse finale et prochaines étapes...' }],
        },
      ],
    },
    metadata: {
      defaultStyles: ['title', 'heading2', 'body'],
      suggestedLength: 'long',
      tags: ['rapport', 'business', 'professionnel'],
    },
  },
  {
    id: 'letter',
    name: 'Lettre',
    description: 'Format de lettre formelle ou professionnelle',
    category: 'business',
    icon: 'envelope',
    version: '1.0.0',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isBuiltin: true,
    isCustom: false,
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '[Votre nom]' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '[Votre adresse]' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '[Code postal, Ville]' }],
        },
        {
          type: 'paragraph',
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '[Nom du destinataire]' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '[Adresse du destinataire]' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '[Code postal, Ville]' }],
        },
        {
          type: 'paragraph',
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '[Lieu], le [Date]' }],
        },
        {
          type: 'paragraph',
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Objet : ' },
            { type: 'text', text: '[Objet de la lettre]' },
          ],
        },
        {
          type: 'paragraph',
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Madame, Monsieur,' }],
        },
        {
          type: 'paragraph',
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '[Corps de la lettre...]' }],
        },
        {
          type: 'paragraph',
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Je vous prie d\'agréer, Madame, Monsieur, l\'expression de mes salutations distinguées.' }],
        },
        {
          type: 'paragraph',
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '[Signature]' }],
        },
      ],
    },
    metadata: {
      defaultStyles: ['body'],
      suggestedLength: 'short',
      tags: ['lettre', 'courrier', 'formel'],
    },
  },
  {
    id: 'notes',
    name: 'Notes de réunion',
    description: 'Structure pour prendre des notes pendant une réunion',
    category: 'business',
    icon: 'clipboard',
    version: '1.0.0',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isBuiltin: true,
    isCustom: false,
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Notes de réunion' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Date : ' },
            { type: 'text', text: '[Date]' },
          ],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Participants : ' },
            { type: 'text', text: '[Liste des participants]' },
          ],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Objet : ' },
            { type: 'text', text: '[Sujet de la réunion]' },
          ],
        },
        {
          type: 'horizontalRule',
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Ordre du jour' }],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Point 1' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Point 2' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Point 3' }] }],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Notes' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '...' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Actions à suivre' }],
        },
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Action 1 - [Responsable]' }] }],
            },
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Action 2 - [Responsable]' }] }],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Prochaine réunion' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '[Date et heure de la prochaine réunion]' }],
        },
      ],
    },
    metadata: {
      defaultStyles: ['title', 'heading2', 'body'],
      suggestedLength: 'medium',
      tags: ['notes', 'réunion', 'meeting'],
    },
  },
  {
    id: 'essay',
    name: 'Dissertation',
    description: 'Structure académique pour une dissertation ou un essai',
    category: 'academic',
    icon: 'book-open',
    version: '1.0.0',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isBuiltin: true,
    isCustom: false,
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Titre de la dissertation' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'italic' }], text: '[Nom de l\'auteur] - [Date]' },
          ],
        },
        {
          type: 'horizontalRule',
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Introduction' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Présentation du sujet, contexte, problématique et annonce du plan...' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'I. Première partie' }],
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'A. Premier argument' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Développement du premier argument...' }],
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'B. Deuxième argument' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Développement du deuxième argument...' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'II. Deuxième partie' }],
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'A. Premier argument' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Développement...' }],
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'B. Deuxième argument' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Développement...' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Conclusion' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Synthèse des arguments, réponse à la problématique et ouverture...' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Bibliographie' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '[Référence 1]' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '[Référence 2]' }] }],
            },
          ],
        },
      ],
    },
    metadata: {
      defaultStyles: ['title', 'heading2', 'heading3', 'body'],
      suggestedLength: 'long',
      tags: ['dissertation', 'essai', 'académique'],
    },
  },
  {
    id: 'todo-list',
    name: 'Liste de tâches',
    description: 'Liste simple pour organiser vos tâches',
    category: 'personal',
    icon: 'check-square',
    version: '1.0.0',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isBuiltin: true,
    isCustom: false,
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Liste de tâches' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'italic' }], text: 'Dernière mise à jour : [Date]' },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Priorité haute' }],
        },
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Tâche urgente 1' }] }],
            },
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Tâche urgente 2' }] }],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Priorité normale' }],
        },
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Tâche normale 1' }] }],
            },
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Tâche normale 2' }] }],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Plus tard' }],
        },
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Tâche à faire plus tard' }] }],
            },
          ],
        },
      ],
    },
    metadata: {
      defaultStyles: ['title', 'heading2'],
      suggestedLength: 'short',
      tags: ['todo', 'tâches', 'liste'],
    },
  },
]

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
  templates: BUILTIN_TEMPLATES,
  builtinTemplates: BUILTIN_TEMPLATES,
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
        templates: [...BUILTIN_TEMPLATES, ...customTemplates],
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
