import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  ExportTemplate,
  ExportTemplateStoreState,
} from '../types/templates'
import {
  listExportTemplates,
  readExportTemplate,
  saveExportTemplate,
  deleteExportTemplate,
} from '../lib/templateStorage'

// Default export templates bundled with the app
const BUILTIN_EXPORT_TEMPLATES: ExportTemplate[] = [
  {
    id: 'simple',
    name: 'Simple',
    description: 'Export minimaliste sans en-tête ni pied de page',
    format: ['html', 'pdf', 'docx'],
    isBuiltin: true,
    version: '1.0.0',
    pageLayout: {
      size: 'A4',
      orientation: 'portrait',
      margins: {
        top: '2cm',
        bottom: '2cm',
        left: '2.5cm',
        right: '2.5cm',
      },
    },
    header: {
      enabled: false,
      height: '0',
      content: { left: '', center: '', right: '' },
      style: {},
    },
    footer: {
      enabled: false,
      height: '0',
      content: { left: '', center: '', right: '' },
      style: {},
    },
    typography: {
      baseFontSize: '11pt',
      headingScale: 1.25,
      lineHeight: 1.6,
      paragraphSpacing: '0.8em',
    },
    styles: {
      h1: {
        fontSize: '24pt',
        fontWeight: '700',
        marginTop: '0',
        marginBottom: '1em',
        color: '#1a1a1a',
      },
      h2: {
        fontSize: '18pt',
        fontWeight: '600',
        marginTop: '1.5em',
        marginBottom: '0.5em',
        color: '#333333',
      },
      h3: {
        fontSize: '14pt',
        fontWeight: '600',
        marginTop: '1.2em',
        marginBottom: '0.4em',
        color: '#444444',
      },
      p: {
        textAlign: 'left',
        textIndent: '0',
      },
      blockquote: {
        fontStyle: 'italic',
        borderLeft: '3px solid #cccccc',
        paddingLeft: '1em',
        color: '#555555',
      },
    },
  },
  {
    id: 'professional',
    name: 'Professionnel',
    description: 'Mise en page formelle avec en-tête et pied de page',
    format: ['pdf', 'docx'],
    isBuiltin: true,
    version: '1.0.0',
    pageLayout: {
      size: 'A4',
      orientation: 'portrait',
      margins: {
        top: '2.5cm',
        bottom: '2.5cm',
        left: '2.5cm',
        right: '2.5cm',
      },
    },
    header: {
      enabled: true,
      height: '1.5cm',
      content: {
        left: '{{document.title}}',
        center: '',
        right: '{{date.format("DD/MM/YYYY")}}',
      },
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '10pt',
        color: '#666666',
        borderBottom: '1px solid #e5e5e5',
        paddingBottom: '0.5em',
      },
    },
    footer: {
      enabled: true,
      height: '1cm',
      content: {
        left: '',
        center: 'Page {{page.current}} / {{page.total}}',
        right: '',
      },
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '9pt',
        color: '#999999',
      },
    },
    typography: {
      baseFontSize: '11pt',
      headingScale: 1.25,
      lineHeight: 1.5,
      paragraphSpacing: '0.8em',
    },
    styles: {
      h1: {
        fontSize: '24pt',
        fontWeight: '700',
        marginTop: '0',
        marginBottom: '1em',
        color: '#1a1a1a',
      },
      h2: {
        fontSize: '18pt',
        fontWeight: '600',
        marginTop: '1.5em',
        marginBottom: '0.5em',
        color: '#333333',
      },
      h3: {
        fontSize: '14pt',
        fontWeight: '600',
        marginTop: '1.2em',
        marginBottom: '0.4em',
        color: '#444444',
      },
      p: {
        textAlign: 'justify',
        textIndent: '0',
      },
      blockquote: {
        fontStyle: 'italic',
        borderLeft: '3px solid #007aff',
        paddingLeft: '1em',
        color: '#555555',
      },
    },
  },
  {
    id: 'academic',
    name: 'Académique',
    description: 'Format universitaire avec numérotation des pages',
    format: ['pdf', 'docx'],
    isBuiltin: true,
    version: '1.0.0',
    pageLayout: {
      size: 'A4',
      orientation: 'portrait',
      margins: {
        top: '2.5cm',
        bottom: '2.5cm',
        left: '3cm',
        right: '2.5cm',
      },
    },
    header: {
      enabled: true,
      height: '1cm',
      content: {
        left: '',
        center: '{{document.title}}',
        right: '',
      },
      style: {
        fontFamily: 'Times New Roman, serif',
        fontSize: '10pt',
        color: '#333333',
        fontStyle: 'italic',
      },
    },
    footer: {
      enabled: true,
      height: '1cm',
      content: {
        left: '',
        center: '{{page.current}}',
        right: '',
      },
      style: {
        fontFamily: 'Times New Roman, serif',
        fontSize: '10pt',
        color: '#333333',
      },
    },
    typography: {
      baseFontSize: '12pt',
      headingScale: 1.2,
      lineHeight: 2.0,
      paragraphSpacing: '0',
    },
    styles: {
      h1: {
        fontSize: '14pt',
        fontWeight: '700',
        marginTop: '0',
        marginBottom: '1em',
        textAlign: 'center',
        textTransform: 'uppercase',
      },
      h2: {
        fontSize: '12pt',
        fontWeight: '700',
        marginTop: '1.5em',
        marginBottom: '0.5em',
      },
      h3: {
        fontSize: '12pt',
        fontWeight: '700',
        fontStyle: 'italic',
        marginTop: '1em',
        marginBottom: '0.5em',
      },
      p: {
        textAlign: 'justify',
        textIndent: '1.5cm',
      },
      blockquote: {
        fontSize: '11pt',
        marginLeft: '2cm',
        marginRight: '2cm',
        fontStyle: 'normal',
      },
    },
  },
  {
    id: 'letter',
    name: 'Lettre',
    description: 'Format de courrier professionnel',
    format: ['pdf', 'docx'],
    isBuiltin: true,
    version: '1.0.0',
    pageLayout: {
      size: 'A4',
      orientation: 'portrait',
      margins: {
        top: '3cm',
        bottom: '2.5cm',
        left: '2.5cm',
        right: '2.5cm',
      },
    },
    header: {
      enabled: false,
      height: '0',
      content: { left: '', center: '', right: '' },
      style: {},
    },
    footer: {
      enabled: false,
      height: '0',
      content: { left: '', center: '', right: '' },
      style: {},
    },
    typography: {
      baseFontSize: '11pt',
      headingScale: 1.0,
      lineHeight: 1.5,
      paragraphSpacing: '1em',
    },
    styles: {
      h1: {
        fontSize: '11pt',
        fontWeight: '700',
        marginTop: '0',
        marginBottom: '0.5em',
      },
      h2: {
        fontSize: '11pt',
        fontWeight: '700',
        marginTop: '1em',
        marginBottom: '0.5em',
      },
      p: {
        textAlign: 'left',
        textIndent: '0',
      },
    },
  },
]

interface ExportTemplateStore extends ExportTemplateStoreState {
  // Actions
  loadTemplates: () => Promise<void>
  getTemplate: (id: string) => ExportTemplate | undefined
  getTemplateAsync: (id: string) => Promise<ExportTemplate>
  createTemplate: (template: Partial<ExportTemplate>) => Promise<string>
  updateTemplate: (id: string, updates: Partial<ExportTemplate>) => Promise<void>
  removeTemplate: (id: string) => Promise<void>
  duplicateTemplate: (id: string, newName?: string) => Promise<string>

  // Selection
  setSelectedTemplate: (id: string | null) => void

  // Preview
  setPreviewHtml: (html: string | null) => void
  generatePreview: (content: string, templateId: string) => string

  // Export
  setIsExporting: (exporting: boolean) => void
}

export const useExportTemplateStore = create<ExportTemplateStore>()(
  persist(
    (set, get) => ({
      // Initial state
      templates: BUILTIN_EXPORT_TEMPLATES,
      selectedTemplateId: 'simple',
      previewHtml: null,
      isExporting: false,
      error: null,

      // Load templates from storage
      loadTemplates: async () => {
        try {
          const storedTemplates = await listExportTemplates()

          // Load full templates for custom ones
          const customTemplates: ExportTemplate[] = []
          for (const meta of storedTemplates) {
            if (!meta.isBuiltin) {
              try {
                const template = await readExportTemplate(meta.id)
                customTemplates.push(template)
              } catch (e) {
                console.error(`Failed to load export template ${meta.id}:`, e)
              }
            }
          }

          set({
            templates: [...BUILTIN_EXPORT_TEMPLATES, ...customTemplates],
          })
        } catch (error) {
          console.error('Failed to load export templates:', error)
          set({ error: String(error) })
        }
      },

      // Get template by ID (sync)
      getTemplate: (id: string) => {
        return get().templates.find((t) => t.id === id)
      },

      // Get template by ID (async)
      getTemplateAsync: async (id: string) => {
        const cached = get().templates.find((t) => t.id === id)
        if (cached) return cached
        return readExportTemplate(id)
      },

      // Create a new template
      createTemplate: async (partial: Partial<ExportTemplate>) => {
        const id = `export-${Date.now().toString(36)}`

        // Start from a base template
        const base = get().getTemplate('simple') || BUILTIN_EXPORT_TEMPLATES[0]

        const template: ExportTemplate = {
          ...base,
          ...partial,
          id,
          name: partial.name || 'Nouveau template d\'export',
          isBuiltin: false,
          version: '1.0.0',
        }

        await saveExportTemplate(template)

        set((state) => ({
          templates: [...state.templates, template],
        }))

        return id
      },

      // Update a template
      updateTemplate: async (id: string, updates: Partial<ExportTemplate>) => {
        const existing = get().getTemplate(id)
        if (!existing) throw new Error(`Export template not found: ${id}`)
        if (existing.isBuiltin) throw new Error('Cannot modify builtin export template')

        const updated: ExportTemplate = { ...existing, ...updates }

        await saveExportTemplate(updated)

        set((state) => ({
          templates: state.templates.map((t) => (t.id === id ? updated : t)),
        }))
      },

      // Delete a template
      removeTemplate: async (id: string) => {
        const existing = get().getTemplate(id)
        if (!existing) throw new Error(`Export template not found: ${id}`)
        if (existing.isBuiltin) throw new Error('Cannot delete builtin export template')

        await deleteExportTemplate(id)

        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
          selectedTemplateId:
            state.selectedTemplateId === id ? 'simple' : state.selectedTemplateId,
        }))
      },

      // Duplicate a template
      duplicateTemplate: async (id: string, newName?: string) => {
        const original = get().getTemplate(id)
        if (!original) throw new Error(`Export template not found: ${id}`)

        return get().createTemplate({
          ...original,
          name: newName || `${original.name} (copie)`,
        })
      },

      // Selection
      setSelectedTemplate: (id: string | null) => {
        set({ selectedTemplateId: id })
      },

      // Preview
      setPreviewHtml: (html: string | null) => {
        set({ previewHtml: html })
      },

      // Generate preview HTML with template applied
      generatePreview: (content: string, templateId: string) => {
        const template = get().getTemplate(templateId)
        if (!template) return content

        const { pageLayout, header, footer, typography, styles } = template

        // Build CSS from template
        const css = `
          @page {
            size: ${pageLayout.size} ${pageLayout.orientation};
            margin: ${pageLayout.margins.top} ${pageLayout.margins.right} ${pageLayout.margins.bottom} ${pageLayout.margins.left};
          }

          body {
            font-family: system-ui, -apple-system, sans-serif;
            font-size: ${typography.baseFontSize};
            line-height: ${typography.lineHeight};
            color: #1a1a1a;
          }

          h1 { ${Object.entries(styles.h1 || {}).map(([k, v]) => `${toKebabCase(k)}: ${v}`).join('; ')} }
          h2 { ${Object.entries(styles.h2 || {}).map(([k, v]) => `${toKebabCase(k)}: ${v}`).join('; ')} }
          h3 { ${Object.entries(styles.h3 || {}).map(([k, v]) => `${toKebabCase(k)}: ${v}`).join('; ')} }
          p { ${Object.entries(styles.p || {}).map(([k, v]) => `${toKebabCase(k)}: ${v}`).join('; ')}; margin-bottom: ${typography.paragraphSpacing}; }
          blockquote { ${Object.entries(styles.blockquote || {}).map(([k, v]) => `${toKebabCase(k)}: ${v}`).join('; ')} }

          .header {
            ${header.enabled ? `
              height: ${header.height};
              display: flex;
              justify-content: space-between;
              align-items: center;
              ${Object.entries(header.style).map(([k, v]) => `${toKebabCase(k)}: ${v}`).join('; ')}
            ` : 'display: none;'}
          }

          .footer {
            ${footer.enabled ? `
              height: ${footer.height};
              display: flex;
              justify-content: space-between;
              align-items: center;
              ${Object.entries(footer.style).map(([k, v]) => `${toKebabCase(k)}: ${v}`).join('; ')}
            ` : 'display: none;'}
          }
        `

        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>${css}</style>
          </head>
          <body>
            ${header.enabled ? `
              <div class="header">
                <span>${header.content.left}</span>
                <span>${header.content.center}</span>
                <span>${header.content.right}</span>
              </div>
            ` : ''}
            <div class="content">${content}</div>
            ${footer.enabled ? `
              <div class="footer">
                <span>${footer.content.left}</span>
                <span>${footer.content.center}</span>
                <span>${footer.content.right}</span>
              </div>
            ` : ''}
          </body>
          </html>
        `

        return html
      },

      // Export
      setIsExporting: (exporting: boolean) => {
        set({ isExporting: exporting })
      },
    }),
    {
      name: 'citadelle-export-templates',
      partialize: (state) => ({
        selectedTemplateId: state.selectedTemplateId,
      }),
    }
  )
)

// Helper function to convert camelCase to kebab-case
function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}
