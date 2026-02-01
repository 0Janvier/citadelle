// Types pour la bibliothèque unifiée (clauses + snippets)

import type { JSONContent } from '@tiptap/react'

// ============================================================================
// Types de base
// ============================================================================

export type LibraryItemType = 'clause' | 'snippet'
export type ContentFormat = 'richtext' | 'plaintext'
export type ItemSource = 'builtin' | 'custom' | 'modified-builtin' | 'imported'

// ============================================================================
// Catégories
// ============================================================================

export interface LibraryCategory {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  parentId?: string | null // Pour catégories imbriquées (2 niveaux max)
  isBuiltin: boolean
  order: number
  itemType?: LibraryItemType // Si null, accepte les deux types
  createdAt: string
  updatedAt: string
}

// Catégories par défaut (built-in)
export const DEFAULT_CATEGORIES: Omit<LibraryCategory, 'createdAt' | 'updatedAt'>[] = [
  // Catégories clauses (legacy domaines)
  { id: 'cat-contrats', name: 'Contrats', icon: 'file-text', color: '#3b82f6', parentId: null, isBuiltin: true, order: 1, itemType: 'clause' },
  { id: 'cat-baux', name: 'Baux', icon: 'home', color: '#10b981', parentId: null, isBuiltin: true, order: 2, itemType: 'clause' },
  { id: 'cat-societes', name: 'Sociétés', icon: 'briefcase', color: '#8b5cf6', parentId: null, isBuiltin: true, order: 3, itemType: 'clause' },
  { id: 'cat-travail', name: 'Droit du travail', icon: 'users', color: '#f59e0b', parentId: null, isBuiltin: true, order: 4, itemType: 'clause' },
  { id: 'cat-famille', name: 'Droit de la famille', icon: 'heart', color: '#ec4899', parentId: null, isBuiltin: true, order: 5, itemType: 'clause' },
  { id: 'cat-immobilier', name: 'Immobilier', icon: 'building', color: '#06b6d4', parentId: null, isBuiltin: true, order: 6, itemType: 'clause' },
  { id: 'cat-commercial', name: 'Commercial', icon: 'shopping-cart', color: '#84cc16', parentId: null, isBuiltin: true, order: 7, itemType: 'clause' },
  { id: 'cat-clause-autre', name: 'Autre (Clauses)', icon: 'folder', color: '#6b7280', parentId: null, isBuiltin: true, order: 8, itemType: 'clause' },

  // Catégories snippets (legacy categories)
  { id: 'cat-contentieux', name: 'Contentieux', icon: 'gavel', color: '#ef4444', parentId: null, isBuiltin: true, order: 10, itemType: 'snippet' },
  { id: 'cat-contractuel', name: 'Contractuel', icon: 'handshake', color: '#3b82f6', parentId: null, isBuiltin: true, order: 11, itemType: 'snippet' },
  { id: 'cat-courrier', name: 'Courrier', icon: 'mail', color: '#8b5cf6', parentId: null, isBuiltin: true, order: 12, itemType: 'snippet' },
  { id: 'cat-general', name: 'Général', icon: 'file', color: '#6b7280', parentId: null, isBuiltin: true, order: 13, itemType: 'snippet' },
  { id: 'cat-custom', name: 'Personnalisés', icon: 'star', color: '#f59e0b', parentId: null, isBuiltin: true, order: 14 },
]

// Mapping legacy domaine/category vers categoryId
export const LEGACY_DOMAINE_TO_CATEGORY: Record<string, string> = {
  contrats: 'cat-contrats',
  baux: 'cat-baux',
  societes: 'cat-societes',
  travail: 'cat-travail',
  famille: 'cat-famille',
  immobilier: 'cat-immobilier',
  commercial: 'cat-commercial',
  autre: 'cat-clause-autre',
}

export const LEGACY_SNIPPET_CATEGORY_TO_CATEGORY: Record<string, string> = {
  contentieux: 'cat-contentieux',
  contractuel: 'cat-contractuel',
  courrier: 'cat-courrier',
  general: 'cat-general',
  custom: 'cat-custom',
}

// ============================================================================
// Item de bibliothèque unifié
// ============================================================================

export interface LibraryItem {
  // Identité
  id: string
  type: LibraryItemType
  version: number

  // Contenu
  title: string
  description?: string
  content: string | JSONContent // Texte brut ou rich text TipTap
  contentFormat: ContentFormat
  searchText: string // Version texte pré-calculée pour recherche

  // Classification
  categoryId: string
  tags: string[]

  // Spécifique snippets: raccourci clavier
  shortcut?: string // Ex: "/plaise"
  variables: string[] // Variables extraites: ["client.nom", "date"]

  // Legacy: champs pour migration/compatibilité
  legacyDomaine?: string // Ancien champ domaine pour clauses
  legacyClauseType?: string // Ancien champ type pour clauses
  legacySnippetCategory?: string // Ancien champ category pour snippets

  // Provenance
  source: ItemSource
  builtinId?: string // Référence à l'original si modified-builtin

  // Métadonnées utilisateur
  isFavorite: boolean
  usageCount: number

  // Timestamps
  createdAt: string
  updatedAt: string
  lastUsedAt?: string
}

// ============================================================================
// Métadonnées de la bibliothèque
// ============================================================================

export interface LibraryMetadata {
  version: string // Version du schéma
  migratedFrom?: string // Version précédente si migration
  lastBackup?: string
  itemCount: number
  categoryCount: number
  createdAt: string
  updatedAt: string
}

export const CURRENT_LIBRARY_VERSION = '1.0.0'

// ============================================================================
// État du store
// ============================================================================

export type SortOption = 'title' | 'usage' | 'recent' | 'created' | 'updated'
export type SortDirection = 'asc' | 'desc'

export interface LibraryFilters {
  searchQuery: string
  selectedCategoryId: string | null
  selectedType: LibraryItemType | 'all'
  showFavoritesOnly: boolean
  showBuiltinOnly: boolean
  showCustomOnly: boolean
  sortBy: SortOption
  sortDirection: SortDirection
}

export const DEFAULT_FILTERS: LibraryFilters = {
  searchQuery: '',
  selectedCategoryId: null,
  selectedType: 'all',
  showFavoritesOnly: false,
  showBuiltinOnly: false,
  showCustomOnly: false,
  sortBy: 'title',
  sortDirection: 'asc',
}

// ============================================================================
// Import/Export
// ============================================================================

export interface LibraryExport {
  version: string
  exportedAt: string
  items: LibraryItem[]
  categories: LibraryCategory[]
}

export interface ImportResult {
  success: boolean
  itemsImported: number
  categoriesImported: number
  itemsSkipped: number
  errors: string[]
}

export interface MigrationResult {
  success: boolean
  clausesMigrated: number
  snippetsMigrated: number
  categoriesCreated: number
  errors: string[]
  backupPath?: string
}

// ============================================================================
// Utilitaires
// ============================================================================

// Extraire les variables d'un contenu texte
export function extractVariables(content: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g
  const variables: string[] = []
  let match
  while ((match = regex.exec(content)) !== null) {
    const variable = match[1].trim()
    if (!variables.includes(variable)) {
      variables.push(variable)
    }
  }
  return variables
}

// Convertir JSONContent en texte pour recherche
export function jsonContentToSearchText(content: JSONContent): string {
  if (!content) return ''

  const extractText = (node: JSONContent): string => {
    if (node.text) return node.text
    if (node.content && Array.isArray(node.content)) {
      return node.content.map(extractText).join(' ')
    }
    return ''
  }

  return extractText(content).trim()
}

// Générer un ID unique
export function generateLibraryItemId(type: LibraryItemType): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${type}-${timestamp}-${random}`
}

// Générer un ID de catégorie
export function generateCategoryId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 6)
  return `cat-${timestamp}-${random}`
}

// Valider un raccourci (doit commencer par /)
export function isValidShortcut(shortcut: string): boolean {
  return /^\/[a-z0-9_-]+$/i.test(shortcut)
}

// Normaliser un raccourci
export function normalizeShortcut(shortcut: string): string {
  let normalized = shortcut.toLowerCase().trim()
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized
  }
  return normalized.replace(/[^a-z0-9_/-]/g, '')
}

// Labels pour l'UI
export const ITEM_TYPE_LABELS: Record<LibraryItemType, string> = {
  clause: 'Clause',
  snippet: 'Formule',
}

export const SOURCE_LABELS: Record<ItemSource, string> = {
  builtin: 'Intégré',
  custom: 'Personnalisé',
  'modified-builtin': 'Modifié',
  imported: 'Importé',
}

export const CONTENT_FORMAT_LABELS: Record<ContentFormat, string> = {
  richtext: 'Texte riche',
  plaintext: 'Texte brut',
}
