import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import { Extension } from '@tiptap/core'
import { KeyboardShortcutsExtension } from './KeyboardShortcutsExtension'
import { PageBreak } from './PageBreakExtension'
import { SlashCommandExtension, createSlashCommandSuggestion } from './SlashCommandExtension'
import { VariablePlaceholderExtension } from './VariablePlaceholderExtension'
import { LegalNumberingExtension } from './LegalNumberingExtension'
import { DefinedTermsExtension } from './DefinedTermsExtension'
import { common, createLowlight } from 'lowlight'
import { useSnippetStore } from '../store/useSnippetStore'
import { useVariableStore } from '../store/useVariableStore'
import { useDefinedTermsStore } from '../store/useDefinedTermsStore'

// Déclaration des types pour les commandes de police
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontFamily: {
      setFontFamily: (fontFamily: string) => ReturnType
      unsetFontFamily: () => ReturnType
    }
  }
}

// Create lowlight instance with common languages
const lowlight = createLowlight(common)

// Extension personnalisée pour la taille de police
// Ajoute l'attribut fontSize au mark TextStyle
const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.fontSize?.replace(/['"]+/g, ''),
            renderHTML: (attributes: { fontSize?: string }) => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },
})

// TipTap extensions configuration
export const extensions = [
  // StarterKit includes: Bold, Italic, Strike, Code, Paragraph, Text, Heading, etc.
  StarterKit.configure({
    history: {
      depth: 100, // Unlimited undo/redo for current session
    },
    codeBlock: false, // Disable default code block to use CodeBlockLowlight instead
  }),

  // Placeholder text when editor is empty
  Placeholder.configure({
    placeholder: 'Commencez à écrire...',
    emptyEditorClass: 'is-editor-empty',
  }),

  // Smart typography with French guillemets « »
  Typography.configure({
    openDoubleQuote: '« ',
    closeDoubleQuote: ' »',
    openSingleQuote: '‹ ',
    closeSingleQuote: ' ›',
  }),

  // Clickable links
  Link.configure({
    openOnClick: true,
    HTMLAttributes: {
      class: 'text-blue-500 hover:underline dark:text-blue-400',
    },
    protocols: ['http', 'https', 'mailto'],
    autolink: true, // Auto-detect URLs
  }),

  // Image support
  Image.configure({
    inline: true,
    allowBase64: true,
    HTMLAttributes: {
      class: 'max-w-full h-auto rounded-lg',
    },
  }),

  // Tables
  Table.configure({
    resizable: true,
    HTMLAttributes: {
      class: 'border-collapse table-auto w-full',
    },
  }),
  TableRow,
  TableHeader.configure({
    HTMLAttributes: {
      class: 'border border-gray-300 dark:border-gray-600 px-3 py-2 bg-gray-100 dark:bg-gray-800 font-bold',
    },
  }),
  TableCell.configure({
    HTMLAttributes: {
      class: 'border border-gray-300 dark:border-gray-600 px-3 py-2',
    },
  }),

  // Task lists (checkboxes)
  TaskList.configure({
    HTMLAttributes: {
      class: 'list-none pl-0',
    },
  }),
  TaskItem.configure({
    nested: true,
    HTMLAttributes: {
      class: 'flex items-start gap-2',
    },
  }),

  // Code blocks with syntax highlighting
  CodeBlockLowlight.configure({
    lowlight,
    HTMLAttributes: {
      class: 'bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm overflow-x-auto',
    },
  }),

  // Highlight (surbrillance) - multicolor enabled for color picker
  Highlight.configure({
    multicolor: true,
  }),

  // Underline (souligné)
  Underline,

  // Text styling (required for font family and size)
  TextStyle,

  // Font family (police de caractères)
  FontFamily.configure({
    types: ['textStyle'],
  }),

  // Font size (taille de police)
  FontSize,

  // Text alignment (justification par défaut)
  TextAlign.configure({
    types: ['heading', 'paragraph'],
    alignments: ['left', 'center', 'right', 'justify'],
    defaultAlignment: 'justify',
  }),

  // Custom keyboard shortcuts
  KeyboardShortcutsExtension,

  // Page breaks for pagination
  PageBreak,

  // Slash commands for snippets (/plaise, /attendu, etc.)
  SlashCommandExtension.configure({
    suggestion: createSlashCommandSuggestion(
      (query) => useSnippetStore.getState().getSuggestions(query),
      (item) => useSnippetStore.getState().incrementUsage(item.id)
    ),
  }),

  // Variable placeholders ({{client.nom}}, {{dossier.rg}}, etc.)
  VariablePlaceholderExtension.configure({
    getVariableValue: (key) => useVariableStore.getState().getResolvedValue(key),
    onVariableClick: (key) => {
      // Will be handled by the VariablePanel
      console.log('Variable clicked:', key)
    },
  }),

  // Legal numbering (I., A., 1., a.)
  LegalNumberingExtension.configure({
    enabled: true,
  }),

  // Defined terms detection and highlighting
  DefinedTermsExtension.configure({
    enabled: true,
    getDefinedTerms: () => {
      const terms = useDefinedTermsStore.getState().terms
      const map = new Map<string, { term: string; termId: string; definition: string }>()
      for (const t of terms) {
        map.set(t.normalizedTerm, {
          term: t.term,
          termId: t.id,
          definition: t.definition,
        })
      }
      return map
    },
    onTermClick: (term, event) => {
      // Dispatch custom event for handling in React
      window.dispatchEvent(
        new CustomEvent('defined-term-click', {
          detail: { term, event },
        })
      )
    },
  }),
]
