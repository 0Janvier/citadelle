/**
 * Utilitaires de conversion pour l'export PDF et DOCX
 *
 * Conversions d'unités :
 * - Template margins (cm) → pdfmake (points) : 1cm = 28.35 points
 * - Template margins (cm) → docx (twips) : 1cm = 567 twips
 * - Font sizes (pt) → pdfmake (number) : "11pt" → 11
 * - Font sizes (pt) → docx (half-points) : "11pt" → 22
 */

import type { PageSize, PageOrientation } from '../types/templates'

// Constantes de conversion
const CM_TO_POINTS = 28.3465  // 1 cm = 28.3465 points
const CM_TO_TWIPS = 566.929   // 1 cm = 566.929 twips
const INCH_TO_TWIPS = 1440    // 1 inch = 1440 twips

// Dimensions des pages en twips (largeur x hauteur en portrait)
const PAGE_SIZES_TWIPS: Record<string, { width: number; height: number }> = {
  A4: { width: 11906, height: 16838 },
  A5: { width: 8391, height: 11906 },
  Letter: { width: 12240, height: 15840 },
  Legal: { width: 12240, height: 20160 },
}

/**
 * Parse une valeur avec unité (ex: "2.5cm", "11pt")
 */
export function parseUnit(value: string): { value: number; unit: string } {
  const match = value.match(/^([\d.]+)\s*([a-z%]+)?$/i)
  if (!match) {
    return { value: parseFloat(value) || 0, unit: '' }
  }
  return {
    value: parseFloat(match[1]) || 0,
    unit: match[2]?.toLowerCase() || '',
  }
}

/**
 * Convertit une valeur en cm vers des points (pdfmake)
 * @param cmValue - Valeur en format "2.5cm" ou "2.5"
 * @returns Valeur en points
 */
export function cmToPoints(cmValue: string): number {
  const { value, unit } = parseUnit(cmValue)

  // Si pas d'unité ou cm, convertir depuis cm
  if (!unit || unit === 'cm') {
    return Math.round(value * CM_TO_POINTS)
  }

  // Si déjà en points
  if (unit === 'pt') {
    return Math.round(value)
  }

  // Si en inches
  if (unit === 'in') {
    return Math.round(value * 72) // 1 inch = 72 points
  }

  // Fallback: traiter comme cm
  return Math.round(value * CM_TO_POINTS)
}

/**
 * Convertit une valeur en cm vers des twips (docx)
 * @param cmValue - Valeur en format "2.5cm" ou "2.5"
 * @returns Valeur en twips
 */
export function cmToTwips(cmValue: string): number {
  const { value, unit } = parseUnit(cmValue)

  // Si pas d'unité ou cm, convertir depuis cm
  if (!unit || unit === 'cm') {
    return Math.round(value * CM_TO_TWIPS)
  }

  // Si en inches
  if (unit === 'in') {
    return Math.round(value * INCH_TO_TWIPS)
  }

  // Si en points
  if (unit === 'pt') {
    return Math.round(value * 20) // 1 point = 20 twips
  }

  // Fallback: traiter comme cm
  return Math.round(value * CM_TO_TWIPS)
}

/**
 * Convertit une taille de police en points vers un nombre (pdfmake)
 * @param ptValue - Valeur en format "11pt" ou "11"
 * @returns Valeur numérique
 */
export function ptToNumber(ptValue: string): number {
  const { value } = parseUnit(ptValue)
  return value || 11 // Default 11pt
}

/**
 * Convertit une taille de police en demi-points (docx)
 * @param ptValue - Valeur en format "11pt" ou "11"
 * @returns Valeur en demi-points (ex: 11pt → 22)
 */
export function ptToHalfPoints(ptValue: string): number {
  const { value } = parseUnit(ptValue)
  return Math.round((value || 11) * 2)
}

/**
 * Retourne le format de page pour pdfmake
 * @param size - Taille de page (A4, Letter, etc.)
 * @returns String format pdfmake
 */
export function getPageSizeForPdfmake(size: PageSize): string {
  const mapping: Record<PageSize, string> = {
    A4: 'A4',
    A5: 'A5',
    Letter: 'LETTER',
    Legal: 'LEGAL',
    custom: 'A4', // Fallback
  }
  return mapping[size] || 'A4'
}

/**
 * Retourne les dimensions de page pour docx en twips
 * @param size - Taille de page
 * @param orientation - Orientation (portrait/landscape)
 * @returns Dimensions en twips
 */
export function getPageSizeForDocx(
  size: PageSize,
  orientation: PageOrientation
): { width: number; height: number } {
  const dimensions = PAGE_SIZES_TWIPS[size] || PAGE_SIZES_TWIPS.A4

  if (orientation === 'landscape') {
    return { width: dimensions.height, height: dimensions.width }
  }

  return dimensions
}

/**
 * Convertit une valeur em vers des points basé sur la taille de base
 * @param emValue - Valeur en format "1.5em" ou "1.5"
 * @param baseFontSize - Taille de police de base en points
 * @returns Valeur en points
 */
export function emToPoints(emValue: string, baseFontSize: number): number {
  const { value, unit } = parseUnit(emValue)

  if (unit === 'em' || !unit) {
    return Math.round(value * baseFontSize)
  }

  if (unit === 'pt') {
    return Math.round(value)
  }

  return Math.round(value * baseFontSize)
}

/**
 * Convertit les propriétés de style CSS-like en format pdfmake
 */
export function mapCssStyleToPdfmake(
  cssStyle: Record<string, string>,
  baseFontSize: number = 11
): Record<string, unknown> {
  const pdfStyle: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(cssStyle)) {
    switch (key) {
      case 'fontSize':
        pdfStyle.fontSize = ptToNumber(value)
        break
      case 'fontWeight':
        pdfStyle.bold = value === '700' || value === 'bold'
        break
      case 'fontStyle':
        pdfStyle.italics = value === 'italic'
        break
      case 'color':
        pdfStyle.color = value
        break
      case 'textAlign':
        pdfStyle.alignment = value
        break
      case 'marginTop':
        pdfStyle.marginTop = emToPoints(value, baseFontSize)
        break
      case 'marginBottom':
        pdfStyle.marginBottom = emToPoints(value, baseFontSize)
        break
      case 'marginLeft':
        pdfStyle.marginLeft = cmToPoints(value)
        break
      case 'marginRight':
        pdfStyle.marginRight = cmToPoints(value)
        break
      case 'textIndent':
        pdfStyle.leadingIndent = cmToPoints(value)
        break
      case 'textTransform':
        // pdfmake ne supporte pas textTransform nativement
        break
    }
  }

  return pdfStyle
}

/**
 * Remplace les variables de date dans une chaîne
 * @param text - Texte avec variables {{date.format("...")}}
 * @returns Texte avec dates remplacées
 */
export function replaceDateVariables(text: string): string {
  const now = new Date()

  // Remplacer {{date.format("DD/MM/YYYY")}}
  return text.replace(/\{\{date\.format\("([^"]+)"\)\}\}/g, (_, format: string) => {
    let result = format

    // Jour
    result = result.replace('DD', String(now.getDate()).padStart(2, '0'))
    result = result.replace('D', String(now.getDate()))

    // Mois
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    result = result.replace('MMMM', months[now.getMonth()])
    result = result.replace('MM', String(now.getMonth() + 1).padStart(2, '0'))
    result = result.replace('M', String(now.getMonth() + 1))

    // Année
    result = result.replace('YYYY', String(now.getFullYear()))
    result = result.replace('YY', String(now.getFullYear()).slice(-2))

    return result
  })
}

/**
 * Remplace les variables statiques (hors pagination) dans une chaîne
 * @param text - Texte avec variables
 * @param documentTitle - Titre du document
 * @returns Texte avec variables remplacées
 */
export function replaceStaticVariables(
  text: string,
  documentTitle: string,
  documentNumber?: string
): string {
  let result = text

  // Remplacer le titre du document
  result = result.replace(/\{\{document\.title\}\}/g, documentTitle)

  // Remplacer le numéro de document
  result = result.replace(/\{\{document\.numero\}\}/g, documentNumber || '')

  // Remplacer les dates
  result = replaceDateVariables(result)

  return result
}
