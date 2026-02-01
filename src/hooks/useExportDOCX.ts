// Hook pour l'export DOCX (Word)
// Utilise la bibliothèque docx pour générer des fichiers Word

import { useCallback } from 'react'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  TabStopPosition,
  TabStopType,
} from 'docx'
import { save } from '@tauri-apps/api/dialog'
import { writeBinaryFile } from '@tauri-apps/api/fs'
import { useToast } from './useToast'
import { useLawyerProfileStore, type LawyerProfile } from '../store/useLawyerProfileStore'
import { useDocumentCounterStore } from '../store/useDocumentCounterStore'
import { useSettingsStore } from '../store/useSettingsStore'
import type { JSONContent } from '@tiptap/react'
import type { ExportTemplate, HeaderFooter } from '../types/templates'
import {
  cmToTwips,
  ptToHalfPoints,
  getPageSizeForDocx,
  replaceStaticVariables,
} from '../lib/exportUtils'

interface ExportDOCXOptions {
  title?: string
  author?: string
  template?: ExportTemplate
  includeLetterhead?: boolean
  includeSignature?: boolean
  // Deprecated, kept for backward compatibility
  includeHeader?: boolean
  includeFooter?: boolean
  includePageNumbers?: boolean
}

// Mapper les niveaux de heading TipTap vers docx
function mapHeadingLevel(level: number): typeof HeadingLevel[keyof typeof HeadingLevel] {
  switch (level) {
    case 1: return HeadingLevel.HEADING_1
    case 2: return HeadingLevel.HEADING_2
    case 3: return HeadingLevel.HEADING_3
    case 4: return HeadingLevel.HEADING_4
    case 5: return HeadingLevel.HEADING_5
    case 6: return HeadingLevel.HEADING_6
    default: return HeadingLevel.HEADING_1
  }
}

// Convertir le contenu TipTap en éléments docx
function convertContentToDocx(content: JSONContent, settings?: { paragraphIndent: number; paragraphSpacing: number }): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = []

  if (!content.content) return elements

  // Récupérer les paramètres de typographie
  const paragraphIndentTwips = settings?.paragraphIndent
    ? Math.round(settings.paragraphIndent * 567) // cm vers twips
    : 0
  const paragraphSpacingTwips = settings?.paragraphSpacing
    ? Math.round(settings.paragraphSpacing * 200) // em vers twips (approximatif)
    : 200

  for (const node of content.content) {
    switch (node.type) {
      case 'paragraph': {
        const textRuns = convertInlineContent(node.content || [])
        // Récupérer l'alignement du paragraphe
        const textAlign = node.attrs?.textAlign as string | undefined
        let alignment: typeof AlignmentType[keyof typeof AlignmentType] | undefined
        switch (textAlign) {
          case 'center':
            alignment = AlignmentType.CENTER
            break
          case 'right':
            alignment = AlignmentType.RIGHT
            break
          case 'justify':
            alignment = AlignmentType.JUSTIFIED
            break
          default:
            alignment = AlignmentType.LEFT
        }
        elements.push(new Paragraph({
          children: textRuns,
          alignment,
          spacing: { after: paragraphSpacingTwips },
          indent: paragraphIndentTwips > 0 ? { firstLine: paragraphIndentTwips } : undefined,
        }))
        break
      }

      case 'heading': {
        const level = node.attrs?.level || 1
        const textRuns = convertInlineContent(node.content || [])
        // Récupérer l'alignement du titre
        const textAlign = node.attrs?.textAlign as string | undefined
        let alignment: typeof AlignmentType[keyof typeof AlignmentType] | undefined
        switch (textAlign) {
          case 'center':
            alignment = AlignmentType.CENTER
            break
          case 'right':
            alignment = AlignmentType.RIGHT
            break
          case 'justify':
            alignment = AlignmentType.JUSTIFIED
            break
          default:
            alignment = AlignmentType.LEFT
        }
        elements.push(new Paragraph({
          children: textRuns,
          heading: mapHeadingLevel(level),
          alignment,
          spacing: { before: 400, after: 200 },
        }))
        break
      }

      case 'bulletList': {
        const items = node.content || []
        for (const item of items) {
          if (item.type === 'listItem') {
            const textRuns = convertInlineContent(item.content?.[0]?.content || [])
            elements.push(new Paragraph({
              children: textRuns,
              bullet: { level: 0 },
              spacing: { after: 100 },
            }))
          }
        }
        break
      }

      case 'orderedList': {
        const items = node.content || []
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          if (item.type === 'listItem') {
            const textRuns = convertInlineContent(item.content?.[0]?.content || [])
            elements.push(new Paragraph({
              children: [
                new TextRun({ text: `${i + 1}. ` }),
                ...textRuns,
              ],
              spacing: { after: 100 },
            }))
          }
        }
        break
      }

      case 'blockquote': {
        const paragraphs = node.content || []
        for (const p of paragraphs) {
          const textRuns = convertInlineContent(p.content || [])
          elements.push(new Paragraph({
            children: textRuns,
            indent: { left: 720 }, // 0.5 inch
            spacing: { after: 200 },
            border: {
              left: { style: BorderStyle.SINGLE, size: 12, color: '999999' },
            },
          }))
        }
        break
      }

      case 'table': {
        const rows = node.content || []
        const tableRows: TableRow[] = []

        for (const row of rows) {
          if (row.type === 'tableRow') {
            const cells: TableCell[] = []
            for (const cell of row.content || []) {
              const textRuns = convertInlineContent(cell.content?.[0]?.content || [])
              cells.push(new TableCell({
                children: [new Paragraph({ children: textRuns })],
                width: { size: 100 / (row.content?.length || 1), type: WidthType.PERCENTAGE },
              }))
            }
            tableRows.push(new TableRow({ children: cells }))
          }
        }

        if (tableRows.length > 0) {
          elements.push(new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }))
          elements.push(new Paragraph({ children: [] })) // Espace après le tableau
        }
        break
      }

      case 'horizontalRule': {
        elements.push(new Paragraph({
          children: [],
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '999999' } },
          spacing: { before: 200, after: 200 },
        }))
        break
      }

      case 'codeBlock': {
        const text = node.content?.[0]?.text || ''
        elements.push(new Paragraph({
          children: [
            new TextRun({
              text,
              font: 'Courier New',
              size: 20,
            }),
          ],
          shading: { fill: 'F5F5F5' },
          spacing: { after: 200 },
        }))
        break
      }

      case 'taskList': {
        const items = node.content || []
        for (const item of items) {
          if (item.type === 'taskItem') {
            const checked = item.attrs?.checked ? '☑ ' : '☐ '
            const textRuns = convertInlineContent(item.content?.[0]?.content || [])
            elements.push(new Paragraph({
              children: [
                new TextRun({ text: checked }),
                ...textRuns,
              ],
              spacing: { after: 100 },
            }))
          }
        }
        break
      }

      case 'image': {
        // Les images ne sont pas facilement supportées dans docx sans base64
        // On ajoute un placeholder avec le texte alternatif
        const alt = node.attrs?.alt || 'Image'
        elements.push(new Paragraph({
          children: [
            new TextRun({
              text: `[Image: ${alt}]`,
              italics: true,
              color: '666666',
            }),
          ],
          spacing: { after: 200 },
        }))
        break
      }
    }
  }

  return elements
}

// Types de surlignage supportés par docx
type HighlightColor = 'yellow' | 'green' | 'blue' | 'cyan' | 'magenta' | 'red' | 'darkBlue' | 'darkCyan' | 'darkGreen' | 'darkMagenta' | 'darkRed' | 'darkYellow' | 'lightGray' | 'darkGray' | 'black' | 'white' | 'none'

// Convertir le contenu inline (texte, bold, italic, etc.)
function convertInlineContent(content: JSONContent[]): TextRun[] {
  const runs: TextRun[] = []

  for (const node of content) {
    if (node.type === 'text') {
      const marks = node.marks || []
      const options: {
        text: string
        bold?: boolean
        italics?: boolean
        underline?: { type: 'single' }
        strike?: boolean
        highlight?: HighlightColor
        font?: string
        size?: number
        color?: string
        subScript?: boolean
        superScript?: boolean
      } = {
        text: node.text || '',
      }

      for (const mark of marks) {
        switch (mark.type) {
          case 'bold':
            options.bold = true
            break
          case 'italic':
            options.italics = true
            break
          case 'underline':
            options.underline = { type: 'single' }
            break
          case 'strike':
            options.strike = true
            break
          case 'highlight':
            // Mapper les couleurs de surlignage TipTap vers les couleurs DOCX
            const highlightColor = mark.attrs?.color as string | undefined
            if (highlightColor) {
              if (highlightColor.includes('255, 235') || highlightColor.includes('255, 255, 0')) {
                options.highlight = 'yellow'
              } else if (highlightColor.includes('212, 237') || highlightColor.includes('0, 255')) {
                options.highlight = 'green'
              } else if (highlightColor.includes('204, 229') || highlightColor.includes('0, 0, 255')) {
                options.highlight = 'blue'
              } else if (highlightColor.includes('248, 215') || highlightColor.includes('255, 0, 0')) {
                options.highlight = 'red'
              } else if (highlightColor.includes('232, 218')) {
                options.highlight = 'magenta'
              } else if (highlightColor.includes('255, 224')) {
                options.highlight = 'yellow' // orange -> yellow (closest)
              } else {
                options.highlight = 'yellow' // default
              }
            } else {
              options.highlight = 'yellow'
            }
            break
          case 'code':
            // Code inline avec police monospace
            options.font = 'Courier New'
            options.size = 20 // 10pt en half-points
            options.color = 'c7254e'
            break
          case 'link':
            // Liens en bleu souligné
            options.color = '0066cc'
            options.underline = { type: 'single' }
            break
          case 'subscript':
            options.subScript = true
            break
          case 'superscript':
            options.superScript = true
            break
        }
      }

      runs.push(new TextRun(options))
    } else if (node.type === 'hardBreak') {
      runs.push(new TextRun({ break: 1 }))
    }
  }

  return runs
}

/**
 * Crée un TextRun pour un numéro de page
 */
function createPageNumberRun(type: 'current' | 'total', fontSize: number): TextRun {
  return new TextRun({
    children: [type === 'current' ? PageNumber.CURRENT : PageNumber.TOTAL_PAGES],
    size: fontSize,
  })
}

/**
 * Parse le texte et remplace les variables de pagination par des TextRun appropriés
 */
function parseTextWithPageNumbers(text: string, fontSize: number): TextRun[] {
  const runs: TextRun[] = []
  const parts = text.split(/(\{\{page\.current\}\}|\{\{page\.total\}\})/)

  for (const part of parts) {
    if (part === '{{page.current}}') {
      runs.push(createPageNumberRun('current', fontSize))
    } else if (part === '{{page.total}}') {
      runs.push(createPageNumberRun('total', fontSize))
    } else if (part) {
      runs.push(new TextRun({ text: part, size: fontSize }))
    }
  }

  return runs
}

/**
 * Crée un header DOCX depuis un template
 */
function createTemplateHeader(
  headerConfig: HeaderFooter,
  documentTitle: string,
  documentNumber: string
): Header {
  // Remplacer les variables statiques
  const leftText = replaceStaticVariables(headerConfig.content.left, documentTitle, documentNumber)
  const centerText = replaceStaticVariables(headerConfig.content.center, documentTitle, documentNumber)
  const rightText = replaceStaticVariables(headerConfig.content.right, documentTitle, documentNumber)

  const fontSize = headerConfig.style.fontSize
    ? ptToHalfPoints(headerConfig.style.fontSize)
    : 18

  // Construire le contenu avec support des variables de pagination
  const children: TextRun[] = []

  // Left text
  if (leftText) {
    if (leftText.includes('{{page.current}}') || leftText.includes('{{page.total}}')) {
      children.push(...parseTextWithPageNumbers(leftText, fontSize))
    } else {
      children.push(new TextRun({ text: leftText, size: fontSize }))
    }
  }

  // Tab vers le centre
  children.push(new TextRun({ text: '\t' }))

  // Center text avec gestion des variables de pagination
  if (centerText) {
    if (centerText.includes('{{page.current}}') || centerText.includes('{{page.total}}')) {
      children.push(...parseTextWithPageNumbers(centerText, fontSize))
    } else {
      children.push(new TextRun({ text: centerText, size: fontSize }))
    }
  }

  // Tab vers la droite
  children.push(new TextRun({ text: '\t' }))

  // Right text
  if (rightText) {
    if (rightText.includes('{{page.current}}') || rightText.includes('{{page.total}}')) {
      children.push(...parseTextWithPageNumbers(rightText, fontSize))
    } else {
      children.push(new TextRun({ text: rightText, size: fontSize }))
    }
  }

  return new Header({
    children: [
      new Paragraph({
        children,
        tabStops: [
          { type: TabStopType.CENTER, position: TabStopPosition.MAX / 2 },
          { type: TabStopType.RIGHT, position: TabStopPosition.MAX },
        ],
      }),
    ],
  })
}

/**
 * Crée un footer DOCX depuis un template
 */
function createTemplateFooter(
  footerConfig: HeaderFooter,
  documentTitle: string,
  documentNumber: string
): Footer {
  // Remplacer les variables statiques
  const leftText = replaceStaticVariables(footerConfig.content.left, documentTitle, documentNumber)
  const centerText = replaceStaticVariables(footerConfig.content.center, documentTitle, documentNumber)
  const rightText = replaceStaticVariables(footerConfig.content.right, documentTitle, documentNumber)

  const fontSize = footerConfig.style.fontSize
    ? ptToHalfPoints(footerConfig.style.fontSize)
    : 18

  // Construire le contenu avec support des variables de pagination
  const children: TextRun[] = []

  // Left text
  if (leftText) {
    if (leftText.includes('{{page.current}}') || leftText.includes('{{page.total}}')) {
      children.push(...parseTextWithPageNumbers(leftText, fontSize))
    } else {
      children.push(new TextRun({ text: leftText, size: fontSize }))
    }
  }

  // Tab vers le centre
  children.push(new TextRun({ text: '\t' }))

  // Center text avec gestion des variables de pagination
  if (centerText) {
    if (centerText.includes('{{page.current}}') || centerText.includes('{{page.total}}')) {
      children.push(...parseTextWithPageNumbers(centerText, fontSize))
    } else {
      children.push(new TextRun({ text: centerText, size: fontSize }))
    }
  }

  // Tab vers la droite
  children.push(new TextRun({ text: '\t' }))

  // Right text
  if (rightText) {
    if (rightText.includes('{{page.current}}') || rightText.includes('{{page.total}}')) {
      children.push(...parseTextWithPageNumbers(rightText, fontSize))
    } else {
      children.push(new TextRun({ text: rightText, size: fontSize }))
    }
  }

  return new Footer({
    children: [
      new Paragraph({
        children,
        tabStops: [
          { type: TabStopType.CENTER, position: TabStopPosition.MAX / 2 },
          { type: TabStopType.RIGHT, position: TabStopPosition.MAX },
        ],
      }),
    ],
  })
}

/**
 * Crée un header avec l'en-tête du profil avocat
 */
function createLawyerProfileHeader(profile: LawyerProfile): Header {
  const fullName = [profile.civilite, profile.prenom, profile.nom].filter(Boolean).join(' ')
  const fullAddress = [
    profile.adresse,
    [profile.codePostal, profile.ville].filter(Boolean).join(' ')
  ].filter(Boolean).join(', ')

  const contactLines: string[] = []
  if (profile.telephone) contactLines.push(`Tél. ${profile.telephone}`)
  if (profile.email) contactLines.push(profile.email)

  const paragraphs: Paragraph[] = []

  if (profile.cabinet) {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: profile.cabinet, bold: true, size: 24 })],
      alignment: AlignmentType.RIGHT,
    }))
  }

  if (fullName) {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: fullName, size: 20 })],
      alignment: AlignmentType.RIGHT,
    }))
  }

  if (fullAddress) {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: fullAddress, size: 18, color: '666666' })],
      alignment: AlignmentType.RIGHT,
    }))
  }

  if (contactLines.length > 0) {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: contactLines.join(' – '), size: 16, color: '888888' })],
      alignment: AlignmentType.RIGHT,
    }))
  }

  if (profile.barreau) {
    const barreauLine = [
      `Barreau de ${profile.barreau}`,
      profile.numeroToque ? `Toque ${profile.numeroToque}` : ''
    ].filter(Boolean).join(' – ')
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: barreauLine, size: 16, italics: true, color: '888888' })],
      alignment: AlignmentType.RIGHT,
    }))
  }

  return new Header({ children: paragraphs })
}

/**
 * Crée un footer basique avec numéros de page
 */
function createBasicPageNumberFooter(): Footer {
  return new Footer({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: 'Page ', size: 18 }),
          createPageNumberRun('current', 18),
          new TextRun({ text: ' / ', size: 18 }),
          createPageNumberRun('total', 18),
        ],
        alignment: AlignmentType.CENTER,
      }),
    ],
  })
}

export function useExportDOCX() {
  const toast = useToast()
  const lawyerProfile = useLawyerProfileStore()

  const exportToDocx = useCallback(async (
    content: JSONContent,
    options: ExportDOCXOptions = {}
  ) => {
    try {
      const {
        title = 'Document',
        author = lawyerProfile.getFullName(),
        template,
        includeLetterhead = options.includeHeader ?? true,
        includeSignature = options.includeFooter ?? true,
      } = options

      // Récupérer les paramètres de typographie
      const typographySettings = useSettingsStore.getState()

      // Convertir le contenu
      const docElements = convertContentToDocx(content, {
        paragraphIndent: typographySettings.paragraphIndent,
        paragraphSpacing: typographySettings.paragraphSpacing,
      })

      // Calculer les marges de page
      let pageMargins = {
        top: 1440,    // 1 inch en twips par défaut
        right: 1440,
        bottom: 1440,
        left: 1440,
      }

      let pageSize: { width: number; height: number } | undefined

      // Appliquer le template si fourni
      if (template) {
        const { pageLayout } = template

        // Convertir les marges depuis le template
        pageMargins = {
          top: cmToTwips(pageLayout.margins.top),
          right: cmToTwips(pageLayout.margins.right),
          bottom: cmToTwips(pageLayout.margins.bottom),
          left: cmToTwips(pageLayout.margins.left),
        }

        // Récupérer la taille de page
        pageSize = getPageSizeForDocx(pageLayout.size, pageLayout.orientation)
      }

      // Demander le chemin de sauvegarde d'abord
      const filePath = await save({
        filters: [
          { name: 'Document Word', extensions: ['docx'] },
        ],
        defaultPath: `${title.replace(/[^a-zA-Z0-9]/g, '_')}.docx`,
      })

      if (!filePath) {
        return null
      }

      // Générer le numéro de document (incrémente le compteur)
      const documentNumber = useDocumentCounterStore.getState().getNextNumber()

      // Construire les headers/footers
      let headers: { default: Header } | undefined
      let footers: { default: Footer } | undefined

      // Header: letterhead remplace le template header
      if (includeLetterhead && (lawyerProfile.cabinet || lawyerProfile.nom)) {
        headers = { default: createLawyerProfileHeader(lawyerProfile) }
      } else if (template?.header.enabled) {
        headers = { default: createTemplateHeader(template.header, title, documentNumber) }
      }

      // Footer: template footer ou numérotation basique si signature demandée
      if (template?.footer.enabled) {
        footers = { default: createTemplateFooter(template.footer, title, documentNumber) }
      } else if (includeSignature) {
        footers = { default: createBasicPageNumberFooter() }
      }

      // Créer le document
      const doc = new Document({
        creator: author,
        title,
        description: 'Document généré par Citadelle',
        sections: [
          {
            properties: {
              page: {
                margin: pageMargins,
                size: pageSize,
              },
            },
            headers,
            footers,
            children: docElements,
          },
        ],
      })

      // Générer le fichier
      const blob = await Packer.toBlob(doc)
      const buffer = await blob.arrayBuffer()

      await writeBinaryFile(filePath, new Uint8Array(buffer))
      toast.success('Document Word exporté avec succès')
      return filePath
    } catch (error) {
      console.error('Erreur lors de l\'export DOCX:', error)
      toast.error('Erreur lors de l\'export du document Word')
      throw error
    }
  }, [lawyerProfile, toast])

  return { exportToDocx }
}
