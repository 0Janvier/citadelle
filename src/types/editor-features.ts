// Types pour les fonctionnalités avancées de l'éditeur juridique

import type { JSONContent } from '@tiptap/react'

// ============================================================================
// Clauses
// ============================================================================

export type ClauseDomaine =
  | 'contrats'
  | 'baux'
  | 'societes'
  | 'travail'
  | 'famille'
  | 'immobilier'
  | 'commercial'
  | 'autre'

export type ClauseType =
  | 'objet'
  | 'duree'
  | 'prix'
  | 'paiement'
  | 'resiliation'
  | 'responsabilite'
  | 'confidentialite'
  | 'litiges'
  | 'divers'

export const CLAUSE_DOMAINE_LABELS: Record<ClauseDomaine, string> = {
  contrats: 'Contrats',
  baux: 'Baux',
  societes: 'Sociétés',
  travail: 'Droit du travail',
  famille: 'Droit de la famille',
  immobilier: 'Immobilier',
  commercial: 'Commercial',
  autre: 'Autre',
}

export const CLAUSE_TYPE_LABELS: Record<ClauseType, string> = {
  objet: 'Objet',
  duree: 'Durée',
  prix: 'Prix / Rémunération',
  paiement: 'Modalités de paiement',
  resiliation: 'Résiliation',
  responsabilite: 'Responsabilité',
  confidentialite: 'Confidentialité',
  litiges: 'Règlement des litiges',
  divers: 'Dispositions diverses',
}

export interface Clause {
  id: string
  titre: string
  description?: string
  contenu: JSONContent
  texteRecherche: string        // Version texte pour la recherche
  domaine: ClauseDomaine
  type: ClauseType
  tags: string[]
  favoris: boolean
  usageCount: number
  isBuiltin: boolean
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Variables Dynamiques
// ============================================================================

export type VariableType = 'text' | 'date' | 'number' | 'select' | 'boolean'

export type VariableCategory =
  | 'client'
  | 'dossier'
  | 'avocat'
  | 'adverse'
  | 'juridiction'
  | 'date'
  | 'custom'

export const VARIABLE_CATEGORY_LABELS: Record<VariableCategory, string> = {
  client: 'Client',
  dossier: 'Dossier',
  avocat: 'Avocat',
  adverse: 'Partie adverse',
  juridiction: 'Juridiction',
  date: 'Dates',
  custom: 'Personnalisées',
}

export interface VariableDefinition {
  key: string                   // Ex: "client.nom"
  label: string                 // Ex: "Nom du client"
  category: VariableCategory
  type: VariableType
  defaultValue?: string
  options?: string[]            // Pour type 'select'
  placeholder?: string
  isBuiltin: boolean
}

export interface VariableValue {
  key: string
  value: string
  documentId?: string           // Si spécifique à un document
}

// ============================================================================
// Snippets
// ============================================================================

export type SnippetCategory = 'contentieux' | 'contractuel' | 'courrier' | 'general' | 'custom'

export const SNIPPET_CATEGORY_LABELS: Record<SnippetCategory, string> = {
  contentieux: 'Contentieux',
  contractuel: 'Contractuel',
  courrier: 'Courrier',
  general: 'Général',
  custom: 'Personnalisés',
}

export interface Snippet {
  id: string
  nom: string
  description?: string
  raccourci: string             // Ex: "/plaise"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contenu: string | Record<string, any> // Texte brut, variables, ou TipTap JSON
  category: SnippetCategory
  variables: string[]           // Variables utilisées (ex: ["client.nom"])
  isBuiltin: boolean
  usageCount: number
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Commentaires et Révisions
// ============================================================================

export type CommentStatus = 'open' | 'resolved' | 'rejected'

export interface Comment {
  id: string
  documentId: string
  author: string
  content: string
  position: {
    from: number
    to: number
  }
  status: CommentStatus
  resolved: boolean             // Quick boolean for filtering (mirrors status === 'resolved')
  parentId?: string             // Pour les réponses
  createdAt: string
  updatedAt: string
}

export interface Revision {
  id: string
  documentId: string
  author: string
  type: 'insert' | 'delete' | 'format'
  position: {
    from: number
    to: number
  }
  oldContent?: string
  newContent?: string
  accepted: boolean | null      // null = en attente
  createdAt: string
}

// ============================================================================
// Codes et Articles
// ============================================================================

export type CodeType =
  | 'code_civil'
  | 'code_procedure_civile'
  | 'code_commerce'
  | 'code_travail'
  | 'code_penal'
  | 'code_procedure_penale'
  | 'code_general_impots'
  | 'code_consommation'
  | 'autre'

export const CODE_TYPE_LABELS: Record<CodeType, string> = {
  code_civil: 'Code civil',
  code_procedure_civile: 'Code de procédure civile',
  code_commerce: 'Code de commerce',
  code_travail: 'Code du travail',
  code_penal: 'Code pénal',
  code_procedure_penale: 'Code de procédure pénale',
  code_general_impots: 'Code général des impôts',
  code_consommation: 'Code de la consommation',
  autre: 'Autre texte',
}

export interface Article {
  id: string
  code: CodeType
  numero: string                // Ex: "1134", "L. 121-1"
  titre?: string
  contenu: string
  dateVersion?: string          // Date de la version du texte
  liens?: string[]              // Articles liés
}

// ============================================================================
// Recherche Globale
// ============================================================================

export type SearchResultType =
  | 'document'
  | 'clause'
  | 'snippet'
  | 'jurisprudence'
  | 'article'

export interface SearchResult {
  id: string
  type: SearchResultType
  titre: string
  extrait: string               // Extrait avec surlignage
  score: number
  path?: string                 // Pour les documents
  createdAt?: string
}

// ============================================================================
// Export Avancé
// ============================================================================

export type ExportFormat = 'pdf' | 'pdfa' | 'docx' | 'odt' | 'html' | 'rtf'

export interface ExportOptions {
  format: ExportFormat
  includeMetadata: boolean
  includeTableOfContents: boolean
  includePageNumbers: boolean
  includeLineNumbers: boolean
  includeSignature: boolean
  includeHeader: boolean
  includeFooter: boolean
  watermark?: string
  password?: string
}

// ============================================================================
// Synchronisation Cloud
// ============================================================================

export type CloudProvider = 'icloud' | 'dropbox' | 'onedrive' | 'google_drive'

export interface CloudSyncState {
  provider: CloudProvider | null
  connected: boolean
  lastSync: string | null
  syncInProgress: boolean
  error: string | null
}
