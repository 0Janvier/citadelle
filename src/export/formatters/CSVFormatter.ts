// Formatter CSV natif (sans dépendance externe)

import type {
  ExportData,
  ExportOptions,
  ExportResult,
  ExportFormatter,
  TableExportContent,
  CSVExportOptions,
} from '../core/types'
import { DEFAULT_CSV_OPTIONS } from '../core/types'

// ============================================================================
// Utilitaires CSV
// ============================================================================

/**
 * Échappe une valeur pour le CSV
 * - Entoure de guillemets si contient le délimiteur, des guillemets ou des retours à la ligne
 * - Double les guillemets internes
 */
function escapeCSVValue(value: string | number | boolean | null, delimiter: string): string {
  if (value === null || value === undefined) {
    return ''
  }

  const stringValue = String(value)

  // Vérifier si on doit entourer de guillemets
  const needsQuotes =
    stringValue.includes(delimiter) ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')

  if (needsQuotes) {
    // Doubler les guillemets et entourer
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

/**
 * Formate une date selon le format demandé
 */
function formatDate(dateISO: string, format: CSVExportOptions['dateFormat']): string {
  if (!dateISO) return ''

  try {
    const date = new Date(dateISO)
    if (isNaN(date.getTime())) return dateISO

    switch (format) {
      case 'iso':
        return dateISO.split('T')[0] // YYYY-MM-DD

      case 'fr':
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })

      case 'fr-short':
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })

      default:
        return dateISO
    }
  } catch {
    return dateISO
  }
}

/**
 * Convertit une ligne en CSV
 */
function rowToCSV(
  row: (string | number | boolean | null)[],
  options: CSVExportOptions
): string {
  return row
    .map(value => {
      // Formater les dates si c'est une chaîne ISO
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        value = formatDate(value, options.dateFormat)
      }
      return escapeCSVValue(value, options.delimiter)
    })
    .join(options.delimiter)
}

/**
 * Génère le contenu CSV complet
 */
function generateCSV(
  headers: string[],
  rows: (string | number | boolean | null)[][],
  options: CSVExportOptions
): string {
  const lines: string[] = []

  // En-têtes
  if (options.includeHeaders) {
    lines.push(rowToCSV(headers, options))
  }

  // Lignes de données
  for (const row of rows) {
    lines.push(rowToCSV(row, options))
  }

  return lines.join('\n')
}

/**
 * Ajoute le BOM UTF-8 si nécessaire
 */
function addBOM(content: string, encoding: CSVExportOptions['encoding']): Uint8Array {
  const encoder = new TextEncoder()

  if (encoding === 'utf-8-bom') {
    // BOM UTF-8: EF BB BF
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF])
    const contentBytes = encoder.encode(content)
    const result = new Uint8Array(bom.length + contentBytes.length)
    result.set(bom, 0)
    result.set(contentBytes, bom.length)
    return result
  }

  return encoder.encode(content)
}

// ============================================================================
// Formatter CSV
// ============================================================================

export class CSVFormatter implements ExportFormatter {
  formatType: 'csv' = 'csv'
  mimeType = 'text/csv;charset=utf-8'
  extension = 'csv'

  async formatData(data: ExportData[], options: ExportOptions): Promise<ExportResult> {
    const csvOptions: CSVExportOptions = {
      ...DEFAULT_CSV_OPTIONS,
      ...options.csvOptions,
    }

    try {
      // Collecter toutes les données tabulaires
      const allHeaders: string[] = []
      const allRows: (string | number | boolean | null)[][] = []

      for (const exportData of data) {
        if (exportData.content.kind === 'table') {
          const tableContent = exportData.content as TableExportContent

          // Si c'est le premier, prendre les headers
          if (allHeaders.length === 0) {
            allHeaders.push(...tableContent.headers)
          }

          // Ajouter les lignes
          allRows.push(...tableContent.rows)
        } else if (exportData.content.kind === 'citations') {
          // Convertir les citations en format tabulaire
          if (allHeaders.length === 0) {
            allHeaders.push('Citation courte', 'Citation complète', 'Résumé')
          }

          for (const citation of exportData.content.citations) {
            allRows.push([citation.short, citation.full, citation.resume || ''])
          }
        }
        // Les documents (kind: 'document') ne sont pas exportables en CSV
      }

      if (allHeaders.length === 0 || allRows.length === 0) {
        return {
          success: false,
          format: 'csv',
          filename: '',
          error: 'Aucune donnée tabulaire à exporter',
        }
      }

      // Générer le CSV
      const csvContent = generateCSV(allHeaders, allRows, csvOptions)
      const csvBytes = addBOM(csvContent, csvOptions.encoding)

      // Construire le nom de fichier
      const filename = options.filename
        ? `${options.filename}.csv`
        : `export_${new Date().toISOString().split('T')[0]}.csv`

      return {
        success: true,
        format: 'csv',
        filename,
        data: csvBytes,
        mimeType: this.mimeType,
      }

    } catch (error) {
      return {
        success: false,
        format: 'csv',
        filename: '',
        error: error instanceof Error ? error.message : 'Erreur lors de la génération CSV',
      }
    }
  }
}

// Instance singleton
let csvFormatterInstance: CSVFormatter | null = null

export function getCSVFormatter(): CSVFormatter {
  if (!csvFormatterInstance) {
    csvFormatterInstance = new CSVFormatter()
  }
  return csvFormatterInstance
}
