// Extension TipTap pour la numérotation juridique automatique
// Permet d'utiliser les styles de numérotation I., A., 1., a.

import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface LegalNumberingOptions {
  enabled: boolean
  styles: NumberingStyle[]
}

export type NumberingLevel = 1 | 2 | 3 | 4 | 5 | 6

export interface NumberingStyle {
  level: NumberingLevel
  format: 'roman_upper' | 'roman_lower' | 'letter_upper' | 'letter_lower' | 'number' | 'number_paren'
  suffix: string // Ex: "." ou ")" ou "°"
}

// Styles de numérotation juridique par défaut
export const DEFAULT_LEGAL_NUMBERING: NumberingStyle[] = [
  { level: 1, format: 'roman_upper', suffix: '.' },    // I. II. III.
  { level: 2, format: 'letter_upper', suffix: '.' },   // A. B. C.
  { level: 3, format: 'number', suffix: '.' },          // 1. 2. 3.
  { level: 4, format: 'letter_lower', suffix: ')' },   // a) b) c)
  { level: 5, format: 'roman_lower', suffix: ')' },    // i) ii) iii)
  { level: 6, format: 'number_paren', suffix: ')' },   // 1) 2) 3)
]

const legalNumberingPluginKey = new PluginKey('legalNumbering')

// Conversion en chiffres romains
function toRoman(num: number, uppercase = true): string {
  const romanNumerals: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ]

  let result = ''
  for (const [value, symbol] of romanNumerals) {
    while (num >= value) {
      result += symbol
      num -= value
    }
  }

  return uppercase ? result : result.toLowerCase()
}

// Conversion en lettres
function toLetter(num: number, uppercase = true): string {
  if (num < 1 || num > 26) {
    // Pour les nombres > 26, on utilise AA, AB, etc.
    const first = Math.floor((num - 1) / 26)
    const second = ((num - 1) % 26) + 1
    const letters = first > 0
      ? String.fromCharCode(64 + first) + String.fromCharCode(64 + second)
      : String.fromCharCode(64 + second)
    return uppercase ? letters : letters.toLowerCase()
  }

  const letter = String.fromCharCode(64 + num)
  return uppercase ? letter : letter.toLowerCase()
}

// Formater un numéro selon le style
export function formatNumber(num: number, style: NumberingStyle): string {
  let formatted: string

  switch (style.format) {
    case 'roman_upper':
      formatted = toRoman(num, true)
      break
    case 'roman_lower':
      formatted = toRoman(num, false)
      break
    case 'letter_upper':
      formatted = toLetter(num, true)
      break
    case 'letter_lower':
      formatted = toLetter(num, false)
      break
    case 'number':
      formatted = String(num)
      break
    case 'number_paren':
      formatted = String(num)
      break
    default:
      formatted = String(num)
  }

  return formatted + style.suffix
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    legalNumbering: {
      insertLegalHeading: (level: NumberingLevel) => ReturnType
      resetNumbering: () => ReturnType
    }
  }
}

export const LegalNumberingExtension = Extension.create<LegalNumberingOptions>({
  name: 'legalNumbering',

  addOptions() {
    return {
      enabled: true,
      styles: DEFAULT_LEGAL_NUMBERING,
    }
  },

  addStorage() {
    return {
      counters: [0, 0, 0, 0, 0, 0] as number[],
    }
  },

  addCommands() {
    return {
      insertLegalHeading:
        (level: NumberingLevel) =>
        ({ commands }) => {
          const { styles } = this.options
          const style = styles.find((s) => s.level === level)
          if (!style) return false

          // Incrémenter le compteur du niveau actuel
          this.storage.counters[level - 1]++

          // Réinitialiser les compteurs des niveaux inférieurs
          for (let i = level; i < 6; i++) {
            this.storage.counters[i] = 0
          }

          const number = formatNumber(this.storage.counters[level - 1], style)

          // Insérer le heading avec le numéro
          return commands.insertContent({
            type: 'heading',
            attrs: { level: Math.min(level + 1, 6) }, // Mapper vers H2-H6
            content: [
              {
                type: 'text',
                text: `${number} `,
              },
            ],
          })
        },

      resetNumbering:
        () =>
        ({}) => {
          this.storage.counters = [0, 0, 0, 0, 0, 0]
          return true
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      // Ctrl+Shift+1 à 6 pour insérer les niveaux
      'Mod-Shift-1': () => this.editor.commands.insertLegalHeading(1),
      'Mod-Shift-2': () => this.editor.commands.insertLegalHeading(2),
      'Mod-Shift-3': () => this.editor.commands.insertLegalHeading(3),
      'Mod-Shift-4': () => this.editor.commands.insertLegalHeading(4),
      'Mod-Shift-5': () => this.editor.commands.insertLegalHeading(5),
      'Mod-Shift-6': () => this.editor.commands.insertLegalHeading(6),
    }
  },

  addProseMirrorPlugins() {
    const { enabled, styles } = this.options

    if (!enabled) return []

    return [
      new Plugin({
        key: legalNumberingPluginKey,

        props: {
          decorations(state) {
            if (!enabled) return DecorationSet.empty

            const { doc } = state
            const decorations: Decoration[] = []

            // Compteurs pour chaque niveau
            const counters = [0, 0, 0, 0, 0, 0]

            doc.descendants((node, pos) => {
              if (node.type.name === 'heading') {
                const headingLevel = node.attrs.level as number
                const mappedLevel = headingLevel - 1 // H2 = niveau 1, etc.

                if (mappedLevel >= 1 && mappedLevel <= 6) {
                  const style = styles.find((s) => s.level === mappedLevel)
                  if (style) {
                    // Incrémenter le compteur
                    counters[mappedLevel - 1]++

                    // Réinitialiser les niveaux inférieurs
                    for (let i = mappedLevel; i < 6; i++) {
                      counters[i] = 0
                    }

                    const number = formatNumber(counters[mappedLevel - 1], style)

                    // Ajouter une décoration pour afficher le numéro
                    decorations.push(
                      Decoration.widget(pos + 1, () => {
                        const span = document.createElement('span')
                        span.className = 'legal-numbering'
                        span.textContent = number + ' '
                        span.style.cssText = `
                          font-weight: bold;
                          margin-right: 0.5em;
                          color: var(--text-primary);
                        `
                        return span
                      })
                    )
                  }
                }
              }
            })

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  },
})

// Composant pour insérer la numérotation depuis la toolbar
export const legalNumberingButtons = [
  { level: 1 as NumberingLevel, label: 'I.', description: 'Partie principale' },
  { level: 2 as NumberingLevel, label: 'A.', description: 'Section' },
  { level: 3 as NumberingLevel, label: '1.', description: 'Point' },
  { level: 4 as NumberingLevel, label: 'a)', description: 'Sous-point' },
  { level: 5 as NumberingLevel, label: 'i)', description: 'Détail' },
]
