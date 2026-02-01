// Types pour le système d'export unifié

import type { JSONContent } from '@tiptap/react'
import type { ClauseDomaine, ClauseType } from '../../types/editor-features'
import type {
  JuridictionType,
  SolutionType
} from '../../types/legal'
import type { PageLayout, HeaderFooter, ExportTypography } from '../../types/templates'

// ============================================================================
// Types de modèles exportables
// ============================================================================

export type ExportModelType =
  | 'document'
  | 'clause'
  | 'bordereau'
  | 'jurisprudence'
  | 'defined-term'

// ============================================================================
// Formats d'export
// ============================================================================

export type UnifiedExportFormat =
  | 'pdf'
  | 'docx'
  | 'html'
  | 'markdown'
  | 'csv'
  | 'json'

// Matrice de compatibilité format/modèle
export const FORMAT_SUPPORT: Record<ExportModelType, UnifiedExportFormat[]> = {
  document: ['pdf', 'docx', 'html', 'markdown', 'json'],
  clause: ['pdf', 'docx', 'html', 'markdown', 'csv', 'json'],
  bordereau: ['pdf', 'docx', 'html', 'csv'],
  jurisprudence: ['pdf', 'docx', 'csv', 'json'],
  'defined-term': ['pdf', 'docx', 'csv', 'json'],
}

// Labels des formats
export const FORMAT_LABELS: Record<UnifiedExportFormat, string> = {
  pdf: 'PDF',
  docx: 'Word',
  html: 'HTML',
  markdown: 'Markdown',
  csv: 'CSV',
  json: 'JSON',
}

// Labels des modèles
export const MODEL_LABELS: Record<ExportModelType, string> = {
  document: 'Document actuel',
  clause: 'Clauses',
  bordereau: 'Bordereau de pièces',
  jurisprudence: 'Jurisprudence',
  'defined-term': 'Termes définis',
}

// Descriptions des modèles
export const MODEL_DESCRIPTIONS: Record<ExportModelType, string> = {
  document: 'Contenu du document en cours d\'édition',
  clause: 'Bibliothèque de clauses juridiques',
  bordereau: 'Index des pièces numérotées',
  jurisprudence: 'Citations et références jurisprudentielles',
  'defined-term': 'Glossaire des termes définis',
}

// ============================================================================
// Sélection de données à exporter
// ============================================================================

export interface ExportModelSelection {
  type: ExportModelType
  enabled: boolean
  ids?: string[]  // IDs spécifiques, ou tous si non défini
  filters?: ExportFilters
}

export interface ExportFilters {
  // Filtres pour clauses
  clauseDomaine?: ClauseDomaine | 'all'
  clauseType?: ClauseType | 'all'
  clauseFavoritesOnly?: boolean

  // Filtres pour jurisprudence
  juridictionType?: JuridictionType | 'all'
  solutionType?: SolutionType | 'all'
  dateRange?: {
    from?: string
    to?: string
  }
}

// ============================================================================
// Options d'export
// ============================================================================

export interface ExportOptions {
  // Nom du fichier de sortie (sans extension)
  filename?: string

  // Métadonnées
  includeMetadata: boolean
  includeTimestamp: boolean

  // Options documents/PDF/DOCX
  includeLetterhead: boolean
  includeSignature: boolean
  includePageNumbers: boolean

  // Template à utiliser (si applicable)
  templateId?: string

  // Options CSV
  csvOptions?: CSVExportOptions
}

export interface CSVExportOptions {
  delimiter: ',' | ';' | '\t'
  includeHeaders: boolean
  encoding: 'utf-8' | 'utf-8-bom'
  dateFormat: 'iso' | 'fr' | 'fr-short'
}

export const DEFAULT_CSV_OPTIONS: CSVExportOptions = {
  delimiter: ';',
  includeHeaders: true,
  encoding: 'utf-8-bom',  // Pour compatibilité Excel
  dateFormat: 'fr',
}

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  includeMetadata: true,
  includeTimestamp: true,
  includeLetterhead: true,
  includeSignature: false,
  includePageNumbers: true,
  csvOptions: DEFAULT_CSV_OPTIONS,
}

// ============================================================================
// Requête d'export
// ============================================================================

export interface ExportRequest {
  models: ExportModelSelection[]
  format: UnifiedExportFormat
  options: ExportOptions
}

// ============================================================================
// Données exportables (format intermédiaire)
// ============================================================================

export interface ExportData {
  type: ExportModelType
  title: string
  metadata?: Record<string, unknown>
  content: ExportContent
}

export type ExportContent =
  | DocumentExportContent
  | TableExportContent
  | CitationExportContent

export interface DocumentExportContent {
  kind: 'document'
  jsonContent: JSONContent
}

export interface TableExportContent {
  kind: 'table'
  headers: string[]
  rows: (string | number | boolean | null)[][]
}

export interface CitationExportContent {
  kind: 'citations'
  citations: {
    short: string
    full: string
    resume?: string
  }[]
}

// ============================================================================
// Résultat d'export
// ============================================================================

export interface ExportResult {
  success: boolean
  format: UnifiedExportFormat
  filename: string
  data?: Uint8Array | string
  mimeType?: string
  error?: string
}

// ============================================================================
// Progression d'export
// ============================================================================

export interface ExportProgress {
  status: 'idle' | 'preparing' | 'converting' | 'formatting' | 'complete' | 'error'
  current: number
  total: number
  currentItem?: string
  error?: string
}

// ============================================================================
// Interface Adapter (convertisseur modèle → données exportables)
// ============================================================================

export interface ExportAdapter<T> {
  type: ExportModelType
  supportedFormats: UnifiedExportFormat[]

  // Convertit les données du modèle en format exportable
  adapt(data: T | T[], options: ExportOptions): ExportData

  // Récupère les données depuis les stores
  fetchData(selection: ExportModelSelection): Promise<T[]>
}

// ============================================================================
// Interface Formatter (génère le fichier de sortie)
// ============================================================================

export interface ExportFormatter {
  formatType: UnifiedExportFormat
  mimeType: string
  extension: string

  // Formate les données en fichier de sortie
  formatData(data: ExportData[], options: ExportOptions): Promise<ExportResult>
}

// ============================================================================
// Templates d'export par modèle
// ============================================================================

export interface ModelExportTemplate {
  id: string
  name: string
  description: string
  modelType: ExportModelType
  formats: UnifiedExportFormat[]
  isBuiltin: boolean

  // Configuration spécifique au modèle
  config: {
    // Colonnes à inclure (pour CSV/table)
    columns?: string[]

    // Style pour PDF/DOCX
    pageLayout?: Partial<PageLayout>
    typography?: Partial<ExportTypography>
    header?: Partial<HeaderFooter>
    footer?: Partial<HeaderFooter>

    // Tri et groupement
    sortBy?: string
    groupBy?: string
  }
}

// Templates intégrés
export const BUILTIN_MODEL_TEMPLATES: ModelExportTemplate[] = [
  {
    id: 'bordereau-standard',
    name: 'Bordereau standard',
    description: 'Format classique pour bordereau de communication de pièces',
    modelType: 'bordereau',
    formats: ['pdf', 'docx', 'csv'],
    isBuiltin: true,
    config: {
      columns: ['numero', 'titre', 'nature', 'dateDocument', 'pagination'],
      sortBy: 'numero',
    },
  },
  {
    id: 'jurisprudence-bibliographie',
    name: 'Bibliographie juridique',
    description: 'Format bibliographique pour citations de jurisprudence',
    modelType: 'jurisprudence',
    formats: ['pdf', 'docx'],
    isBuiltin: true,
    config: {
      sortBy: 'date',
      groupBy: 'juridiction',
    },
  },
  {
    id: 'jurisprudence-tableau',
    name: 'Tableau de jurisprudence',
    description: 'Format tabulaire pour export CSV',
    modelType: 'jurisprudence',
    formats: ['csv'],
    isBuiltin: true,
    config: {
      columns: ['citationCourte', 'date', 'juridiction', 'solution', 'matieres'],
      sortBy: 'date',
    },
  },
  {
    id: 'clauses-catalogue',
    name: 'Catalogue de clauses',
    description: 'Liste structurée des clauses par domaine',
    modelType: 'clause',
    formats: ['pdf', 'docx'],
    isBuiltin: true,
    config: {
      groupBy: 'domaine',
      sortBy: 'titre',
    },
  },
  {
    id: 'clauses-liste',
    name: 'Liste des clauses',
    description: 'Export simple en liste',
    modelType: 'clause',
    formats: ['csv'],
    isBuiltin: true,
    config: {
      columns: ['titre', 'domaine', 'type', 'tags', 'usageCount'],
      sortBy: 'titre',
    },
  },
]
