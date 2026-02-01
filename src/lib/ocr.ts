// OCR (Optical Character Recognition) pour l'extraction de texte des documents
// Utilise Tesseract.js pour l'OCR côté client

import { createWorker, PSM, OEM } from 'tesseract.js'

export interface OcrResult {
  text: string
  confidence: number
  words: OcrWord[]
  blocks: OcrBlock[]
}

export interface OcrWord {
  text: string
  confidence: number
  bbox: BoundingBox
}

export interface OcrBlock {
  text: string
  confidence: number
  bbox: BoundingBox
  paragraphs: OcrParagraph[]
}

export interface OcrParagraph {
  text: string
  confidence: number
  bbox: BoundingBox
}

export interface BoundingBox {
  x0: number
  y0: number
  x1: number
  y1: number
}

export interface OcrProgress {
  status: string
  progress: number
}

// Languages disponibles
export type OcrLanguage = 'fra' | 'eng' | 'deu' | 'spa' | 'ita'

export const OCR_LANGUAGES: Record<OcrLanguage, string> = {
  fra: 'Français',
  eng: 'English',
  deu: 'Deutsch',
  spa: 'Español',
  ita: 'Italiano',
}

// État de l'OCR
let worker: Awaited<ReturnType<typeof createWorker>> | null = null
let currentLanguage: OcrLanguage = 'fra'

// Initialiser le worker OCR
export async function initOcrWorker(
  language: OcrLanguage = 'fra',
  onProgress?: (progress: OcrProgress) => void
): Promise<void> {
  if (worker && currentLanguage === language) {
    return
  }

  // Terminer le worker existant
  if (worker) {
    await worker.terminate()
    worker = null
  }

  // Créer un nouveau worker
  worker = await createWorker(language, OEM.LSTM_ONLY, {
    logger: (m) => {
      if (onProgress) {
        onProgress({
          status: m.status,
          progress: m.progress || 0,
        })
      }
    },
  })

  // Configurer le PSM (Page Segmentation Mode)
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.AUTO,
  })

  currentLanguage = language
}

// Terminer le worker OCR
export async function terminateOcrWorker(): Promise<void> {
  if (worker) {
    await worker.terminate()
    worker = null
  }
}

// Extraire le texte d'une image
export async function extractTextFromImage(
  imageSource: string | File | Blob,
  options?: {
    language?: OcrLanguage
    onProgress?: (progress: OcrProgress) => void
  }
): Promise<OcrResult> {
  const language = options?.language || 'fra'
  const onProgress = options?.onProgress

  // Initialiser le worker si nécessaire
  await initOcrWorker(language, onProgress)

  if (!worker) {
    throw new Error('OCR worker not initialized')
  }

  // Effectuer l'OCR
  const result = await worker.recognize(imageSource)

  // Convertir le résultat
  const words = (result.data as { words?: Array<{ text: string; confidence: number; bbox: { x0: number; y0: number; x1: number; y1: number } }> }).words || []
  const blocks = result.data.blocks || []

  const ocrResult: OcrResult = {
    text: result.data.text,
    confidence: result.data.confidence,
    words: words.map((w) => ({
      text: w.text,
      confidence: w.confidence,
      bbox: {
        x0: w.bbox.x0,
        y0: w.bbox.y0,
        x1: w.bbox.x1,
        y1: w.bbox.y1,
      },
    })),
    blocks: blocks.map((b) => ({
      text: b.text,
      confidence: b.confidence,
      bbox: {
        x0: b.bbox.x0,
        y0: b.bbox.y0,
        x1: b.bbox.x1,
        y1: b.bbox.y1,
      },
      paragraphs: b.paragraphs.map((p) => ({
        text: p.text,
        confidence: p.confidence,
        bbox: {
          x0: p.bbox.x0,
          y0: p.bbox.y0,
          x1: p.bbox.x1,
          y1: p.bbox.y1,
        },
      })),
    })),
  }

  return ocrResult
}

// Extraire le texte d'un PDF (page par page)
export async function extractTextFromPdf(
  _pdfUrl: string,
  _options?: {
    language?: OcrLanguage
    onProgress?: (progress: OcrProgress) => void
    pageNumbers?: number[] // Pages spécifiques à traiter
  }
): Promise<OcrResult[]> {
  // Note: L'extraction PDF nécessite pdf.js pour convertir les pages en images
  // Pour l'instant, cette fonction est un placeholder
  console.warn('PDF OCR not yet implemented - requires pdf.js integration')
  return []
}

// Prétraitement d'image pour améliorer l'OCR
export function preprocessImage(
  imageData: ImageData,
  options?: {
    grayscale?: boolean
    contrast?: number
    threshold?: number
  }
): ImageData {
  const data = imageData.data
  const grayscale = options?.grayscale ?? true
  const contrast = options?.contrast ?? 1.2
  const threshold = options?.threshold

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i]
    let g = data[i + 1]
    let b = data[i + 2]

    // Convertir en niveaux de gris
    if (grayscale) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b
      r = g = b = gray
    }

    // Ajuster le contraste
    if (contrast !== 1) {
      r = ((r / 255 - 0.5) * contrast + 0.5) * 255
      g = ((g / 255 - 0.5) * contrast + 0.5) * 255
      b = ((b / 255 - 0.5) * contrast + 0.5) * 255
    }

    // Appliquer un seuil (binarisation)
    if (threshold !== undefined) {
      const avg = (r + g + b) / 3
      r = g = b = avg > threshold ? 255 : 0
    }

    // Clamp les valeurs
    data[i] = Math.min(255, Math.max(0, r))
    data[i + 1] = Math.min(255, Math.max(0, g))
    data[i + 2] = Math.min(255, Math.max(0, b))
  }

  return imageData
}

// Détecter automatiquement le type de document
export function detectDocumentType(text: string): string {
  const lowerText = text.toLowerCase()

  // Patterns pour différents types de documents juridiques
  if (lowerText.includes('tribunal') || lowerText.includes('jugement') || lowerText.includes('ordonnance')) {
    return 'decision_justice'
  }
  if (lowerText.includes('assignation') || lowerText.includes('huissier')) {
    return 'acte_huissier'
  }
  if (lowerText.includes('contrat') || lowerText.includes('convention')) {
    return 'contrat'
  }
  if (lowerText.includes('facture') || lowerText.includes('invoice')) {
    return 'facture'
  }
  if (lowerText.includes('attestation') || lowerText.includes('certifie')) {
    return 'attestation'
  }
  if (lowerText.includes('procuration')) {
    return 'procuration'
  }

  return 'autre'
}

// Extraire les entités du texte OCR (dates, montants, noms)
export function extractEntities(text: string): {
  dates: string[]
  amounts: string[]
  names: string[]
  references: string[]
} {
  const entities = {
    dates: [] as string[],
    amounts: [] as string[],
    names: [] as string[],
    references: [] as string[],
  }

  // Patterns de dates françaises
  const datePattern = /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{1,2}\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4}/gi
  const dateMatches = text.match(datePattern)
  if (dateMatches) {
    entities.dates = [...new Set(dateMatches)]
  }

  // Patterns de montants
  const amountPattern = /\d+[\s,\.]*\d*\s*(?:€|EUR|euros?)/gi
  const amountMatches = text.match(amountPattern)
  if (amountMatches) {
    entities.amounts = [...new Set(amountMatches)]
  }

  // Patterns de références (RG, dossier, etc.)
  const refPattern = /(?:RG|N°|Dossier|Réf\.?)\s*[:n°]*\s*[\w\-\/]+/gi
  const refMatches = text.match(refPattern)
  if (refMatches) {
    entities.references = [...new Set(refMatches)]
  }

  return entities
}
