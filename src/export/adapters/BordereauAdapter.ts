// Adapter pour l'export du bordereau de pièces

import type {
  ExportAdapter,
  ExportData,
  ExportOptions,
  ExportModelSelection,
  UnifiedExportFormat,
  TableExportContent,
} from '../core/types'
import type { BordereauPieces, Piece } from '../../types/legal'
import {
  PIECE_NATURE_LABELS,
  PIECE_PROVENANCE_LABELS,
  formatDateJuridique,
} from '../../types/legal'

// ============================================================================
// Types locaux
// ============================================================================

interface BordereauExportData {
  bordereau: BordereauPieces | null
  pieces: Piece[]
}

// ============================================================================
// Utilitaires
// ============================================================================

function formatPagination(piece: Piece): string {
  if (!piece.pagination) return ''
  if (piece.pagination.debut === piece.pagination.fin) {
    return `p. ${piece.pagination.debut}`
  }
  return `p. ${piece.pagination.debut}-${piece.pagination.fin}`
}

function formatNature(nature: Piece['nature']): string {
  return PIECE_NATURE_LABELS[nature] || nature
}

function formatProvenance(provenance: Piece['provenance']): string {
  return PIECE_PROVENANCE_LABELS[provenance] || provenance
}

// ============================================================================
// Adapter Bordereau
// ============================================================================

export class BordereauAdapter implements ExportAdapter<BordereauExportData> {
  type: 'bordereau' = 'bordereau'
  supportedFormats: UnifiedExportFormat[] = ['pdf', 'docx', 'html', 'csv']

  /**
   * Récupère les données depuis les stores
   * Note: Dans l'implémentation actuelle, les pièces sont stockées différemment.
   * Cette méthode devra être adaptée selon la structure réelle des données.
   */
  async fetchData(_selection: ExportModelSelection): Promise<BordereauExportData[]> {
    // Import dynamique pour éviter les dépendances circulaires
    // Note: À adapter selon l'implémentation réelle des stores

    // Exemple de structure attendue
    // Dans une vraie implémentation, on récupérerait depuis usePiecesStore
    // ou un nouveau store dédié aux bordereaux

    return [{
      bordereau: null,
      pieces: [],
    }]
  }

  /**
   * Convertit les données en format exportable
   */
  adapt(data: BordereauExportData | BordereauExportData[], options: ExportOptions): ExportData {
    const dataArray = Array.isArray(data) ? data : [data]

    // Fusionner toutes les pièces
    const allPieces: Piece[] = []
    let mainBordereau: BordereauPieces | null = null

    for (const item of dataArray) {
      if (item.bordereau && !mainBordereau) {
        mainBordereau = item.bordereau
      }
      allPieces.push(...item.pieces)
    }

    // Trier par numéro
    const sortedPieces = [...allPieces].sort((a, b) => a.numero - b.numero)

    // Construire le titre
    let title = 'Bordereau de pièces'
    if (mainBordereau) {
      title = `Bordereau - ${mainBordereau.affaireReference}`
    }

    // Métadonnées
    const metadata: Record<string, unknown> = {}
    if (mainBordereau) {
      metadata.affaireReference = mainBordereau.affaireReference
      metadata.parties = mainBordereau.parties
      metadata.juridiction = mainBordereau.juridiction
      metadata.numeroRG = mainBordereau.numeroRG
    }
    if (options.includeTimestamp) {
      metadata.exportedAt = new Date().toISOString()
    }

    // Construire le contenu tabulaire
    const headers = [
      'N°',
      'Désignation',
      'Nature',
      'Provenance',
      'Date',
      'Pagination',
    ]

    const rows: (string | number | null)[][] = sortedPieces.map(piece => [
      piece.numero,
      piece.titre,
      formatNature(piece.nature),
      formatProvenance(piece.provenance),
      piece.dateDocument ? formatDateJuridique(piece.dateDocument) : '',
      formatPagination(piece),
    ])

    const content: TableExportContent = {
      kind: 'table',
      headers,
      rows,
    }

    return {
      type: 'bordereau',
      title,
      metadata,
      content,
    }
  }
}

// ============================================================================
// Factory pour créer des pièces depuis des fichiers
// ============================================================================

export function createPieceFromFile(
  numero: number,
  filename: string,
  options?: Partial<Omit<Piece, 'id' | 'numero' | 'reference' | 'createdAt' | 'updatedAt'>>
): Piece {
  const now = new Date().toISOString()

  // Extraire le nom sans extension
  const titre = filename.replace(/\.[^/.]+$/, '')

  return {
    id: `piece-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    numero,
    reference: `Pièce n°${numero}`,
    titre,
    nature: options?.nature || 'autre',
    provenance: options?.provenance || 'demandeur',
    confidentiel: options?.confidentiel || false,
    dateDocument: options?.dateDocument,
    description: options?.description,
    pagination: options?.pagination,
    fichierPath: options?.fichierPath,
    createdAt: now,
    updatedAt: now,
  }
}

// ============================================================================
// Créer un bordereau vide
// ============================================================================

export function createEmptyBordereau(
  affaireReference: string,
  parties: { demandeur: string; défendeur: string }
): BordereauPieces {
  const now = new Date().toISOString()

  return {
    id: `bordereau-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    affaireReference,
    parties,
    pieces: [],
    dateCreation: now,
    dateModification: now,
  }
}

// Instance singleton
let bordereauAdapterInstance: BordereauAdapter | null = null

export function getBordereauAdapter(): BordereauAdapter {
  if (!bordereauAdapterInstance) {
    bordereauAdapterInstance = new BordereauAdapter()
  }
  return bordereauAdapterInstance
}
