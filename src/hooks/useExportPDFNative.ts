/**
 * Hook d'export PDF natif avec pdfmake
 *
 * Ce hook génère des PDF directement depuis le contenu TipTap
 * avec support complet des en-têtes/pieds de page et numérotation.
 */

// Polyfill Buffer pour pdfmake (nécessaire dans le browser)
import { Buffer } from 'buffer'
if (typeof window !== 'undefined' && !(window as unknown as { Buffer?: typeof Buffer }).Buffer) {
  (window as unknown as { Buffer: typeof Buffer }).Buffer = Buffer
}
if (typeof globalThis !== 'undefined' && !(globalThis as unknown as { Buffer?: typeof Buffer }).Buffer) {
  (globalThis as unknown as { Buffer: typeof Buffer }).Buffer = Buffer
}

import { save } from '@tauri-apps/api/dialog'
import { writeBinaryFile } from '@tauri-apps/api/fs'
import { useDocumentStore } from '../store/useDocumentStore'
import { useDocumentCounterStore } from '../store/useDocumentCounterStore'
import { usePageStore, replacePageVariables } from '../store/usePageStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { useExportTemplateStore } from '../store/useExportTemplateStore'
import { useLawyerProfileStore } from '../store/useLawyerProfileStore'
import { useToast } from './useToast'
import type { JSONContent } from '@tiptap/react'
import type { ExportTemplate, HeaderFooter } from '../types/templates'
import {
  cmToPoints,
  ptToNumber,
  getPageSizeForPdfmake,
  replaceStaticVariables,
} from '../lib/exportUtils'
import { loadGaramondFonts, getAvailableFont } from '../lib/pdfFonts'

// pdfmake et ses fonts - on n'initialise pas au chargement du module
// car les imports ESM peuvent ne pas être prêts immédiatement
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfMake: any = null
let fontsInitialized = false

// Fonction d'initialisation asynchrone de pdfmake
async function initializePdfMake(): Promise<boolean> {
  // Si déjà initialisé, retourner true
  if (fontsInitialized && pdfMake) {
    return true
  }

  try {
    console.log('=== PDF Export: Initializing pdfmake ===')

    // APPROCHE: Charger pdfmake d'abord, puis exposer globalement, puis charger vfs_fonts
    // Cela permet à vfs_fonts de s'auto-enregistrer via le global

    // Étape 1: Importer pdfmake
    const pdfMakeModule = await import('pdfmake/build/pdfmake')
    console.log('Step 1: pdfmake module loaded')
    console.log('  - Module keys:', Object.keys(pdfMakeModule).slice(0, 10))

    // Extraire l'instance pdfMake
    pdfMake = pdfMakeModule.default || pdfMakeModule
    if (pdfMake.pdfMake) {
      pdfMake = pdfMake.pdfMake
    }

    // Étape 2: Exposer pdfMake globalement pour que vfs_fonts puisse s'auto-enregistrer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const globalObj = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {}) as any
    globalObj.pdfMake = pdfMake

    console.log('Step 2: pdfMake exposed globally')
    console.log('  - typeof pdfMake.createPdf:', typeof pdfMake?.createPdf)
    console.log('  - typeof pdfMake.addVirtualFileSystem:', typeof pdfMake?.addVirtualFileSystem)

    // Étape 3: Charger vfs_fonts - il va s'auto-enregistrer grâce au global
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts')
    console.log('Step 3: vfs_fonts loaded')

    // Vérifier si l'auto-enregistrement a fonctionné
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vfsFonts: any = pdfFontsModule.default || pdfFontsModule
    const fontKeys = Object.keys(vfsFonts || {})
    console.log('Step 4: VFS analysis')
    console.log('  - vfsFonts type:', typeof vfsFonts)
    console.log('  - vfsFonts keys count:', fontKeys.length)
    console.log('  - Sample keys:', fontKeys.slice(0, 4))

    // Si les fonts n'ont pas été auto-enregistrées, le faire manuellement
    if (fontKeys.length > 0 && fontKeys.includes('Roboto-Regular.ttf')) {
      console.log('Step 5: Manually registering fonts via addVirtualFileSystem')
      if (typeof pdfMake.addVirtualFileSystem === 'function') {
        pdfMake.addVirtualFileSystem(vfsFonts)
      } else {
        // Fallback: assigner directement
        pdfMake.vfs = vfsFonts
      }
    }

    // Étape 4: Configurer les fonts Roboto (de base)
    pdfMake.fonts = {
      Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
      }
    }

    console.log('Step 6: Roboto font configuration set')

    // Étape 5: Charger les fonts Garamond (police par défaut pour les documents juridiques)
    try {
      await loadGaramondFonts(pdfMake)
      console.log('Step 7: Garamond fonts loaded')
    } catch (garamondErr) {
      console.warn('Failed to load Garamond fonts, falling back to Roboto:', garamondErr)
    }

    // Vérification finale
    console.log('Step 8: Final verification')
    console.log('  - pdfMake.fonts:', JSON.stringify(pdfMake.fonts))
    console.log('  - pdfMake.virtualfs type:', typeof pdfMake.virtualfs)
    if (pdfMake.virtualfs && typeof pdfMake.virtualfs.readFileSync === 'function') {
      // Test Roboto
      try {
        const testRoboto = pdfMake.virtualfs.readFileSync('Roboto-Regular.ttf')
        console.log('  - Roboto-Regular.ttf:', testRoboto ? 'OK' : 'FAILED')
      } catch (e) {
        console.log('  - Roboto-Regular.ttf: FAILED')
      }
      // Test Garamond
      try {
        const testGaramond = pdfMake.virtualfs.readFileSync('EBGaramond-Regular.ttf')
        console.log('  - EBGaramond-Regular.ttf:', testGaramond ? 'OK' : 'FAILED')
      } catch (e) {
        console.log('  - EBGaramond-Regular.ttf: FAILED (Garamond not loaded)')
      }
    }

    fontsInitialized = true
    console.log('=== PDF Export: Initialization complete ===')
    return true

  } catch (error) {
    console.error('PDF Export: Initialization error:', error)
    return false
  }
}

// Types pdfmake
type PdfMakeContent = {
  text?: string | PdfMakeContent[]
  style?: string
  bold?: boolean
  italics?: boolean
  decoration?: string
  fontSize?: number
  color?: string
  alignment?: 'left' | 'center' | 'right' | 'justify'
  margin?: number[]
  marginTop?: number
  marginBottom?: number
  marginLeft?: number
  marginRight?: number
  leadingIndent?: number
  ul?: PdfMakeContent[]
  ol?: PdfMakeContent[]
  table?: {
    headerRows?: number
    widths?: (string | number)[]
    body: PdfMakeContent[][]
  }
  canvas?: {
    type: string
    x1: number
    y1: number
    x2: number
    y2: number
    lineWidth: number
    lineColor: string
  }[]
  image?: string
  width?: number | string
  pageBreak?: 'before' | 'after'
  columns?: PdfMakeContent[]
  stack?: PdfMakeContent[]
}

interface PdfMakeDocDefinition {
  pageSize: string
  pageOrientation: 'portrait' | 'landscape'
  pageMargins: number[]
  header?: (currentPage: number, pageCount: number) => PdfMakeContent
  footer?: (currentPage: number, pageCount: number) => PdfMakeContent
  content: PdfMakeContent[]
  defaultStyle: {
    font?: string
    fontSize: number
    lineHeight: number
    alignment?: 'left' | 'center' | 'right' | 'justify'
  }
  styles: Record<string, object>
}

// Couleurs professionnelles pour cabinet d'avocats
const LEGAL_COLORS = {
  darkBlue: '#1e3a5f',        // Bleu foncé pour titres
  mediumBlue: '#2c5282',      // Bleu moyen pour sous-titres
  darkGray: '#2d3748',        // Gris foncé pour texte
  mediumGray: '#4a5568',      // Gris moyen
  lightGray: '#718096',       // Gris clair pour métadonnées
  accent: '#c9a227',          // Or pour accents (optionnel)
  border: '#cbd5e0',          // Bordures légères
}

// Valeurs par défaut professionnelles
const LEGAL_DEFAULTS = {
  fontSize: 12,               // Taille standard juridique
  lineHeight: 1.2,            // Interligne compact mais lisible
  paragraphSpacing: 6,        // Espacement entre paragraphes (points)
  headingSpacing: {           // Espacement avant/après titres
    h1: { before: 24, after: 12 },
    h2: { before: 18, after: 10 },
    h3: { before: 14, after: 8 },
    h4: { before: 12, after: 6 },
  },
}

export function useExportPDFNative() {
  const toast = useToast()

  /**
   * Convertit un noeud TipTap en format pdfmake
   */
  const convertToPdfmake = (node: JSONContent): PdfMakeContent | PdfMakeContent[] | null => {
    if (!node) return null

    switch (node.type) {
      case 'doc':
        return (node.content || [])
          .map(convertToPdfmake)
          .filter((item): item is PdfMakeContent => item !== null)
          .flat()

      case 'paragraph': {
        const content = (node.content || [])
          .map(convertToPdfmake)
          .filter((item): item is PdfMakeContent => item !== null)

        // Récupérer les paramètres de typographie (avec fallback sur valeurs juridiques)
        const settings = useSettingsStore.getState()
        const indentPoints = (settings.paragraphIndent || 0) * 28.35 // cm vers points
        // Espacement entre paragraphes : 6 points par défaut (style juridique compact)
        const spacingPoints = LEGAL_DEFAULTS.paragraphSpacing

        // L'alignement par défaut : justifié (style juridique français)
        const alignment = (node.attrs?.textAlign as 'left' | 'center' | 'right' | 'justify') || 'justify'

        if (content.length === 0) {
          return { text: ' ', margin: [0, 0, 0, spacingPoints] }
        }

        // Style juridique : alinéa en retrait
        return {
          text: content,
          alignment,
          margin: [0, 0, 0, spacingPoints],
          leadingIndent: indentPoints > 0 ? indentPoints : undefined,
        }
      }

      case 'heading': {
        const level = node.attrs?.level || 1
        const content = (node.content || [])
          .map(convertToPdfmake)
          .filter((item): item is PdfMakeContent => item !== null)

        // Tailles proportionnelles à la taille de base (style juridique professionnel)
        const baseFontSize = LEGAL_DEFAULTS.fontSize
        const sizeMultipliers: Record<number, number> = {
          1: 1.75,     // h1 = 21pt (titre principal)
          2: 1.5,      // h2 = 18pt (sections)
          3: 1.25,     // h3 = 15pt (sous-sections)
          4: 1.08,     // h4 = 13pt (paragraphes titrés)
          5: 1.0,      // h5 = 12pt
          6: 0.92,     // h6 = 11pt
        }

        // Couleurs selon le niveau (bleu foncé pour titres principaux)
        const headingColors: Record<number, string> = {
          1: LEGAL_COLORS.darkBlue,
          2: LEGAL_COLORS.darkBlue,
          3: LEGAL_COLORS.mediumBlue,
          4: LEGAL_COLORS.darkGray,
          5: LEGAL_COLORS.darkGray,
          6: LEGAL_COLORS.mediumGray,
        }

        // Espacement professionnel
        const spacing = LEGAL_DEFAULTS.headingSpacing[`h${level}` as keyof typeof LEGAL_DEFAULTS.headingSpacing]
          || { before: 12, after: 6 }

        return {
          text: content,
          fontSize: Math.round(baseFontSize * (sizeMultipliers[level] || 1)),
          bold: true,
          color: headingColors[level] || LEGAL_COLORS.darkGray,
          alignment: (node.attrs?.textAlign as 'left' | 'center' | 'right') || 'left',
          margin: [0, spacing.before, 0, spacing.after],
        }
      }

      case 'text': {
        const styles: Partial<PdfMakeContent> = {}
        const decorations: string[] = []

        if (node.marks) {
          for (const mark of node.marks) {
            switch (mark.type) {
              case 'bold':
                styles.bold = true
                break
              case 'italic':
                styles.italics = true
                break
              case 'underline':
                decorations.push('underline')
                break
              case 'strike':
                decorations.push('lineThrough')
                break
              case 'code':
                styles.fontSize = 10
                styles.color = '#c7254e'
                break
              case 'highlight':
                if (mark.attrs?.color) {
                  const bgColor = mark.attrs.color as string
                  // Convertir rgba en couleur de texte approximative
                  if (bgColor.includes('255, 235')) styles.color = '#856404'
                  else if (bgColor.includes('212, 237')) styles.color = '#155724'
                  else if (bgColor.includes('204, 229')) styles.color = '#004085'
                  else if (bgColor.includes('248, 215')) styles.color = '#721c24'
                  else if (bgColor.includes('232, 218')) styles.color = '#6c757d'
                  else if (bgColor.includes('255, 224')) styles.color = '#856404'
                }
                break
              case 'link':
                styles.color = '#0066cc'
                decorations.push('underline')
                break
              case 'subscript':
                styles.fontSize = 8
                break
              case 'superscript':
                styles.fontSize = 8
                break
              // Support pour les styles de texte personnalisés (couleur, taille)
              case 'textStyle':
                if (mark.attrs?.color) {
                  styles.color = mark.attrs.color as string
                }
                if (mark.attrs?.fontSize) {
                  // Convertir "14px" en nombre
                  const sizeStr = mark.attrs.fontSize as string
                  const size = parseInt(sizeStr.replace(/[^0-9]/g, ''), 10)
                  if (size > 0) {
                    styles.fontSize = size
                  }
                }
                if (mark.attrs?.fontFamily) {
                  // Note: pdfmake ne supporte que les fonts enregistrées
                  // On ignore fontFamily ici car Roboto est la seule disponible
                }
                break
            }
          }
        }

        // Combiner les décorations
        if (decorations.length > 0) {
          styles.decoration = decorations.join(' ') as string
        }

        return {
          text: node.text || '',
          ...styles,
        }
      }

      case 'bulletList': {
        const items = (node.content || []).map((item) => {
          const listItemContent = item.content || []
          return listItemContent
            .map(convertToPdfmake)
            .filter((c): c is PdfMakeContent => c !== null)
        })

        return {
          ul: items.flat(),
          margin: [0, 0, 0, 8],
        }
      }

      case 'orderedList': {
        const items = (node.content || []).map((item) => {
          const listItemContent = item.content || []
          return listItemContent
            .map(convertToPdfmake)
            .filter((c): c is PdfMakeContent => c !== null)
        })

        return {
          ol: items.flat(),
          margin: [0, 0, 0, 8],
        }
      }

      case 'listItem': {
        const content = (node.content || [])
          .map(convertToPdfmake)
          .filter((item): item is PdfMakeContent => item !== null)
        return content.length > 0 ? content[0] : { text: '' }
      }

      case 'blockquote': {
        const content = (node.content || [])
          .map(convertToPdfmake)
          .filter((item): item is PdfMakeContent => item !== null)

        // Style citation juridique élégant
        return {
          stack: [
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0,
                  y1: 0,
                  x2: 0,
                  y2: 60,
                  lineWidth: 3,
                  lineColor: LEGAL_COLORS.mediumBlue,
                },
              ],
            },
            {
              text: content,
              italics: true,
              color: LEGAL_COLORS.mediumGray,
              fontSize: LEGAL_DEFAULTS.fontSize - 1,
              margin: [20, -60, 20, 0],
            },
          ],
          margin: [20, 12, 20, 12],
        }
      }

      case 'codeBlock': {
        const code = node.content?.map((c) => c.text).join('\n') || ''
        return {
          text: code,
          fontSize: 10,
          margin: [20, 10, 20, 10],
        }
      }

      case 'horizontalRule': {
        // Ligne de séparation élégante
        return {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 0.5,
              lineColor: LEGAL_COLORS.border,
            },
          ],
          margin: [0, 16, 0, 16],
        }
      }

      case 'pageBreak': {
        return {
          text: '',
          pageBreak: 'after',
        }
      }

      case 'table': {
        const rows = node.content || []
        const body: PdfMakeContent[][] = []

        for (const row of rows) {
          const cells: PdfMakeContent[] = []
          for (const cell of row.content || []) {
            const cellContent = (cell.content || [])
              .map(convertToPdfmake)
              .filter((c): c is PdfMakeContent => c !== null)

            cells.push(cellContent.length > 0 ? cellContent[0] : { text: '' })
          }
          body.push(cells)
        }

        if (body.length === 0) return null

        const colCount = body[0]?.length || 1
        const widths = Array(colCount).fill('*')

        return {
          table: {
            headerRows: 1,
            widths,
            body,
          },
          margin: [0, 10, 0, 10],
        }
      }

      case 'image': {
        if (node.attrs?.src) {
          return {
            image: node.attrs.src,
            width: Math.min(node.attrs.width || 400, 500),
            margin: [0, 10, 0, 10],
          }
        }
        return null
      }

      case 'taskList':
      case 'taskItem': {
        const items = (node.content || []).map((item) => {
          const checked = item.attrs?.checked ? '[x] ' : '[ ] '
          const content = (item.content || [])
            .map(convertToPdfmake)
            .filter((c): c is PdfMakeContent => c !== null)

          return {
            text: [{ text: checked }, ...content],
          }
        })

        return {
          ul: items,
          margin: [0, 0, 0, 8],
        }
      }

      default:
        if (node.content) {
          return (node.content || [])
            .map(convertToPdfmake)
            .filter((item): item is PdfMakeContent => item !== null)
            .flat()
        }
        return null
    }
  }

  /**
   * Génère le header pour chaque page avec support première page différente
   */
  const createHeader = (
    headerContent: { left: string; center: string; right: string },
    documentTitle: string,
    documentNumber: string,
    firstPageConfig?: {
      differentFirstPage: boolean
      headerEnabled: boolean
      headerContent: { left: string; center: string; right: string }
    }
  ) => {
    return (currentPage: number, pageCount: number): PdfMakeContent => {
      if (currentPage === 1 && firstPageConfig?.differentFirstPage) {
        if (!firstPageConfig.headerEnabled) {
          return { text: '' }
        }
        const left = replacePageVariables(firstPageConfig.headerContent.left, currentPage, pageCount, documentTitle, documentNumber)
        const center = replacePageVariables(firstPageConfig.headerContent.center, currentPage, pageCount, documentTitle, documentNumber)
        const right = replacePageVariables(firstPageConfig.headerContent.right, currentPage, pageCount, documentTitle, documentNumber)

        return {
          margin: [40, 20, 40, 0],
          text: [
            { text: left, alignment: 'left' as const },
            { text: '   ' },
            { text: center, alignment: 'center' as const },
            { text: '   ' },
            { text: right, alignment: 'right' as const },
          ],
          fontSize: 9,
        }
      }

      const left = replacePageVariables(headerContent.left, currentPage, pageCount, documentTitle, documentNumber)
      const center = replacePageVariables(headerContent.center, currentPage, pageCount, documentTitle, documentNumber)
      const right = replacePageVariables(headerContent.right, currentPage, pageCount, documentTitle, documentNumber)

      return {
        margin: [40, 20, 40, 0],
        columns: [
          { text: left, width: '*', alignment: 'left' as const, fontSize: 9, color: LEGAL_COLORS.lightGray },
          { text: center, width: 'auto', alignment: 'center' as const, fontSize: 9, color: LEGAL_COLORS.mediumGray },
          { text: right, width: '*', alignment: 'right' as const, fontSize: 9, color: LEGAL_COLORS.lightGray },
        ],
      }
    }
  }

  /**
   * Génère le footer pour chaque page avec support première page différente
   */
  const createFooter = (
    footerContent: { left: string; center: string; right: string },
    documentTitle: string,
    documentNumber: string,
    firstPageConfig?: {
      differentFirstPage: boolean
      footerEnabled: boolean
      footerContent: { left: string; center: string; right: string }
    }
  ) => {
    return (currentPage: number, pageCount: number): PdfMakeContent => {
      if (currentPage === 1 && firstPageConfig?.differentFirstPage) {
        if (!firstPageConfig.footerEnabled) {
          return { text: '' }
        }
        const left = replacePageVariables(firstPageConfig.footerContent.left, currentPage, pageCount, documentTitle, documentNumber)
        const center = replacePageVariables(firstPageConfig.footerContent.center, currentPage, pageCount, documentTitle, documentNumber)
        const right = replacePageVariables(firstPageConfig.footerContent.right, currentPage, pageCount, documentTitle, documentNumber)

        return {
          margin: [40, 0, 40, 20],
          text: [
            { text: left },
            { text: center },
            { text: right },
          ],
          fontSize: 9,
          alignment: 'center',
        }
      }

      const left = replacePageVariables(footerContent.left, currentPage, pageCount, documentTitle, documentNumber)
      const center = replacePageVariables(footerContent.center, currentPage, pageCount, documentTitle, documentNumber)
      const right = replacePageVariables(footerContent.right, currentPage, pageCount, documentTitle, documentNumber)

      return {
        margin: [40, 0, 40, 20],
        columns: [
          { text: left, width: '*', alignment: 'left' as const, fontSize: 9, color: LEGAL_COLORS.lightGray },
          { text: center, width: 'auto', alignment: 'center' as const, fontSize: 9, color: LEGAL_COLORS.lightGray },
          { text: right, width: '*', alignment: 'right' as const, fontSize: 9, color: LEGAL_COLORS.lightGray },
        ],
      }
    }
  }

  /**
   * Exporte le document en PDF
   */
  const exportToPDF = async (documentId: string) => {
    try {
      // Initialiser pdfmake de manière asynchrone
      const initialized = await initializePdfMake()
      if (!initialized) {
        toast.error('Erreur d\'initialisation des polices PDF')
        return
      }

      const doc = useDocumentStore.getState().getDocument(documentId)
      if (!doc) {
        toast.error('Aucun document sélectionné')
        return
      }

      const pageState = usePageStore.getState()

      // Demander l'emplacement de sauvegarde
      const outputPath = await save({
        defaultPath: doc.title.replace(/\.(md|txt)$/, '.pdf'),
        filters: [{ name: 'PDF', extensions: ['pdf'] }],
      })

      if (!outputPath) return

      // Générer le numéro de document (incrémente le compteur)
      const documentNumber = useDocumentCounterStore.getState().getNextNumber()

      console.log('PDF Export: Starting conversion...')

      // Convertir le contenu en format pdfmake
      const content = convertToPdfmake(doc.content)
      console.log('PDF Export: Content converted', content ? 'OK' : 'FAILED')

      if (!content) {
        toast.error('Impossible de convertir le document')
        return
      }

      console.log('PDF Export: Creating document definition...')

      // Utiliser les paramètres juridiques professionnels par défaut
      // Garamond 12pt, interligne 1.2, justifié
      const baseFontSize = LEGAL_DEFAULTS.fontSize
      const lineHeight = LEGAL_DEFAULTS.lineHeight

      // Déterminer la police disponible (Garamond si chargé, sinon Roboto)
      const availableFont = getAvailableFont(pdfMake)
      console.log('PDF Export: Using font:', availableFont)

      // Créer la définition du document avec style juridique professionnel
      const docDefinition: PdfMakeDocDefinition = {
        pageSize: pageState.pageFormat === 'custom' ? 'A4' : pageState.pageFormat,
        pageOrientation: pageState.orientation,
        pageMargins: [
          pageState.margins.left,
          pageState.margins.top + (pageState.headerEnabled ? pageState.headerHeight : 0),
          pageState.margins.right,
          pageState.margins.bottom + (pageState.footerEnabled ? pageState.footerHeight : 0),
        ],
        content: Array.isArray(content) ? content : [content],
        defaultStyle: {
          font: availableFont, // Garamond si disponible, sinon Roboto
          fontSize: baseFontSize, // 12pt - taille standard
          lineHeight: lineHeight, // 1.2 - interligne compact professionnel
          alignment: 'justify' as const, // Justifié - style français
        },
        styles: {
          // Styles de titres professionnels avec bleu foncé
          h1: {
            fontSize: Math.round(baseFontSize * 1.75),
            bold: true,
            color: LEGAL_COLORS.darkBlue,
            margin: [0, LEGAL_DEFAULTS.headingSpacing.h1.before, 0, LEGAL_DEFAULTS.headingSpacing.h1.after],
            alignment: 'left' as const,
          },
          h2: {
            fontSize: Math.round(baseFontSize * 1.5),
            bold: true,
            color: LEGAL_COLORS.darkBlue,
            margin: [0, LEGAL_DEFAULTS.headingSpacing.h2.before, 0, LEGAL_DEFAULTS.headingSpacing.h2.after],
            alignment: 'left' as const,
          },
          h3: {
            fontSize: Math.round(baseFontSize * 1.25),
            bold: true,
            color: LEGAL_COLORS.mediumBlue,
            margin: [0, LEGAL_DEFAULTS.headingSpacing.h3.before, 0, LEGAL_DEFAULTS.headingSpacing.h3.after],
            alignment: 'left' as const,
          },
          h4: {
            fontSize: Math.round(baseFontSize * 1.08),
            bold: true,
            color: LEGAL_COLORS.darkGray,
            margin: [0, LEGAL_DEFAULTS.headingSpacing.h4.before, 0, LEGAL_DEFAULTS.headingSpacing.h4.after],
            alignment: 'left' as const,
          },
          // Style pour les métadonnées (date, référence, etc.)
          metadata: {
            fontSize: 10,
            color: LEGAL_COLORS.lightGray,
            italics: true,
          },
          // Style pour les références légales
          legalRef: {
            fontSize: 11,
            color: LEGAL_COLORS.mediumBlue,
            italics: true,
          },
        },
      }

      // Ajouter header si activé
      if (pageState.headerEnabled || (pageState.firstPage.differentFirstPage && pageState.firstPage.headerEnabled)) {
        docDefinition.header = createHeader(
          pageState.headerContent,
          doc.title,
          documentNumber,
          {
            differentFirstPage: pageState.firstPage.differentFirstPage,
            headerEnabled: pageState.firstPage.headerEnabled,
            headerContent: pageState.firstPage.headerContent,
          }
        )
      }

      // Ajouter footer si activé
      if (pageState.footerEnabled || (pageState.firstPage.differentFirstPage && pageState.firstPage.footerEnabled)) {
        docDefinition.footer = createFooter(
          pageState.footerContent,
          doc.title,
          documentNumber,
          {
            differentFirstPage: pageState.firstPage.differentFirstPage,
            footerEnabled: pageState.firstPage.footerEnabled,
            footerContent: pageState.firstPage.footerContent,
          }
        )
      }

      // Nettoyer le contenu pour éviter les problèmes
      const cleanContent = (items: PdfMakeContent[]): PdfMakeContent[] => {
        return items.map(item => {
          // Supprimer les images problématiques (data URLs très longues ou URLs externes)
          if (item.image) {
            if (item.image.startsWith('http') || (item.image.length > 100000)) {
              console.log('PDF Export: Skipping problematic image')
              return { text: '[Image non exportée]', italics: true, color: '#999999' }
            }
          }
          // Nettoyer récursivement
          if (item.stack && Array.isArray(item.stack)) {
            item.stack = cleanContent(item.stack)
          }
          if (item.columns && Array.isArray(item.columns)) {
            item.columns = cleanContent(item.columns)
          }
          if (Array.isArray(item.text)) {
            // Garder tel quel, c'est un tableau de spans
          }
          return item
        }).filter(Boolean)
      }

      const cleanedContent = Array.isArray(docDefinition.content)
        ? cleanContent(docDefinition.content)
        : docDefinition.content

      // Créer le document PDF
      console.log('PDF Export: Creating PDF document...')
      console.log('  - docDefinition.defaultStyle:', JSON.stringify(docDefinition.defaultStyle))
      console.log('  - docDefinition.pageSize:', docDefinition.pageSize)
      console.log('  - Content items count:', Array.isArray(cleanedContent) ? cleanedContent.length : 1)

      const finalDocDefinition = {
        ...docDefinition,
        content: cleanedContent,
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let pdfDoc: any
      try {
        pdfDoc = (pdfMake as any).createPdf(finalDocDefinition)
        console.log('PDF Export: pdfDoc created successfully')
      } catch (createErr) {
        console.error('PDF Export: Error in createPdf:', createErr)
        throw createErr
      }

      // Générer le buffer PDF et sauvegarder
      // pdfmake moderne (0.3.x) utilise des Promises, pas des callbacks
      console.log('PDF Export: Getting buffer (this may take a moment)...')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let buffer: any
      try {
        // getBuffer() retourne une Promise dans pdfmake 0.3.x
        buffer = await pdfDoc.getBuffer()
        console.log('PDF Export: Buffer received via Promise, size:', buffer?.byteLength || buffer?.length)
      } catch (bufferErr) {
        console.error('PDF Export: getBuffer() Promise rejected:', bufferErr)
        throw bufferErr
      }

      // Convertir en Uint8Array si nécessaire
      let pdfBuffer: Uint8Array
      if (buffer instanceof Uint8Array) {
        pdfBuffer = buffer
      } else if (buffer instanceof ArrayBuffer) {
        pdfBuffer = new Uint8Array(buffer)
      } else if (Buffer.isBuffer(buffer)) {
        pdfBuffer = new Uint8Array(buffer)
      } else {
        // Fallback
        pdfBuffer = new Uint8Array(buffer)
      }

      console.log('PDF Export: Writing file...')
      await writeBinaryFile(outputPath, pdfBuffer)
      toast.success('PDF exporté avec succès')
      console.log('PDF Export: Success!')

    } catch (error) {
      console.error('Error exporting to PDF:', error)
      toast.error(`Erreur lors de l'export PDF: ${error}`)
    }
  }

  /**
   * Crée un header depuis un template d'export
   */
  const createTemplateHeader = (
    headerConfig: HeaderFooter,
    documentTitle: string,
    documentNumber: string,
    marginLeft: number,
    marginRight: number
  ) => {
    return (currentPage: number, pageCount: number): PdfMakeContent => {
      let left = replaceStaticVariables(headerConfig.content.left, documentTitle, documentNumber)
      let center = replaceStaticVariables(headerConfig.content.center, documentTitle, documentNumber)
      let right = replaceStaticVariables(headerConfig.content.right, documentTitle, documentNumber)

      left = left.replace(/\{\{page\.current\}\}/g, String(currentPage))
      left = left.replace(/\{\{page\.total\}\}/g, String(pageCount))
      center = center.replace(/\{\{page\.current\}\}/g, String(currentPage))
      center = center.replace(/\{\{page\.total\}\}/g, String(pageCount))
      right = right.replace(/\{\{page\.current\}\}/g, String(currentPage))
      right = right.replace(/\{\{page\.total\}\}/g, String(pageCount))

      const fontSize = headerConfig.style.fontSize
        ? ptToNumber(headerConfig.style.fontSize)
        : 9

      return {
        margin: [marginLeft, 20, marginRight, 0],
        columns: [
          { text: left, width: '*', alignment: 'left' as const },
          { text: center, width: 'auto', alignment: 'center' as const },
          { text: right, width: '*', alignment: 'right' as const },
        ],
        fontSize,
        color: headerConfig.style.color || '#666666',
      }
    }
  }

  /**
   * Crée un footer depuis un template d'export
   */
  const createTemplateFooter = (
    footerConfig: HeaderFooter,
    documentTitle: string,
    documentNumber: string,
    marginLeft: number,
    marginRight: number
  ) => {
    return (currentPage: number, pageCount: number): PdfMakeContent => {
      let left = replaceStaticVariables(footerConfig.content.left, documentTitle, documentNumber)
      let center = replaceStaticVariables(footerConfig.content.center, documentTitle, documentNumber)
      let right = replaceStaticVariables(footerConfig.content.right, documentTitle, documentNumber)

      left = left.replace(/\{\{page\.current\}\}/g, String(currentPage))
      left = left.replace(/\{\{page\.total\}\}/g, String(pageCount))
      center = center.replace(/\{\{page\.current\}\}/g, String(currentPage))
      center = center.replace(/\{\{page\.total\}\}/g, String(pageCount))
      right = right.replace(/\{\{page\.current\}\}/g, String(currentPage))
      right = right.replace(/\{\{page\.total\}\}/g, String(pageCount))

      const fontSize = footerConfig.style.fontSize
        ? ptToNumber(footerConfig.style.fontSize)
        : 9

      return {
        margin: [marginLeft, 0, marginRight, 20],
        columns: [
          { text: left, width: '*', alignment: 'left' as const },
          { text: center, width: 'auto', alignment: 'center' as const },
          { text: right, width: '*', alignment: 'right' as const },
        ],
        fontSize,
        color: footerConfig.style.color || '#999999',
      }
    }
  }

  /**
   * Crée un header avec l'en-tête du profil avocat
   */
  const createLawyerProfileHeader = (marginLeft: number, marginRight: number) => {
    const profile = useLawyerProfileStore.getState()

    const fullName = [profile.civilite, profile.prenom, profile.nom].filter(Boolean).join(' ')
    const fullAddress = [
      profile.adresse,
      [profile.codePostal, profile.ville].filter(Boolean).join(' ')
    ].filter(Boolean).join(', ')

    const contactLines: string[] = []
    if (profile.telephone) contactLines.push(`Tél. ${profile.telephone}`)
    if (profile.email) contactLines.push(profile.email)

    const headerLines: PdfMakeContent[] = []

    if (profile.cabinet) {
      headerLines.push({ text: profile.cabinet, bold: true, fontSize: 12 })
    }
    if (fullName) {
      headerLines.push({ text: fullName, fontSize: 10 })
    }
    if (fullAddress) {
      headerLines.push({ text: fullAddress, fontSize: 9, color: '#666666' })
    }
    if (contactLines.length > 0) {
      headerLines.push({ text: contactLines.join(' – '), fontSize: 8, color: '#888888' })
    }
    if (profile.barreau) {
      const barreauLine = [
        `Barreau de ${profile.barreau}`,
        profile.numeroToque ? `Toque ${profile.numeroToque}` : ''
      ].filter(Boolean).join(' – ')
      headerLines.push({ text: barreauLine, fontSize: 8, italics: true, color: '#888888' })
    }

    return (): PdfMakeContent => ({
      margin: [marginLeft, 15, marginRight, 10],
      stack: headerLines,
      alignment: 'right' as const,
    })
  }

  /**
   * Convertit les styles du template en styles pdfmake
   */
  const mapTemplateStylesToPdfmake = (
    templateStyles: Record<string, Record<string, string>>,
    baseFontSize: number
  ): Record<string, object> => {
    const pdfStyles: Record<string, object> = {}

    for (const [styleName, styleProps] of Object.entries(templateStyles)) {
      const style: Record<string, unknown> = {}

      if (styleProps.fontSize) {
        style.fontSize = ptToNumber(styleProps.fontSize)
      }
      if (styleProps.fontWeight === '700' || styleProps.fontWeight === 'bold') {
        style.bold = true
      }
      if (styleProps.fontStyle === 'italic') {
        style.italics = true
      }
      if (styleProps.color) {
        style.color = styleProps.color
      }
      if (styleProps.textAlign) {
        style.alignment = styleProps.textAlign
      }
      if (styleProps.marginTop || styleProps.marginBottom) {
        const marginTop = styleProps.marginTop
          ? parseFloat(styleProps.marginTop) * baseFontSize
          : 0
        const marginBottom = styleProps.marginBottom
          ? parseFloat(styleProps.marginBottom) * baseFontSize
          : 0
        style.margin = [0, marginTop, 0, marginBottom]
      }

      pdfStyles[styleName] = style
    }

    return pdfStyles
  }

  /**
   * Construit la définition du document depuis un template
   */
  const buildDocDefinitionFromTemplate = (
    doc: { title: string; content: JSONContent },
    template: ExportTemplate,
    documentNumber: string,
    options?: { includeLetterhead?: boolean; includeSignature?: boolean }
  ): PdfMakeDocDefinition => {
    const { pageLayout, header, footer, typography, styles } = template

    const margins = {
      left: cmToPoints(pageLayout.margins.left),
      top: cmToPoints(pageLayout.margins.top),
      right: cmToPoints(pageLayout.margins.right),
      bottom: cmToPoints(pageLayout.margins.bottom),
    }

    const headerHeight = header.enabled ? cmToPoints(header.height) : 0
    const footerHeight = footer.enabled ? cmToPoints(footer.height) : 0

    const content = convertToPdfmake(doc.content)
    const baseFontSize = ptToNumber(typography.baseFontSize)

    const pdfStyles = mapTemplateStylesToPdfmake(styles, baseFontSize)

    // Déterminer la police disponible (Garamond si chargé, sinon Roboto)
    const availableFont = getAvailableFont(pdfMake)

    const docDefinition: PdfMakeDocDefinition = {
      pageSize: getPageSizeForPdfmake(pageLayout.size),
      pageOrientation: pageLayout.orientation,
      pageMargins: [
        margins.left,
        margins.top + headerHeight + (options?.includeLetterhead ? 60 : 0),
        margins.right,
        margins.bottom + footerHeight,
      ],
      content: Array.isArray(content) ? content : content ? [content] : [],
      defaultStyle: {
        font: availableFont, // Garamond si disponible, sinon Roboto
        fontSize: baseFontSize || LEGAL_DEFAULTS.fontSize, // 12pt par défaut
        lineHeight: typography.lineHeight || LEGAL_DEFAULTS.lineHeight, // 1.2 par défaut
        alignment: 'justify' as const,
      },
      styles: {
        // Styles professionnels avec titres en bleu foncé
        h1: {
          fontSize: Math.round((baseFontSize || 12) * 1.75),
          bold: true,
          color: LEGAL_COLORS.darkBlue,
          margin: [0, LEGAL_DEFAULTS.headingSpacing.h1.before, 0, LEGAL_DEFAULTS.headingSpacing.h1.after],
          ...pdfStyles.h1,
        },
        h2: {
          fontSize: Math.round((baseFontSize || 12) * 1.5),
          bold: true,
          color: LEGAL_COLORS.darkBlue,
          margin: [0, LEGAL_DEFAULTS.headingSpacing.h2.before, 0, LEGAL_DEFAULTS.headingSpacing.h2.after],
          ...pdfStyles.h2,
        },
        h3: {
          fontSize: Math.round((baseFontSize || 12) * 1.25),
          bold: true,
          color: LEGAL_COLORS.mediumBlue,
          margin: [0, LEGAL_DEFAULTS.headingSpacing.h3.before, 0, LEGAL_DEFAULTS.headingSpacing.h3.after],
          ...pdfStyles.h3,
        },
        h4: {
          fontSize: Math.round((baseFontSize || 12) * 1.08),
          bold: true,
          color: LEGAL_COLORS.darkGray,
          margin: [0, LEGAL_DEFAULTS.headingSpacing.h4.before, 0, LEGAL_DEFAULTS.headingSpacing.h4.after],
        },
        metadata: {
          fontSize: 10,
          color: LEGAL_COLORS.lightGray,
          italics: true,
        },
        legalRef: {
          fontSize: 11,
          color: LEGAL_COLORS.mediumBlue,
          italics: true,
        },
        ...pdfStyles,
      },
    }

    if (options?.includeLetterhead) {
      const profile = useLawyerProfileStore.getState()
      if (profile.cabinet || profile.nom) {
        docDefinition.header = createLawyerProfileHeader(margins.left, margins.right)
      }
    } else if (header.enabled) {
      docDefinition.header = createTemplateHeader(header, doc.title, documentNumber, margins.left, margins.right)
    }

    if (footer.enabled) {
      docDefinition.footer = createTemplateFooter(footer, doc.title, documentNumber, margins.left, margins.right)
    } else if (options?.includeSignature) {
      docDefinition.footer = (currentPage: number, pageCount: number): PdfMakeContent => ({
        margin: [margins.left, 0, margins.right, 20],
        text: `Page ${currentPage} / ${pageCount}`,
        fontSize: 9,
        alignment: 'center',
        color: '#999999',
      })
    }

    return docDefinition
  }

  /**
   * Exporte vers PDF avec un template d'export
   */
  const exportWithTemplate = async (
    documentId: string,
    templateId: string | null,
    options?: { includeLetterhead?: boolean; includeSignature?: boolean }
  ) => {
    try {
      // Initialiser pdfmake de manière asynchrone
      const initialized = await initializePdfMake()
      if (!initialized) {
        toast.error('Erreur d\'initialisation des polices PDF')
        return
      }

      const doc = useDocumentStore.getState().getDocument(documentId)
      if (!doc) {
        toast.error('Aucun document sélectionné')
        return
      }

      if (!templateId) {
        return exportToPDF(documentId)
      }

      const template = useExportTemplateStore.getState().getTemplate(templateId)
      if (!template) {
        toast.error('Template introuvable')
        return
      }

      const outputPath = await save({
        defaultPath: doc.title.replace(/\.(md|txt)$/, '.pdf'),
        filters: [{ name: 'PDF', extensions: ['pdf'] }],
      })

      if (!outputPath) return

      // Générer le numéro de document (incrémente le compteur)
      const documentNumber = useDocumentCounterStore.getState().getNextNumber()

      const docDefinition = buildDocDefinitionFromTemplate(doc, template, documentNumber, options)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let pdfDoc: any
      try {
        pdfDoc = (pdfMake as any).createPdf(docDefinition)
      } catch (createErr) {
        console.error('PDF Export (template): Error in createPdf:', createErr)
        throw createErr
      }

      // pdfmake 0.3.x utilise des Promises
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let buffer: any
      try {
        buffer = await pdfDoc.getBuffer()
      } catch (bufferErr) {
        console.error('PDF Export (template): getBuffer error:', bufferErr)
        throw bufferErr
      }

      // Convertir en Uint8Array
      let pdfBuffer: Uint8Array
      if (buffer instanceof Uint8Array) {
        pdfBuffer = buffer
      } else if (buffer instanceof ArrayBuffer) {
        pdfBuffer = new Uint8Array(buffer)
      } else if (Buffer.isBuffer(buffer)) {
        pdfBuffer = new Uint8Array(buffer)
      } else {
        pdfBuffer = new Uint8Array(buffer)
      }

      await writeBinaryFile(outputPath, pdfBuffer)
      toast.success('PDF exporté avec succès')

    } catch (error) {
      console.error('Error exporting to PDF with template:', error)
      toast.error(`Erreur lors de l'export PDF: ${error}`)
    }
  }

  return {
    exportToPDF,
    exportWithTemplate,
    convertToPdfmake,
  }
}

export default useExportPDFNative
