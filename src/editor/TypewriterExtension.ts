import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface TypewriterOptions {
  enabled: boolean
  dimOpacity: number
  highlightStyle: 'line' | 'sentence' | 'paragraph'
  markLine: boolean
}

// Helper to find sentence boundaries around cursor position
function findSentenceBounds(text: string, cursorOffset: number): { start: number; end: number } {
  let sentenceStart = 0
  let sentenceEnd = text.length

  // Find sentence start (look backwards for sentence ender)
  for (let i = cursorOffset - 1; i >= 0; i--) {
    if (/[.!?…]/.test(text[i]) && (i === 0 || /[\s\n]/.test(text[i + 1] || ''))) {
      sentenceStart = i + 1
      // Skip whitespace after punctuation
      while (sentenceStart < cursorOffset && /[\s\n]/.test(text[sentenceStart])) {
        sentenceStart++
      }
      break
    }
  }

  // Find sentence end (look forwards for sentence ender)
  for (let i = cursorOffset; i < text.length; i++) {
    if (/[.!?…]/.test(text[i])) {
      sentenceEnd = i + 1
      break
    }
  }

  return { start: sentenceStart, end: sentenceEnd }
}

export const TypewriterExtension = Extension.create<TypewriterOptions>({
  name: 'typewriter',

  addOptions() {
    return {
      enabled: false,
      dimOpacity: 0.3,
      highlightStyle: 'paragraph' as const,
      markLine: true,
    }
  },

  addProseMirrorPlugins() {
    const options = this.options

    return [
      new Plugin({
        key: new PluginKey('typewriter'),
        props: {
          decorations: (state) => {
            if (!options.enabled) {
              return DecorationSet.empty
            }

            const { selection, doc } = state
            const { from } = selection
            const decorations: Decoration[] = []

            const $pos = doc.resolve(from)
            let activeStart = 0
            let activeEnd = doc.content.size
            let activeBlockStart = 0
            let activeBlockEnd = doc.content.size

            // Get the parent block node containing cursor
            for (let depth = $pos.depth; depth > 0; depth--) {
              const node = $pos.node(depth)
              if (node.isBlock && node.isTextblock) {
                activeBlockStart = $pos.start(depth)
                activeBlockEnd = $pos.end(depth)
                break
              }
            }

            // Add line mark decoration (subtle grey tint under current block)
            if (options.markLine && activeBlockStart > 0) {
              decorations.push(
                Decoration.node(activeBlockStart - 1, activeBlockEnd + 1, {
                  class: 'typewriter-line-mark',
                })
              )
            }

            if (options.highlightStyle === 'paragraph') {
              activeStart = activeBlockStart
              activeEnd = activeBlockEnd
            } else if (options.highlightStyle === 'sentence') {
              // For sentence mode, find the sentence within the current block
              const blockNode = $pos.parent
              if (blockNode.isTextblock) {
                const textContent = blockNode.textContent
                const offsetInBlock = from - activeBlockStart
                const bounds = findSentenceBounds(textContent, offsetInBlock)
                activeStart = activeBlockStart + bounds.start
                activeEnd = activeBlockStart + bounds.end
              }
            } else if (options.highlightStyle === 'line') {
              // For line mode, we highlight just around the cursor position
              // This is a simplified approach - true line detection would need DOM access
              activeStart = from
              activeEnd = from

              // Expand to word boundaries for a more natural feel
              const blockNode = $pos.parent
              if (blockNode.isTextblock) {
                const textContent = blockNode.textContent
                const offsetInBlock = from - activeBlockStart

                // Find line start (previous newline or block start)
                let lineStart = offsetInBlock
                for (let i = offsetInBlock - 1; i >= 0; i--) {
                  if (textContent[i] === '\n') {
                    lineStart = i + 1
                    break
                  }
                  lineStart = i
                }
                if (lineStart < 0) lineStart = 0

                // Find line end (next newline or block end)
                let lineEnd = offsetInBlock
                for (let i = offsetInBlock; i < textContent.length; i++) {
                  if (textContent[i] === '\n') {
                    lineEnd = i
                    break
                  }
                  lineEnd = i + 1
                }

                activeStart = activeBlockStart + lineStart
                activeEnd = activeBlockStart + lineEnd
              }
            }

            // Add inline decoration for sentence/line mode active text
            if (options.highlightStyle === 'sentence' || options.highlightStyle === 'line') {
              if (activeStart < activeEnd) {
                decorations.push(
                  Decoration.inline(activeStart, activeEnd, {
                    class: 'typewriter-active-text',
                  })
                )
              }
            }

            // Add dimmed decoration to all blocks except current,
            // or add inline dimming for sentence/line modes
            doc.descendants((node, pos) => {
              if (node.isBlock && node.isTextblock) {
                const nodeStart = pos
                const nodeEnd = pos + node.nodeSize

                if (options.highlightStyle === 'paragraph') {
                  // Paragraph mode: dim entire blocks that don't contain cursor
                  if (nodeStart < activeBlockStart - 1 || nodeStart > activeBlockEnd) {
                    decorations.push(
                      Decoration.node(nodeStart, nodeEnd, {
                        class: 'typewriter-dimmed',
                        style: `opacity: ${options.dimOpacity}`,
                      })
                    )
                  } else {
                    // Active paragraph gets highlight
                    decorations.push(
                      Decoration.node(nodeStart, nodeEnd, {
                        class: 'typewriter-active-block',
                      })
                    )
                  }
                } else {
                  // Sentence/Line mode: dim text outside the active range
                  const textContent = node.textContent
                  const contentStart = pos + 1 // +1 to skip the opening of the node

                  if (nodeStart < activeBlockStart - 1 || nodeStart > activeBlockEnd) {
                    // This block doesn't contain cursor - dim entirely
                    decorations.push(
                      Decoration.node(nodeStart, nodeEnd, {
                        class: 'typewriter-dimmed',
                        style: `opacity: ${options.dimOpacity}`,
                      })
                    )
                  } else if (textContent.length > 0) {
                    // This block contains cursor - dim parts outside active range
                    const relativeActiveStart = activeStart - contentStart
                    const relativeActiveEnd = activeEnd - contentStart

                    // Dim text before active range
                    if (relativeActiveStart > 0) {
                      decorations.push(
                        Decoration.inline(contentStart, contentStart + relativeActiveStart, {
                          class: 'typewriter-dimmed-inline',
                          style: `opacity: ${options.dimOpacity}`,
                        })
                      )
                    }

                    // Dim text after active range
                    if (relativeActiveEnd < textContent.length) {
                      decorations.push(
                        Decoration.inline(contentStart + relativeActiveEnd, contentStart + textContent.length, {
                          class: 'typewriter-dimmed-inline',
                          style: `opacity: ${options.dimOpacity}`,
                        })
                      )
                    }
                  }
                }
              }
              return true
            })

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  },
})
