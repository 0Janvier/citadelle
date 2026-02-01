// Template Storage - Interface with Tauri commands for template management

import { invoke } from '@tauri-apps/api/tauri'
import type {
  DocumentTemplate,
  DocumentTemplateMetadata,
  TextStyle,
  StylesConfig,
  ExportTemplate,
  InterfaceTheme,
  TemplateCategory,
} from '../types/templates'

// ============================================================================
// User Data Directory
// ============================================================================

/**
 * Get the path to the Citadelle user data directory (~/.citadelle)
 */
export async function getUserDataPath(): Promise<string> {
  return invoke<string>('get_user_data_path')
}

/**
 * Initialize the user data directory structure
 * Creates templates/documents, templates/export, styles, themes directories
 */
export async function initUserDataDir(): Promise<void> {
  return invoke<void>('init_user_data_dir')
}

// ============================================================================
// Document Templates
// ============================================================================

/**
 * List all document templates, optionally filtered by category
 */
export async function listTemplates(
  category?: TemplateCategory
): Promise<DocumentTemplateMetadata[]> {
  const result = await invoke<Array<{
    id: string
    name: string
    description: string
    category: string
    icon: string
    is_builtin: boolean
    is_custom: boolean
    updated_at: string
  }>>('list_templates', { category })

  return result.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category as TemplateCategory,
    icon: t.icon,
    isBuiltin: t.is_builtin,
    isCustom: t.is_custom,
    updatedAt: t.updated_at,
  }))
}

/**
 * Read a document template by its ID
 */
export async function readTemplate(id: string): Promise<DocumentTemplate> {
  const result = await invoke<{
    id: string
    name: string
    description: string
    category: string
    icon: string
    version: string
    created_at: string
    updated_at: string
    is_builtin: boolean
    is_custom: boolean
    content: unknown
    metadata: {
      default_styles: string[]
      suggested_length?: string
      tags: string[]
    }
  }>('read_template', { id })

  return {
    id: result.id,
    name: result.name,
    description: result.description,
    category: result.category as TemplateCategory,
    icon: result.icon,
    version: result.version,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
    isBuiltin: result.is_builtin,
    isCustom: result.is_custom,
    content: result.content as DocumentTemplate['content'],
    metadata: {
      defaultStyles: result.metadata.default_styles,
      suggestedLength: result.metadata.suggested_length as DocumentTemplate['metadata']['suggestedLength'],
      tags: result.metadata.tags,
    },
  }
}

/**
 * Save a document template (create or update)
 */
export async function saveTemplate(template: DocumentTemplate): Promise<void> {
  return invoke<void>('save_template', {
    template: {
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      icon: template.icon,
      version: template.version,
      created_at: template.createdAt,
      updated_at: new Date().toISOString(),
      is_builtin: template.isBuiltin,
      is_custom: template.isCustom,
      content: template.content,
      metadata: {
        default_styles: template.metadata.defaultStyles,
        suggested_length: template.metadata.suggestedLength,
        tags: template.metadata.tags,
      },
    },
  })
}

/**
 * Delete a document template by its ID
 * Note: Builtin templates cannot be deleted
 */
export async function deleteTemplate(id: string): Promise<void> {
  return invoke<void>('delete_template', { id })
}

// ============================================================================
// Text Styles
// ============================================================================

/**
 * Read the styles configuration
 */
export async function readStyles(): Promise<StylesConfig> {
  const result = await invoke<{
    version: string
    styles: TextStyle[]
    custom_styles: TextStyle[]
  }>('read_styles')

  return {
    version: result.version,
    styles: result.styles,
    customStyles: result.custom_styles,
  }
}

/**
 * Save the styles configuration
 */
export async function saveStyles(config: StylesConfig): Promise<void> {
  return invoke<void>('save_styles', {
    styles: {
      version: config.version,
      styles: config.styles,
      custom_styles: config.customStyles,
    },
  })
}

// ============================================================================
// Interface Themes
// ============================================================================

interface ThemeMetadata {
  id: string
  name: string
  description: string
  isBuiltin: boolean
  base: 'light' | 'dark'
}

/**
 * List all interface themes
 */
export async function listThemes(): Promise<ThemeMetadata[]> {
  const result = await invoke<Array<{
    id: string
    name: string
    description: string
    is_builtin: boolean
    base: string
  }>>('list_themes')

  return result.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    isBuiltin: t.is_builtin,
    base: t.base as 'light' | 'dark',
  }))
}

/**
 * Read a theme by its ID
 */
export async function readTheme(id: string): Promise<InterfaceTheme> {
  return invoke<InterfaceTheme>('read_theme', { id })
}

/**
 * Save a theme (create or update)
 */
export async function saveTheme(theme: InterfaceTheme): Promise<void> {
  return invoke<void>('save_theme', { theme })
}

/**
 * Delete a theme by its ID
 * Note: Builtin themes cannot be deleted
 */
export async function deleteTheme(id: string): Promise<void> {
  return invoke<void>('delete_theme', { id })
}

// ============================================================================
// Export Templates
// ============================================================================

interface ExportTemplateMetadata {
  id: string
  name: string
  description: string
  format: string[]
  isBuiltin: boolean
}

/**
 * List all export templates
 */
export async function listExportTemplates(): Promise<ExportTemplateMetadata[]> {
  const result = await invoke<Array<{
    id: string
    name: string
    description: string
    format: string[]
    isBuiltin: boolean
  }>>('list_export_templates')

  return result.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    format: t.format,
    isBuiltin: t.isBuiltin,
  }))
}

/**
 * Read an export template by its ID
 */
export async function readExportTemplate(id: string): Promise<ExportTemplate> {
  return invoke<ExportTemplate>('read_export_template', { id })
}

/**
 * Save an export template (create or update)
 */
export async function saveExportTemplate(template: ExportTemplate): Promise<void> {
  return invoke<void>('save_export_template', { template })
}

/**
 * Delete an export template by its ID
 * Note: Builtin export templates cannot be deleted
 */
export async function deleteExportTemplate(id: string): Promise<void> {
  return invoke<void>('delete_export_template', { id })
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a unique ID for a new template
 */
export function generateTemplateId(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const timestamp = Date.now().toString(36)
  return `${slug}-${timestamp}`
}

/**
 * Duplicate a template with a new ID
 */
export async function duplicateTemplate(
  id: string,
  newName?: string
): Promise<DocumentTemplate> {
  const original = await readTemplate(id)
  const name = newName || `${original.name} (copie)`

  const duplicate: DocumentTemplate = {
    ...original,
    id: generateTemplateId(name),
    name,
    isBuiltin: false,
    isCustom: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await saveTemplate(duplicate)
  return duplicate
}

/**
 * Duplicate a theme with a new ID
 */
export async function duplicateTheme(
  id: string,
  newName?: string
): Promise<InterfaceTheme> {
  const original = await readTheme(id)
  const name = newName || `${original.name} (copie)`

  const duplicate: InterfaceTheme = {
    ...original,
    id: generateTemplateId(name),
    name,
    isBuiltin: false,
  }

  await saveTheme(duplicate)
  return duplicate
}

/**
 * Export a template to a JSON file (for sharing)
 */
export function exportToJson<T>(data: T): string {
  return JSON.stringify(data, null, 2)
}

/**
 * Import a template from JSON string
 */
export function importFromJson<T>(json: string): T {
  return JSON.parse(json) as T
}
