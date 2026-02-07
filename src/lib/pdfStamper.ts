/**
 * PDF Stamper - Ported from KLS PDF stamping application
 * Uses pdf-lib for client-side PDF manipulation
 * Applies numbered piece stamps (tampons) on PDF documents
 */

import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb } from 'pdf-lib'

// ============================================================================
// Types
// ============================================================================

export type StampStyle =
  | 'elegant'
  | 'professional'
  | 'minimal'
  | 'framed'
  | 'modern'
  | 'official'
  | 'subtle'
  | 'banner'

export type StampPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export type StampFont = 'helvetica' | 'times' | 'courier'

export interface StampConfig {
  prefix: string        // "Piece n " par defaut
  cabinetName: string   // Nom du cabinet
  style: StampStyle
  position: StampPosition
  fontSize: number      // 11 par defaut
  sizeScale: number     // 100 par defaut (%)
  allPages: boolean     // Tamponner toutes les pages ou juste la premiere

  // Personnalisation avancee
  fontFamily: StampFont         // Police (helvetica par defaut)
  customTextColor?: string      // Hex (#RRGGBB), override le style
  customBgColor?: string        // Hex (#RRGGBB), override le style
  customBorderColor?: string    // Hex (#RRGGBB), override le style
  opacity: number               // Opacite globale 0-100 (100 par defaut)
  margin: number                // Marge depuis le bord en pt (30 par defaut)
  additionalLine: string        // Ligne supplementaire sous le cabinet
}

export const DEFAULT_STAMP_CONFIG: StampConfig = {
  prefix: 'Piece n\u00B0',
  cabinetName: '',
  style: 'elegant',
  position: 'top-right',
  fontSize: 11,
  sizeScale: 100,
  allPages: false,
  fontFamily: 'helvetica',
  customTextColor: undefined,
  customBgColor: undefined,
  customBorderColor: undefined,
  opacity: 100,
  margin: 30,
  additionalLine: '',
}

export const STAMP_STYLE_LABELS: Record<StampStyle, string> = {
  elegant: 'Elegant',
  professional: 'Professionnel',
  minimal: 'Minimal',
  framed: 'Encadre',
  modern: 'Moderne',
  official: 'Officiel',
  subtle: 'Discret',
  banner: 'Bandeau',
}

export const STAMP_POSITION_LABELS: Record<StampPosition, string> = {
  'top-left': 'Haut gauche',
  'top-center': 'Haut centre',
  'top-right': 'Haut droite',
  'bottom-left': 'Bas gauche',
  'bottom-center': 'Bas centre',
  'bottom-right': 'Bas droite',
}

export const STAMP_FONT_LABELS: Record<StampFont, string> = {
  helvetica: 'Helvetica',
  times: 'Times New Roman',
  courier: 'Courier',
}

// ============================================================================
// Style Definitions (ported from KLS StampRenderer)
// ============================================================================

interface StyleDef {
  border: { width: number; color: [number, number, number]; double?: boolean } | null
  background: { color: [number, number, number]; opacity: number } | null
  text: { color: [number, number, number] }
  padding: { x: number; y: number }
  accentBar?: { width: number; color: [number, number, number] }
  fullWidth?: boolean
}

const STAMP_STYLES: Record<StampStyle, StyleDef> = {
  elegant: {
    border: { width: 1.5, color: [0.35, 0.35, 0.45] },
    background: { color: [0.98, 0.98, 0.97], opacity: 0.95 },
    text: { color: [0.1, 0.1, 0.18] },
    padding: { x: 12, y: 8 },
  },
  professional: {
    border: { width: 1.5, color: [0, 0, 0] },
    background: { color: [1, 1, 1], opacity: 1 },
    text: { color: [0, 0, 0] },
    padding: { x: 10, y: 6 },
  },
  minimal: {
    border: null,
    background: null,
    text: { color: [0.3, 0.3, 0.4] },
    padding: { x: 0, y: 0 },
  },
  framed: {
    border: { width: 2, color: [0.15, 0.15, 0.3], double: true },
    background: { color: [0.96, 0.96, 0.98], opacity: 0.92 },
    text: { color: [0.15, 0.15, 0.3] },
    padding: { x: 14, y: 10 },
  },
  modern: {
    border: null,
    background: { color: [0.95, 0.95, 0.98], opacity: 0.95 },
    text: { color: [0.2, 0.3, 0.5] },
    padding: { x: 14, y: 8 },
    accentBar: { width: 3, color: [0.2, 0.4, 0.7] },
  },
  official: {
    border: { width: 2, color: [0.6, 0.2, 0.2], double: true },
    background: { color: [1, 1, 1], opacity: 0.9 },
    text: { color: [0.6, 0.2, 0.2] },
    padding: { x: 12, y: 8 },
  },
  subtle: {
    border: { width: 0.5, color: [0.7, 0.7, 0.7] },
    background: { color: [0.97, 0.97, 0.97], opacity: 0.85 },
    text: { color: [0.4, 0.4, 0.4] },
    padding: { x: 10, y: 6 },
  },
  banner: {
    border: null,
    background: { color: [0.15, 0.15, 0.2], opacity: 0.92 },
    text: { color: [1, 1, 1] },
    padding: { x: 20, y: 6 },
    fullWidth: true,
  },
}

// ============================================================================
// Helpers
// ============================================================================

/** Parse hex color (#RRGGBB or #RGB) to [r, g, b] in 0-1 range */
function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '')
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16) / 255
    const g = parseInt(clean[1] + clean[1], 16) / 255
    const b = parseInt(clean[2] + clean[2], 16) / 255
    return [r, g, b]
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16) / 255
    const g = parseInt(clean.substring(2, 4), 16) / 255
    const b = parseInt(clean.substring(4, 6), 16) / 255
    return [r, g, b]
  }
  return null
}

/** Apply custom color overrides to a style definition */
function applyCustomColors(style: StyleDef, config: StampConfig): StyleDef {
  const result = JSON.parse(JSON.stringify(style)) as StyleDef

  const textColor = config.customTextColor ? hexToRgb(config.customTextColor) : null
  const bgColor = config.customBgColor ? hexToRgb(config.customBgColor) : null
  const borderColor = config.customBorderColor ? hexToRgb(config.customBorderColor) : null

  if (textColor) {
    result.text.color = textColor
    if (result.accentBar) {
      result.accentBar.color = textColor
    }
  }

  if (bgColor) {
    if (result.background) {
      result.background.color = bgColor
    } else {
      result.background = { color: bgColor, opacity: 0.92 }
    }
  }

  if (borderColor) {
    if (result.border) {
      result.border.color = borderColor
    } else {
      result.border = { width: 1, color: borderColor }
    }
  }

  return result
}

// ============================================================================
// Font mapping
// ============================================================================

const FONT_MAP: Record<StampFont, { regular: StandardFonts; bold: StandardFonts }> = {
  helvetica: { regular: StandardFonts.Helvetica, bold: StandardFonts.HelveticaBold },
  times: { regular: StandardFonts.TimesRoman, bold: StandardFonts.TimesRomanBold },
  courier: { regular: StandardFonts.Courier, bold: StandardFonts.CourierBold },
}

// ============================================================================
// Text Wrapping Helper
// ============================================================================

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  if (!text || text.trim() === '') return []

  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word
    const testWidth = font.widthOfTextAtSize(testLine, fontSize)

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  // Truncate lines that are still too long
  return lines.map((line) => {
    if (font.widthOfTextAtSize(line, fontSize) > maxWidth) {
      let truncated = line
      while (font.widthOfTextAtSize(truncated + '...', fontSize) > maxWidth && truncated.length > 3) {
        truncated = truncated.slice(0, -1)
      }
      return truncated + '...'
    }
    return line
  })
}

// ============================================================================
// Position Calculator
// ============================================================================

function calculatePosition(
  positionKey: StampPosition,
  pageWidth: number,
  pageHeight: number,
  stampWidth: number,
  stampHeight: number,
  margin: number
): { x: number; y: number } {
  const positions: Record<StampPosition, { x: number; y: number }> = {
    'top-left': { x: margin, y: pageHeight - margin - stampHeight },
    'top-center': { x: (pageWidth - stampWidth) / 2, y: pageHeight - margin - stampHeight },
    'top-right': { x: pageWidth - margin - stampWidth, y: pageHeight - margin - stampHeight },
    'bottom-left': { x: margin, y: margin },
    'bottom-center': { x: (pageWidth - stampWidth) / 2, y: margin },
    'bottom-right': { x: pageWidth - margin - stampWidth, y: margin },
  }

  return positions[positionKey] || positions['top-right']
}

// ============================================================================
// Stamp Renderer
// ============================================================================

function drawRectangularStamp(
  page: PDFPage,
  config: StampConfig,
  pieceNumber: number,
  font: PDFFont,
  fontBold: PDFFont,
  style: StyleDef
) {
  const { width, height } = page.getSize()
  const stampMargin = config.margin ?? 30
  const globalOpacity = (config.opacity ?? 100) / 100

  const pieceText = config.prefix + ' ' + pieceNumber
  const cabinetText = config.cabinetName || ''
  const additionalText = config.additionalLine || ''

  const scale = (config.sizeScale || 100) / 100
  const fontSize = (config.fontSize || 11) * scale
  const fontSizeSmall = fontSize * 0.85

  const paddingX = style.padding.x * scale
  const paddingY = style.padding.y * scale

  // Calculate piece text width
  const pieceWidth = fontBold.widthOfTextAtSize(pieceText, fontSize)

  // Calculate cabinet text lines
  const maxTextWidth = Math.max(pieceWidth, 80 * scale)
  const cabinetLines = wrapText(cabinetText, font, fontSizeSmall, maxTextWidth)
  const additionalLines = wrapText(additionalText, font, fontSizeSmall, maxTextWidth)

  // Final width based on widest text
  let textWidth = pieceWidth
  for (const line of [...cabinetLines, ...additionalLines]) {
    const lineWidth = font.widthOfTextAtSize(line, fontSizeSmall)
    textWidth = Math.max(textWidth, lineWidth)
  }

  const lineHeight = fontSize * 1.2
  const lineHeightSmall = fontSizeSmall * 1.2
  const textHeight = lineHeight + (cabinetLines.length + additionalLines.length) * lineHeightSmall

  let stampWidth = textWidth + paddingX * 2
  const stampHeight = textHeight + paddingY * 2

  if (style.fullWidth) {
    stampWidth = width - stampMargin * 2
  }

  if (style.accentBar) {
    stampWidth += (style.accentBar.width + 4) * scale
  }

  const position = calculatePosition(config.position, width, height, stampWidth, stampHeight, stampMargin)

  // Draw background
  if (style.background) {
    page.drawRectangle({
      x: position.x,
      y: position.y,
      width: stampWidth,
      height: stampHeight,
      color: rgb(style.background.color[0], style.background.color[1], style.background.color[2]),
      opacity: style.background.opacity * globalOpacity,
    })
  }

  // Accent bar (modern style)
  if (style.accentBar) {
    const barWidth = style.accentBar.width * scale
    page.drawRectangle({
      x: position.x,
      y: position.y,
      width: barWidth,
      height: stampHeight,
      color: rgb(style.accentBar.color[0], style.accentBar.color[1], style.accentBar.color[2]),
      opacity: globalOpacity,
    })
  }

  // Border
  if (style.border) {
    const borderWidth = style.border.width * scale
    page.drawRectangle({
      x: position.x,
      y: position.y,
      width: stampWidth,
      height: stampHeight,
      borderColor: rgb(style.border.color[0], style.border.color[1], style.border.color[2]),
      borderWidth: borderWidth,
      opacity: globalOpacity,
    })

    if (style.border.double) {
      const innerOffset = 3 * scale
      page.drawRectangle({
        x: position.x + innerOffset,
        y: position.y + innerOffset,
        width: stampWidth - innerOffset * 2,
        height: stampHeight - innerOffset * 2,
        borderColor: rgb(style.border.color[0], style.border.color[1], style.border.color[2]),
        borderWidth: borderWidth * 0.5,
        opacity: globalOpacity,
      })
    }
  }

  // Text area
  let contentX = position.x + paddingX
  const contentWidth = stampWidth - paddingX * 2

  if (style.accentBar) {
    contentX += (style.accentBar.width + 4) * scale
  }

  let textY = position.y + paddingY
  const textOpacity = globalOpacity

  // Draw additional lines (bottommost)
  for (let i = additionalLines.length - 1; i >= 0; i--) {
    const line = additionalLines[i]
    const lineWidth = font.widthOfTextAtSize(line, fontSizeSmall)
    const lineX = style.fullWidth
      ? contentX + (contentWidth - lineWidth) / 2
      : contentX + (textWidth - lineWidth) / 2

    page.drawText(line, {
      x: lineX,
      y: textY,
      size: fontSizeSmall,
      font: font,
      color: rgb(style.text.color[0], style.text.color[1], style.text.color[2]),
      opacity: textOpacity * 0.65,
    })
    textY += lineHeightSmall
  }

  // Draw cabinet lines (middle)
  for (let i = cabinetLines.length - 1; i >= 0; i--) {
    const line = cabinetLines[i]
    const lineWidth = font.widthOfTextAtSize(line, fontSizeSmall)
    const lineX = style.fullWidth
      ? contentX + (contentWidth - lineWidth) / 2
      : contentX + (textWidth - lineWidth) / 2

    page.drawText(line, {
      x: lineX,
      y: textY,
      size: fontSizeSmall,
      font: font,
      color: rgb(style.text.color[0], style.text.color[1], style.text.color[2]),
      opacity: textOpacity,
    })
    textY += lineHeightSmall
  }

  // Draw piece number (top, centered)
  const pieceX = style.fullWidth
    ? contentX + (contentWidth - pieceWidth) / 2
    : contentX + (textWidth - pieceWidth) / 2

  page.drawText(pieceText, {
    x: pieceX,
    y: textY,
    size: fontSize,
    font: fontBold,
    color: rgb(style.text.color[0], style.text.color[1], style.text.color[2]),
    opacity: textOpacity,
  })
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Apply a stamp to a PDF document
 * @param pdfBytes - Original PDF bytes
 * @param pieceNumber - Piece number to stamp
 * @param config - Stamp configuration
 * @returns Stamped PDF bytes
 */
export async function stampPdf(
  pdfBytes: Uint8Array,
  pieceNumber: number,
  config: StampConfig
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })

  const fontFamily = config.fontFamily || 'helvetica'
  const fonts = FONT_MAP[fontFamily] || FONT_MAP.helvetica
  const font = await pdfDoc.embedFont(fonts.regular)
  const fontBold = await pdfDoc.embedFont(fonts.bold)

  const baseStyle = STAMP_STYLES[config.style] || STAMP_STYLES.elegant
  const style = applyCustomColors(baseStyle, config)

  // Determine which pages to stamp
  const pages = config.allPages ? pdfDoc.getPages() : [pdfDoc.getPage(0)]

  for (const page of pages) {
    drawRectangularStamp(page, config, pieceNumber, font, fontBold, style)
  }

  return await pdfDoc.save()
}

/**
 * Stamp multiple PDFs in batch
 * @param files - Array of {bytes, pieceNumber, filename}
 * @param config - Stamp configuration
 * @param onProgress - Progress callback (current, total)
 * @returns Array of stamped {bytes, filename}
 */
export async function stampBatch(
  files: Array<{ bytes: Uint8Array; pieceNumber: number; filename: string }>,
  config: StampConfig,
  onProgress?: (current: number, total: number) => void
): Promise<Array<{ bytes: Uint8Array; filename: string }>> {
  const results: Array<{ bytes: Uint8Array; filename: string }> = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    onProgress?.(i, files.length)

    try {
      const stampedBytes = await stampPdf(file.bytes, file.pieceNumber, config)
      results.push({ bytes: stampedBytes, filename: file.filename })
    } catch (error) {
      console.error(`Failed to stamp ${file.filename}:`, error)
      // Skip failed files but continue batch
    }
  }

  onProgress?.(files.length, files.length)
  return results
}
