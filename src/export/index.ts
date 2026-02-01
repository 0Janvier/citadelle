// Export module - Point d'entrée principal

// Core
export * from './core'

// Formatters
export * from './formatters'

// Adapters
export * from './adapters'

// ============================================================================
// Initialisation du service d'export
// ============================================================================

import { getExportService } from './core'
import {
  getCSVFormatter,
  getMarkdownFormatter,
  getHTMLFormatter,
  getJSONFormatter,
} from './formatters'
import {
  getDocumentAdapter,
  getBordereauAdapter,
  getJurisprudenceAdapter,
  getClauseAdapter,
} from './adapters'

let initialized = false

/**
 * Initialise le service d'export avec tous les adapters et formatters
 */
export function initializeExportService(): void {
  if (initialized) return

  const service = getExportService()

  // Enregistrer les formatters
  service.registerFormatter(getCSVFormatter())
  service.registerFormatter(getMarkdownFormatter())
  service.registerFormatter(getHTMLFormatter())
  service.registerFormatter(getJSONFormatter())

  // Enregistrer les adapters
  service.registerAdapter(getDocumentAdapter())
  service.registerAdapter(getBordereauAdapter())
  service.registerAdapter(getJurisprudenceAdapter())
  service.registerAdapter(getClauseAdapter())

  initialized = true
}

/**
 * Réinitialise le service (utile pour les tests)
 */
export function resetExportServiceInit(): void {
  initialized = false
}
