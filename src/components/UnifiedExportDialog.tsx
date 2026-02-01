import { useState, useMemo, useCallback, useEffect } from 'react'
import { useDocumentStore } from '../store/useDocumentStore'
import { useLawyerProfileStore } from '../store/useLawyerProfileStore'
import { useClauseStore } from '../store/useClauseStore'
import { useToast } from '../hooks/useToast'
import { usePrint } from '../hooks/usePrint'
import { save } from '@tauri-apps/api/dialog'
import { invoke } from '@tauri-apps/api/tauri'
import {
  getExportService,
  initializeExportService,
  type ExportModelSelection,
  type ExportRequest,
  type ExportProgress,
  type UnifiedExportFormat,
  FORMAT_SUPPORT,
  FORMAT_LABELS,
  MODEL_LABELS,
  DEFAULT_EXPORT_OPTIONS,
  type ExportModelType,
} from '../export'

// ============================================================================
// Icons
// ============================================================================

const MarkdownIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 5h18v14H3V5zm2 2v10h14V7H5zm2 2h2l2 3 2-3h2v6h-2v-3l-2 3-2-3v3H7V9z"/>
  </svg>
)

const HtmlIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
)

const PdfIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8.5 13c.8 0 1.5.7 1.5 1.5S9.3 16 8.5 16H7v2H5.5v-5h3zm5 0c1.4 0 2.5 1.1 2.5 2.5s-1.1 2.5-2.5 2.5H12v-5h1.5z"/>
  </svg>
)

const DocxIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM7 17V9h1.5l1.25 5 1.25-5H12.5v8h-1.2v-5.5l-1.3 5.5h-1l-1.3-5.5V17H7z"/>
  </svg>
)

const CsvIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM7 13h2v2H7v-2zm4 0h6v2h-6v-2zm-4 3h2v2H7v-2zm4 0h6v2h-6v-2z"/>
  </svg>
)

const JsonIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 3h2v2H5v5a2 2 0 01-2 2 2 2 0 012 2v5h2v2H5c-1.1 0-2-.9-2-2v-4c0-.6-.4-1-1-1H1v-2h1c.6 0 1-.4 1-1V5c0-1.1.9-2 2-2zm14 0c1.1 0 2 .9 2 2v4c0 .6.4 1 1 1h1v2h-1c-.6 0-1 .4-1 1v4c0 1.1-.9 2-2 2h-2v-2h2v-5a2 2 0 012-2 2 2 0 01-2-2V5h-2V3h2z"/>
  </svg>
)

const LoadingSpinner = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const CloseIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const PrinterIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
)

// ============================================================================
// Format configuration
// ============================================================================

const FORMAT_CONFIG: Record<UnifiedExportFormat, { icon: React.ReactNode; color: string; desc: string }> = {
  pdf: { icon: <PdfIcon />, color: '#DC2626', desc: 'Document PDF professionnel' },
  docx: { icon: <DocxIcon />, color: '#2563EB', desc: 'Document Word éditable' },
  html: { icon: <HtmlIcon />, color: '#E34C26', desc: 'Page web autonome' },
  markdown: { icon: <MarkdownIcon />, color: '#6B7280', desc: 'Texte formaté simple' },
  csv: { icon: <CsvIcon />, color: '#059669', desc: 'Tableau pour Excel' },
  json: { icon: <JsonIcon />, color: '#F59E0B', desc: 'Données structurées' },
}

// ============================================================================
// Model icons
// ============================================================================

const MODEL_ICONS: Record<ExportModelType, React.ReactNode> = {
  document: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  bordereau: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M8 13h8M8 17h8M8 9h2" />
    </svg>
  ),
  jurisprudence: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  clause: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  ),
  'defined-term': (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16M4 12h16M4 17h10" />
    </svg>
  ),
}

// ============================================================================
// Props
// ============================================================================

interface UnifiedExportDialogProps {
  open: boolean
  onClose: () => void
  documentId?: string
}

// ============================================================================
// Component
// ============================================================================

export function UnifiedExportDialog({ open, onClose, documentId }: UnifiedExportDialogProps) {
  const doc = useDocumentStore((state) => documentId ? state.getDocument(documentId) : null)
  const lawyerProfile = useLawyerProfileStore()
  const clauseStore = useClauseStore()
  const toast = useToast()
  const { printDocument, isPrinting } = usePrint()

  // Model selection state
  const [selectedModels, setSelectedModels] = useState<Record<ExportModelType, boolean>>({
    document: !!documentId,
    clause: false,
    bordereau: false,
    jurisprudence: false,
    'defined-term': false,
  })

  // Format and options
  const [selectedFormat, setSelectedFormat] = useState<UnifiedExportFormat>('pdf')
  const [includeLetterhead, setIncludeLetterhead] = useState(true)
  const [includeSignature, setIncludeSignature] = useState(false)
  const [includePageNumbers, setIncludePageNumbers] = useState(true)

  // UI state
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState<ExportProgress | null>(null)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

  // Initialize export service on mount
  useEffect(() => {
    initializeExportService()
  }, [])

  // Reset selection when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedModels({
        document: !!documentId,
        clause: false,
        bordereau: false,
        jurisprudence: false,
        'defined-term': false,
      })
      setSelectedFormat('pdf')
      setProgress(null)
    }
  }, [open, documentId])

  // Build model selections
  const modelSelections = useMemo((): ExportModelSelection[] => {
    return Object.entries(selectedModels)
      .filter(([, enabled]) => enabled)
      .map(([type]) => ({
        type: type as ExportModelType,
        enabled: true,
      }))
  }, [selectedModels])

  // Get available formats based on selected models
  const availableFormats = useMemo((): UnifiedExportFormat[] => {
    if (modelSelections.length === 0) {
      return []
    }

    // Intersection of all supported formats
    const formatSets = modelSelections.map(m => new Set(FORMAT_SUPPORT[m.type]))
    let intersection = formatSets[0]

    for (let i = 1; i < formatSets.length; i++) {
      intersection = new Set([...intersection].filter(f => formatSets[i].has(f)))
    }

    return Array.from(intersection)
  }, [modelSelections])

  // Auto-select first available format when selection changes
  useEffect(() => {
    if (availableFormats.length > 0 && !availableFormats.includes(selectedFormat)) {
      setSelectedFormat(availableFormats[0])
    }
  }, [availableFormats, selectedFormat])

  // Model counts for display
  const modelCounts = useMemo(() => ({
    clause: clauseStore.clauses.length,
    bordereau: 0,
    jurisprudence: 0,
    'defined-term': 0,
  }), [clauseStore.clauses.length])

  // Toggle model selection
  const toggleModel = useCallback((type: ExportModelType) => {
    setSelectedModels(prev => ({
      ...prev,
      [type]: !prev[type],
    }))
  }, [])

  // Handle export
  const handleExport = async () => {
    if (modelSelections.length === 0) {
      toast.error('Veuillez sélectionner au moins un type de données')
      return
    }

    setIsExporting(true)
    setProgress(null)

    try {
      const service = getExportService()

      // Set progress callback
      service.onProgress((p) => setProgress(p))

      // Build request
      const request: ExportRequest = {
        models: modelSelections,
        format: selectedFormat,
        options: {
          ...DEFAULT_EXPORT_OPTIONS,
          includeLetterhead,
          includeSignature,
          includePageNumbers,
          filename: doc?.title?.replace(/\.[^/.]+$/, '') || 'export',
        },
      }

      // Execute export
      const result = await service.export(request)

      if (!result.success) {
        throw new Error(result.error || 'Erreur inconnue')
      }

      // Save file
      if (result.data) {
        const extension = selectedFormat === 'markdown' ? 'md' : selectedFormat
        const defaultName = `${request.options.filename}.${extension}`
        const filters = [{
          name: FORMAT_LABELS[selectedFormat],
          extensions: [extension],
        }]

        const savePath = await save({ defaultPath: defaultName, filters })

        if (savePath) {
          if (result.data instanceof Uint8Array) {
            await invoke('write_binary_file', { path: savePath, content: Array.from(result.data) })
          } else {
            await invoke('write_file', { path: savePath, content: result.data })
          }
          toast.success(`Export ${FORMAT_LABELS[selectedFormat]} réussi`)
          onClose()
        }
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      toast.error(`Erreur lors de l'export: ${message}`)
    } finally {
      setIsExporting(false)
      setProgress(null)
    }
  }

  // Handle print
  const handlePrint = async () => {
    if (!documentId) {
      toast.error('Aucun document sélectionné pour l\'impression')
      return
    }

    await printDocument(documentId, {
      includeLetterhead,
      includeSignature,
      includePageNumbers,
    })
  }

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const hasLawyerProfile = lawyerProfile.nom || lawyerProfile.cabinet
  const showExportOptions = (selectedFormat === 'pdf' || selectedFormat === 'docx' || selectedFormat === 'html') && hasLawyerProfile

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn" />

      {/* Dialog */}
      <div
        className="relative bg-[var(--bg)] border border-[var(--border)] rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-xl font-semibold">Exporter</h2>
            {doc && (
              <p className="text-sm text-gray-500 truncate mt-0.5 max-w-[300px]">"{doc.title}"</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--editor-bg)] transition-colors text-gray-500 hover:text-gray-700"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Section: Données */}
          <section>
            <h3 className="text-sm font-medium text-gray-600 mb-3">Données à exporter</h3>
            <div className="grid grid-cols-2 gap-2">
              {/* Document */}
              {documentId && (
                <button
                  onClick={() => toggleModel('document')}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                    selectedModels.document
                      ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                      : 'border-[var(--border)] hover:border-gray-400'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    selectedModels.document
                      ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                      : 'border-gray-300'
                  }`}>
                    {selectedModels.document && <CheckIcon />}
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-gray-500">{MODEL_ICONS.document}</span>
                    <span className="text-sm font-medium truncate">{MODEL_LABELS.document}</span>
                  </div>
                </button>
              )}

              {/* Bordereau */}
              <button
                onClick={() => toggleModel('bordereau')}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                  selectedModels.bordereau
                    ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                    : 'border-[var(--border)] hover:border-gray-400'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  selectedModels.bordereau
                    ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                    : 'border-gray-300'
                }`}>
                  {selectedModels.bordereau && <CheckIcon />}
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-gray-500">{MODEL_ICONS.bordereau}</span>
                  <span className="text-sm font-medium">{MODEL_LABELS.bordereau}</span>
                </div>
              </button>

              {/* Jurisprudence */}
              <button
                onClick={() => toggleModel('jurisprudence')}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                  selectedModels.jurisprudence
                    ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                    : 'border-[var(--border)] hover:border-gray-400'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  selectedModels.jurisprudence
                    ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                    : 'border-gray-300'
                }`}>
                  {selectedModels.jurisprudence && <CheckIcon />}
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-gray-500">{MODEL_ICONS.jurisprudence}</span>
                  <span className="text-sm font-medium">{MODEL_LABELS.jurisprudence}</span>
                </div>
              </button>

              {/* Clauses */}
              <button
                onClick={() => toggleModel('clause')}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                  selectedModels.clause
                    ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                    : 'border-[var(--border)] hover:border-gray-400'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  selectedModels.clause
                    ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                    : 'border-gray-300'
                }`}>
                  {selectedModels.clause && <CheckIcon />}
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-gray-500">{MODEL_ICONS.clause}</span>
                  <div className="flex-1">
                    <span className="text-sm font-medium">{MODEL_LABELS.clause}</span>
                    {modelCounts.clause > 0 && (
                      <span className="text-xs text-gray-500 ml-1">({modelCounts.clause})</span>
                    )}
                  </div>
                </div>
              </button>
            </div>
          </section>

          {/* Section: Format */}
          {modelSelections.length > 0 && (
            <section>
              <h3 className="text-sm font-medium text-gray-600 mb-3">Format</h3>
              <div className="flex flex-wrap gap-2">
                {availableFormats.map((format) => {
                  const config = FORMAT_CONFIG[format]
                  const isSelected = selectedFormat === format
                  return (
                    <button
                      key={format}
                      onClick={() => setSelectedFormat(format)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                          : 'border-[var(--border)] hover:border-gray-400'
                      }`}
                    >
                      <span style={{ color: isSelected ? config.color : 'currentColor' }}>
                        {config.icon}
                      </span>
                      <span className="text-sm font-medium">{FORMAT_LABELS[format]}</span>
                    </button>
                  )
                })}
              </div>
              {selectedFormat && (
                <p className="text-xs text-gray-500 mt-2">
                  {FORMAT_CONFIG[selectedFormat].desc}
                </p>
              )}
            </section>
          )}

          {/* Section: Options avancées */}
          {showExportOptions && (
            <section>
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                <span className={`transform transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`}>
                  <ChevronDownIcon />
                </span>
                Options avancées
              </button>

              {showAdvancedOptions && (
                <div className="mt-3 p-4 bg-[var(--editor-bg)] rounded-lg space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeLetterhead}
                      onChange={(e) => setIncludeLetterhead(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]"
                    />
                    <span className="text-sm">Inclure l'en-tête cabinet</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includePageNumbers}
                      onChange={(e) => setIncludePageNumbers(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]"
                    />
                    <span className="text-sm">Inclure la numérotation des pages</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSignature}
                      onChange={(e) => setIncludeSignature(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]"
                    />
                    <span className="text-sm">Inclure la signature</span>
                  </label>
                </div>
              )}
            </section>
          )}

          {/* Progress indicator */}
          {progress && progress.status !== 'idle' && progress.status !== 'complete' && (
            <div className="p-4 bg-[var(--editor-bg)] rounded-lg">
              <div className="flex items-center gap-3">
                <LoadingSpinner />
                <span className="text-sm text-gray-600">
                  {progress.currentItem || 'Export en cours...'}
                </span>
              </div>
              {progress.total > 1 && (
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent)] transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--border)] px-6 py-4 flex gap-3 justify-between bg-[var(--bg)]">
          {/* Left side - Print button (only if document is selected) */}
          <div>
            {documentId && selectedModels.document && (
              <button
                onClick={handlePrint}
                disabled={isExporting || isPrinting}
                className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--text)] hover:bg-[var(--editor-bg)] transition-colors disabled:opacity-50 flex items-center gap-2"
                title="Imprimer le document (Cmd+P)"
              >
                {isPrinting ? (
                  <LoadingSpinner />
                ) : (
                  <PrinterIcon />
                )}
                <span>Imprimer</span>
              </button>
            )}
          </div>

          {/* Right side - Cancel and Export buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isExporting || isPrinting}
              className="px-4 py-2 rounded-lg text-[var(--text)] hover:bg-[var(--editor-bg)] transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || isPrinting || modelSelections.length === 0}
              className="px-5 py-2 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 flex items-center gap-2 min-w-[120px] justify-center"
            >
              {isExporting ? (
                <>
                  <LoadingSpinner />
                  <span>Export...</span>
                </>
              ) : (
                'Exporter'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
