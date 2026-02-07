/**
 * Extension TipTap pour coller sans formatage (Cmd+Shift+V)
 * Essentiel pour copier depuis Legifrance, Dalloz, etc. sans importer leur mise en forme.
 */

import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

const pasteHandlerKey = new PluginKey('pasteHandler')

export const PasteHandlerExtension = Extension.create({
  name: 'pasteHandler',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: pasteHandlerKey,

        props: {
          handleKeyDown(view, event) {
            // Cmd+Shift+V = paste as plain text
            if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'v') {
              event.preventDefault()

              navigator.clipboard.readText().then((text) => {
                if (text) {
                  const { state } = view
                  const { from, to } = state.selection
                  const tr = state.tr.replaceRangeWith(
                    from,
                    to,
                    state.schema.text(text)
                  )
                  view.dispatch(tr)
                }
              }).catch(() => {
                // Clipboard API may fail, fallback does nothing
              })

              return true
            }
            return false
          },
        },
      }),
    ]
  },
})
