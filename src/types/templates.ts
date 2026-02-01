// Types for the template and layout system

import type { JSONContent } from '@tiptap/react'

// ============================================================================
// Document Templates
// ============================================================================

export type TemplateCategory = 'writing' | 'business' | 'academic' | 'personal' | 'legal' | 'custom'

export interface DocumentTemplate {
  id: string
  name: string
  description: string
  category: TemplateCategory
  icon: string
  version: string
  createdAt: string
  updatedAt: string
  isBuiltin: boolean
  isCustom: boolean
  content: JSONContent
  metadata: {
    defaultStyles: string[]
    suggestedLength?: 'short' | 'medium' | 'long'
    tags: string[]
  }
}

export interface DocumentTemplateMetadata {
  id: string
  name: string
  description: string
  category: TemplateCategory
  icon: string
  isBuiltin: boolean
  isCustom: boolean
  updatedAt: string
}

// ============================================================================
// Text Styles
// ============================================================================

export type StyleCategory = 'headings' | 'body' | 'blocks' | 'inline' | 'custom'
export type StyleNodeType = 'heading' | 'paragraph' | 'blockquote' | 'codeBlock' | 'listItem'

export interface TextStyleFormatting {
  fontFamily?: string
  fontSize?: string
  fontWeight?: string
  fontStyle?: string
  lineHeight?: string
  letterSpacing?: string
  color?: string
  backgroundColor?: string
  textDecoration?: string
  textTransform?: string
  marginTop?: string
  marginBottom?: string
  marginLeft?: string
  marginRight?: string
  paddingLeft?: string
  paddingRight?: string
  borderLeftWidth?: string
  borderLeftColor?: string
  borderLeftStyle?: string
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  textIndent?: string
}

export interface TextStyle {
  id: string
  name: string
  shortcut?: string
  isBuiltin: boolean
  category: StyleCategory
  nodeType: StyleNodeType
  attrs?: Record<string, unknown>
  formatting: TextStyleFormatting
  darkMode?: Partial<TextStyleFormatting>
}

export interface StylesConfig {
  version: string
  styles: TextStyle[]
  customStyles: TextStyle[]
}

// ============================================================================
// Export Templates
// ============================================================================

export type PageSize = 'A4' | 'Letter' | 'Legal' | 'A5' | 'custom'
export type PageOrientation = 'portrait' | 'landscape'
export type ExportFormat = 'pdf' | 'html' | 'docx'

export interface PageMargins {
  top: string
  bottom: string
  left: string
  right: string
}

export interface PageLayout {
  size: PageSize
  orientation: PageOrientation
  margins: PageMargins
  customSize?: {
    width: string
    height: string
  }
}

export interface HeaderFooterContent {
  left: string
  center: string
  right: string
}

export interface HeaderFooterStyle {
  fontFamily?: string
  fontSize?: string
  fontStyle?: string
  color?: string
  borderBottom?: string
  borderTop?: string
  paddingBottom?: string
  paddingTop?: string
}

export interface HeaderFooter {
  enabled: boolean
  height: string
  content: HeaderFooterContent
  style: HeaderFooterStyle
}

export interface ExportTypography {
  baseFontSize: string
  headingScale: number
  lineHeight: number
  paragraphSpacing: string
}

export interface ExportTemplate {
  id: string
  name: string
  description: string
  format: ExportFormat[]
  isBuiltin: boolean
  version: string
  pageLayout: PageLayout
  header: HeaderFooter
  footer: HeaderFooter
  typography: ExportTypography
  styles: Record<string, Record<string, string>>
  coverPage?: {
    enabled: boolean
    template: string | null
  }
}

// ============================================================================
// Interface Themes
// ============================================================================

export type ThemeBase = 'light' | 'dark'

export interface ThemeColors {
  bg: string
  bgSecondary: string
  editorBg: string
  text: string
  textSecondary: string
  textMuted: string
  accent: string
  accentHover: string
  border: string
  selection: string
  highlight: {
    yellow: string
    green: string
    blue: string
    pink: string
    orange: string
    purple: string
  }
}

export interface ThemeTypography {
  fontFamily: {
    ui: string
    editor: string
    mono: string
  }
  fontSize: {
    base: string
    small: string
    large: string
  }
  lineHeight: {
    tight: string
    normal: string
    relaxed: string
  }
}

export interface ThemeSpacing {
  editorPadding: string
  editorMaxWidth: string
  sidebarWidth: string
}

export interface ThemeEffects {
  borderRadius: string
  shadow: string
  blur: string
}

export interface InterfaceTheme {
  id: string
  name: string
  description: string
  isBuiltin: boolean
  version: string
  base: ThemeBase
  colors: ThemeColors
  typography: ThemeTypography
  spacing: ThemeSpacing
  effects: ThemeEffects
}

// ============================================================================
// Store Types
// ============================================================================

export interface TemplateStoreState {
  templates: DocumentTemplate[]
  builtinTemplates: DocumentTemplate[]
  customTemplates: DocumentTemplate[]
  selectedCategory: TemplateCategory | null
  searchQuery: string
  isLoading: boolean
  error: string | null
}

export interface StyleStoreState {
  styles: TextStyle[]
  builtinStyles: TextStyle[]
  customStyles: TextStyle[]
  activeStyleId: string | null
  recentStyles: string[]
  isLoading: boolean
  error: string | null
}

export interface ExportTemplateStoreState {
  templates: ExportTemplate[]
  selectedTemplateId: string | null
  previewHtml: string | null
  isExporting: boolean
  error: string | null
}

export interface ThemeStoreState {
  themes: InterfaceTheme[]
  builtinThemes: InterfaceTheme[]
  customThemes: InterfaceTheme[]
  activeThemeId: string
  isLoading: boolean
  error: string | null
}

// ============================================================================
// Tauri Command Types
// ============================================================================

export interface TauriTemplateMetadata {
  id: string
  name: string
  description: string
  category: string
  icon: string
  is_builtin: boolean
  created_at: string
  updated_at: string
}

export interface TauriTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: string
  version: string
  is_builtin: boolean
  is_custom: boolean
  created_at: string
  updated_at: string
  content: JSONContent
  metadata: {
    default_styles: string[]
    suggested_length?: string
    tags: string[]
  }
}

// ============================================================================
// Export Variables (for template interpolation)
// ============================================================================

export interface ExportVariable {
  key: string
  description: string
  example: string
}

export const EXPORT_VARIABLES: ExportVariable[] = [
  { key: '{{document.title}}', description: 'Titre du document', example: 'Mon Article' },
  { key: '{{document.author}}', description: 'Auteur du document', example: 'Jean Dupont' },
  { key: '{{date.format("DD/MM/YYYY")}}', description: 'Date formatée', example: '15/01/2024' },
  { key: '{{date.format("MMMM YYYY")}}', description: 'Mois et année', example: 'Janvier 2024' },
  { key: '{{page.current}}', description: 'Numéro de page actuel', example: '1' },
  { key: '{{page.total}}', description: 'Nombre total de pages', example: '10' },
  { key: '{{wordCount}}', description: 'Nombre de mots', example: '1500' },
]

// ============================================================================
// Category Icons Mapping
// ============================================================================

export const TEMPLATE_CATEGORY_ICONS: Record<TemplateCategory, string> = {
  writing: 'pencil',
  business: 'briefcase',
  academic: 'graduation-cap',
  personal: 'user',
  legal: 'scale',
  custom: 'star',
}

export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  writing: 'Rédaction',
  business: 'Professionnel',
  academic: 'Académique',
  personal: 'Personnel',
  legal: 'Juridique',
  custom: 'Personnalisé',
}

export const STYLE_CATEGORY_LABELS: Record<StyleCategory, string> = {
  headings: 'Titres',
  body: 'Corps de texte',
  blocks: 'Blocs',
  inline: 'En ligne',
  custom: 'Personnalisé',
}
