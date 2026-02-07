import { Node, mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    footnote: {
      insertFootnote: (content?: string) => ReturnType
      updateFootnote: (footnoteId: string, content: string) => ReturnType
    }
  }
}

let footnoteCounter = 0
function generateFootnoteId(): string {
  return `fn-${Date.now()}-${++footnoteCounter}`
}

export const FootnoteExtension = Node.create({
  name: 'footnote',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      footnoteId: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute('data-footnote-id'),
        renderHTML: (attrs: { footnoteId?: string }) => ({
          'data-footnote-id': attrs.footnoteId,
        }),
      },
      content: {
        default: '',
        parseHTML: (el: HTMLElement) => el.getAttribute('data-footnote-content') || '',
        renderHTML: (attrs: { content?: string }) => ({
          'data-footnote-content': attrs.content,
        }),
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'span[data-footnote-id]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        class: 'footnote-ref',
        contenteditable: 'false',
      }),
      // The number is rendered dynamically via CSS counter or plugin
      ['sup', { class: 'footnote-number' }, '?'],
    ]
  },

  addCommands() {
    return {
      insertFootnote:
        (content = '') =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              footnoteId: generateFootnoteId(),
              content,
            },
          })
        },

      updateFootnote:
        (footnoteId: string, content: string) =>
        ({ tr, state, dispatch }) => {
          let updated = false
          state.doc.descendants((node, pos) => {
            if (node.type.name === 'footnote' && node.attrs.footnoteId === footnoteId) {
              if (dispatch) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  content,
                })
              }
              updated = true
              return false
            }
          })
          return updated
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-n': () => this.editor.commands.insertFootnote(),
    }
  },

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey('footnote-numbering')

    return [
      new Plugin({
        key: pluginKey,
        view() {
          return {
            update(view) {
              // Number all footnotes sequentially
              const { doc } = view.state
              let counter = 0
              doc.descendants((node, pos) => {
                if (node.type.name === 'footnote') {
                  counter++
                  const dom = view.nodeDOM(pos) as HTMLElement | null
                  if (dom) {
                    const sup = dom.querySelector('.footnote-number')
                    if (sup) {
                      sup.textContent = String(counter)
                    }
                  }
                }
              })
            },
          }
        },
      }),
      new Plugin({
        key: new PluginKey('footnote-click'),
        props: {
          handleClick(_view, _pos, event) {
            const target = event.target as HTMLElement
            const footnoteEl = target.closest('.footnote-ref')
            if (footnoteEl) {
              const footnoteId = footnoteEl.getAttribute('data-footnote-id')
              if (footnoteId) {
                window.dispatchEvent(
                  new CustomEvent('footnote-click', {
                    detail: { footnoteId, element: footnoteEl },
                  })
                )
                return true
              }
            }
            return false
          },
        },
      }),
    ]
  },
})
