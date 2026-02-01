// Formatter JSON

import type {
  ExportData,
  ExportOptions,
  ExportResult,
  ExportFormatter,
} from '../core/types'

// ============================================================================
// Formatter JSON
// ============================================================================

export class JSONFormatter implements ExportFormatter {
  formatType: 'json' = 'json'
  mimeType = 'application/json;charset=utf-8'
  extension = 'json'

  async formatData(data: ExportData[], options: ExportOptions): Promise<ExportResult> {
    try {
      // Construire l'objet d'export
      const exportObject = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        data: data.map(item => ({
          type: item.type,
          title: item.title,
          metadata: item.metadata,
          content: item.content,
        })),
      }

      const jsonString = JSON.stringify(exportObject, null, 2)
      const encoder = new TextEncoder()
      const contentBytes = encoder.encode(jsonString)

      const filename = options.filename
        ? `${options.filename}.json`
        : `export_${new Date().toISOString().split('T')[0]}.json`

      return {
        success: true,
        format: 'json',
        filename,
        data: contentBytes,
        mimeType: this.mimeType,
      }

    } catch (error) {
      return {
        success: false,
        format: 'json',
        filename: '',
        error: error instanceof Error ? error.message : 'Erreur lors de la génération JSON',
      }
    }
  }
}

// Instance singleton
let jsonFormatterInstance: JSONFormatter | null = null

export function getJSONFormatter(): JSONFormatter {
  if (!jsonFormatterInstance) {
    jsonFormatterInstance = new JSONFormatter()
  }
  return jsonFormatterInstance
}
