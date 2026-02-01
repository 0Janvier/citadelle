import type { JSONContent } from '@tiptap/react'

/**
 * Convertit du Markdown en format TipTap JSON.
 * Gère: titres, paragraphes, listes, code, citations, tableaux, images, liens, formatage inline.
 */
export function markdownToJson(markdown: string): JSONContent {
  const lines = markdown.split('\n')
  const content: JSONContent[] = []

  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Code block (```)
    if (line.startsWith('```')) {
      const language = line.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      content.push({
        type: 'codeBlock',
        attrs: { language },
        content: codeLines.length > 0
          ? [{ type: 'text', text: codeLines.join('\n') }]
          : [],
      })
      i++ // Skip closing ```
      continue
    }

    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      content.push({
        type: 'heading',
        attrs: { level: headingMatch[1].length },
        content: parseInlineMarks(headingMatch[2]),
      })
      i++
      continue
    }

    // Horizontal rule
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(line.trim())) {
      content.push({ type: 'horizontalRule' })
      i++
      continue
    }

    // Blockquote
    if (line.startsWith('>')) {
      const quoteLines: string[] = []
      while (i < lines.length && (lines[i].startsWith('>') || (lines[i].trim() !== '' && quoteLines.length > 0 && !lines[i].startsWith('#')))) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      content.push({
        type: 'blockquote',
        content: [{
          type: 'paragraph',
          content: parseInlineMarks(quoteLines.join(' ')),
        }],
      })
      continue
    }

    // Unordered list
    if (/^[-*+]\s/.test(line)) {
      const listItems: JSONContent[] = []
      while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
        const itemText = lines[i].replace(/^[-*+]\s/, '')
        // Check for task item
        const taskMatch = itemText.match(/^\[([ xX])\]\s*(.*)/)
        if (taskMatch) {
          listItems.push({
            type: 'taskItem',
            attrs: { checked: taskMatch[1].toLowerCase() === 'x' },
            content: [{
              type: 'paragraph',
              content: parseInlineMarks(taskMatch[2]),
            }],
          })
        } else {
          listItems.push({
            type: 'listItem',
            content: [{
              type: 'paragraph',
              content: parseInlineMarks(itemText),
            }],
          })
        }
        i++
      }
      // Determine if it's a task list
      const hasTaskItems = listItems.some(item => item.type === 'taskItem')
      if (hasTaskItems) {
        content.push({
          type: 'taskList',
          content: listItems,
        })
      } else {
        content.push({
          type: 'bulletList',
          content: listItems,
        })
      }
      continue
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const listItems: JSONContent[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const itemText = lines[i].replace(/^\d+\.\s/, '')
        listItems.push({
          type: 'listItem',
          content: [{
            type: 'paragraph',
            content: parseInlineMarks(itemText),
          }],
        })
        i++
      }
      content.push({
        type: 'orderedList',
        content: listItems,
      })
      continue
    }

    // Table
    if (line.includes('|') && line.trim().startsWith('|')) {
      const tableRows: JSONContent[] = []
      let isFirstRow = true

      while (i < lines.length && lines[i].includes('|')) {
        const rowLine = lines[i].trim()

        // Skip separator row (|---|---|)
        if (/^\|[-:\s|]+\|$/.test(rowLine)) {
          i++
          continue
        }

        const cells = rowLine
          .split('|')
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
          .map(cell => cell.trim())

        const cellType = isFirstRow ? 'tableHeader' : 'tableCell'
        const rowContent: JSONContent[] = cells.map(cellText => ({
          type: cellType,
          content: [{
            type: 'paragraph',
            content: parseInlineMarks(cellText),
          }],
        }))

        tableRows.push({
          type: 'tableRow',
          content: rowContent,
        })

        isFirstRow = false
        i++
      }

      if (tableRows.length > 0) {
        content.push({
          type: 'table',
          content: tableRows,
        })
      }
      continue
    }

    // Image (standalone line)
    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
    if (imageMatch) {
      content.push({
        type: 'image',
        attrs: {
          src: imageMatch[2],
          alt: imageMatch[1],
        },
      })
      i++
      continue
    }

    // Empty line
    if (line.trim() === '') {
      i++
      continue
    }

    // Regular paragraph
    const paragraphLines: string[] = [line]
    i++
    // Collect consecutive non-empty, non-special lines
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('>') &&
      !lines[i].startsWith('```') &&
      !/^[-*+]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) &&
      !/^(-{3,}|_{3,}|\*{3,})$/.test(lines[i].trim()) &&
      !(lines[i].includes('|') && lines[i].trim().startsWith('|'))
    ) {
      paragraphLines.push(lines[i])
      i++
    }

    content.push({
      type: 'paragraph',
      content: parseInlineMarks(paragraphLines.join(' ')),
    })
  }

  return {
    type: 'doc',
    content: content.length > 0 ? content : [{ type: 'paragraph' }],
  }
}

/**
 * Parse inline markdown marks (bold, italic, code, links, etc.)
 */
function parseInlineMarks(text: string): JSONContent[] {
  if (!text || text.trim() === '') {
    return []
  }

  const result: JSONContent[] = []

  // Regex patterns for inline elements
  const patterns = [
    // Bold + Italic
    { regex: /\*\*\*(.+?)\*\*\*/g, marks: ['bold', 'italic'] },
    { regex: /___(.+?)___/g, marks: ['bold', 'italic'] },
    // Bold
    { regex: /\*\*(.+?)\*\*/g, marks: ['bold'] },
    { regex: /__(.+?)__/g, marks: ['bold'] },
    // Italic
    { regex: /\*(.+?)\*/g, marks: ['italic'] },
    { regex: /_(.+?)_/g, marks: ['italic'] },
    // Strikethrough
    { regex: /~~(.+?)~~/g, marks: ['strike'] },
    // Inline code
    { regex: /`([^`]+)`/g, marks: ['code'] },
    // Links
    { regex: /\[([^\]]+)\]\(([^)]+)\)/g, marks: ['link'], hasAttrs: true },
    // Images inline
    { regex: /!\[([^\]]*)\]\(([^)]+)\)/g, marks: ['image'], isNode: true },
  ]

  // Simple approach: find all matches and their positions
  interface Match {
    start: number
    end: number
    text: string
    marks: Array<{ type: string; attrs?: Record<string, string> }>
    isNode?: boolean
    nodeType?: string
    nodeAttrs?: Record<string, string>
  }

  const matches: Match[] = []

  for (const pattern of patterns) {
    let match
    const regex = new RegExp(pattern.regex.source, 'g')
    while ((match = regex.exec(text)) !== null) {
      if (pattern.isNode && pattern.marks[0] === 'image') {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[1] || '',
          marks: [],
          isNode: true,
          nodeType: 'image',
          nodeAttrs: { src: match[2], alt: match[1] || '' },
        })
      } else if (pattern.hasAttrs && pattern.marks[0] === 'link') {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[1],
          marks: [{ type: 'link', attrs: { href: match[2] } }],
        })
      } else {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[1],
          marks: pattern.marks.map(m => ({ type: m })),
        })
      }
    }
  }

  // Sort matches by start position
  matches.sort((a, b) => a.start - b.start)

  // Remove overlapping matches (keep first)
  const filteredMatches: Match[] = []
  let lastEnd = 0
  for (const match of matches) {
    if (match.start >= lastEnd) {
      filteredMatches.push(match)
      lastEnd = match.end
    }
  }

  // Build result
  let currentPos = 0
  for (const match of filteredMatches) {
    // Add text before this match
    if (match.start > currentPos) {
      const plainText = text.slice(currentPos, match.start)
      if (plainText) {
        result.push({ type: 'text', text: plainText })
      }
    }

    // Add the matched content
    if (match.isNode) {
      result.push({
        type: match.nodeType!,
        attrs: match.nodeAttrs,
      })
    } else if (match.text) {
      result.push({
        type: 'text',
        text: match.text,
        marks: match.marks.length > 0 ? match.marks : undefined,
      })
    }

    currentPos = match.end
  }

  // Add remaining text
  if (currentPos < text.length) {
    const remainingText = text.slice(currentPos)
    if (remainingText) {
      result.push({ type: 'text', text: remainingText })
    }
  }

  // If no matches were found, return simple text
  if (result.length === 0 && text) {
    return [{ type: 'text', text }]
  }

  return result
}

/**
 * Convertit du TipTap JSON en Markdown.
 */
export function jsonToMarkdown(json: JSONContent): string {
  if (!json.content) return ''

  const lines: string[] = []

  for (const node of json.content) {
    lines.push(nodeToMarkdown(node))
  }

  return lines.join('\n\n')
}

function nodeToMarkdown(node: JSONContent): string {
  switch (node.type) {
    case 'heading': {
      const level = node.attrs?.level || 1
      const prefix = '#'.repeat(level)
      return `${prefix} ${inlineToMarkdown(node.content)}`
    }

    case 'paragraph':
      return inlineToMarkdown(node.content)

    case 'bulletList':
      return (node.content || [])
        .map(item => `- ${nodeToMarkdown(item.content?.[0] || {})}`)
        .join('\n')

    case 'orderedList':
      return (node.content || [])
        .map((item, i) => `${i + 1}. ${nodeToMarkdown(item.content?.[0] || {})}`)
        .join('\n')

    case 'taskList':
      return (node.content || [])
        .map(item => {
          const checked = item.attrs?.checked ? 'x' : ' '
          return `- [${checked}] ${nodeToMarkdown(item.content?.[0] || {})}`
        })
        .join('\n')

    case 'blockquote':
      return (node.content || [])
        .map(child => `> ${nodeToMarkdown(child)}`)
        .join('\n')

    case 'codeBlock': {
      const lang = node.attrs?.language || ''
      const code = inlineToMarkdown(node.content)
      return `\`\`\`${lang}\n${code}\n\`\`\``
    }

    case 'horizontalRule':
      return '---'

    case 'image':
      return `![${node.attrs?.alt || ''}](${node.attrs?.src || ''})`

    case 'table':
      return tableToMarkdown(node)

    default:
      return inlineToMarkdown(node.content)
  }
}

function inlineToMarkdown(content?: JSONContent[]): string {
  if (!content) return ''

  return content.map(node => {
    if (node.type === 'text') {
      let text = node.text || ''
      if (node.marks) {
        for (const mark of node.marks) {
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
      }
      return text
    }
    if (node.type === 'hardBreak') {
      return '  \n'
    }
    if (node.type === 'image') {
      return `![${node.attrs?.alt || ''}](${node.attrs?.src || ''})`
    }
    return ''
  }).join('')
}

function tableToMarkdown(node: JSONContent): string {
  if (!node.content) return ''

  const rows = node.content
  const lines: string[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const cells = (row.content || []).map(cell => {
      const cellContent = cell.content?.[0]
      return inlineToMarkdown(cellContent?.content)
    })

    lines.push(`| ${cells.join(' | ')} |`)

    // Add separator after header row
    if (i === 0) {
      lines.push(`| ${cells.map(() => '---').join(' | ')} |`)
    }
  }

  return lines.join('\n')
}
