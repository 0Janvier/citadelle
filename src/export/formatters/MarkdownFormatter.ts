// Formatter Markdown

import type {
  ExportData,
  ExportOptions,
  ExportResult,
  ExportFormatter,
  DocumentExportContent,
  TableExportContent,
} from '../core/types'
import type { JSONContent } from '@tiptap/react'

// ============================================================================
// Conversion JSONContent → Markdown
// ============================================================================

function jsonToMarkdown(content: JSONContent): string {
  if (!content) return ''

  const lines: string[] = []

  if (content.content) {
    for (const node of content.content) {
      const md = nodeToMarkdown(node)
      if (md !== null) {
        lines.push(md)
      }
    }
  }

  return lines.join('\n\n')
}

function nodeToMarkdown(node: JSONContent): string | null {
  switch (node.type) {
    case 'paragraph':
      return inlineToMarkdown(node.content || [])

    case 'heading': {
      const level = node.attrs?.level || 1
      const prefix = '#'.repeat(level)
      const text = inlineToMarkdown(node.content || [])
      return `${prefix} ${text}`
    }

    case 'bulletList': {
      const items = (node.content || [])
        .map(item => {
          if (item.type === 'listItem') {
            const text = item.content?.[0]?.content
              ? inlineToMarkdown(item.content[0].content)
              : ''
            return `- ${text}`
          }
          return ''
        })
        .filter(Boolean)
      return items.join('\n')
    }

    case 'orderedList': {
      const items = (node.content || [])
        .map((item, index) => {
          if (item.type === 'listItem') {
            const text = item.content?.[0]?.content
              ? inlineToMarkdown(item.content[0].content)
              : ''
            return `${index + 1}. ${text}`
          }
          return ''
        })
        .filter(Boolean)
      return items.join('\n')
    }

    case 'taskList': {
      const items = (node.content || [])
        .map(item => {
          if (item.type === 'taskItem') {
            const checked = item.attrs?.checked ? 'x' : ' '
            const text = item.content?.[0]?.content
              ? inlineToMarkdown(item.content[0].content)
              : ''
            return `- [${checked}] ${text}`
          }
          return ''
        })
        .filter(Boolean)
      return items.join('\n')
    }

    case 'blockquote': {
      const paragraphs = (node.content || [])
        .map(p => {
          const text = inlineToMarkdown(p.content || [])
          return `> ${text}`
        })
      return paragraphs.join('\n')
    }

    case 'codeBlock': {
      const lang = node.attrs?.language || ''
      const code = node.content?.[0]?.text || ''
      return `\`\`\`${lang}\n${code}\n\`\`\``
    }

    case 'horizontalRule':
      return '---'

    case 'table': {
      const rows = node.content || []
      if (rows.length === 0) return null

      const tableLines: string[] = []

      rows.forEach((row, rowIndex) => {
        if (row.type === 'tableRow') {
          const cells = (row.content || []).map(cell => {
            const text = cell.content?.[0]?.content
              ? inlineToMarkdown(cell.content[0].content)
              : ''
            return text
          })
          tableLines.push(`| ${cells.join(' | ')} |`)

          // Ajouter la ligne de séparation après l'en-tête
          if (rowIndex === 0) {
            const separator = cells.map(() => '---').join(' | ')
            tableLines.push(`| ${separator} |`)
          }
        }
      })

      return tableLines.join('\n')
    }

    case 'image': {
      const src = node.attrs?.src || ''
      const alt = node.attrs?.alt || ''
      return `![${alt}](${src})`
    }

    default:
      return null
  }
}

function inlineToMarkdown(content: JSONContent[]): string {
  return content
    .map(node => {
      if (node.type === 'text') {
        let text = node.text || ''
        const marks = node.marks || []

        for (const mark of marks) {
          switch (mark.type) {
            case 'bold':
              text = `**${text}**`
              break
            case 'italic':
              text = `*${text}*`
              break
            case 'strike':
              text = `~~${text}~~`
              break
            case 'code':
              text = `\`${text}\``
              break
            case 'link':
              text = `[${text}](${mark.attrs?.href || ''})`
              break
          }
        }

        return text
      }

      if (node.type === 'hardBreak') {
        return '  \n'
      }

      return ''
    })
    .join('')
}

// ============================================================================
// Conversion Table → Markdown
// ============================================================================

function tableToMarkdown(headers: string[], rows: (string | number | boolean | null)[][]): string {
  const lines: string[] = []

  // En-têtes
  lines.push(`| ${headers.join(' | ')} |`)
  lines.push(`| ${headers.map(() => '---').join(' | ')} |`)

  // Lignes
  for (const row of rows) {
    const cells = row.map(cell => String(cell ?? ''))
    lines.push(`| ${cells.join(' | ')} |`)
  }

  return lines.join('\n')
}

// ============================================================================
// Formatter Markdown
// ============================================================================

export class MarkdownFormatter implements ExportFormatter {
  formatType: 'markdown' = 'markdown'
  mimeType = 'text/markdown;charset=utf-8'
  extension = 'md'

  async formatData(data: ExportData[], options: ExportOptions): Promise<ExportResult> {
    try {
      const sections: string[] = []

      for (const exportData of data) {
        // Titre
        if (data.length > 1) {
          sections.push(`# ${exportData.title}`)
          sections.push('')
        }

        // Contenu
        if (exportData.content.kind === 'document') {
          const docContent = exportData.content as DocumentExportContent
          const markdown = jsonToMarkdown(docContent.jsonContent)
          sections.push(markdown)
        } else if (exportData.content.kind === 'table') {
          const tableContent = exportData.content as TableExportContent
          const markdown = tableToMarkdown(tableContent.headers, tableContent.rows)
          sections.push(markdown)
        } else if (exportData.content.kind === 'citations') {
          // Format citations en liste
          for (const citation of exportData.content.citations) {
            sections.push(`- **${citation.short}**`)
            if (citation.resume) {
              sections.push(`  ${citation.resume}`)
            }
            sections.push('')
          }
        }
      }

      const content = sections.join('\n')
      const encoder = new TextEncoder()
      const contentBytes = encoder.encode(content)

      const filename = options.filename
        ? `${options.filename}.md`
        : `export_${new Date().toISOString().split('T')[0]}.md`

      return {
        success: true,
        format: 'markdown',
        filename,
        data: contentBytes,
        mimeType: this.mimeType,
      }

    } catch (error) {
      return {
        success: false,
        format: 'markdown',
        filename: '',
        error: error instanceof Error ? error.message : 'Erreur lors de la génération Markdown',
      }
    }
  }
}

// Instance singleton
let markdownFormatterInstance: MarkdownFormatter | null = null

export function getMarkdownFormatter(): MarkdownFormatter {
  if (!markdownFormatterInstance) {
    markdownFormatterInstance = new MarkdownFormatter()
  }
  return markdownFormatterInstance
}
