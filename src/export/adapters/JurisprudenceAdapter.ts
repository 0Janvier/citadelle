// Adapter pour l'export de jurisprudence

import type {
  ExportAdapter,
  ExportData,
  ExportOptions,
  ExportModelSelection,
  UnifiedExportFormat,
  TableExportContent,
  CitationExportContent,
} from '../core/types'
import type { Jurisprudence } from '../../types/legal'
import {
  JURIDICTION_LABELS,
  SOLUTION_LABELS,
  genererCitationCourte,
  genererCitationComplete,
  formatDateJuridique,
} from '../../types/legal'

// ============================================================================
// Utilitaires
// ============================================================================

function formatJuridiction(juridiction: Jurisprudence['juridiction']): string {
  return JURIDICTION_LABELS[juridiction] || juridiction
}

function formatSolution(solution: Jurisprudence['solution']): string {
  return SOLUTION_LABELS[solution] || solution
}

function formatMatieres(matieres: string[]): string {
  return matieres.join(', ')
}

// ============================================================================
// Adapter Jurisprudence
// ============================================================================

export class JurisprudenceAdapter implements ExportAdapter<Jurisprudence> {
  type: 'jurisprudence' = 'jurisprudence'
  supportedFormats: UnifiedExportFormat[] = ['pdf', 'docx', 'csv', 'json']

  /**
   * Récupère les données depuis les stores
   */
  async fetchData(selection: ExportModelSelection): Promise<Jurisprudence[]> {
    // Note: Dans une vraie implémentation, on récupérerait depuis un store Zustand
    // Pour l'instant, retourne un tableau vide
    // Les données seront passées directement via adapt() dans le cas courant

    // Si des IDs spécifiques sont fournis, filtrer
    if (selection.ids && selection.ids.length > 0) {
      // Récupérer et filtrer par IDs
    }

    // Appliquer les filtres
    if (selection.filters) {
      // Filtrer par juridiction, solution, date, etc.
    }

    return []
  }

  /**
   * Convertit les données en format exportable
   */
  adapt(data: Jurisprudence | Jurisprudence[], options: ExportOptions): ExportData {
    const dataArray = Array.isArray(data) ? data : [data]

    // Trier par date (du plus récent au plus ancien)
    const sorted = [...dataArray].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    // Construire le titre
    const title = sorted.length === 1
      ? `Jurisprudence - ${genererCitationCourte(sorted[0])}`
      : `Bibliographie jurisprudentielle (${sorted.length} décisions)`

    // Métadonnées
    const metadata: Record<string, unknown> = {
      count: sorted.length,
    }
    if (options.includeTimestamp) {
      metadata.exportedAt = new Date().toISOString()
    }

    // Pour CSV: format tabulaire
    // Pour PDF/DOCX: format citations
    // Le formatter choisira le format approprié

    // Format tabulaire (pour CSV)
    const tableContent: TableExportContent = {
      kind: 'table',
      headers: [
        'Citation',
        'Date',
        'Juridiction',
        'Solution',
        'Matières',
        'N° Pourvoi',
        'ECLI',
      ],
      rows: sorted.map(j => [
        genererCitationCourte(j),
        formatDateJuridique(j.date),
        formatJuridiction(j.juridiction),
        formatSolution(j.solution),
        formatMatieres(j.matieres),
        j.numero || '',
        j.ecli || '',
      ]),
    }

    // Format citations (pour PDF/DOCX) - préparé pour usage futur
    const _citationContent: CitationExportContent = {
      kind: 'citations',
      citations: sorted.map(j => ({
        short: genererCitationCourte(j),
        full: genererCitationComplete(j),
        resume: j.resume,
      })),
    }
    void _citationContent // Préservé pour usage futur avec les formatters PDF/DOCX

    // On retourne le format tabulaire par défaut
    return {
      type: 'jurisprudence',
      title,
      metadata,
      content: tableContent,
    }
  }

  /**
   * Variante pour export PDF/DOCX avec citations formatées
   */
  adaptForCitations(data: Jurisprudence | Jurisprudence[], options: ExportOptions): ExportData {
    const dataArray = Array.isArray(data) ? data : [data]

    const sorted = [...dataArray].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    const title = sorted.length === 1
      ? `Jurisprudence - ${genererCitationCourte(sorted[0])}`
      : `Bibliographie jurisprudentielle (${sorted.length} décisions)`

    const metadata: Record<string, unknown> = {
      count: sorted.length,
    }
    if (options.includeTimestamp) {
      metadata.exportedAt = new Date().toISOString()
    }

    const content: CitationExportContent = {
      kind: 'citations',
      citations: sorted.map(j => ({
        short: genererCitationCourte(j),
        full: genererCitationComplete(j),
        resume: j.resume,
      })),
    }

    return {
      type: 'jurisprudence',
      title,
      metadata,
      content,
    }
  }
}

// ============================================================================
// Factory pour créer une jurisprudence
// ============================================================================

export function createJurisprudence(
  data: Omit<Jurisprudence, 'id' | 'citationCourte' | 'citationComplete' | 'createdAt' | 'updatedAt'>
): Jurisprudence {
  const now = new Date().toISOString()

  const juris: Jurisprudence = {
    ...data,
    id: `juris-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    citationCourte: '', // Sera calculé
    citationComplete: '', // Sera calculé
    createdAt: now,
    updatedAt: now,
  }

  // Générer les citations
  juris.citationCourte = genererCitationCourte(juris)
  juris.citationComplete = genererCitationComplete(juris)

  return juris
}

// Instance singleton
let jurisprudenceAdapterInstance: JurisprudenceAdapter | null = null

export function getJurisprudenceAdapter(): JurisprudenceAdapter {
  if (!jurisprudenceAdapterInstance) {
    jurisprudenceAdapterInstance = new JurisprudenceAdapter()
  }
  return jurisprudenceAdapterInstance
}
