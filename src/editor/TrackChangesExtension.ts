/**
 * Track Changes Extension for TipTap
 *
 * Two marks: insertion (green, underlined) and deletion (red, strikethrough).
 * A ProseMirror plugin intercepts text input and deletion when tracking is active,
 * wrapping new content in insertion marks and deleted content in deletion marks.
 */

import { Mark, mergeAttributes, Extension } from '@tiptap/core'
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'
import type { MarkType, Node as PmNode } from '@tiptap/pm/model'
import type { Transaction } from '@tiptap/pm/state'

// ============================================================================
// Insertion Mark
// ============================================================================

export const InsertionMark = Mark.create({
  name: 'insertion',

  addAttributes() {
    return {
      author: {
        default: 'Auteur',
        parseHTML: (el: HTMLElement) => el.getAttribute('data-author') || 'Auteur',
        renderHTML: (attrs: { author?: string }) => ({ 'data-author': attrs.author }),
      },
      timestamp: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute('data-timestamp'),
        renderHTML: (attrs: { timestamp?: string }) => ({ 'data-timestamp': attrs.timestamp }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span.track-insertion' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { class: 'track-insertion' }),
      0,
    ]
  },
})

// ============================================================================
// Deletion Mark
// ============================================================================

export const DeletionMark = Mark.create({
  name: 'deletion',

  addAttributes() {
    return {
      author: {
        default: 'Auteur',
        parseHTML: (el: HTMLElement) => el.getAttribute('data-author') || 'Auteur',
        renderHTML: (attrs: { author?: string }) => ({ 'data-author': attrs.author }),
      },
      timestamp: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute('data-timestamp'),
        renderHTML: (attrs: { timestamp?: string }) => ({ 'data-timestamp': attrs.timestamp }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span.track-deletion' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { class: 'track-deletion' }),
      0,
    ]
  },
})

// ============================================================================
// Track Changes Controller Extension
// ============================================================================

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    trackChanges: {
      enableTracking: () => ReturnType
      disableTracking: () => ReturnType
      acceptChangeAtPos: () => ReturnType
      rejectChangeAtPos: () => ReturnType
      acceptAllChanges: () => ReturnType
      rejectAllChanges: () => ReturnType
    }
  }
}

const trackChangesPluginKey = new PluginKey('track-changes')

/**
 * Apply track-changes deletion logic to a selected range.
 * - Content with an insertion mark is removed entirely (cancellation: no trace).
 * - Content already marked as deletion is skipped (already tracked).
 * - All other content is wrapped with a deletion mark.
 *
 * Operations are collected and applied back-to-front to avoid position shifts.
 */
function applySelectionDeletion(
  tr: Transaction,
  doc: PmNode,
  from: number,
  to: number,
  insertionType: MarkType,
  deletionType: MarkType,
  author: string,
  timestamp: string,
): void {
  // Collect ranges that need action
  const toDelete: { from: number; to: number }[] = []      // insertion-marked → remove entirely
  const toMarkDel: { from: number; to: number }[] = []      // plain text → add deletion mark
  // (already deletion-marked text is skipped)

  doc.nodesBetween(from, to, (node, pos) => {
    if (!node.isText) return
    const nodeFrom = Math.max(pos, from)
    const nodeTo = Math.min(pos + node.nodeSize, to)
    if (nodeFrom >= nodeTo) return

    const hasInsertion = node.marks.some((m) => m.type === insertionType)
    const hasDeletion = node.marks.some((m) => m.type === deletionType)

    if (hasInsertion) {
      // Cancellation: inserted text is being deleted → remove entirely
      toDelete.push({ from: nodeFrom, to: nodeTo })
    } else if (!hasDeletion) {
      // Plain text → mark as deleted
      toMarkDel.push({ from: nodeFrom, to: nodeTo })
    }
    // Already deletion-marked → skip
  })

  // Apply deletions back-to-front (removes first, then marks, to keep positions stable)
  for (let i = toDelete.length - 1; i >= 0; i--) {
    tr.delete(toDelete[i].from, toDelete[i].to)
  }

  // After deletions, positions of toMarkDel ranges may have shifted.
  // Calculate cumulative offset from deletions that occurred before each mark range.
  for (const range of toMarkDel) {
    let offset = 0
    for (const del of toDelete) {
      if (del.to <= range.from) {
        offset += del.to - del.from
      } else if (del.from < range.from) {
        // Partial overlap (shouldn't happen with text node boundaries, but be safe)
        offset += range.from - del.from
      }
    }
    const adjustedFrom = range.from - offset
    const adjustedTo = range.to - offset
    const deletionMark = deletionType.create({ author, timestamp })
    tr.addMark(adjustedFrom, adjustedTo, deletionMark)
  }
}

export const TrackChangesExtension = Extension.create({
  name: 'trackChanges',

  addStorage() {
    return {
      isTracking: false,
      authorName: 'Auteur',
    }
  },

  addCommands() {
    return {
      enableTracking:
        () =>
        () => {
          this.storage.isTracking = true
          return true
        },

      disableTracking:
        () =>
        () => {
          this.storage.isTracking = false
          return true
        },

      acceptChangeAtPos:
        () =>
        ({ state, dispatch }) => {
          const { from, to } = state.selection
          if (!dispatch) return true

          const tr = state.tr

          // Remove insertion marks (keep content)
          const insertionType = state.schema.marks.insertion
          if (insertionType) {
            tr.removeMark(from, to, insertionType)
          }

          // Remove deletion-marked content entirely
          const deletionType = state.schema.marks.deletion
          if (deletionType) {
            // Walk backwards to avoid position shifts
            const deletions: { from: number; to: number }[] = []
            state.doc.nodesBetween(from, to, (node, pos) => {
              if (node.isText) {
                const marks = node.marks.filter((m) => m.type === deletionType)
                if (marks.length > 0) {
                  deletions.push({ from: pos, to: pos + node.nodeSize })
                }
              }
            })
            for (let i = deletions.length - 1; i >= 0; i--) {
              tr.delete(deletions[i].from, deletions[i].to)
            }
          }

          dispatch(tr)
          return true
        },

      rejectChangeAtPos:
        () =>
        ({ state, dispatch }) => {
          const { from, to } = state.selection
          if (!dispatch) return true

          const tr = state.tr

          // Remove deletion marks (keep content)
          const deletionType = state.schema.marks.deletion
          if (deletionType) {
            tr.removeMark(from, to, deletionType)
          }

          // Remove insertion-marked content entirely
          const insertionType = state.schema.marks.insertion
          if (insertionType) {
            const insertions: { from: number; to: number }[] = []
            state.doc.nodesBetween(from, to, (node, pos) => {
              if (node.isText) {
                const marks = node.marks.filter((m) => m.type === insertionType)
                if (marks.length > 0) {
                  insertions.push({ from: pos, to: pos + node.nodeSize })
                }
              }
            })
            for (let i = insertions.length - 1; i >= 0; i--) {
              tr.delete(insertions[i].from, insertions[i].to)
            }
          }

          dispatch(tr)
          return true
        },

      acceptAllChanges:
        () =>
        ({ state, dispatch }) => {
          if (!dispatch) return true
          const tr = state.tr
          const { doc } = state

          // Remove all insertion marks (keep content)
          const insertionType = state.schema.marks.insertion
          if (insertionType) {
            tr.removeMark(0, doc.content.size, insertionType)
          }

          // Remove all deletion-marked content
          const deletionType = state.schema.marks.deletion
          if (deletionType) {
            const deletions: { from: number; to: number }[] = []
            doc.descendants((node, pos) => {
              if (node.isText) {
                const marks = node.marks.filter((m) => m.type === deletionType)
                if (marks.length > 0) {
                  deletions.push({ from: pos, to: pos + node.nodeSize })
                }
              }
            })
            for (let i = deletions.length - 1; i >= 0; i--) {
              tr.delete(deletions[i].from, deletions[i].to)
            }
          }

          dispatch(tr)
          return true
        },

      rejectAllChanges:
        () =>
        ({ state, dispatch }) => {
          if (!dispatch) return true
          const tr = state.tr
          const { doc } = state

          // Remove all deletion marks (keep content)
          const deletionType = state.schema.marks.deletion
          if (deletionType) {
            tr.removeMark(0, doc.content.size, deletionType)
          }

          // Remove all insertion-marked content
          const insertionType = state.schema.marks.insertion
          if (insertionType) {
            const insertions: { from: number; to: number }[] = []
            doc.descendants((node, pos) => {
              if (node.isText) {
                const marks = node.marks.filter((m) => m.type === insertionType)
                if (marks.length > 0) {
                  insertions.push({ from: pos, to: pos + node.nodeSize })
                }
              }
            })
            for (let i = insertions.length - 1; i >= 0; i--) {
              tr.delete(insertions[i].from, insertions[i].to)
            }
          }

          dispatch(tr)
          return true
        },
    }
  },

  addProseMirrorPlugins() {
    const storage = this.storage

    return [
      new Plugin({
        key: trackChangesPluginKey,

        props: {
          // Intercept text input when tracking
          handleTextInput(view, from, to, text) {
            if (!storage.isTracking) return false

            const { state } = view
            const insertionType: MarkType = state.schema.marks.insertion
            const deletionType: MarkType = state.schema.marks.deletion
            if (!insertionType) return false

            const timestamp = new Date().toISOString()
            const insertionMark = insertionType.create({
              author: storage.authorName,
              timestamp,
            })

            const tr = state.tr

            // If there's a selection, apply tracked deletion to selected content
            if (from !== to && deletionType) {
              applySelectionDeletion(tr, state.doc, from, to, insertionType, deletionType, storage.authorName, timestamp)
            }

            // Insert new text with insertion mark at the start of where the selection was
            // After applySelectionDeletion, some content may have been removed, so use
            // the mapping to find the correct position.
            const mappedFrom = tr.mapping.map(from)
            tr.insertText(text, mappedFrom, mappedFrom)
            tr.addMark(mappedFrom, mappedFrom + text.length, insertionMark)
            tr.setSelection(TextSelection.create(tr.doc, mappedFrom + text.length))

            view.dispatch(tr)
            return true
          },

          // Intercept key events for delete/backspace/cut when tracking
          handleKeyDown(view, event) {
            if (!storage.isTracking) return false

            const isDelete = event.key === 'Delete'
            const isBackspace = event.key === 'Backspace'
            const isCut = event.key === 'x' && (event.metaKey || event.ctrlKey)

            if (!isDelete && !isBackspace && !isCut) return false

            const { state } = view
            const { from, to } = state.selection
            const deletionType: MarkType = state.schema.marks.deletion
            const insertionType: MarkType = state.schema.marks.insertion
            if (!deletionType) return false

            const timestamp = new Date().toISOString()
            const tr = state.tr

            if (from !== to) {
              // --- Selection deletion (Backspace, Delete, or Cut on selected text) ---

              // For cut, copy the selected text to clipboard first
              if (isCut) {
                const selectedText = state.doc.textBetween(from, to, '\n')
                navigator.clipboard.writeText(selectedText).catch(() => {
                  // Clipboard write failed silently - deletion still proceeds
                })
              }

              applySelectionDeletion(tr, state.doc, from, to, insertionType, deletionType, storage.authorName, timestamp)

              // Place cursor at the (mapped) start of the former selection
              const cursorPos = tr.mapping.map(from)
              tr.setSelection(TextSelection.create(tr.doc, cursorPos))
            } else if (isCut) {
              // Cut with no selection - nothing to do
              return false
            } else {
              // Single char deletion
              let deleteFrom: number, deleteTo: number
              if (isBackspace && from > 0) {
                deleteFrom = from - 1
                deleteTo = from
              } else if (isDelete && to < state.doc.content.size) {
                deleteFrom = from
                deleteTo = from + 1
              } else {
                return false
              }

              // Check what marks are on the character being deleted
              const $pos = state.doc.resolve(deleteFrom)
              const node = $pos.nodeAfter

              if (node) {
                // If the character has an insertion mark → cancellation: remove it entirely
                if (node.marks.some((m) => m.type === insertionType)) {
                  tr.delete(deleteFrom, deleteTo)
                  tr.setSelection(TextSelection.create(tr.doc, deleteFrom))
                  view.dispatch(tr)
                  return true
                }

                // If already marked as deletion, let default behavior happen (skip past it)
                if (node.marks.some((m) => m.type === deletionType)) {
                  return false
                }
              }

              const deletionMark = deletionType.create({
                author: storage.authorName,
                timestamp,
              })
              tr.addMark(deleteFrom, deleteTo, deletionMark)
              tr.setSelection(TextSelection.create(tr.doc, deleteTo))
            }

            view.dispatch(tr)
            return true
          },
        },
      }),
    ]
  },
})
