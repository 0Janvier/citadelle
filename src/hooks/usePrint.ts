// Hook d'impression de documents
// Utilise window.print() avec un iframe caché pour l'impression native macOS

import { useCallback, useState } from 'react'
import { useDocumentStore } from '../store/useDocumentStore'
import { useLawyerProfileStore } from '../store/useLawyerProfileStore'
import { useToast } from './useToast'
import type { JSONContent } from '@tiptap/react'

// ============================================================================
// Types
// ============================================================================

export interface PrintOptions {
  includeLetterhead?: boolean
  includeSignature?: boolean
  includePageNumbers?: boolean
}

export interface PrintState {
  isPrinting: boolean
  error: string | null
}

// ============================================================================
// Conversion JSONContent → HTML
// ============================================================================

function jsonToHTML(content: JSONContent): string {
  if (!content) return ''

  const lines: string[] = []

  if (content.content) {
    for (const node of content.content) {
      const html = nodeToHTML(node)
      if (html) {
        lines.push(html)
      }
    }
  }

  return lines.join('\n')
}

function nodeToHTML(node: JSONContent): string {
  switch (node.type) {
    case 'paragraph': {
      const content = inlineToHTML(node.content || [])
      const align = node.attrs?.textAlign
      const style = align ? ` style="text-align: ${align}"` : ''
      return `<p${style}>${content}</p>`
    }

    case 'heading': {
      const level = node.attrs?.level || 1
      const content = inlineToHTML(node.content || [])
      const align = node.attrs?.textAlign
      const style = align ? ` style="text-align: ${align}"` : ''
      return `<h${level}${style}>${content}</h${level}>`
    }

    case 'bulletList': {
      const items = (node.content || [])
        .map(item => {
          if (item.type === 'listItem') {
            const text = item.content?.[0]?.content
              ? inlineToHTML(item.content[0].content)
              : ''
            return `<li>${text}</li>`
          }
          return ''
        })
        .filter(Boolean)
        .join('\n')
      return `<ul>\n${items}\n</ul>`
    }

    case 'orderedList': {
      const items = (node.content || [])
        .map(item => {
          if (item.type === 'listItem') {
            const text = item.content?.[0]?.content
              ? inlineToHTML(item.content[0].content)
              : ''
            return `<li>${text}</li>`
          }
          return ''
        })
        .filter(Boolean)
        .join('\n')
      return `<ol>\n${items}\n</ol>`
    }

    case 'taskList': {
      const items = (node.content || [])
        .map(item => {
          if (item.type === 'taskItem') {
            const checked = item.attrs?.checked ? 'checked' : ''
            const text = item.content?.[0]?.content
              ? inlineToHTML(item.content[0].content)
              : ''
            return `<li class="task"><input type="checkbox" ${checked} disabled> ${text}</li>`
          }
          return ''
        })
        .filter(Boolean)
        .join('\n')
      return `<ul class="task-list">\n${items}\n</ul>`
    }

    case 'blockquote': {
      const paragraphs = (node.content || [])
        .map(p => `<p>${inlineToHTML(p.content || [])}</p>`)
        .join('\n')
      return `<blockquote>\n${paragraphs}\n</blockquote>`
    }

    case 'codeBlock': {
      const lang = node.attrs?.language || ''
      const code = escapeHTML(node.content?.[0]?.text || '')
      return `<pre><code class="language-${lang}">${code}</code></pre>`
    }

    case 'horizontalRule':
      return '<hr>'

    case 'table': {
      const rows = node.content || []
      if (rows.length === 0) return ''

      const rowsHTML = rows.map((row, index) => {
        if (row.type === 'tableRow') {
          const tag = index === 0 ? 'th' : 'td'
          const cells = (row.content || []).map(cell => {
            const text = cell.content?.[0]?.content
              ? inlineToHTML(cell.content[0].content)
              : ''
            return `<${tag}>${text}</${tag}>`
          }).join('')
          return `<tr>${cells}</tr>`
        }
        return ''
      }).join('\n')

      return `<table>\n${rowsHTML}\n</table>`
    }

    case 'image': {
      const src = node.attrs?.src || ''
      const alt = escapeHTML(node.attrs?.alt || '')
      return `<img src="${src}" alt="${alt}">`
    }

    default:
      return ''
  }
}

function inlineToHTML(content: JSONContent[]): string {
  return content
    .map(node => {
      if (node.type === 'text') {
        let text = escapeHTML(node.text || '')
        const marks = node.marks || []

        for (const mark of [...marks].reverse()) {
          switch (mark.type) {
            case 'bold':
              text = `<strong>${text}</strong>`
              break
            case 'italic':
              text = `<em>${text}</em>`
              break
            case 'strike':
              text = `<del>${text}</del>`
              break
            case 'underline':
              text = `<u>${text}</u>`
              break
            case 'code':
              text = `<code>${text}</code>`
              break
            case 'link':
              text = `<a href="${mark.attrs?.href || ''}">${text}</a>`
              break
            case 'highlight':
              text = `<mark>${text}</mark>`
              break
          }
        }

        return text
      }

      if (node.type === 'hardBreak') {
        return '<br>'
      }

      return ''
    })
    .join('')
}

function escapeHTML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ============================================================================
// Génération du document HTML pour impression
// ============================================================================

interface PrintDocumentParams {
  title: string
  bodyContent: string
  options: PrintOptions
  lawyerProfile: ReturnType<typeof useLawyerProfileStore.getState>
}

function generatePrintDocument({
  title,
  bodyContent,
  options,
  lawyerProfile,
}: PrintDocumentParams): string {
  // En-tête cabinet
  let headerHTML = ''
  if (options.includeLetterhead && (lawyerProfile.nom || lawyerProfile.cabinet)) {
    const fullName = [lawyerProfile.civilite, lawyerProfile.prenom, lawyerProfile.nom].filter(Boolean).join(' ')
    const fullAddress = [
      lawyerProfile.adresse,
      [lawyerProfile.codePostal, lawyerProfile.ville].filter(Boolean).join(' ')
    ].filter(Boolean).join(', ')

    const contactLines: string[] = []
    if (lawyerProfile.telephone) contactLines.push(`Tél. ${lawyerProfile.telephone}`)
    if (lawyerProfile.email) contactLines.push(lawyerProfile.email)

    const barreauLine = [
      lawyerProfile.barreau ? `Barreau de ${lawyerProfile.barreau}` : '',
      lawyerProfile.numeroToque ? `Toque ${lawyerProfile.numeroToque}` : ''
    ].filter(Boolean).join(' – ')

    headerHTML = `
<header class="letterhead">
  <div class="letterhead-info">
    ${lawyerProfile.cabinet ? `<div class="letterhead-cabinet">${escapeHTML(lawyerProfile.cabinet)}</div>` : ''}
    ${fullName ? `<div class="letterhead-name">${escapeHTML(fullName)}</div>` : ''}
    <div class="letterhead-details">
      ${fullAddress ? `<div>${escapeHTML(fullAddress)}</div>` : ''}
      ${contactLines.map(line => `<div>${escapeHTML(line)}</div>`).join('')}
    </div>
    ${barreauLine ? `<div class="letterhead-barreau">${escapeHTML(barreauLine)}</div>` : ''}
  </div>
</header>`
  }

  // Pied de page avec signature
  let footerHTML = ''
  if (options.includeSignature && lawyerProfile.afficherSignature && lawyerProfile.nom) {
    const fullName = [lawyerProfile.civilite, lawyerProfile.prenom, lawyerProfile.nom].filter(Boolean).join(' ')
    footerHTML = `
<footer class="document-footer">
  <div class="signature-block">
    <div class="signature-label">Pour le Cabinet,</div>
    ${fullName ? `<div class="signature-name">${escapeHTML(fullName)}</div>` : ''}
  </div>
</footer>`
  }

  // Styles CSS pour l'impression
  const pageNumbersCSS = options.includePageNumbers ? `
      @page {
        @bottom-center {
          content: counter(page) " / " counter(pages);
          font-size: 10pt;
          color: #666;
        }
      }
      .page-footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 10pt;
        color: #666;
        padding: 10px;
      }
  ` : ''

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)}</title>
  <style>
    @media print {
      @page {
        size: A4;
        margin: 20mm 15mm 25mm 15mm;
      }
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      ${pageNumbersCSS}
    }

    @media screen {
      body {
        max-width: 210mm;
        margin: 0 auto;
        padding: 20mm 15mm;
        background: white;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
      }
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: 'EB Garamond', 'Garamond', 'Georgia', serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #1d1d1f;
      background: white;
    }

    /* En-tête cabinet */
    .letterhead {
      padding-bottom: 15px;
      margin-bottom: 25px;
      border-bottom: 2px solid #1e3a5f;
      text-align: right;
    }
    .letterhead-cabinet {
      font-weight: 600;
      font-size: 14pt;
      color: #1e3a5f;
      margin-bottom: 4px;
    }
    .letterhead-name {
      font-weight: 500;
      color: #333;
    }
    .letterhead-details {
      color: #666;
      margin-top: 8px;
      font-size: 10pt;
    }
    .letterhead-barreau {
      font-style: italic;
      color: #888;
      margin-top: 6px;
      font-size: 10pt;
    }

    /* Titres */
    h1, h2, h3, h4, h5, h6 {
      font-weight: 600;
      line-height: 1.3;
      margin: 1.5em 0 0.5em;
      color: #1e3a5f;
      page-break-after: avoid;
    }
    h1 { font-size: 18pt; }
    h2 { font-size: 16pt; }
    h3 { font-size: 14pt; color: #2c5282; }

    /* Contenu */
    p {
      margin: 0 0 1em;
      text-align: justify;
      orphans: 3;
      widows: 3;
    }

    a {
      color: #1e3a5f;
      text-decoration: none;
    }

    /* Code */
    code {
      font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
      font-size: 0.9em;
      background: #f5f5f5;
      padding: 0.2em 0.4em;
      border-radius: 3px;
    }
    pre {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 1em 0;
      page-break-inside: avoid;
    }
    pre code {
      background: none;
      padding: 0;
    }

    /* Citations */
    blockquote {
      border-left: 3px solid #1e3a5f;
      margin: 1em 0;
      padding-left: 16px;
      color: #555;
      font-style: italic;
      page-break-inside: avoid;
    }

    /* Listes */
    ul, ol {
      padding-left: 24px;
      margin: 1em 0;
    }
    li {
      margin: 0.25em 0;
    }
    .task-list {
      list-style: none;
      padding-left: 0;
    }
    .task-list .task {
      margin-left: 0;
    }
    .task-list .task input {
      margin-right: 8px;
    }

    /* Ligne horizontale */
    hr {
      border: none;
      border-top: 1px solid #e5e5e5;
      margin: 2em 0;
    }

    /* Images */
    img {
      max-width: 100%;
      height: auto;
      page-break-inside: avoid;
    }

    /* Tableaux */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
      page-break-inside: avoid;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background: #f8f9fa;
      font-weight: 600;
    }

    /* Surlignage */
    mark {
      background-color: #fff3cd;
      padding: 0.1em 0.2em;
    }

    /* Pied de page / Signature */
    .document-footer {
      margin-top: 60px;
      padding-top: 30px;
      border-top: 1px solid #ddd;
      page-break-inside: avoid;
    }
    .signature-block {
      margin: 40px 0;
      text-align: right;
    }
    .signature-label {
      font-size: 11pt;
      color: #666;
      margin-bottom: 30px;
    }
    .signature-name {
      font-weight: 500;
      margin-top: 8px;
    }

    /* Contenu principal */
    .document-content {
      min-height: 200mm;
    }
  </style>
</head>
<body>
${headerHTML}
<main class="document-content">
${bodyContent}
</main>
${footerHTML}
</body>
</html>`
}

// ============================================================================
// Hook usePrint
// ============================================================================

export function usePrint() {
  const toast = useToast()
  const [state, setState] = useState<PrintState>({
    isPrinting: false,
    error: null,
  })

  const printDocument = useCallback(async (
    documentId: string,
    options: PrintOptions = {}
  ) => {
    setState({ isPrinting: true, error: null })

    try {
      // 1. Récupérer le document depuis le store
      const doc = useDocumentStore.getState().getDocument(documentId)
      if (!doc) {
        throw new Error('Document non trouvé')
      }

      // 2. Récupérer le profil avocat
      const lawyerProfile = useLawyerProfileStore.getState()

      // 3. Convertir le contenu TipTap en HTML
      const bodyContent = jsonToHTML(doc.content)

      // 4. Générer le document HTML complet
      const printHTML = generatePrintDocument({
        title: doc.title,
        bodyContent,
        options: {
          includeLetterhead: options.includeLetterhead ?? true,
          includeSignature: options.includeSignature ?? false,
          includePageNumbers: options.includePageNumbers ?? true,
        },
        lawyerProfile,
      })

      // 5. Créer un iframe caché
      const iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.right = '0'
      iframe.style.bottom = '0'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = 'none'
      iframe.style.visibility = 'hidden'
      document.body.appendChild(iframe)

      // 6. Écrire le contenu HTML dans l'iframe
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      if (!iframeDoc) {
        throw new Error('Impossible de créer le document d\'impression')
      }

      iframeDoc.open()
      iframeDoc.write(printHTML)
      iframeDoc.close()

      // 7. Attendre que les polices et images soient chargées
      await new Promise<void>((resolve) => {
        if (iframe.contentWindow) {
          iframe.contentWindow.onload = () => resolve()
          // Fallback si onload ne se déclenche pas
          setTimeout(resolve, 500)
        } else {
          resolve()
        }
      })

      // 8. Lancer l'impression
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()

      // 9. Nettoyer l'iframe après un délai
      setTimeout(() => {
        document.body.removeChild(iframe)
      }, 1000)

      setState({ isPrinting: false, error: null })
      toast.success('Document envoyé à l\'impression')

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setState({ isPrinting: false, error: message })
      toast.error(`Erreur d'impression: ${message}`)
    }
  }, [toast])

  return {
    printDocument,
    isPrinting: state.isPrinting,
    error: state.error,
  }
}
