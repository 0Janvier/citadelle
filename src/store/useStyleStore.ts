import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Editor } from '@tiptap/react'
import type {
  TextStyle,
  StyleStoreState,
  StylesConfig,
} from '../types/templates'
import { readStyles, saveStyles } from '../lib/templateStorage'

// Default text styles bundled with the app
const BUILTIN_STYLES: TextStyle[] = [
  // Headings
  {
    id: 'title',
    name: 'Titre principal',
    shortcut: 'Mod-Alt-1',
    isBuiltin: true,
    category: 'headings',
    nodeType: 'heading',
    attrs: { level: 1 },
    formatting: {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '2.25rem',
      fontWeight: '700',
      lineHeight: '1.2',
      letterSpacing: '-0.02em',
      marginTop: '0',
      marginBottom: '1.5rem',
    },
  },
  {
    id: 'heading2',
    name: 'Titre de section',
    shortcut: 'Mod-Alt-2',
    isBuiltin: true,
    category: 'headings',
    nodeType: 'heading',
    attrs: { level: 2 },
    formatting: {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '1.5rem',
      fontWeight: '600',
      lineHeight: '1.3',
      marginTop: '2rem',
      marginBottom: '1rem',
    },
  },
  {
    id: 'heading3',
    name: 'Sous-titre',
    shortcut: 'Mod-Alt-3',
    isBuiltin: true,
    category: 'headings',
    nodeType: 'heading',
    attrs: { level: 3 },
    formatting: {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '1.25rem',
      fontWeight: '600',
      lineHeight: '1.4',
      marginTop: '1.5rem',
      marginBottom: '0.75rem',
    },
  },

  // Body styles
  {
    id: 'body',
    name: 'Corps de texte',
    shortcut: 'Mod-Alt-0',
    isBuiltin: true,
    category: 'body',
    nodeType: 'paragraph',
    formatting: {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '1rem',
      fontWeight: '400',
      lineHeight: '1.6',
      marginBottom: '1rem',
    },
  },
  {
    id: 'lead',
    name: 'Chapeau',
    shortcut: 'Mod-Alt-L',
    isBuiltin: true,
    category: 'body',
    nodeType: 'paragraph',
    formatting: {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '1.25rem',
      fontWeight: '400',
      fontStyle: 'normal',
      lineHeight: '1.6',
      color: 'var(--text-secondary)',
      marginBottom: '1.5rem',
    },
  },
  {
    id: 'small',
    name: 'Petit texte',
    isBuiltin: true,
    category: 'body',
    nodeType: 'paragraph',
    formatting: {
      fontSize: '0.875rem',
      lineHeight: '1.5',
      color: 'var(--text-muted)',
    },
  },

  // Block styles
  {
    id: 'quote',
    name: 'Citation',
    shortcut: 'Mod-Alt-Q',
    isBuiltin: true,
    category: 'blocks',
    nodeType: 'blockquote',
    formatting: {
      fontFamily: 'Georgia, serif',
      fontSize: '1.1rem',
      fontStyle: 'italic',
      lineHeight: '1.6',
      paddingLeft: '1.5rem',
      borderLeftWidth: '4px',
      borderLeftColor: 'var(--accent)',
      borderLeftStyle: 'solid',
      color: 'var(--text-secondary)',
      marginTop: '1.5rem',
      marginBottom: '1.5rem',
    },
  },
  {
    id: 'callout',
    name: 'Encadré',
    isBuiltin: true,
    category: 'blocks',
    nodeType: 'paragraph',
    formatting: {
      backgroundColor: 'var(--bg-secondary)',
      paddingLeft: '1rem',
      paddingRight: '1rem',
      borderLeftWidth: '4px',
      borderLeftColor: 'var(--accent)',
      borderLeftStyle: 'solid',
      marginTop: '1rem',
      marginBottom: '1rem',
    },
  },
  {
    id: 'code',
    name: 'Bloc de code',
    shortcut: 'Mod-Alt-C',
    isBuiltin: true,
    category: 'blocks',
    nodeType: 'codeBlock',
    formatting: {
      fontFamily: '"SF Mono", Monaco, "Cascadia Code", monospace',
      fontSize: '0.875rem',
      lineHeight: '1.5',
      backgroundColor: 'var(--bg-secondary)',
    },
  },
]

interface StyleStore extends StyleStoreState {
  // Actions
  loadStyles: () => Promise<void>
  getStyle: (id: string) => TextStyle | undefined
  createStyle: (style: Partial<TextStyle>) => Promise<string>
  updateStyle: (id: string, updates: Partial<TextStyle>) => Promise<void>
  removeStyle: (id: string) => Promise<void>
  duplicateStyle: (id: string, newName?: string) => Promise<string>

  // Application
  applyStyle: (editor: Editor, styleId: string) => void
  getStyleForSelection: (editor: Editor) => TextStyle | null
  setActiveStyleId: (id: string | null) => void

  // Recent styles
  addRecentStyle: (styleId: string) => void
  clearRecentStyles: () => void

  // Export/Import
  exportStyles: () => string
  importStyles: (json: string) => Promise<void>
}

export const useStyleStore = create<StyleStore>()(
  persist(
    (set, get) => ({
      // Initial state
      styles: BUILTIN_STYLES,
      builtinStyles: BUILTIN_STYLES,
      customStyles: [],
      activeStyleId: null,
      recentStyles: [],
      isLoading: false,
      error: null,

      // Load styles from storage
      loadStyles: async () => {
        set({ isLoading: true, error: null })
        try {
          const config = await readStyles()

          // Merge builtin styles with stored custom styles
          const customStyles = config.customStyles || []

          set({
            styles: [...BUILTIN_STYLES, ...customStyles],
            customStyles,
            isLoading: false,
          })
        } catch (error) {
          console.error('Failed to load styles:', error)
          set({ error: String(error), isLoading: false })
        }
      },

      // Get style by ID
      getStyle: (id: string) => {
        return get().styles.find((s) => s.id === id)
      },

      // Create a new style
      createStyle: async (partial: Partial<TextStyle>) => {
        const id = `custom-${Date.now().toString(36)}`

        const style: TextStyle = {
          id,
          name: partial.name || 'Nouveau style',
          shortcut: partial.shortcut,
          isBuiltin: false,
          category: partial.category || 'custom',
          nodeType: partial.nodeType || 'paragraph',
          attrs: partial.attrs,
          formatting: partial.formatting || {},
          darkMode: partial.darkMode,
        }

        const newCustomStyles = [...get().customStyles, style]

        // Save to storage
        const config: StylesConfig = {
          version: '1.0.0',
          styles: get().builtinStyles,
          customStyles: newCustomStyles,
        }
        await saveStyles(config)

        set((state) => ({
          styles: [...state.styles, style],
          customStyles: newCustomStyles,
        }))

        return id
      },

      // Update a style
      updateStyle: async (id: string, updates: Partial<TextStyle>) => {
        const existing = get().getStyle(id)
        if (!existing) throw new Error(`Style not found: ${id}`)
        if (existing.isBuiltin) throw new Error('Cannot modify builtin style')

        const updated: TextStyle = { ...existing, ...updates }

        const newCustomStyles = get().customStyles.map((s) =>
          s.id === id ? updated : s
        )

        const config: StylesConfig = {
          version: '1.0.0',
          styles: get().builtinStyles,
          customStyles: newCustomStyles,
        }
        await saveStyles(config)

        set((state) => ({
          styles: state.styles.map((s) => (s.id === id ? updated : s)),
          customStyles: newCustomStyles,
        }))
      },

      // Delete a style
      removeStyle: async (id: string) => {
        const existing = get().getStyle(id)
        if (!existing) throw new Error(`Style not found: ${id}`)
        if (existing.isBuiltin) throw new Error('Cannot delete builtin style')

        const newCustomStyles = get().customStyles.filter((s) => s.id !== id)

        const config: StylesConfig = {
          version: '1.0.0',
          styles: get().builtinStyles,
          customStyles: newCustomStyles,
        }
        await saveStyles(config)

        set((state) => ({
          styles: state.styles.filter((s) => s.id !== id),
          customStyles: newCustomStyles,
        }))
      },

      // Duplicate a style
      duplicateStyle: async (id: string, newName?: string) => {
        const original = get().getStyle(id)
        if (!original) throw new Error(`Style not found: ${id}`)

        return get().createStyle({
          ...original,
          name: newName || `${original.name} (copie)`,
        })
      },

      // Apply a style to the current selection
      applyStyle: (editor: Editor, styleId: string) => {
        const style = get().getStyle(styleId)
        if (!style || !editor) return

        // Apply based on node type
        switch (style.nodeType) {
          case 'heading':
            editor
              .chain()
              .focus()
              .setHeading({ level: (style.attrs?.level as 1 | 2 | 3 | 4 | 5 | 6) || 1 })
              .run()
            break

          case 'paragraph':
            editor.chain().focus().setParagraph().run()
            break

          case 'blockquote':
            editor.chain().focus().setBlockquote().run()
            break

          case 'codeBlock':
            editor.chain().focus().setCodeBlock().run()
            break

          default:
            editor.chain().focus().setParagraph().run()
        }

        // Add to recent styles
        get().addRecentStyle(styleId)
        set({ activeStyleId: styleId })
      },

      // Get the style for the current selection
      getStyleForSelection: (editor: Editor) => {
        if (!editor) return null

        const { styles } = get()

        // Check what node type is active
        if (editor.isActive('heading', { level: 1 })) {
          return styles.find((s) => s.nodeType === 'heading' && s.attrs?.level === 1) || null
        }
        if (editor.isActive('heading', { level: 2 })) {
          return styles.find((s) => s.nodeType === 'heading' && s.attrs?.level === 2) || null
        }
        if (editor.isActive('heading', { level: 3 })) {
          return styles.find((s) => s.nodeType === 'heading' && s.attrs?.level === 3) || null
        }
        if (editor.isActive('blockquote')) {
          return styles.find((s) => s.nodeType === 'blockquote') || null
        }
        if (editor.isActive('codeBlock')) {
          return styles.find((s) => s.nodeType === 'codeBlock') || null
        }
        if (editor.isActive('paragraph')) {
          return styles.find((s) => s.id === 'body') || null
        }

        return null
      },

      setActiveStyleId: (id: string | null) => {
        set({ activeStyleId: id })
      },

      // Recent styles
      addRecentStyle: (styleId: string) => {
        set((state) => {
          const filtered = state.recentStyles.filter((id) => id !== styleId)
          return {
            recentStyles: [styleId, ...filtered].slice(0, 5),
          }
        })
      },

      clearRecentStyles: () => {
        set({ recentStyles: [] })
      },

      // Export styles to JSON
      exportStyles: () => {
        const { builtinStyles, customStyles } = get()
        const config: StylesConfig = {
          version: '1.0.0',
          styles: builtinStyles,
          customStyles,
        }
        return JSON.stringify(config, null, 2)
      },

      // Import styles from JSON
      importStyles: async (json: string) => {
        const imported = JSON.parse(json) as StylesConfig

        // Only import custom styles, don't override builtins
        const newCustomStyles = imported.customStyles || []

        // Regenerate IDs to avoid conflicts
        const renamedStyles = newCustomStyles.map((s) => ({
          ...s,
          id: `imported-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          isBuiltin: false,
        }))

        const config: StylesConfig = {
          version: '1.0.0',
          styles: get().builtinStyles,
          customStyles: [...get().customStyles, ...renamedStyles],
        }
        await saveStyles(config)

        set((state) => ({
          styles: [...state.styles, ...renamedStyles],
          customStyles: [...state.customStyles, ...renamedStyles],
        }))
      },
    }),
    {
      name: 'citadelle-styles',
      partialize: (state) => ({
        recentStyles: state.recentStyles,
        activeStyleId: state.activeStyleId,
      }),
    }
  )
)
