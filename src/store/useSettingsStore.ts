import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'sepia' | 'midnight' | 'auto'
export type TypewriterHighlightStyle = 'line' | 'sentence' | 'paragraph'
export type TypewriterScrollPosition = 'top' | 'middle' | 'bottom' | 'variable' | 'none'
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'orange' | 'purple'
export type HeadingNumberingStyle = 'juridique' | 'numeric'

export interface HeadingNumberingConfig {
  enabled: boolean
  style: HeadingNumberingStyle
  startLevel: number // 1-6, H2 maps to level 1
}


// Highlight color values for light and dark modes
export const HIGHLIGHT_COLORS: Record<HighlightColor, { light: string; dark: string; name: string }> = {
  yellow: { light: '#fef08a', dark: '#854d0e', name: 'Jaune' },
  green: { light: '#bbf7d0', dark: '#166534', name: 'Vert' },
  blue: { light: '#bfdbfe', dark: '#1e40af', name: 'Bleu' },
  pink: { light: '#fbcfe8', dark: '#9d174d', name: 'Rose' },
  orange: { light: '#fed7aa', dark: '#9a3412', name: 'Orange' },
  purple: { light: '#ddd6fe', dark: '#5b21b6', name: 'Violet' },
}

interface SettingsStore {
  // Theme
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void

  // Editor preferences
  fontSize: number
  fontFamily: string
  lineHeight: number
  paragraphIndent: number // Retrait première ligne en cm (0, 0.5, 1, 1.5, 2)
  paragraphSpacing: number // Espacement entre paragraphes en em
  showLineNumbers: boolean
  wordWrap: boolean
  autoSave: boolean
  autoSaveInterval: number
  spellcheckEnabled: boolean
  frenchTypography: boolean

  // Typewriter mode
  typewriterMode: boolean
  typewriterDimOpacity: number
  typewriterHighlightStyle: TypewriterHighlightStyle
  typewriterScrollPosition: TypewriterScrollPosition
  typewriterMarkLine: boolean

  // General preferences
  recentFilesCount: number
  confirmTabClose: boolean
  restoreSession: boolean

  // Highlight color
  highlightColor: HighlightColor

  // Editor letterhead
  afficherCartoucheEditeur: boolean

  // Bubble toolbar
  showBubbleToolbar: boolean

  // Accent color (null = theme default)
  accentColor: string | null

  // Heading numbering
  headingNumbering: HeadingNumberingConfig

  // Setters
  setFontSize: (size: number) => void
  setFontFamily: (family: string) => void
  setLineHeight: (height: number) => void
  setParagraphIndent: (indent: number) => void
  setParagraphSpacing: (spacing: number) => void
  setShowLineNumbers: (show: boolean) => void
  setWordWrap: (wrap: boolean) => void
  setAutoSave: (enabled: boolean) => void
  setAutoSaveInterval: (interval: number) => void
  setSpellcheck: (enabled: boolean) => void
  setFrenchTypography: (enabled: boolean) => void
  setRecentFilesCount: (count: number) => void
  setConfirmTabClose: (confirm: boolean) => void
  setRestoreSession: (restore: boolean) => void
  setHighlightColor: (color: HighlightColor) => void
  setAfficherCartoucheEditeur: (show: boolean) => void
  setShowBubbleToolbar: (show: boolean) => void
  setAccentColor: (color: string | null) => void

  // Heading numbering setters
  setHeadingNumbering: (config: Partial<HeadingNumberingConfig>) => void

  // Typewriter setters
  setTypewriterMode: (enabled: boolean) => void
  setTypewriterDimOpacity: (opacity: number) => void
  setTypewriterHighlightStyle: (style: TypewriterHighlightStyle) => void
  setTypewriterScrollPosition: (position: TypewriterScrollPosition) => void
  setTypewriterMarkLine: (mark: boolean) => void
  toggleTypewriterMode: () => void

  // Export/Import
  exportSettings: () => string
  importSettings: (json: string) => void
  resetToDefaults: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'auto',
      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },
      toggleTheme: () => {
        const currentTheme = get().theme
        const themes: Theme[] = ['light', 'dark', 'sepia', 'midnight']
        const currentIndex = themes.indexOf(currentTheme as any)
        const nextTheme = themes[(currentIndex + 1) % themes.length]
        get().setTheme(nextTheme)
      },

      // Editor preferences
      fontSize: 16,
      fontFamily: 'Garamond, serif',
      lineHeight: 1.6,
      paragraphIndent: 0, // 0 cm par défaut
      paragraphSpacing: 1, // 1em par défaut
      showLineNumbers: false,
      wordWrap: true,
      autoSave: true,
      autoSaveInterval: 3000, // 3 seconds
      spellcheckEnabled: true,
      frenchTypography: true,

      // Typewriter mode
      typewriterMode: false,
      typewriterDimOpacity: 0.4,
      typewriterHighlightStyle: 'paragraph' as TypewriterHighlightStyle,
      typewriterScrollPosition: 'middle' as TypewriterScrollPosition,
      typewriterMarkLine: true,

      // General preferences
      recentFilesCount: 20,
      confirmTabClose: true,
      restoreSession: true,

      // Highlight color
      highlightColor: 'yellow' as HighlightColor,

      // Editor letterhead
      afficherCartoucheEditeur: true,

      // Bubble toolbar
      showBubbleToolbar: true,

      // Accent color
      accentColor: null as string | null,

      // Heading numbering
      headingNumbering: {
        enabled: true,
        style: 'juridique' as HeadingNumberingStyle,
        startLevel: 1,
      },

      // Setters
      setFontSize: (size) => set({ fontSize: Math.max(10, Math.min(24, size)) }),
      setFontFamily: (family) => set({ fontFamily: family }),
      setLineHeight: (height) =>
        set({ lineHeight: Math.max(1.0, Math.min(2.0, height)) }),
      setParagraphIndent: (indent) =>
        set({ paragraphIndent: Math.max(0, Math.min(3, indent)) }),
      setParagraphSpacing: (spacing) =>
        set({ paragraphSpacing: Math.max(0.5, Math.min(3, spacing)) }),
      setShowLineNumbers: (show) => set({ showLineNumbers: show }),
      setWordWrap: (wrap) => set({ wordWrap: wrap }),
      setAutoSave: (enabled) => set({ autoSave: enabled }),
      setAutoSaveInterval: (interval) =>
        set({ autoSaveInterval: Math.max(1000, interval) }),
      setSpellcheck: (enabled) => set({ spellcheckEnabled: enabled }),
      setFrenchTypography: (enabled) => set({ frenchTypography: enabled }),
      setRecentFilesCount: (count) =>
        set({ recentFilesCount: Math.max(5, Math.min(50, count)) }),
      setConfirmTabClose: (confirm) => set({ confirmTabClose: confirm }),
      setRestoreSession: (restore) => set({ restoreSession: restore }),
      setHighlightColor: (color) => set({ highlightColor: color }),
      setAfficherCartoucheEditeur: (show) => set({ afficherCartoucheEditeur: show }),
      setShowBubbleToolbar: (show) => set({ showBubbleToolbar: show }),
      setAccentColor: (color) => {
        set({ accentColor: color })
        applyAccentColor(color)
      },

      // Heading numbering setters
      setHeadingNumbering: (config) =>
        set((state) => ({
          headingNumbering: { ...state.headingNumbering, ...config },
        })),

      // Typewriter setters
      setTypewriterMode: (enabled) => set({ typewriterMode: enabled }),
      setTypewriterDimOpacity: (opacity) =>
        set({ typewriterDimOpacity: Math.max(0.2, Math.min(0.6, opacity)) }),
      setTypewriterHighlightStyle: (style) => set({ typewriterHighlightStyle: style }),
      setTypewriterScrollPosition: (position) => set({ typewriterScrollPosition: position }),
      setTypewriterMarkLine: (mark) => set({ typewriterMarkLine: mark }),
      toggleTypewriterMode: () => set((state) => ({ typewriterMode: !state.typewriterMode })),

      // Export/Import
      exportSettings: () => {
        return JSON.stringify(get(), null, 2)
      },
      importSettings: (json) => {
        try {
          const settings = JSON.parse(json)
          set(settings)
          if (settings.theme) {
            applyTheme(settings.theme)
          }
        } catch (error) {
          console.error('Failed to import settings:', error)
          throw new Error('Format de fichier invalide')
        }
      },
      resetToDefaults: () => {
        set({
          theme: 'auto',
          fontSize: 16,
          fontFamily: 'Garamond, serif',
          lineHeight: 1.6,
          paragraphIndent: 0,
          paragraphSpacing: 1,
          showLineNumbers: false,
          wordWrap: true,
          autoSave: true,
          autoSaveInterval: 3000,
          spellcheckEnabled: true,
          frenchTypography: true,
          typewriterMode: false,
          typewriterDimOpacity: 0.4,
          typewriterHighlightStyle: 'paragraph' as TypewriterHighlightStyle,
          typewriterScrollPosition: 'middle' as TypewriterScrollPosition,
          typewriterMarkLine: true,
          recentFilesCount: 20,
          confirmTabClose: true,
          restoreSession: true,
          highlightColor: 'yellow' as HighlightColor,
          afficherCartoucheEditeur: true,
          showBubbleToolbar: true,
          accentColor: null,
          headingNumbering: {
            enabled: true,
            style: 'juridique' as HeadingNumberingStyle,
            startLevel: 1,
          },
        })
        applyTheme('auto')
        applyAccentColor(null)
      },
    }),
    {
      name: 'citadelle-settings', // localStorage key
    }
  )
)

// Apply custom accent color override
function applyAccentColor(color: string | null) {
  const root = document.documentElement
  if (color) {
    root.style.setProperty('--accent', color)
    // Derive a hover color (slightly lighter/different)
    root.style.setProperty('--accent-hover', color)
  } else {
    root.style.removeProperty('--accent')
    root.style.removeProperty('--accent-hover')
  }
}

// Apply theme to document
function applyTheme(theme: Theme) {
  const root = document.documentElement

  if (theme === 'auto') {
    // Follow system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
    root.removeAttribute('data-theme')
  } else if (theme === 'dark') {
    root.classList.add('dark')
    root.removeAttribute('data-theme')
  } else if (theme === 'light') {
    root.classList.remove('dark')
    root.removeAttribute('data-theme')
  } else if (theme === 'sepia') {
    root.classList.remove('dark')
    root.setAttribute('data-theme', 'sepia')
  } else if (theme === 'midnight') {
    root.classList.add('dark')
    root.setAttribute('data-theme', 'midnight')
  }
}

// Initialize theme on load
if (typeof window !== 'undefined') {
  const storedSettings = localStorage.getItem('citadelle-settings')
  if (storedSettings) {
    try {
      const { state } = JSON.parse(storedSettings)
      applyTheme(state.theme || 'auto')
      if (state.accentColor) applyAccentColor(state.accentColor)
    } catch (e) {
      applyTheme('auto')
    }
  } else {
    applyTheme('auto')
  }
}
