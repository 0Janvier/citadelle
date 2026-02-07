import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface CollapsibleHeadingsOptions {
  /**
   * Function to get the set of collapsed heading IDs
   */
  getCollapsedIds: () => string[]
  /**
   * Function called when a heading toggle is clicked
   */
  onToggle: (headingId: string) => void
  /**
   * Heading levels to make collapsible (default: [1, 2, 3, 4, 5, 6])
   */
  levels: number[]
}

const collapsiblePluginKey = new PluginKey('collapsibleHeadings')

/**
 * Generate a stable ID for a heading based on its content (not position).
 * Uses content + level + duplicate index so IDs don't shift when headings are added/removed.
 * duplicateIndex=1 means first occurrence (no suffix), 2+ gets a suffix.
 */
function generateHeadingId(text: string, level: number, duplicateIndex: number): string {
  const sanitized = text.slice(0, 40).replace(/[^a-zA-Z0-9\u00C0-\u017F]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase()
  const base = `h${level}-${sanitized || 'empty'}`
  return duplicateIndex > 1 ? `${base}-${duplicateIndex}` : base
}

/**
 * Find the end position of a section (until next heading of same or higher level)
 */
function findSectionEnd(doc: any, startPos: number, headingLevel: number): number {
  let endPos = doc.content.size

  doc.nodesBetween(startPos + 1, doc.content.size, (node: any, pos: number) => {
    if (node.type.name === 'heading') {
      const level = node.attrs.level || 1
      if (level <= headingLevel) {
        endPos = pos
        return false
      }
    }
    return true
  })

  return endPos
}

/**
 * Check if a heading has content after it (to show toggle)
 */
function hasContentAfter(doc: any, headingEndPos: number, sectionEndPos: number): boolean {
  if (sectionEndPos <= headingEndPos) return false

  let hasContent = false
  doc.nodesBetween(headingEndPos, sectionEndPos, (node: any) => {
    if (node.isBlock && node.type.name !== 'heading') {
      hasContent = true
      return false
    }
    return true
  })

  return hasContent
}

interface HeadingInfo {
  pos: number
  endPos: number
  level: number
  text: string
  id: string
  sectionEndPos: number
  hasContent: boolean
}

/**
 * Collect all headings with their stable IDs
 */
function collectHeadings(doc: any, levels: number[]): HeadingInfo[] {
  const headings: HeadingInfo[] = []
  // Track duplicates by content+level to assign stable duplicate indices
  const textCounters: Record<string, number> = {}

  doc.descendants((node: any, pos: number) => {
    if (node.type.name === 'heading') {
      const level = node.attrs.level || 1

      if (!levels.includes(level)) {
        return true
      }

      const text = node.textContent
      // Count duplicates by normalized content + level
      const contentKey = `h${level}-${text.slice(0, 40).replace(/[^a-zA-Z0-9\u00C0-\u017F]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase()}`
      textCounters[contentKey] = (textCounters[contentKey] || 0) + 1

      const id = generateHeadingId(text, level, textCounters[contentKey])
      const endPos = pos + node.nodeSize
      const sectionEndPos = findSectionEnd(doc, pos, level)
      const hasContent = hasContentAfter(doc, endPos, sectionEndPos)

      headings.push({
        pos,
        endPos,
        level,
        text,
        id,
        sectionEndPos,
        hasContent,
      })
    }
    return true
  })

  return headings
}

/**
 * Build decorations for collapsible headings
 */
function buildDecorations(
  doc: any,
  collapsedIds: string[],
  levels: number[],
  onToggle: (id: string) => void
): Decoration[] {
  const decorations: Decoration[] = []
  const collapsedSet = new Set(collapsedIds)
  const headings = collectHeadings(doc, levels)

  for (const heading of headings) {
    if (!heading.hasContent) {
      continue
    }

    const collapsed = collapsedSet.has(heading.id)

    // Create chevron button widget - placed BEFORE the heading content
    const chevronWidget = Decoration.widget(
      heading.pos + 1,
      (view) => {
        const button = document.createElement('button')
        button.className = `collapsible-chevron ${collapsed ? 'collapsed' : 'expanded'}`
        button.setAttribute('data-heading-id', heading.id)
        button.setAttribute('aria-expanded', String(!collapsed))
        button.setAttribute('aria-label', collapsed ? 'Déplier la section' : 'Replier la section')
        button.type = 'button'
        button.contentEditable = 'false'

        button.innerHTML = `
          <svg class="collapsible-chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        `

        // Handle click directly on the button
        button.addEventListener('mousedown', (e) => {
          e.preventDefault()
          e.stopPropagation()
        })

        button.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()

          // Toggle state
          onToggle(heading.id)

          // Force decoration rebuild
          view.dispatch(view.state.tr.setMeta(collapsiblePluginKey, { toggle: heading.id }))
        })

        return button
      },
      {
        side: -1,
        key: `chevron-${heading.id}`,
        // Prevent widget from being selected
        ignoreSelection: true,
      }
    )
    decorations.push(chevronWidget)

    // Add styling class to heading
    const headingDeco = Decoration.node(heading.pos, heading.endPos, {
      'data-heading-id': heading.id,
      'data-collapsible': 'true',
      class: `collapsible-heading ${collapsed ? 'is-collapsed' : 'is-expanded'}`,
    })
    decorations.push(headingDeco)

    // Hide content if collapsed - only top-level blocks
    if (collapsed) {
      doc.nodesBetween(heading.endPos, heading.sectionEndPos, (childNode: any, childPos: number) => {
        // Only process top-level blocks (direct children of doc)
        if (childPos >= heading.endPos && childNode.isBlock) {
          const nodeDeco = Decoration.node(childPos, childPos + childNode.nodeSize, {
            class: 'collapsible-hidden',
            'data-collapsed-by': heading.id,
          })
          decorations.push(nodeDeco)
          // Don't descend into children - we hide the whole block
          return false
        }
        return true
      })
    }
  }

  return decorations
}

export const CollapsibleHeadingsExtension = Extension.create<CollapsibleHeadingsOptions>({
  name: 'collapsibleHeadings',

  addOptions() {
    return {
      getCollapsedIds: () => [],
      onToggle: () => {},
      levels: [1, 2, 3, 4, 5, 6],
    }
  },

  addProseMirrorPlugins() {
    const { getCollapsedIds, onToggle, levels } = this.options

    return [
      new Plugin({
        key: collapsiblePluginKey,

        state: {
          init: (_, state) => {
            const collapsedIds = getCollapsedIds()
            const decorations = buildDecorations(state.doc, collapsedIds, levels, onToggle)
            return DecorationSet.create(state.doc, decorations)
          },

          apply: (tr, oldDecorationSet, _oldState, newState) => {
            // Only rebuild if document changed or toggle was triggered
            const toggleMeta = tr.getMeta(collapsiblePluginKey)

            if (tr.docChanged || toggleMeta) {
              const collapsedIds = getCollapsedIds()
              const decorations = buildDecorations(newState.doc, collapsedIds, levels, onToggle)
              return DecorationSet.create(newState.doc, decorations)
            }

            // Map existing decorations through the transaction
            return oldDecorationSet.map(tr.mapping, newState.doc)
          },
        },

        props: {
          decorations: (state) => {
            return collapsiblePluginKey.getState(state)
          },
        },
      }),
    ]
  },

  addKeyboardShortcuts() {
    return {
      'Mod-.': () => {
        const { state } = this.editor
        const { selection } = state
        const { $from } = selection

        // Collect headings to find the one at cursor
        const headings = collectHeadings(state.doc, this.options.levels)

        // Find heading containing or preceding cursor
        let targetHeading: HeadingInfo | null = null

        for (const heading of headings) {
          // Check if cursor is inside this heading
          if ($from.pos >= heading.pos && $from.pos <= heading.endPos) {
            targetHeading = heading
            break
          }
          // Or if this heading precedes cursor
          if (heading.pos < $from.pos) {
            targetHeading = heading
          }
        }

        if (targetHeading && targetHeading.hasContent) {
          this.options.onToggle(targetHeading.id)
          this.editor.view.dispatch(
            this.editor.state.tr.setMeta(collapsiblePluginKey, { toggle: targetHeading.id })
          )
          return true
        }

        return false
      },
    }
  },
})
