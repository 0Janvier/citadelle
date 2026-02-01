// Extension TipTap pour détecter et surligner les termes définis
import { Extension, Mark } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'

// ============================================================================
// Types
// ============================================================================

export interface DefinedTermDecoration {
  term: string
  normalizedTerm: string
  type: 'definition' | 'usage'
  from: number
  to: number
  termId?: string
}

export interface DefinedTermsOptions {
  // Callback quand un terme est cliqué
  onTermClick?: (term: DefinedTermDecoration, event: MouseEvent) => void
  // Callback pour obtenir les termes définis actuels
  getDefinedTerms?: () => Map<string, { term: string; termId: string; definition: string }>
  // Activer/désactiver la détection
  enabled?: boolean
}

// ============================================================================
// Patterns de détection
// ============================================================================

// Patterns pour les définitions (où le terme est défini)
// Note: Les guillemets français « » sont privilégiés (Typography convertit " → « »)
const DEFINITION_PATTERNS = [
  // « le Vendeur » - guillemets français (pattern principal)
  { regex: /«\s*([^»]+)\s*»/g, type: 'definition' as const },
  // (ci-après « le Vendeur ») - définition explicite avec guillemets français
  { regex: /\(ci-après\s*«\s*([^»]+)\s*»\s*\)/gi, type: 'definition' as const },
  // (ci-après dénommé « le Vendeur ») - définition explicite longue
  { regex: /\(ci-après\s+dénommé[e]?\s*«\s*([^»]+)\s*»\s*\)/gi, type: 'definition' as const },
  // (le « Vendeur ») ou (la « Société »)
  { regex: /\(l[ea]\s*«\s*([^»]+)\s*»\s*\)/gi, type: 'definition' as const },
]

// ============================================================================
// Mark pour les termes définis (optionnel, pour persistance)
// ============================================================================

export const DefinedTermMark = Mark.create({
  name: 'definedTerm',

  addAttributes() {
    return {
      termId: {
        default: null,
      },
      type: {
        default: 'usage', // 'definition' ou 'usage'
      },
      term: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-defined-term]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      {
        ...HTMLAttributes,
        'data-defined-term': HTMLAttributes.term,
        'data-term-type': HTMLAttributes.type,
        class: `defined-term defined-term-${HTMLAttributes.type}`,
      },
      0,
    ]
  },
})

// ============================================================================
// Plugin Key
// ============================================================================

const definedTermsPluginKey = new PluginKey('definedTerms')

// ============================================================================
// Helper Functions
// ============================================================================

function normalizeTerm(term: string): string {
  return term
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^(le|la|les|l'|un|une|des|du|de la|de l')\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function findDefinitions(doc: ProseMirrorNode): DefinedTermDecoration[] {
  const decorations: DefinedTermDecoration[] = []
  const seenTerms = new Set<string>()

  doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return

    const text = node.text

    for (const pattern of DEFINITION_PATTERNS) {
      pattern.regex.lastIndex = 0
      let match

      while ((match = pattern.regex.exec(text)) !== null) {
        const term = match[1].trim()
        const normalized = normalizeTerm(term)

        // Éviter les doublons dans le même document
        const key = `${normalized}-${pos + match.index}`
        if (seenTerms.has(key)) continue
        seenTerms.add(key)

        decorations.push({
          term,
          normalizedTerm: normalized,
          type: 'definition',
          from: pos + match.index,
          to: pos + match.index + match[0].length,
        })
      }
    }
  })

  return decorations
}

function findUsages(
  doc: ProseMirrorNode,
  definedTerms: Map<string, { term: string; termId: string }>,
  definitions: DefinedTermDecoration[]
): DefinedTermDecoration[] {
  const usages: DefinedTermDecoration[] = []
  const definitionPositions = new Set(definitions.map((d) => `${d.from}-${d.to}`))

  doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return

    const text = node.text

    for (const [normalized, { term, termId }] of definedTerms) {
      // Rechercher le terme (insensible à la casse)
      const regex = new RegExp(`\\b${escapeRegex(term)}\\b`, 'gi')
      let match

      while ((match = regex.exec(text)) !== null) {
        const from = pos + match.index
        const to = from + match[0].length

        // Ne pas décorer si c'est une définition
        if (definitionPositions.has(`${from}-${to}`)) continue

        // Vérifier que ce n'est pas à l'intérieur d'une définition (guillemets)
        const beforeChar = text[match.index - 1]
        const afterChar = text[match.index + match[0].length]
        if ((beforeChar === '«' || beforeChar === '"') && (afterChar === '»' || afterChar === '"')) {
          continue
        }

        usages.push({
          term: match[0],
          normalizedTerm: normalized,
          type: 'usage',
          from,
          to,
          termId,
        })
      }
    }
  })

  return usages
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ============================================================================
// Extension
// ============================================================================

export const DefinedTermsExtension = Extension.create<DefinedTermsOptions>({
  name: 'definedTerms',

  addOptions() {
    return {
      onTermClick: undefined,
      getDefinedTerms: () => new Map(),
      enabled: true,
    }
  },

  addProseMirrorPlugins() {
    const options = this.options

    return [
      new Plugin({
        key: definedTermsPluginKey,

        state: {
          init(_, { doc }) {
            if (!options.enabled) return DecorationSet.empty

            const definitions = findDefinitions(doc)
            const definedTerms = options.getDefinedTerms?.() || new Map()

            // Ajouter les définitions trouvées dans le document au Map
            for (const def of definitions) {
              if (!definedTerms.has(def.normalizedTerm)) {
                definedTerms.set(def.normalizedTerm, {
                  term: def.term,
                  termId: `local-${def.from}`,
                })
              }
            }

            const usages = findUsages(doc, definedTerms, definitions)
            const allDecorations = [...definitions, ...usages]

            const decorations = allDecorations.map((item) => {
              const classes = [
                'defined-term-decoration',
                item.type === 'definition'
                  ? 'defined-term-definition'
                  : 'defined-term-usage',
              ].join(' ')

              return Decoration.inline(item.from, item.to, {
                class: classes,
                'data-term': item.term,
                'data-term-type': item.type,
                'data-term-id': item.termId || '',
              })
            })

            return DecorationSet.create(doc, decorations)
          },

          apply(tr, oldDecorations, _oldState, newState) {
            if (!options.enabled) return DecorationSet.empty

            // Si le document a changé, recalculer les décorations
            if (tr.docChanged) {
              const definitions = findDefinitions(newState.doc)
              const definedTerms = options.getDefinedTerms?.() || new Map()

              for (const def of definitions) {
                if (!definedTerms.has(def.normalizedTerm)) {
                  definedTerms.set(def.normalizedTerm, {
                    term: def.term,
                    termId: `local-${def.from}`,
                  })
                }
              }

              const usages = findUsages(newState.doc, definedTerms, definitions)
              const allDecorations = [...definitions, ...usages]

              const decorations = allDecorations.map((item) => {
                const classes = [
                  'defined-term-decoration',
                  item.type === 'definition'
                    ? 'defined-term-definition'
                    : 'defined-term-usage',
                ].join(' ')

                return Decoration.inline(item.from, item.to, {
                  class: classes,
                  'data-term': item.term,
                  'data-term-type': item.type,
                  'data-term-id': item.termId || '',
                })
              })

              return DecorationSet.create(newState.doc, decorations)
            }

            // Mapper les anciennes décorations à travers la transaction
            return oldDecorations.map(tr.mapping, tr.doc)
          },
        },

        props: {
          decorations(state) {
            return this.getState(state)
          },

          handleClick(_view, pos, event) {
            if (!options.onTermClick) return false

            // Vérifier si on a cliqué sur un terme défini
            const target = event.target as HTMLElement
            if (!target.classList.contains('defined-term-decoration')) return false

            const term = target.getAttribute('data-term')
            const type = target.getAttribute('data-term-type') as 'definition' | 'usage'
            const termId = target.getAttribute('data-term-id')

            if (term) {
              // Vérifier si Cmd/Ctrl est pressé pour navigation
              const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
              const modifierPressed = isMac ? event.metaKey : event.ctrlKey

              if (modifierPressed || type === 'usage') {
                options.onTermClick(
                  {
                    term,
                    normalizedTerm: normalizeTerm(term),
                    type,
                    from: pos,
                    to: pos + term.length,
                    termId: termId || undefined,
                  },
                  event
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

// ============================================================================
// CSS (à ajouter dans le fichier de styles)
// ============================================================================

/*
.defined-term-decoration {
  cursor: pointer;
  border-radius: 2px;
  transition: background-color 0.15s ease;
}

.defined-term-definition {
  background-color: rgba(59, 130, 246, 0.15);
  border-bottom: 2px solid rgba(59, 130, 246, 0.5);
}

.defined-term-definition:hover {
  background-color: rgba(59, 130, 246, 0.25);
}

.defined-term-usage {
  background-color: rgba(34, 197, 94, 0.1);
  border-bottom: 1px dashed rgba(34, 197, 94, 0.5);
}

.defined-term-usage:hover {
  background-color: rgba(34, 197, 94, 0.2);
}

.dark .defined-term-definition {
  background-color: rgba(59, 130, 246, 0.2);
}

.dark .defined-term-usage {
  background-color: rgba(34, 197, 94, 0.15);
}
*/

export default DefinedTermsExtension
