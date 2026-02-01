import { Node, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageBreak: {
      /**
       * Insère un saut de page manuel
       */
      setPageBreak: () => ReturnType
    }
  }
}

/**
 * Extension TipTap pour gérer les sauts de page manuels
 *
 * Utilisation:
 * - Raccourci: Cmd+Enter (Mac) ou Ctrl+Enter (Windows/Linux)
 * - Commande: editor.commands.setPageBreak()
 *
 * Le saut de page est rendu comme un bloc avec une ligne pointillée
 * et le texte "Saut de page". En mode impression/PDF, il force un
 * saut de page via CSS.
 */
export const PageBreak = Node.create({
  name: 'pageBreak',

  group: 'block',

  // Le noeud est atomique (ne peut pas contenir d'autres noeuds)
  atom: true,

  // Ne peut pas être sélectionné comme texte
  selectable: true,

  // Peut être déplacé par drag and drop
  draggable: true,

  addAttributes() {
    return {
      // Optionnel: attribut pour stocker des métadonnées
      label: {
        default: 'Saut de page',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-page-break]',
      },
      {
        tag: 'hr.page-break',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-page-break': '',
        class: 'page-break',
        contenteditable: 'false',
      }),
      [
        'div',
        { class: 'page-break-line' },
      ],
      [
        'span',
        { class: 'page-break-label' },
        HTMLAttributes.label || 'Saut de page',
      ],
    ]
  },

  addCommands() {
    return {
      setPageBreak:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              label: 'Saut de page',
            },
          })
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      // Cmd+Enter sur Mac, Ctrl+Enter sur Windows/Linux
      'Mod-Enter': () => this.editor.commands.setPageBreak(),
    }
  },
})

/**
 * CSS à ajouter au fichier de styles de l'éditeur:
 *
 * .page-break {
 *   position: relative;
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   margin: 1.5rem 0;
 *   padding: 0.5rem 0;
 *   cursor: pointer;
 *   user-select: none;
 * }
 *
 * .page-break-line {
 *   position: absolute;
 *   left: 0;
 *   right: 0;
 *   top: 50%;
 *   border-top: 2px dashed #d1d5db;
 * }
 *
 * .dark .page-break-line {
 *   border-top-color: #4b5563;
 * }
 *
 * .page-break-label {
 *   position: relative;
 *   padding: 0.25rem 0.75rem;
 *   background: var(--bg, white);
 *   color: #9ca3af;
 *   font-size: 0.75rem;
 *   font-weight: 500;
 *   text-transform: uppercase;
 *   letter-spacing: 0.05em;
 *   border-radius: 4px;
 * }
 *
 * .page-break:hover .page-break-label {
 *   color: #6b7280;
 * }
 *
 * .page-break.ProseMirror-selectednode {
 *   outline: 2px solid var(--accent, #3b82f6);
 *   outline-offset: 2px;
 *   border-radius: 4px;
 * }
 *
 * @media print {
 *   .page-break {
 *     display: block;
 *     page-break-after: always;
 *     break-after: page;
 *     visibility: hidden;
 *     height: 0;
 *     margin: 0;
 *     padding: 0;
 *   }
 *
 *   .page-break-line,
 *   .page-break-label {
 *     display: none;
 *   }
 * }
 */

export default PageBreak
