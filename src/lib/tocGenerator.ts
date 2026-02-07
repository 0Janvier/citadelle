/**
 * Table of Contents generator for TipTap editor.
 * Scans document headings and generates a TipTap JSON structure
 * with clickable entries that navigate to heading positions.
 */

import type { Editor } from '@tiptap/core'

interface TocEntry {
  level: number
  text: string
  id: string
}

/**
 * Extract all headings from the editor document.
 */
function extractHeadings(editor: Editor): TocEntry[] {
  const headings: TocEntry[] = []
  const seen = new Map<string, number>()

  editor.state.doc.descendants((node) => {
    if (node.type.name === 'heading') {
      const level = node.attrs.level || 1
      const text = node.textContent.trim()
      if (!text) return

      // Generate stable ID matching CollapsibleHeadingsExtension pattern
      const sanitized = text
        .slice(0, 40)
        .replace(/[^a-zA-Z0-9\u00C0-\u017F]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase()
      const base = `h${level}-${sanitized || 'empty'}`
      const count = (seen.get(base) || 0) + 1
      seen.set(base, count)
      const id = count > 1 ? `${base}-${count}` : base

      headings.push({ level, text, id })
    }
  })

  return headings
}

/**
 * Generate TipTap JSON content for a Table of Contents.
 * Produces a heading "Table des matieres" followed by paragraphs
 * with indentation based on heading level.
 */
export function generateTocContent(editor: Editor): Record<string, unknown> {
  const headings = extractHeadings(editor)

  if (headings.length === 0) {
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              marks: [{ type: 'italic' }],
              text: 'Aucun titre trouve dans le document.',
            },
          ],
        },
      ],
    }
  }

  const minLevel = Math.min(...headings.map((h) => h.level))

  const tocNodes = headings.map((h) => {
    const indent = h.level - minLevel
    const prefix = indent > 0 ? '\u00A0\u00A0\u00A0\u00A0'.repeat(indent) : ''

    return {
      type: 'paragraph',
      attrs: {
        textAlign: 'left',
      },
      content: [
        ...(prefix
          ? [{ type: 'text', text: prefix }]
          : []),
        {
          type: 'text',
          text: h.text,
        },
      ],
    }
  })

  return {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Table des matieres' }],
      },
      ...tocNodes,
      {
        type: 'horizontalRule',
      },
    ],
  }
}

/**
 * Insert a Table of Contents at the current cursor position.
 */
export function insertTableOfContents(editor: Editor): boolean {
  const toc = generateTocContent(editor)
  const content = (toc as { content: unknown[] }).content

  editor.chain().focus().insertContent(content).run()

  return true
}
