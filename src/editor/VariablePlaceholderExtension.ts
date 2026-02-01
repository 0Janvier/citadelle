// Extension TipTap pour les variables dynamiques {{variable}}
// Permet d'afficher et d'éditer les placeholders de variables

import { Node, mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface VariablePlaceholderOptions {
  HTMLAttributes: Record<string, unknown>
  getVariableValue: (key: string) => string
  onVariableClick?: (key: string, pos: number) => void
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    variablePlaceholder: {
      insertVariable: (key: string) => ReturnType
    }
  }
}

const variablePluginKey = new PluginKey('variablePlaceholder')

// Regex pour détecter les variables {{key}}
const VARIABLE_REGEX = /\{\{([^}]+)\}\}/g

export const VariablePlaceholderExtension = Node.create<VariablePlaceholderOptions>({
  name: 'variablePlaceholder',

  group: 'inline',

  inline: true,

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      getVariableValue: () => '',
      onVariableClick: undefined,
    }
  },

  addAttributes() {
    return {
      key: {
        default: null,
        parseHTML: element => element.getAttribute('data-variable-key'),
        renderHTML: attributes => ({
          'data-variable-key': attributes.key,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-variable-key]',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    const key = node.attrs.key
    const value = this.options.getVariableValue(key)

    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-variable-key': key,
        class: 'variable-placeholder',
        title: `Variable: ${key}`,
      }),
      value || `{{${key}}}`,
    ]
  },

  addCommands() {
    return {
      insertVariable:
        (key: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { key },
          })
        },
    }
  },

  addProseMirrorPlugins() {
    const { getVariableValue, onVariableClick } = this.options

    return [
      new Plugin({
        key: variablePluginKey,

        props: {
          decorations(state) {
            const { doc } = state
            const decorations: Decoration[] = []

            // Parcourir le document pour trouver les variables {{key}}
            doc.descendants((node, pos) => {
              if (!node.isText) return

              const text = node.text || ''
              let match

              while ((match = VARIABLE_REGEX.exec(text)) !== null) {
                const from = pos + match.index
                const to = from + match[0].length
                const key = match[1].trim()
                const value = getVariableValue(key)

                decorations.push(
                  Decoration.inline(from, to, {
                    class: value ? 'variable-resolved' : 'variable-unresolved',
                    'data-variable-key': key,
                    title: value ? `${key}: ${value}` : `Variable non définie: ${key}`,
                  })
                )
              }
            })

            return DecorationSet.create(doc, decorations)
          },

          handleClick(_view, pos, event) {
            const target = event.target as HTMLElement
            const variableKey = target.getAttribute('data-variable-key')

            if (variableKey && onVariableClick) {
              onVariableClick(variableKey, pos)
              return true
            }

            return false
          },
        },
      }),
    ]
  },
})

// Styles CSS pour les variables (à ajouter dans editor.css)
export const variablePlaceholderStyles = `
  .variable-placeholder,
  .variable-resolved,
  .variable-unresolved {
    padding: 2px 6px;
    border-radius: 4px;
    font-family: inherit;
    cursor: pointer;
    transition: background-color 0.15s ease;
  }

  .variable-placeholder,
  .variable-resolved {
    background-color: rgba(59, 130, 246, 0.15);
    color: rgb(37, 99, 235);
    border: 1px solid rgba(59, 130, 246, 0.3);
  }

  .variable-placeholder:hover,
  .variable-resolved:hover {
    background-color: rgba(59, 130, 246, 0.25);
  }

  .variable-unresolved {
    background-color: rgba(239, 68, 68, 0.15);
    color: rgb(220, 38, 38);
    border: 1px dashed rgba(239, 68, 68, 0.5);
  }

  .variable-unresolved:hover {
    background-color: rgba(239, 68, 68, 0.25);
  }

  .dark .variable-placeholder,
  .dark .variable-resolved {
    background-color: rgba(96, 165, 250, 0.2);
    color: rgb(147, 197, 253);
    border-color: rgba(96, 165, 250, 0.4);
  }

  .dark .variable-unresolved {
    background-color: rgba(248, 113, 113, 0.2);
    color: rgb(252, 165, 165);
    border-color: rgba(248, 113, 113, 0.4);
  }

  /* Popup de modification de variable */
  .variable-edit-popup {
    position: fixed;
    z-index: 9999;
    background: var(--bg-primary, white);
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    padding: 12px;
    min-width: 200px;
  }

  .dark .variable-edit-popup {
    background: var(--bg-primary, #1f2937);
    border-color: var(--border-color, #374151);
  }

  .variable-edit-popup input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 6px;
    font-size: 14px;
    outline: none;
  }

  .variable-edit-popup input:focus {
    border-color: rgb(59, 130, 246);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .variable-edit-popup label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary, #6b7280);
    margin-bottom: 4px;
  }
`
