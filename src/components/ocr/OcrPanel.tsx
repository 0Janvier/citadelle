// Panneau OCR pour extraire du texte des images et PDF
import { useState, useRef } from 'react'
import { useEditorStore } from '../../store/useEditorStore'
import {
  extractTextFromImage,
  OcrLanguage,
  OCR_LANGUAGES,
  OcrProgress,
  OcrResult,
  detectDocumentType,
  extractEntities,
} from '../../lib/ocr'

interface OcrPanelProps {
  onClose?: () => void
}

export function OcrPanel({ onClose }: OcrPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [language, setLanguage] = useState<OcrLanguage>('fra')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState<OcrProgress | null>(null)
  const [result, setResult] = useState<OcrResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const activeEditor = useEditorStore((state) => state.activeEditor)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Seuls les fichiers image et PDF sont supportés')
      return
    }

    setSelectedFile(file)
    setError(null)
    setResult(null)

    // Créer un aperçu
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleProcess = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setProgress(null)
    setError(null)
    setResult(null)

    try {
      const ocrResult = await extractTextFromImage(selectedFile, {
        language,
        onProgress: setProgress,
      })

      setResult(ocrResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'OCR')
    } finally {
      setIsProcessing(false)
      setProgress(null)
    }
  }

  const handleInsertText = () => {
    if (!result || !activeEditor) return

    activeEditor.chain().focus().insertContent(result.text).run()
    onClose?.()
  }

  const handleCopyText = async () => {
    if (!result) return

    await navigator.clipboard.writeText(result.text)
  }

  const documentType = result ? detectDocumentType(result.text) : null
  const entities = result ? extractEntities(result.text) : null

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* En-tête */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
        <h2 className="text-lg font-semibold">Extraction OCR</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Configuration */}
      <div className="p-4 border-b border-[var(--border-color)] space-y-4">
        {/* Sélection de fichier */}
        <div>
          <label className="block text-sm font-medium mb-2">Document source</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-3 border-2 border-dashed border-[var(--border-color)] rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors text-center"
          >
            {selectedFile ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="truncate">{selectedFile.name}</span>
              </div>
            ) : (
              <div className="text-gray-500">
                <svg className="mx-auto w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Cliquez pour sélectionner un fichier
              </div>
            )}
          </button>
        </div>

        {/* Aperçu */}
        {preview && (
          <div className="rounded-lg overflow-hidden border border-[var(--border-color)] max-h-40">
            <img src={preview} alt="Aperçu" className="w-full h-full object-contain bg-gray-100 dark:bg-gray-800" />
          </div>
        )}

        {/* Langue */}
        <div>
          <label className="block text-sm font-medium mb-2">Langue du document</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as OcrLanguage)}
            className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            {Object.entries(OCR_LANGUAGES).map(([code, label]) => (
              <option key={code} value={code}>{label}</option>
            ))}
          </select>
        </div>

        {/* Bouton traitement */}
        <button
          onClick={handleProcess}
          disabled={!selectedFile || isProcessing}
          className="w-full px-4 py-3 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Traitement en cours...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Extraire le texte
            </>
          )}
        </button>

        {/* Progression */}
        {progress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{progress.status}</span>
              <span className="font-medium">{Math.round(progress.progress * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--accent)] transition-all duration-300"
                style={{ width: `${progress.progress * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Erreur */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Résultat */}
      {result && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Métadonnées */}
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              Confiance: {Math.round(result.confidence)}%
            </span>
            {documentType && (
              <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                Type: {documentType}
              </span>
            )}
          </div>

          {/* Entités détectées */}
          {entities && (entities.dates.length > 0 || entities.amounts.length > 0 || entities.references.length > 0) && (
            <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <h4 className="font-medium text-sm mb-2">Éléments détectés</h4>
              <div className="space-y-1 text-sm">
                {entities.dates.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Dates:</span>
                    <span>{entities.dates.join(', ')}</span>
                  </div>
                )}
                {entities.amounts.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Montants:</span>
                    <span>{entities.amounts.join(', ')}</span>
                  </div>
                )}
                {entities.references.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Références:</span>
                    <span>{entities.references.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Texte extrait */}
          <div>
            <h4 className="font-medium text-sm mb-2">Texte extrait</h4>
            <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] max-h-60 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-sans">{result.text}</pre>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleCopyText}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copier
            </button>
            <button
              onClick={handleInsertText}
              className="flex-1 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Insérer
            </button>
          </div>
        </div>
      )}

      {/* Message d'aide */}
      {!result && !isProcessing && !error && (
        <div className="flex-1 flex items-center justify-center p-4 text-gray-500 text-center">
          <div>
            <svg className="mx-auto w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>Sélectionnez une image ou un PDF</p>
            <p className="text-sm mt-1">pour en extraire le texte</p>
          </div>
        </div>
      )}
    </div>
  )
}
