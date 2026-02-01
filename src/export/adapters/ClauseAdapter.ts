// Adapter pour l'export des clauses

import type {
  ExportAdapter,
  ExportData,
  ExportOptions,
  ExportModelSelection,
  UnifiedExportFormat,
  TableExportContent,
  DocumentExportContent,
} from '../core/types'
import type { Clause, ClauseDomaine, ClauseType } from '../../types/editor-features'
import {
  CLAUSE_DOMAINE_LABELS,
  CLAUSE_TYPE_LABELS,
} from '../../types/editor-features'
import { useClauseStore } from '../../store/useClauseStore'

// ============================================================================
// Utilitaires
// ============================================================================

function formatDomaine(domaine: ClauseDomaine): string {
  return CLAUSE_DOMAINE_LABELS[domaine] || domaine
}

function formatType(type: ClauseType): string {
  return CLAUSE_TYPE_LABELS[type] || type
}

function formatTags(tags: string[]): string {
  return tags.join(', ')
}

// ============================================================================
// Adapter Clause
// ============================================================================

export class ClauseAdapter implements ExportAdapter<Clause> {
  type: 'clause' = 'clause'
  supportedFormats: UnifiedExportFormat[] = ['pdf', 'docx', 'html', 'markdown', 'csv', 'json']

  /**
   * Récupère les données depuis le store
   */
  async fetchData(selection: ExportModelSelection): Promise<Clause[]> {
    const store = useClauseStore.getState()
    let clauses = store.clauses

    // Filtrer par IDs si spécifiés
    if (selection.ids && selection.ids.length > 0) {
      const idsSet = new Set(selection.ids)
      clauses = clauses.filter(c => idsSet.has(c.id))
    }

    // Appliquer les filtres
    if (selection.filters) {
      const { clauseDomaine, clauseType, clauseFavoritesOnly } = selection.filters

      if (clauseDomaine && clauseDomaine !== 'all') {
        clauses = clauses.filter(c => c.domaine === clauseDomaine)
      }

      if (clauseType && clauseType !== 'all') {
        clauses = clauses.filter(c => c.type === clauseType)
      }

      if (clauseFavoritesOnly) {
        clauses = clauses.filter(c => c.favoris)
      }
    }

    return clauses
  }

  /**
   * Convertit les données en format exportable (tabulaire)
   */
  adapt(data: Clause | Clause[], options: ExportOptions): ExportData {
    const dataArray = Array.isArray(data) ? data : [data]

    // Trier par domaine puis par titre
    const sorted = [...dataArray].sort((a, b) => {
      const domaineCompare = a.domaine.localeCompare(b.domaine)
      if (domaineCompare !== 0) return domaineCompare
      return a.titre.localeCompare(b.titre)
    })

    // Construire le titre
    const title = sorted.length === 1
      ? `Clause - ${sorted[0].titre}`
      : `Bibliothèque de clauses (${sorted.length} clauses)`

    // Métadonnées
    const metadata: Record<string, unknown> = {
      count: sorted.length,
      builtinCount: sorted.filter(c => c.isBuiltin).length,
      customCount: sorted.filter(c => !c.isBuiltin).length,
    }
    if (options.includeTimestamp) {
      metadata.exportedAt = new Date().toISOString()
    }

    // Format tabulaire (pour CSV)
    const content: TableExportContent = {
      kind: 'table',
      headers: [
        'Titre',
        'Description',
        'Domaine',
        'Type',
        'Tags',
        'Favoris',
        'Utilisations',
      ],
      rows: sorted.map(c => [
        c.titre,
        c.description || '',
        formatDomaine(c.domaine),
        formatType(c.type),
        formatTags(c.tags),
        c.favoris ? 'Oui' : 'Non',
        c.usageCount,
      ]),
    }

    return {
      type: 'clause',
      title,
      metadata,
      content,
    }
  }

  /**
   * Variante pour export document (PDF/DOCX) avec contenu riche
   */
  adaptForDocument(data: Clause | Clause[], options: ExportOptions): ExportData {
    const dataArray = Array.isArray(data) ? data : [data]

    // Pour un export document, on pourrait combiner tous les contenus
    // en un seul JSONContent
    const combinedContent: import('@tiptap/react').JSONContent = {
      type: 'doc',
      content: [],
    }

    // Grouper par domaine
    const byDomaine = new Map<ClauseDomaine, Clause[]>()
    for (const clause of dataArray) {
      const existing = byDomaine.get(clause.domaine) || []
      existing.push(clause)
      byDomaine.set(clause.domaine, existing)
    }

    // Construire le document
    for (const [domaine, clauses] of byDomaine) {
      // Titre du domaine
      combinedContent.content?.push({
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: formatDomaine(domaine) }],
      })

      // Chaque clause
      for (const clause of clauses) {
        // Titre de la clause
        combinedContent.content?.push({
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: clause.titre }],
        })

        // Description si présente
        if (clause.description) {
          combinedContent.content?.push({
            type: 'paragraph',
            attrs: { class: 'description' },
            content: [
              { type: 'text', marks: [{ type: 'italic' }], text: clause.description },
            ],
          })
        }

        // Contenu de la clause
        if (clause.contenu.content) {
          combinedContent.content?.push(...clause.contenu.content)
        }

        // Séparateur
        combinedContent.content?.push({ type: 'horizontalRule' })
      }
    }

    const documentContent: DocumentExportContent = {
      kind: 'document',
      jsonContent: combinedContent,
    }

    const title = dataArray.length === 1
      ? `Clause - ${dataArray[0].titre}`
      : `Catalogue de clauses (${dataArray.length} clauses)`

    const metadata: Record<string, unknown> = {
      count: dataArray.length,
    }
    if (options.includeTimestamp) {
      metadata.exportedAt = new Date().toISOString()
    }

    return {
      type: 'clause',
      title,
      metadata,
      content: documentContent,
    }
  }
}

// Instance singleton
let clauseAdapterInstance: ClauseAdapter | null = null

export function getClauseAdapter(): ClauseAdapter {
  if (!clauseAdapterInstance) {
    clauseAdapterInstance = new ClauseAdapter()
  }
  return clauseAdapterInstance
}
