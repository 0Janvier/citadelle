import { Mark, mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    comment: {
      setComment: (commentId: string) => ReturnType
      unsetComment: () => ReturnType
    }
  }
}

export const CommentExtension = Mark.create({
  name: 'comment',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute('data-comment-id'),
        renderHTML: (attrs: { commentId?: string }) => ({
          'data-comment-id': attrs.commentId,
        }),
      },
      resolved: {
        default: false,
        parseHTML: (el: HTMLElement) => el.getAttribute('data-resolved') === 'true',
        renderHTML: (attrs: { resolved?: boolean }) => ({
          'data-resolved': attrs.resolved ? 'true' : 'false',
        }),
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'span[data-comment-id]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const resolved = HTMLAttributes['data-resolved'] === 'true'
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: `comment-mark${resolved ? ' comment-resolved' : ''}`,
      }),
      0,
    ]
  },

  addCommands() {
    return {
      setComment:
        (commentId: string) =>
        ({ commands }) => {
          return commands.setMark(this.name, { commentId, resolved: false })
        },
      unsetComment:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('comment-click'),
        props: {
          handleClick(_view, _pos, event) {
            const target = event.target as HTMLElement
            const commentEl = target.closest('.comment-mark')
            if (commentEl) {
              const commentId = commentEl.getAttribute('data-comment-id')
              if (commentId) {
                const resolved = commentEl.getAttribute('data-resolved') === 'true'
                window.dispatchEvent(
                  new CustomEvent('comment-click', {
                    detail: { commentId, resolved, element: commentEl },
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
