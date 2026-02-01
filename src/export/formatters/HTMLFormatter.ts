// Formatter HTML

import type {
  ExportData,
  ExportOptions,
  ExportResult,
  ExportFormatter,
  DocumentExportContent,
  TableExportContent,
} from '../core/types'
import type { JSONContent } from '@tiptap/react'
import { useLawyerProfileStore } from '../../store/useLawyerProfileStore'

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

        // Appliquer les marks dans l'ordre inverse pour un bon emboîtement
        for (const mark of marks.reverse()) {
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
// Génération HTML complet
// ============================================================================

function generateHTMLDocument(
  title: string,
  bodyContent: string,
  options: ExportOptions
): string {
  const profile = useLawyerProfileStore.getState()

  // En-tête cabinet
  let headerHTML = ''
  if (options.includeLetterhead && (profile.nom || profile.cabinet)) {
    const fullName = [profile.civilite, profile.prenom, profile.nom].filter(Boolean).join(' ')
    const fullAddress = [
      profile.adresse,
      [profile.codePostal, profile.ville].filter(Boolean).join(' ')
    ].filter(Boolean).join(', ')

    const contactLines: string[] = []
    if (profile.telephone) contactLines.push(`Tél. ${profile.telephone}`)
    if (profile.email) contactLines.push(profile.email)

    const barreauLine = [
      profile.barreau ? `Barreau de ${profile.barreau}` : '',
      profile.numeroToque ? `Toque ${profile.numeroToque}` : ''
    ].filter(Boolean).join(' – ')

    headerHTML = `
<header class="letterhead">
  <div class="letterhead-info">
    ${profile.cabinet ? `<div class="letterhead-cabinet">${escapeHTML(profile.cabinet)}</div>` : ''}
    ${fullName ? `<div class="letterhead-name">${escapeHTML(fullName)}</div>` : ''}
    <div class="letterhead-details">
      ${fullAddress ? `<div>${escapeHTML(fullAddress)}</div>` : ''}
      ${contactLines.map(line => `<div>${escapeHTML(line)}</div>`).join('')}
    </div>
    ${barreauLine ? `<div class="letterhead-barreau">${escapeHTML(barreauLine)}</div>` : ''}
  </div>
</header>`
  }

  // Pied de page
  let footerHTML = ''
  if (options.includeSignature && profile.afficherSignature && profile.nom) {
    const fullName = [profile.civilite, profile.prenom, profile.nom].filter(Boolean).join(' ')
    footerHTML = `
<footer class="document-footer">
  <div class="signature-block">
    <div class="signature-label">Pour le Cabinet,</div>
    ${fullName ? `<div class="signature-name">${escapeHTML(fullName)}</div>` : ''}
  </div>
</footer>`
  }

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)}</title>
  <style>
    :root {
      --text: #1d1d1f;
      --bg: #ffffff;
      --accent: #007aff;
      --border: #e5e5e5;
      --code-bg: #f5f5f5;
    }
    @media print {
      @page { margin: 20mm 15mm 25mm 15mm; size: A4; }
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: var(--text);
      background: var(--bg);
      max-width: 720px;
      margin: 0 auto;
      padding: 24px;
    }
    .letterhead {
      padding-bottom: 20px;
      margin-bottom: 30px;
      border-bottom: 2px solid var(--border);
      text-align: right;
    }
    .letterhead-cabinet { font-weight: 600; font-size: 16px; margin-bottom: 4px; }
    .letterhead-name { font-weight: 500; color: #333; }
    .letterhead-details { color: #666; margin-top: 8px; font-size: 13px; }
    .letterhead-barreau { font-style: italic; color: #888; margin-top: 6px; font-size: 13px; }
    h1, h2, h3, h4, h5, h6 { font-weight: 600; line-height: 1.3; margin: 1.5em 0 0.5em; }
    h1 { font-size: 2em; color: #1e3a5f; }
    h2 { font-size: 1.5em; color: #1e3a5f; }
    h3 { font-size: 1.25em; color: #2c5282; }
    p { margin: 0 0 1em; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    code { font-family: 'SF Mono', Menlo, Monaco, monospace; font-size: 0.9em; background: var(--code-bg); padding: 0.2em 0.4em; border-radius: 4px; }
    pre { background: var(--code-bg); padding: 16px; border-radius: 8px; overflow-x: auto; margin: 1em 0; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid var(--border); margin: 1em 0; padding-left: 16px; color: #666; font-style: italic; }
    ul, ol { padding-left: 24px; margin: 1em 0; }
    li { margin: 0.25em 0; }
    .task-list { list-style: none; padding-left: 0; }
    .task-list .task { margin-left: 0; }
    .task-list .task input { margin-right: 8px; }
    hr { border: none; border-top: 1px solid var(--border); margin: 2em 0; }
    img { max-width: 100%; height: auto; border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; margin: 1em 0; }
    th, td { border: 1px solid var(--border); padding: 8px 12px; text-align: left; }
    th { background: var(--code-bg); font-weight: 600; }
    .document-footer { margin-top: 60px; padding-top: 30px; border-top: 1px solid var(--border); }
    .signature-block { margin: 40px 0; text-align: right; }
    .signature-label { font-size: 14px; color: #666; margin-bottom: 10px; }
    .signature-name { font-weight: 500; margin-top: 8px; }
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
// Conversion Table → HTML
// ============================================================================

function tableToHTML(headers: string[], rows: (string | number | boolean | null)[][]): string {
  const headerRow = headers.map(h => `<th>${escapeHTML(h)}</th>`).join('')
  const bodyRows = rows.map(row => {
    const cells = row.map(cell => `<td>${escapeHTML(String(cell ?? ''))}</td>`).join('')
    return `<tr>${cells}</tr>`
  }).join('\n')

  return `<table>
<thead><tr>${headerRow}</tr></thead>
<tbody>
${bodyRows}
</tbody>
</table>`
}

// ============================================================================
// Formatter HTML
// ============================================================================

export class HTMLFormatter implements ExportFormatter {
  formatType: 'html' = 'html'
  mimeType = 'text/html;charset=utf-8'
  extension = 'html'

  async formatData(data: ExportData[], options: ExportOptions): Promise<ExportResult> {
    try {
      const sections: string[] = []
      let mainTitle = 'Export'

      for (const exportData of data) {
        if (data.length === 1) {
          mainTitle = exportData.title
        } else {
          sections.push(`<h1>${escapeHTML(exportData.title)}</h1>`)
        }

        if (exportData.content.kind === 'document') {
          const docContent = exportData.content as DocumentExportContent
          const html = jsonToHTML(docContent.jsonContent)
          sections.push(html)
        } else if (exportData.content.kind === 'table') {
          const tableContent = exportData.content as TableExportContent
          const html = tableToHTML(tableContent.headers, tableContent.rows)
          sections.push(html)
        } else if (exportData.content.kind === 'citations') {
          const list = exportData.content.citations.map(c => {
            let item = `<li><strong>${escapeHTML(c.short)}</strong>`
            if (c.resume) {
              item += `<br><span class="citation-resume">${escapeHTML(c.resume)}</span>`
            }
            item += '</li>'
            return item
          }).join('\n')
          sections.push(`<ul class="citations">\n${list}\n</ul>`)
        }
      }

      const bodyContent = sections.join('\n\n')
      const fullHTML = generateHTMLDocument(mainTitle, bodyContent, options)

      const encoder = new TextEncoder()
      const contentBytes = encoder.encode(fullHTML)

      const filename = options.filename
        ? `${options.filename}.html`
        : `export_${new Date().toISOString().split('T')[0]}.html`

      return {
        success: true,
        format: 'html',
        filename,
        data: contentBytes,
        mimeType: this.mimeType,
      }

    } catch (error) {
      return {
        success: false,
        format: 'html',
        filename: '',
        error: error instanceof Error ? error.message : 'Erreur lors de la génération HTML',
      }
    }
  }
}

// Instance singleton
let htmlFormatterInstance: HTMLFormatter | null = null

export function getHTMLFormatter(): HTMLFormatter {
  if (!htmlFormatterInstance) {
    htmlFormatterInstance = new HTMLFormatter()
  }
  return htmlFormatterInstance
}
