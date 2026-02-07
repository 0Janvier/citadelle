/**
 * Extension TipTap pour la typographie francaise automatique
 * Insere automatiquement des espaces insecables (NBSP) avant : ; ? ! et autour des guillemets
 *
 * Note : Les guillemets et le tiret cadratin sont geres par @tiptap/extension-typography.
 * Cette extension complete avec les espaces insecables obligatoires en typographie francaise.
 */

import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { useSettingsStore } from '../store/useSettingsStore'

const NBSP = '\u00A0'
const PUNCTUATION_NEEDING_NBSP = new Set([';', ':', '?', '!'])

export interface FrenchTypographyOptions {
  enabled: boolean
}

const frenchTypoKey = new PluginKey('frenchTypography')

export const FrenchTypographyExtension = Extension.create<FrenchTypographyOptions>({
  name: 'frenchTypography',

  addOptions() {
    return {
      enabled: true,
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: frenchTypoKey,

        props: {
          // Intercept text input to apply French typography rules
          handleTextInput(view, from, to, text) {
            // Read setting dynamically from store
            if (!useSettingsStore.getState().frenchTypography) return false

            const { state } = view

            // Rule 1: NBSP before : ; ? !
            // When user types one of these, check if preceded by a regular space
            if (text.length === 1 && PUNCTUATION_NEEDING_NBSP.has(text)) {
              // Check character before cursor
              if (from > 0) {
                const $pos = state.doc.resolve(from)
                const textBefore = $pos.parent.textBetween(
                  Math.max(0, $pos.parentOffset - 1),
                  $pos.parentOffset,
                  undefined,
                  undefined
                )

                if (textBefore === ' ') {
                  // Replace space + insert punctuation with NBSP + punctuation
                  const tr = state.tr
                  tr.replaceWith(
                    from - 1,
                    to,
                    state.schema.text(NBSP + text)
                  )
                  view.dispatch(tr)
                  return true
                }

                // If no space at all, insert NBSP + punctuation (except after NBSP or start of block)
                if (textBefore && textBefore !== NBSP && textBefore !== '' && textBefore !== '\n') {
                  const tr = state.tr
                  tr.replaceWith(
                    from,
                    to,
                    state.schema.text(NBSP + text)
                  )
                  view.dispatch(tr)
                  return true
                }
              }
            }

            // Rule 2: After typing a space right after «, make it NBSP
            if (text === ' ' && from > 0) {
              const $pos = state.doc.resolve(from)
              const charBefore = $pos.parent.textBetween(
                Math.max(0, $pos.parentOffset - 1),
                $pos.parentOffset,
                undefined,
                undefined
              )
              if (charBefore === '\u00AB') { // «
                const tr = state.tr
                tr.replaceWith(from, to, state.schema.text(NBSP))
                view.dispatch(tr)
                return true
              }
            }

            // Rule 3: Before typing » ensure NBSP
            if (text === '\u00BB' && from > 0) { // »
              const $pos = state.doc.resolve(from)
              const charBefore = $pos.parent.textBetween(
                Math.max(0, $pos.parentOffset - 1),
                $pos.parentOffset,
                undefined,
                undefined
              )
              if (charBefore === ' ') {
                const tr = state.tr
                tr.replaceWith(from - 1, to, state.schema.text(NBSP + '\u00BB'))
                view.dispatch(tr)
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
