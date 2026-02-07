// Extension TipTap pour l'autocomplétion avec /commandes
// Permet d'insérer des snippets juridiques et des blocs rapidement

import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { Snippet } from '../types/editor-features'
import { useTocStore } from '../store/useTocStore'

export interface SlashCommandOptions {
  suggestion: {
    items: (query: string) => Snippet[]
    render: () => {
      onStart: (props: SuggestionProps) => void
      onUpdate: (props: SuggestionProps) => void
      onKeyDown: (props: { event: KeyboardEvent }) => boolean
      onExit: () => void
    }
  }
}

export interface SuggestionProps {
  query: string
  items: Snippet[]
  selectedIndex: number
  command: (item: Snippet) => void
  clientRect: (() => DOMRect | null) | null
}

const slashCommandPluginKey = new PluginKey('slashCommand')

export const SlashCommandExtension = Extension.create<SlashCommandOptions>({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        items: () => [],
        render: () => ({
          onStart: () => {},
          onUpdate: () => {},
          onKeyDown: () => false,
          onExit: () => {},
        }),
      },
    }
  },

  addProseMirrorPlugins() {
    const { suggestion } = this.options
    const editor = this.editor

    return [
      new Plugin({
        key: slashCommandPluginKey,

        state: {
          init() {
            return {
              active: false,
              query: '',
              range: null as { from: number; to: number } | null,
              items: [] as Snippet[],
              selectedIndex: 0,
            }
          },

          apply(tr, prev, _oldState, newState) {
            const meta = tr.getMeta(slashCommandPluginKey)
            if (meta) {
              return meta
            }

            // Vérifier si on tape après un /
            const { selection } = newState
            const { $from } = selection

            // Chercher un / dans le texte avant le curseur
            const textBefore = $from.parent.textContent.slice(0, $from.parentOffset)
            const slashMatch = textBefore.match(/\/(\w*)$/)

            if (slashMatch) {
              const query = slashMatch[1]
              const items = suggestion.items(query)

              // Conserver selectedIndex si query identique, sinon reset
              const keepIndex = prev.active && prev.query === query
              const selectedIndex = keepIndex
                ? Math.min(prev.selectedIndex, Math.max(items.length - 1, 0))
                : 0

              return {
                active: true,
                query,
                range: {
                  from: $from.pos - slashMatch[0].length,
                  to: $from.pos,
                },
                items,
                selectedIndex,
              }
            }

            return {
              active: false,
              query: '',
              range: null,
              items: [],
              selectedIndex: 0,
            }
          },
        },

        props: {
          handleKeyDown(view, event) {
            const state = slashCommandPluginKey.getState(view.state)
            if (!state?.active || state.items.length === 0) return false

            const { items, selectedIndex } = state

            // Navigation bas
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              const newIndex = (selectedIndex + 1) % items.length
              view.dispatch(
                view.state.tr.setMeta(slashCommandPluginKey, {
                  ...state,
                  selectedIndex: newIndex,
                })
              )
              return true
            }

            // Navigation haut
            if (event.key === 'ArrowUp') {
              event.preventDefault()
              const newIndex = (selectedIndex - 1 + items.length) % items.length
              view.dispatch(
                view.state.tr.setMeta(slashCommandPluginKey, {
                  ...state,
                  selectedIndex: newIndex,
                })
              )
              return true
            }

            // Sélection
            if (event.key === 'Enter' || event.key === 'Tab') {
              event.preventDefault()
              const selectedItem = items[selectedIndex]
              if (selectedItem && state.range) {
                const { from, to } = state.range
                // Special handling for certain block types
                if (selectedItem.id === 'block-footnote') {
                  editor.chain().focus().deleteRange({ from, to }).run()
                  // Use insertFootnote command if available
                  if (editor.commands.insertFootnote) {
                    editor.commands.insertFootnote()
                  }
                } else if (selectedItem.id === 'block-date') {
                  // Generate fresh date at execution time
                  const mois = ['janvier','fevrier','mars','avril','mai','juin','juillet','aout','septembre','octobre','novembre','decembre']
                  const now = new Date()
                  const dateText = `${now.getDate()} ${mois[now.getMonth()]} ${now.getFullYear()}`
                  editor.chain().focus().deleteRange({ from, to }).insertContent(dateText).run()
                } else if (selectedItem.id === 'block-toc') {
                  editor.chain().focus().deleteRange({ from, to }).run()
                  useTocStore.getState().generateToc(editor)
                  useTocStore.getState().insertTocInDocument(editor)
                } else {
                  editor.chain()
                    .focus()
                    .deleteRange({ from, to })
                    .insertContent(selectedItem.contenu)
                    .run()
                }
              }
              return true
            }

            // Annuler
            if (event.key === 'Escape') {
              view.dispatch(
                view.state.tr.setMeta(slashCommandPluginKey, {
                  active: false,
                  query: '',
                  range: null,
                  items: [],
                  selectedIndex: 0,
                })
              )
              return true
            }

            return false
          },

          decorations(state) {
            const pluginState = slashCommandPluginKey.getState(state)
            if (!pluginState?.active || !pluginState.range) {
              return DecorationSet.empty
            }

            const { from, to } = pluginState.range
            return DecorationSet.create(state.doc, [
              Decoration.inline(from, to, {
                class: 'slash-command-active',
              }),
            ])
          },
        },

        view() {
          let component: ReturnType<typeof suggestion.render> | null = null

          return {
            update: (view) => {
              const state = slashCommandPluginKey.getState(view.state)

              if (state?.active && state.items.length > 0) {
                const { from } = state.range!
                const coords = view.coordsAtPos(from)

                const props: SuggestionProps = {
                  query: state.query,
                  items: state.items,
                  selectedIndex: state.selectedIndex,
                  command: (item: Snippet) => {
                    if (state.range) {
                      if (item.id === 'block-footnote') {
                        editor.chain().focus().deleteRange(state.range).run()
                        if (editor.commands.insertFootnote) {
                          editor.commands.insertFootnote()
                        }
                      } else if (item.id === 'block-date') {
                        const mois = ['janvier','fevrier','mars','avril','mai','juin','juillet','aout','septembre','octobre','novembre','decembre']
                        const now = new Date()
                        const dateText = `${now.getDate()} ${mois[now.getMonth()]} ${now.getFullYear()}`
                        editor.chain().focus().deleteRange(state.range).insertContent(dateText).run()
                      } else if (item.id === 'block-toc') {
                        editor.chain().focus().deleteRange(state.range).run()
                        useTocStore.getState().generateToc(editor)
                        useTocStore.getState().insertTocInDocument(editor)
                      } else {
                        editor.chain()
                          .focus()
                          .deleteRange(state.range)
                          .insertContent(item.contenu)
                          .run()
                      }
                    }
                  },
                  clientRect: () => new DOMRect(coords.left, coords.top, 0, coords.bottom - coords.top),
                }

                if (!component) {
                  component = suggestion.render()
                  component.onStart(props)
                } else {
                  component.onUpdate(props)
                }
              } else {
                if (component) {
                  component.onExit()
                  component = null
                }
              }
            },
            destroy: () => {
              if (component) {
                component.onExit()
                component = null
              }
            },
          }
        },
      }),
    ]
  },
})

// Helper pour créer la suggestion avec le store
export function createSlashCommandSuggestion(
  getItems: (query: string) => Snippet[],
  onSelect?: (item: Snippet) => void
): SlashCommandOptions['suggestion'] {
  return {
    items: getItems,
    render: () => {
      let popup: HTMLDivElement | null = null

      const createPopup = () => {
        popup = document.createElement('div')
        popup.className = 'slash-command-popup'
        document.body.appendChild(popup)
      }

      const updatePopup = (props: SuggestionProps) => {
        if (!popup) return

        // Positionner
        const rect = props.clientRect?.()
        if (rect) {
          popup.style.left = `${rect.left}px`
          popup.style.top = `${rect.bottom + 8}px`
        }

        // Générer le contenu avec selectedIndex
        popup.innerHTML = props.items
          .map((item, index) => {
            const isSelected = index === props.selectedIndex
            return `
              <div
                class="slash-command-item${isSelected ? ' selected' : ''}"
                data-index="${index}"
              >
                <div class="slash-command-title">${escapeHtml(item.nom)}</div>
                <div class="slash-command-description">
                  ${escapeHtml(item.raccourci)}${item.description ? ' · ' + escapeHtml(item.description) : ''}
                </div>
              </div>
            `
          })
          .join('')

        // Scroll l'item sélectionné dans la vue
        const selectedEl = popup.querySelector('.slash-command-item.selected')
        if (selectedEl) {
          selectedEl.scrollIntoView({ block: 'nearest' })
        }

        // Événements de clic et hover
        popup.querySelectorAll('.slash-command-item').forEach((el, index) => {
          el.addEventListener('click', () => {
            const item = props.items[index]
            if (item) {
              props.command(item)
              onSelect?.(item)
            }
          })
          el.addEventListener('mouseenter', () => {
            popup?.querySelectorAll('.slash-command-item.selected').forEach((e) => {
              e.classList.remove('selected')
            })
            el.classList.add('selected')
          })
        })
      }

      return {
        onStart: (props) => {
          createPopup()
          updatePopup(props)
        },
        onUpdate: (props) => {
          updatePopup(props)
        },
        onKeyDown: ({ event }) => {
          if (event.key === 'Escape') {
            popup?.remove()
            popup = null
            return true
          }
          return false
        },
        onExit: () => {
          popup?.remove()
          popup = null
        },
      }
    },
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
