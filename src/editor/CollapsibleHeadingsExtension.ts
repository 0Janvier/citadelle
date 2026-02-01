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
 * Generate a unique ID for a heading based on its position and content
 */
function generateHeadingId(pos: number, text: string): string {
  // Use position + first 20 chars of text as ID
  const sanitized = text.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '-')
  return `heading-${pos}-${sanitized}`
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
        return false // Stop iteration
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

  doc.descendants((node: any, pos: number) => {
    if (node.type.name === 'heading') {
      const level = node.attrs.level || 1

      if (!levels.includes(level)) {
        return true
      }

      const headingText = node.textContent
      const headingId = generateHeadingId(pos, headingText)
      const headingEndPos = pos + node.nodeSize
      const sectionEndPos = findSectionEnd(doc, pos, level)
      const hasContent = hasContentAfter(doc, headingEndPos, sectionEndPos)

      if (!hasContent) {
        return true // No content to collapse
      }

      const collapsed = collapsedSet.has(headingId)

      // Add chevron widget decoration before the heading
      const chevronWidget = Decoration.widget(pos, () => {
        const button = document.createElement('button')
        button.className = `collapsible-chevron ${collapsed ? 'collapsed' : 'expanded'}`
        button.setAttribute('data-heading-id', headingId)
        button.setAttribute('aria-expanded', String(!collapsed))
        button.setAttribute('aria-label', collapsed ? 'Déplier la section' : 'Replier la section')
        button.type = 'button'
        button.contentEditable = 'false'

        // SVG chevron icon
        button.innerHTML = `
          <svg class="collapsible-chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        `

        button.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          onToggle(headingId)
        })

        return button
      }, { side: -1, key: `chevron-${headingId}` })

      decorations.push(chevronWidget)

      // Add data attribute to heading for styling
      const headingDeco = Decoration.node(pos, headingEndPos, {
        'data-heading-id': headingId,
        'data-collapsible': 'true',
        'data-collapsed': String(collapsed),
        class: `collapsible-heading ${collapsed ? 'is-collapsed' : 'is-expanded'}`,
      })
      decorations.push(headingDeco)

      // If collapsed, hide the content after the heading
      if (collapsed && sectionEndPos > headingEndPos) {
        // Find all nodes between heading and section end
        doc.nodesBetween(headingEndPos, sectionEndPos, (childNode: any, childPos: number) => {
          if (childPos >= headingEndPos && childNode.isBlock) {
            // Check if this is a heading of lower level (should be hidden)
            if (childNode.type.name === 'heading') {
              const childLevel = childNode.attrs.level || 1
              if (childLevel > level) {
                // Hide this sub-heading
                const nodeDeco = Decoration.node(childPos, childPos + childNode.nodeSize, {
                  class: 'collapsible-hidden',
                  'data-collapsed-by': headingId,
                })
                decorations.push(nodeDeco)
              }
            } else {
              // Hide other content
              const nodeDeco = Decoration.node(childPos, childPos + childNode.nodeSize, {
                class: 'collapsible-hidden',
                'data-collapsed-by': headingId,
              })
              decorations.push(nodeDeco)
            }
          }
          return true
        })
      }
    }
    return true
  })

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

          apply: (_tr, _oldDecorationSet, _oldState, newState) => {
            // Always rebuild decorations on document change or metadata change
            // This ensures decorations stay in sync with external state
            const collapsedIds = getCollapsedIds()
            const decorations = buildDecorations(newState.doc, collapsedIds, levels, onToggle)
            return DecorationSet.create(newState.doc, decorations)
          },
        },

        props: {
          decorations: (state) => {
            return collapsiblePluginKey.getState(state)
          },

          handleDOMEvents: {
            click: (view, event) => {
              const target = event.target as HTMLElement

              // Check if clicked on chevron or inside chevron
              const chevronButton = target.closest('.collapsible-chevron')
              if (chevronButton) {
                const headingId = chevronButton.getAttribute('data-heading-id')
                if (headingId) {
                  event.preventDefault()
                  event.stopPropagation()
                  onToggle(headingId)
                  // Force view update
                  view.dispatch(view.state.tr.setMeta('collapsibleToggle', headingId))
                  return true
                }
              }

              return false
            },
          },
        },
      }),
    ]
  },

  addKeyboardShortcuts() {
    return {
      'Mod-.': () => {
        // Toggle the section at current cursor position
        const { state } = this.editor
        const { selection } = state
        const { $from } = selection

        // Find the heading that contains or precedes the cursor
        let headingPos: number | null = null
        let headingNode: any = null

        // First check if we're inside a heading
        for (let d = $from.depth; d >= 0; d--) {
          const node = $from.node(d)
          if (node.type.name === 'heading') {
            headingPos = $from.before(d)
            headingNode = node
            break
          }
        }

        // If not in a heading, find the previous heading
        if (headingPos === null) {
          state.doc.nodesBetween(0, $from.pos, (node, pos) => {
            if (node.type.name === 'heading') {
              headingPos = pos
              headingNode = node
            }
            return true
          })
        }

        if (headingPos !== null && headingNode) {
          const headingText = headingNode.textContent
          const headingId = generateHeadingId(headingPos, headingText)
          this.options.onToggle(headingId)
          // Force view update
          this.editor.view.dispatch(
            this.editor.state.tr.setMeta('collapsibleToggle', headingId)
          )
          return true
        }

        return false
      },
    }
  },
})
