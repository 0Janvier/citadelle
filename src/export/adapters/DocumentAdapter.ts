// Adapter pour l'export de documents

import type {
  ExportAdapter,
  ExportData,
  ExportOptions,
  ExportModelSelection,
  UnifiedExportFormat,
  DocumentExportContent,
} from '../core/types'
import type { JSONContent } from '@tiptap/react'
import { useDocumentStore } from '../../store/useDocumentStore'

// ============================================================================
// Types
// ============================================================================

export interface DocumentData {
  id: string
  title: string
  content: JSONContent
}

// ============================================================================
// Adapter Document
// ============================================================================

export class DocumentAdapter implements ExportAdapter<DocumentData> {
  type: 'document' = 'document'
  supportedFormats: UnifiedExportFormat[] = ['pdf', 'docx', 'html', 'markdown', 'json']

  /**
   * Récupère les données depuis le store
   */
  async fetchData(selection: ExportModelSelection): Promise<DocumentData[]> {
    const store = useDocumentStore.getState()

    // Si des IDs spécifiques sont fournis
    if (selection.ids && selection.ids.length > 0) {
      const docs: DocumentData[] = []
      for (const id of selection.ids) {
        const doc = store.getDocument(id)
        if (doc) {
          docs.push({
            id: doc.id,
            title: doc.title,
            content: doc.content,
          })
        }
      }
      return docs
    }

    // Sinon, retourner le document actif
    const activeId = store.activeDocumentId
    if (activeId) {
      const doc = store.getDocument(activeId)
      if (doc) {
        return [{
          id: doc.id,
          title: doc.title,
          content: doc.content,
        }]
      }
    }

    return []
  }

  /**
   * Convertit les données en format exportable
   */
  adapt(data: DocumentData | DocumentData[], options: ExportOptions): ExportData {
    const dataArray = Array.isArray(data) ? data : [data]

    if (dataArray.length === 0) {
      return {
        type: 'document',
        title: 'Document vide',
        content: {
          kind: 'document',
          jsonContent: { type: 'doc', content: [] },
        },
      }
    }

    // Pour un seul document
    if (dataArray.length === 1) {
      const doc = dataArray[0]

      const content: DocumentExportContent = {
        kind: 'document',
        jsonContent: doc.content,
      }

      const metadata: Record<string, unknown> = {}
      if (options.includeTimestamp) {
        metadata.exportedAt = new Date().toISOString()
      }

      return {
        type: 'document',
        title: doc.title,
        metadata,
        content,
      }
    }

    // Pour plusieurs documents, les fusionner
    const combinedContent: JSONContent = {
      type: 'doc',
      content: [],
    }

    for (const doc of dataArray) {
      // Ajouter un titre pour chaque document
      combinedContent.content?.push({
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: doc.title }],
      })

      // Ajouter le contenu
      if (doc.content.content) {
        combinedContent.content?.push(...doc.content.content)
      }

      // Ajouter un saut de page entre les documents
      combinedContent.content?.push({ type: 'horizontalRule' })
    }

    const content: DocumentExportContent = {
      kind: 'document',
      jsonContent: combinedContent,
    }

    const metadata: Record<string, unknown> = {
      documentCount: dataArray.length,
    }
    if (options.includeTimestamp) {
      metadata.exportedAt = new Date().toISOString()
    }

    return {
      type: 'document',
      title: `Export de ${dataArray.length} documents`,
      metadata,
      content,
    }
  }
}

// Instance singleton
let documentAdapterInstance: DocumentAdapter | null = null

export function getDocumentAdapter(): DocumentAdapter {
  if (!documentAdapterInstance) {
    documentAdapterInstance = new DocumentAdapter()
  }
  return documentAdapterInstance
}
