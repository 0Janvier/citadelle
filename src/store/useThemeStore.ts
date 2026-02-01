import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  InterfaceTheme,
  ThemeStoreState,
} from '../types/templates'
import {
  listThemes,
  readTheme,
  saveTheme,
  deleteTheme,
} from '../lib/templateStorage'

// Default themes bundled with the app
const BUILTIN_THEMES: InterfaceTheme[] = [
  {
    id: 'light',
    name: 'Clair',
    description: 'Thème clair classique',
    isBuiltin: true,
    version: '1.0.0',
    base: 'light',
    colors: {
      bg: '#ffffff',
      bgSecondary: '#f5f5f7',
      editorBg: '#ffffff',
      text: '#1d1d1f',
      textSecondary: '#6e6e73',
      textMuted: '#8e8e93',
      accent: '#007aff',
      accentHover: '#0066d6',
      border: '#e5e7eb',
      selection: 'rgba(0, 122, 255, 0.2)',
      highlight: {
        yellow: '#fef08a',
        green: '#bbf7d0',
        blue: '#bfdbfe',
        pink: '#fbcfe8',
        orange: '#fed7aa',
        purple: '#ddd6fe',
      },
    },
    typography: {
      fontFamily: {
        ui: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        editor: 'system-ui, sans-serif',
        mono: '"SF Mono", Monaco, "Cascadia Code", monospace',
      },
      fontSize: {
        base: '16px',
        small: '14px',
        large: '18px',
      },
      lineHeight: {
        tight: '1.3',
        normal: '1.6',
        relaxed: '1.8',
      },
    },
    spacing: {
      editorPadding: '2rem',
      editorMaxWidth: '720px',
      sidebarWidth: '240px',
    },
    effects: {
      borderRadius: '8px',
      shadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      blur: '8px',
    },
  },
  {
    id: 'dark',
    name: 'Sombre',
    description: 'Thème sombre pour le travail nocturne',
    isBuiltin: true,
    version: '1.0.0',
    base: 'dark',
    colors: {
      bg: '#1e1e1e',
      bgSecondary: '#2d2d2d',
      editorBg: '#1e1e1e',
      text: '#d4d4d4',
      textSecondary: '#a0a0a0',
      textMuted: '#6e6e6e',
      accent: '#0a84ff',
      accentHover: '#409cff',
      border: '#374151',
      selection: 'rgba(10, 132, 255, 0.3)',
      highlight: {
        yellow: '#854d0e',
        green: '#166534',
        blue: '#1e40af',
        pink: '#9d174d',
        orange: '#9a3412',
        purple: '#5b21b6',
      },
    },
    typography: {
      fontFamily: {
        ui: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        editor: 'system-ui, sans-serif',
        mono: '"SF Mono", Monaco, "Cascadia Code", monospace',
      },
      fontSize: {
        base: '16px',
        small: '14px',
        large: '18px',
      },
      lineHeight: {
        tight: '1.3',
        normal: '1.6',
        relaxed: '1.8',
      },
    },
    spacing: {
      editorPadding: '2rem',
      editorMaxWidth: '720px',
      sidebarWidth: '240px',
    },
    effects: {
      borderRadius: '8px',
      shadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      blur: '8px',
    },
  },
  {
    id: 'sepia',
    name: 'Sépia',
    description: 'Thème chaleureux pour une lecture confortable',
    isBuiltin: true,
    version: '1.0.0',
    base: 'light',
    colors: {
      bg: '#f4ecd8',
      bgSecondary: '#ebe3cf',
      editorBg: '#f4ecd8',
      text: '#5b4636',
      textSecondary: '#7a6552',
      textMuted: '#998675',
      accent: '#8b4513',
      accentHover: '#a0522d',
      border: '#d4c8b0',
      selection: 'rgba(139, 69, 19, 0.2)',
      highlight: {
        yellow: '#f5deb3',
        green: '#c5e1a5',
        blue: '#b3d4fc',
        pink: '#f8bbd9',
        orange: '#ffcc80',
        purple: '#d1c4e9',
      },
    },
    typography: {
      fontFamily: {
        ui: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        editor: 'Georgia, "Times New Roman", serif',
        mono: '"SF Mono", Monaco, "Cascadia Code", monospace',
      },
      fontSize: {
        base: '16px',
        small: '14px',
        large: '18px',
      },
      lineHeight: {
        tight: '1.3',
        normal: '1.7',
        relaxed: '1.9',
      },
    },
    spacing: {
      editorPadding: '2rem',
      editorMaxWidth: '680px',
      sidebarWidth: '240px',
    },
    effects: {
      borderRadius: '8px',
      shadow: '0 2px 8px rgba(91, 70, 54, 0.1)',
      blur: '8px',
    },
  },
  {
    id: 'nord',
    name: 'Nord',
    description: 'Palette arctique inspirée du Grand Nord',
    isBuiltin: true,
    version: '1.0.0',
    base: 'dark',
    colors: {
      bg: '#2e3440',
      bgSecondary: '#3b4252',
      editorBg: '#2e3440',
      text: '#eceff4',
      textSecondary: '#d8dee9',
      textMuted: '#7b88a1',
      accent: '#88c0d0',
      accentHover: '#8fbcbb',
      border: '#4c566a',
      selection: 'rgba(136, 192, 208, 0.3)',
      highlight: {
        yellow: '#ebcb8b',
        green: '#a3be8c',
        blue: '#81a1c1',
        pink: '#b48ead',
        orange: '#d08770',
        purple: '#b48ead',
      },
    },
    typography: {
      fontFamily: {
        ui: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        editor: 'system-ui, sans-serif',
        mono: '"SF Mono", Monaco, "Cascadia Code", monospace',
      },
      fontSize: {
        base: '16px',
        small: '14px',
        large: '18px',
      },
      lineHeight: {
        tight: '1.3',
        normal: '1.6',
        relaxed: '1.8',
      },
    },
    spacing: {
      editorPadding: '2rem',
      editorMaxWidth: '720px',
      sidebarWidth: '240px',
    },
    effects: {
      borderRadius: '8px',
      shadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
      blur: '8px',
    },
  },
  {
    id: 'solarized-light',
    name: 'Solarized Light',
    description: 'Thème Solarized clair aux tons chauds',
    isBuiltin: true,
    version: '1.0.0',
    base: 'light',
    colors: {
      bg: '#fdf6e3',
      bgSecondary: '#eee8d5',
      editorBg: '#fdf6e3',
      text: '#657b83',
      textSecondary: '#839496',
      textMuted: '#93a1a1',
      accent: '#268bd2',
      accentHover: '#2aa198',
      border: '#d3cbbe',
      selection: 'rgba(38, 139, 210, 0.2)',
      highlight: {
        yellow: '#b58900',
        green: '#859900',
        blue: '#268bd2',
        pink: '#d33682',
        orange: '#cb4b16',
        purple: '#6c71c4',
      },
    },
    typography: {
      fontFamily: {
        ui: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        editor: 'system-ui, sans-serif',
        mono: '"SF Mono", Monaco, "Cascadia Code", monospace',
      },
      fontSize: {
        base: '16px',
        small: '14px',
        large: '18px',
      },
      lineHeight: {
        tight: '1.3',
        normal: '1.6',
        relaxed: '1.8',
      },
    },
    spacing: {
      editorPadding: '2rem',
      editorMaxWidth: '720px',
      sidebarWidth: '240px',
    },
    effects: {
      borderRadius: '8px',
      shadow: '0 2px 8px rgba(101, 123, 131, 0.1)',
      blur: '8px',
    },
  },
]

interface ThemeStore extends ThemeStoreState {
  // Actions
  loadThemes: () => Promise<void>
  getTheme: (id: string) => InterfaceTheme | undefined
  setActiveTheme: (id: string) => void
  createTheme: (theme: Partial<InterfaceTheme>) => Promise<string>
  updateTheme: (id: string, updates: Partial<InterfaceTheme>) => Promise<void>
  removeTheme: (id: string) => Promise<void>
  duplicateThemeAction: (id: string, newName?: string) => Promise<string>

  // Application
  applyTheme: (theme: InterfaceTheme) => void
  generateCssVariables: (theme: InterfaceTheme) => string
  getCurrentTheme: () => InterfaceTheme

  // Export/Import
  exportTheme: (id: string) => string | null
  importTheme: (json: string) => Promise<string>
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      themes: BUILTIN_THEMES,
      builtinThemes: BUILTIN_THEMES,
      customThemes: [],
      activeThemeId: 'light',
      isLoading: false,
      error: null,

      // Load themes from storage
      loadThemes: async () => {
        set({ isLoading: true, error: null })
        try {
          const storedThemes = await listThemes()

          // Load custom themes
          const customThemes: InterfaceTheme[] = []
          for (const meta of storedThemes) {
            if (!meta.isBuiltin) {
              try {
                const theme = await readTheme(meta.id)
                customThemes.push(theme)
              } catch (e) {
                console.error(`Failed to load theme ${meta.id}:`, e)
              }
            }
          }

          set({
            themes: [...BUILTIN_THEMES, ...customThemes],
            customThemes,
            isLoading: false,
          })

          // Apply the active theme
          const activeTheme = get().getCurrentTheme()
          get().applyTheme(activeTheme)
        } catch (error) {
          console.error('Failed to load themes:', error)
          set({ error: String(error), isLoading: false })
        }
      },

      // Get theme by ID
      getTheme: (id: string) => {
        return get().themes.find((t) => t.id === id)
      },

      // Set active theme
      setActiveTheme: (id: string) => {
        const theme = get().getTheme(id)
        if (!theme) {
          console.error(`Theme not found: ${id}`)
          return
        }

        set({ activeThemeId: id })
        get().applyTheme(theme)
      },

      // Create a new theme
      createTheme: async (partial: Partial<InterfaceTheme>) => {
        const id = `theme-${Date.now().toString(36)}`
        const base = get().getTheme(partial.base === 'dark' ? 'dark' : 'light') || BUILTIN_THEMES[0]

        const theme: InterfaceTheme = {
          ...base,
          ...partial,
          id,
          name: partial.name || 'Nouveau thème',
          isBuiltin: false,
          version: '1.0.0',
        }

        await saveTheme(theme)

        set((state) => ({
          themes: [...state.themes, theme],
          customThemes: [...state.customThemes, theme],
        }))

        return id
      },

      // Update a theme
      updateTheme: async (id: string, updates: Partial<InterfaceTheme>) => {
        const existing = get().getTheme(id)
        if (!existing) throw new Error(`Theme not found: ${id}`)
        if (existing.isBuiltin) throw new Error('Cannot modify builtin theme')

        const updated: InterfaceTheme = { ...existing, ...updates }

        await saveTheme(updated)

        set((state) => ({
          themes: state.themes.map((t) => (t.id === id ? updated : t)),
          customThemes: state.customThemes.map((t) => (t.id === id ? updated : t)),
        }))

        // If this is the active theme, reapply it
        if (get().activeThemeId === id) {
          get().applyTheme(updated)
        }
      },

      // Delete a theme
      removeTheme: async (id: string) => {
        const existing = get().getTheme(id)
        if (!existing) throw new Error(`Theme not found: ${id}`)
        if (existing.isBuiltin) throw new Error('Cannot delete builtin theme')

        await deleteTheme(id)

        // If deleting the active theme, switch to light
        const newActiveId = get().activeThemeId === id ? 'light' : get().activeThemeId

        set((state) => ({
          themes: state.themes.filter((t) => t.id !== id),
          customThemes: state.customThemes.filter((t) => t.id !== id),
          activeThemeId: newActiveId,
        }))

        if (newActiveId !== id) {
          const newTheme = get().getTheme(newActiveId)
          if (newTheme) get().applyTheme(newTheme)
        }
      },

      // Duplicate a theme
      duplicateThemeAction: async (id: string, newName?: string) => {
        const original = get().getTheme(id)
        if (!original) throw new Error(`Theme not found: ${id}`)

        return get().createTheme({
          ...original,
          name: newName || `${original.name} (copie)`,
        })
      },

      // Get current theme
      getCurrentTheme: () => {
        const theme = get().getTheme(get().activeThemeId)
        return theme || BUILTIN_THEMES[0]
      },

      // Apply theme to document
      applyTheme: (theme: InterfaceTheme) => {
        const root = document.documentElement

        // Set base class (light/dark)
        if (theme.base === 'dark') {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }

        // Set custom theme ID for non-builtin themes
        if (!theme.isBuiltin || !['light', 'dark'].includes(theme.id)) {
          root.setAttribute('data-theme', theme.id)
        } else {
          root.removeAttribute('data-theme')
        }

        // Apply CSS variables
        const cssVars = get().generateCssVariables(theme)
        let styleEl = document.getElementById('citadelle-theme-vars')
        if (!styleEl) {
          styleEl = document.createElement('style')
          styleEl.id = 'citadelle-theme-vars'
          document.head.appendChild(styleEl)
        }
        styleEl.textContent = `:root { ${cssVars} }`
      },

      // Generate CSS variables from theme
      generateCssVariables: (theme: InterfaceTheme) => {
        const vars: string[] = []

        // Colors
        vars.push(`--theme-bg: ${theme.colors.bg}`)
        vars.push(`--theme-bg-secondary: ${theme.colors.bgSecondary}`)
        vars.push(`--theme-editor-bg: ${theme.colors.editorBg}`)
        vars.push(`--theme-text: ${theme.colors.text}`)
        vars.push(`--theme-text-secondary: ${theme.colors.textSecondary}`)
        vars.push(`--theme-text-muted: ${theme.colors.textMuted}`)
        vars.push(`--theme-accent: ${theme.colors.accent}`)
        vars.push(`--theme-accent-hover: ${theme.colors.accentHover}`)
        vars.push(`--theme-border: ${theme.colors.border}`)
        vars.push(`--theme-selection: ${theme.colors.selection}`)

        // Highlight colors
        Object.entries(theme.colors.highlight).forEach(([key, value]) => {
          vars.push(`--theme-highlight-${key}: ${value}`)
        })

        // Typography
        vars.push(`--theme-font-ui: ${theme.typography.fontFamily.ui}`)
        vars.push(`--theme-font-editor: ${theme.typography.fontFamily.editor}`)
        vars.push(`--theme-font-mono: ${theme.typography.fontFamily.mono}`)
        vars.push(`--theme-font-size-base: ${theme.typography.fontSize.base}`)
        vars.push(`--theme-font-size-small: ${theme.typography.fontSize.small}`)
        vars.push(`--theme-font-size-large: ${theme.typography.fontSize.large}`)
        vars.push(`--theme-line-height-tight: ${theme.typography.lineHeight.tight}`)
        vars.push(`--theme-line-height-normal: ${theme.typography.lineHeight.normal}`)
        vars.push(`--theme-line-height-relaxed: ${theme.typography.lineHeight.relaxed}`)

        // Spacing
        vars.push(`--theme-editor-padding: ${theme.spacing.editorPadding}`)
        vars.push(`--theme-editor-max-width: ${theme.spacing.editorMaxWidth}`)
        vars.push(`--theme-sidebar-width: ${theme.spacing.sidebarWidth}`)

        // Effects
        vars.push(`--theme-border-radius: ${theme.effects.borderRadius}`)
        vars.push(`--theme-shadow: ${theme.effects.shadow}`)
        vars.push(`--theme-blur: ${theme.effects.blur}`)

        return vars.join('; ')
      },

      // Export theme to JSON
      exportTheme: (id: string) => {
        const theme = get().getTheme(id)
        if (!theme) return null
        return JSON.stringify(theme, null, 2)
      },

      // Import theme from JSON
      importTheme: async (json: string) => {
        const imported = JSON.parse(json) as InterfaceTheme

        // Generate new ID
        const id = `imported-${Date.now().toString(36)}`

        const theme: InterfaceTheme = {
          ...imported,
          id,
          isBuiltin: false,
        }

        await saveTheme(theme)

        set((state) => ({
          themes: [...state.themes, theme],
          customThemes: [...state.customThemes, theme],
        }))

        return id
      },
    }),
    {
      name: 'citadelle-theme',
      partialize: (state) => ({
        activeThemeId: state.activeThemeId,
      }),
    }
  )
)
