// Extension TipTap pour l'autocomplétion avec /commandes
// Permet d'insérer des snippets juridiques rapidement

import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { Snippet } from '../types/editor-features'

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

          apply(tr, _prev, _oldState, newState) {
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

              return {
                active: true,
                query,
                range: {
                  from: $from.pos - slashMatch[0].length,
                  to: $from.pos,
                },
                items,
                selectedIndex: 0,
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
            if (!state?.active) return false

            const { items, selectedIndex } = state

            // Navigation
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              const newIndex = Math.min(selectedIndex + 1, items.length - 1)
              view.dispatch(
                view.state.tr.setMeta(slashCommandPluginKey, {
                  ...state,
                  selectedIndex: newIndex,
                })
              )
              return true
            }

            if (event.key === 'ArrowUp') {
              event.preventDefault()
              const newIndex = Math.max(selectedIndex - 1, 0)
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
                // Supprimer le /query et insérer le contenu
                const { from, to } = state.range
                editor.chain()
                  .focus()
                  .deleteRange({ from, to })
                  .insertContent(selectedItem.contenu)
                  .run()

                // Fermer le menu
                view.dispatch(
                  view.state.tr.setMeta(slashCommandPluginKey, {
                    active: false,
                    query: '',
                    range: null,
                    items: [],
                    selectedIndex: 0,
                  })
                )
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

            // Ajouter une décoration pour surligner le /query
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
                // Obtenir la position du curseur pour afficher le menu
                const { from } = state.range!
                const coords = view.coordsAtPos(from)

                const props: SuggestionProps = {
                  query: state.query,
                  items: state.items,
                  command: (item: Snippet) => {
                    if (state.range) {
                      editor.chain()
                        .focus()
                        .deleteRange(state.range)
                        .insertContent(item.contenu)
                        .run()
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
      let currentProps: SuggestionProps | null = null

      const createPopup = () => {
        popup = document.createElement('div')
        popup.className = 'slash-command-popup'
        popup.style.cssText = `
          position: fixed;
          z-index: 9999;
          background: var(--bg-primary, white);
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          max-height: 300px;
          overflow-y: auto;
          min-width: 250px;
          padding: 4px;
        `
        document.body.appendChild(popup)
      }

      const updatePopup = (props: SuggestionProps) => {
        if (!popup) return

        // Positionner le popup
        const rect = props.clientRect?.()
        if (rect) {
          popup.style.left = `${rect.left}px`
          popup.style.top = `${rect.bottom + 8}px`
        }

        // Générer le contenu
        popup.innerHTML = props.items
          .map((item, index) => {
            const isSelected = index === (currentProps as any)?.selectedIndex || index === 0
            return `
              <div
                class="slash-command-item ${isSelected ? 'selected' : ''}"
                data-index="${index}"
                style="
                  padding: 8px 12px;
                  cursor: pointer;
                  border-radius: 4px;
                  ${isSelected ? 'background: var(--bg-secondary, #f3f4f6);' : ''}
                "
              >
                <div style="font-weight: 500; font-size: 14px;">${item.nom}</div>
                <div style="font-size: 12px; color: var(--text-secondary, #6b7280);">
                  ${item.raccourci} ${item.description ? '• ' + item.description : ''}
                </div>
              </div>
            `
          })
          .join('')

        // Ajouter les événements de clic
        popup.querySelectorAll('.slash-command-item').forEach((el, index) => {
          el.addEventListener('click', () => {
            const item = props.items[index]
            if (item) {
              props.command(item)
              onSelect?.(item)
            }
          })
          el.addEventListener('mouseenter', () => {
            popup?.querySelectorAll('.slash-command-item').forEach((e) => {
              ;(e as HTMLElement).style.background = ''
            })
            ;(el as HTMLElement).style.background = 'var(--bg-secondary, #f3f4f6)'
          })
        })
      }

      return {
        onStart: (props) => {
          currentProps = props
          createPopup()
          updatePopup(props)
        },
        onUpdate: (props) => {
          currentProps = props
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
          currentProps = null
        },
      }
    },
  }
}
