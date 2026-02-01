// Service central d'export - Orchestre les adapters et formatters

import type {
  ExportRequest,
  ExportResult,
  ExportData,
  ExportProgress,
  ExportAdapter,
  ExportFormatter,
  ExportModelType,
  UnifiedExportFormat,
  ExportOptions,
  ExportModelSelection,
} from './types'
import { FORMAT_SUPPORT, DEFAULT_EXPORT_OPTIONS } from './types'

// ============================================================================
// Registre des adapters et formatters
// ============================================================================

class AdapterRegistry {
  private adapters = new Map<ExportModelType, ExportAdapter<unknown>>()

  register<T>(adapter: ExportAdapter<T>): void {
    this.adapters.set(adapter.type, adapter as ExportAdapter<unknown>)
  }

  get<T>(type: ExportModelType): ExportAdapter<T> | undefined {
    return this.adapters.get(type) as ExportAdapter<T> | undefined
  }

  has(type: ExportModelType): boolean {
    return this.adapters.has(type)
  }
}

class FormatterRegistry {
  private formatters = new Map<UnifiedExportFormat, ExportFormatter>()

  register(formatter: ExportFormatter): void {
    this.formatters.set(formatter.formatType, formatter)
  }

  get(format: UnifiedExportFormat): ExportFormatter | undefined {
    return this.formatters.get(format)
  }

  has(format: UnifiedExportFormat): boolean {
    return this.formatters.has(format)
  }
}

// ============================================================================
// Service d'export
// ============================================================================

export class ExportService {
  private adapters = new AdapterRegistry()
  private formatters = new FormatterRegistry()
  private progressCallback?: (progress: ExportProgress) => void

  // Enregistrer un adapter
  registerAdapter<T>(adapter: ExportAdapter<T>): void {
    this.adapters.register(adapter)
  }

  // Enregistrer un formatter
  registerFormatter(formatter: ExportFormatter): void {
    this.formatters.register(formatter)
  }

  // Définir le callback de progression
  onProgress(callback: (progress: ExportProgress) => void): void {
    this.progressCallback = callback
  }

  // Notifier la progression
  private updateProgress(progress: ExportProgress): void {
    this.progressCallback?.(progress)
  }

  // Valider la requête d'export
  validateRequest(request: ExportRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Vérifier qu'au moins un modèle est sélectionné
    const enabledModels = request.models.filter(m => m.enabled)
    if (enabledModels.length === 0) {
      errors.push('Aucun modèle sélectionné pour l\'export')
    }

    // Vérifier la compatibilité format/modèle
    for (const model of enabledModels) {
      const supportedFormats = FORMAT_SUPPORT[model.type]
      if (!supportedFormats.includes(request.format)) {
        errors.push(
          `Le format ${request.format.toUpperCase()} n'est pas compatible avec ${model.type}`
        )
      }

      // Vérifier que l'adapter existe
      if (!this.adapters.has(model.type)) {
        errors.push(`Adapter non disponible pour ${model.type}`)
      }
    }

    // Vérifier que le formatter existe
    if (!this.formatters.has(request.format)) {
      errors.push(`Formatter non disponible pour ${request.format}`)
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  // Exécuter l'export
  async export(request: ExportRequest): Promise<ExportResult> {
    // Valider la requête
    const validation = this.validateRequest(request)
    if (!validation.valid) {
      return {
        success: false,
        format: request.format,
        filename: '',
        error: validation.errors.join('. '),
      }
    }

    // Fusionner avec les options par défaut
    const options: ExportOptions = {
      ...DEFAULT_EXPORT_OPTIONS,
      ...request.options,
    }

    try {
      // Phase 1: Préparation
      this.updateProgress({
        status: 'preparing',
        current: 0,
        total: request.models.filter(m => m.enabled).length,
        currentItem: 'Préparation de l\'export...',
      })

      // Phase 2: Collecte des données via les adapters
      const exportDataList: ExportData[] = []
      const enabledModels = request.models.filter(m => m.enabled)
      let processed = 0

      for (const model of enabledModels) {
        this.updateProgress({
          status: 'converting',
          current: processed,
          total: enabledModels.length,
          currentItem: `Conversion de ${model.type}...`,
        })

        const adapter = this.adapters.get(model.type)
        if (!adapter) {
          throw new Error(`Adapter non trouvé pour ${model.type}`)
        }

        // Récupérer les données
        const data = await adapter.fetchData(model)

        // Convertir en format exportable
        const exportData = adapter.adapt(data, options)
        exportDataList.push(exportData)

        processed++
      }

      // Phase 3: Formatage de la sortie
      this.updateProgress({
        status: 'formatting',
        current: enabledModels.length,
        total: enabledModels.length,
        currentItem: `Génération du fichier ${request.format.toUpperCase()}...`,
      })

      const formatter = this.formatters.get(request.format)
      if (!formatter) {
        throw new Error(`Formatter non trouvé pour ${request.format}`)
      }

      const result = await formatter.formatData(exportDataList, options)

      // Phase 4: Terminé
      this.updateProgress({
        status: 'complete',
        current: enabledModels.length,
        total: enabledModels.length,
      })

      return result

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'

      this.updateProgress({
        status: 'error',
        current: 0,
        total: 0,
        error: errorMessage,
      })

      return {
        success: false,
        format: request.format,
        filename: '',
        error: errorMessage,
      }
    }
  }

  // Obtenir les formats disponibles pour une sélection de modèles
  getAvailableFormats(models: ExportModelSelection[]): UnifiedExportFormat[] {
    const enabledModels = models.filter(m => m.enabled)

    if (enabledModels.length === 0) {
      return []
    }

    // Intersection des formats supportés par tous les modèles sélectionnés
    const formatSets = enabledModels.map(m => new Set(FORMAT_SUPPORT[m.type]))

    let intersection = formatSets[0]
    for (let i = 1; i < formatSets.length; i++) {
      intersection = new Set([...intersection].filter(f => formatSets[i].has(f)))
    }

    return Array.from(intersection)
  }
}

// ============================================================================
// Instance singleton
// ============================================================================

let exportServiceInstance: ExportService | null = null

export function getExportService(): ExportService {
  if (!exportServiceInstance) {
    exportServiceInstance = new ExportService()
  }
  return exportServiceInstance
}

export function resetExportService(): void {
  exportServiceInstance = null
}
