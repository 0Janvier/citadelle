import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import Link from '@tiptap/extension-link'
import { ResizableImage } from './ResizableImageExtension'
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
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import Color from '@tiptap/extension-color'
import { Extension } from '@tiptap/core'
import { KeyboardShortcutsExtension } from './KeyboardShortcutsExtension'
import { PageBreak } from './PageBreakExtension'
import { SlashCommandExtension, createSlashCommandSuggestion } from './SlashCommandExtension'
import { VariablePlaceholderExtension } from './VariablePlaceholderExtension'
import { LegalNumberingExtension } from './LegalNumberingExtension'
import { DefinedTermsExtension } from './DefinedTermsExtension'
import { FootnoteExtension } from './FootnoteExtension'
import { CommentExtension } from './CommentExtension'
import { InsertionMark, DeletionMark, TrackChangesExtension } from './TrackChangesExtension'
import { FrenchTypographyExtension } from './FrenchTypographyExtension'
import { PasteHandlerExtension } from './PasteHandlerExtension'
import { common, createLowlight } from 'lowlight'
import { useSnippetStore } from '../store/useSnippetStore'
import { useVariableStore } from '../store/useVariableStore'
import { useDefinedTermsStore } from '../store/useDefinedTermsStore'
import { searchAllCodes, formatArticleForInsertion, CODE_LABELS } from '../data/codes/index'
import type { Snippet } from '../types/editor-features'

// Format date in French (e.g., "7 fevrier 2026")
function formatDateFrench(date: Date): string {
  const mois = [
    'janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'
  ]
  return `${date.getDate()} ${mois[date.getMonth()]} ${date.getFullYear()}`
}

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

  // Smart typography with French guillemets « » (single quotes disabled to preserve apostrophe on AZERTY)
  Typography.configure({
    openDoubleQuote: '« ',
    closeDoubleQuote: ' »',
    openSingleQuote: false,
    closeSingleQuote: false,
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

  // Resizable image with alignment and drag handles
  ResizableImage.configure({
    inline: true,
    allowBase64: true,
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

  // Superscript (exposant) - ex: 1er, 2e, art. 700
  Superscript,

  // Subscript (indice)
  Subscript,

  // Text styling (required for font family, size, and color)
  TextStyle,

  // Text color (couleur de texte)
  Color.configure({
    types: ['textStyle'],
  }),

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

  // Slash commands for snippets (/plaise, /attendu, etc.) + articles de code + blocs
  SlashCommandExtension.configure({
    suggestion: createSlashCommandSuggestion(
      (query) => {
        // Commandes de blocs intégrées (toujours disponibles)
        const builtinBlocks: Snippet[] = [
          { id: 'block-title', nom: 'Titre du document', description: 'Titre principal sans numerotation', raccourci: '/titre',
            contenu: { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: ' ' }] },
            category: 'general', variables: [], isBuiltin: true, usageCount: 0, createdAt: '', updatedAt: '' },
          { id: 'block-h1', nom: 'Titre 1', description: 'Partie principale (I., II.)', raccourci: '/h1',
            contenu: { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: ' ' }] },
            category: 'general', variables: [], isBuiltin: true, usageCount: 0, createdAt: '', updatedAt: '' },
          { id: 'block-h2', nom: 'Titre 2', description: 'Section (A., B.)', raccourci: '/h2',
            contenu: { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: ' ' }] },
            category: 'general', variables: [], isBuiltin: true, usageCount: 0, createdAt: '', updatedAt: '' },
          { id: 'block-h3', nom: 'Titre 3', description: 'Point (1., 2.)', raccourci: '/h3',
            contenu: { type: 'heading', attrs: { level: 4 }, content: [{ type: 'text', text: ' ' }] },
            category: 'general', variables: [], isBuiltin: true, usageCount: 0, createdAt: '', updatedAt: '' },
          { id: 'block-bullet', nom: 'Liste a puces', description: 'Liste non ordonnee', raccourci: '/liste',
            contenu: { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: ' ' }] }] }] },
            category: 'general', variables: [], isBuiltin: true, usageCount: 0, createdAt: '', updatedAt: '' },
          { id: 'block-ordered', nom: 'Liste numerotee', description: 'Liste ordonnee', raccourci: '/num',
            contenu: { type: 'orderedList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: ' ' }] }] }] },
            category: 'general', variables: [], isBuiltin: true, usageCount: 0, createdAt: '', updatedAt: '' },
          { id: 'block-task', nom: 'Liste de taches', description: 'Cases a cocher', raccourci: '/tache',
            contenu: { type: 'taskList', content: [{ type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: ' ' }] }] }] },
            category: 'general', variables: [], isBuiltin: true, usageCount: 0, createdAt: '', updatedAt: '' },
          { id: 'block-quote', nom: 'Citation', description: 'Bloc de citation', raccourci: '/citation',
            contenu: { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: ' ' }] }] },
            category: 'general', variables: [], isBuiltin: true, usageCount: 0, createdAt: '', updatedAt: '' },
          { id: 'block-code', nom: 'Bloc de code', description: 'Code formate', raccourci: '/code',
            contenu: { type: 'codeBlock', content: [{ type: 'text', text: ' ' }] },
            category: 'general', variables: [], isBuiltin: true, usageCount: 0, createdAt: '', updatedAt: '' },
          { id: 'block-hr', nom: 'Ligne horizontale', description: 'Separateur', raccourci: '/hr',
            contenu: { type: 'horizontalRule' },
            category: 'general', variables: [], isBuiltin: true, usageCount: 0, createdAt: '', updatedAt: '' },
          { id: 'block-table', nom: 'Tableau', description: 'Tableau 3x3', raccourci: '/tableau',
            contenu: { type: 'table', content: [
              { type: 'tableRow', content: [
                { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: ' ' }] }] },
                { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: ' ' }] }] },
                { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: ' ' }] }] },
              ]},
              { type: 'tableRow', content: [
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: ' ' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: ' ' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: ' ' }] }] },
              ]},
            ]},
            category: 'general', variables: [], isBuiltin: true, usageCount: 0, createdAt: '', updatedAt: '' },
          { id: 'block-pagebreak', nom: 'Saut de page', description: 'Nouvelle page', raccourci: '/page',
            contenu: { type: 'pageBreak' },
            category: 'general', variables: [], isBuiltin: true, usageCount: 0, createdAt: '', updatedAt: '' },
          // Commandes juridiques pratiques
          { id: 'block-date', nom: 'Date du jour', description: 'Insere la date en francais', raccourci: '/date',
            contenu: { type: 'text', text: formatDateFrench(new Date()) },
            category: 'general', variables: [], isBuiltin: true, usageCount: 0, createdAt: '', updatedAt: '' },
          { id: 'block-footnote', nom: 'Note de bas de page', description: 'Inserer une note', raccourci: '/note',
            contenu: { type: 'text', text: '' }, // Handled specially in onSelect
            category: 'general', variables: [], isBuiltin: true, usageCount: 0, createdAt: '', updatedAt: '' },
          { id: 'block-signature', nom: 'Bloc signature', description: 'Signature avocat', raccourci: '/signe',
            contenu: { type: 'doc', content: [
              { type: 'paragraph', content: [{ type: 'text', text: ' ' }] },
              { type: 'paragraph', attrs: { textAlign: 'right' }, content: [{ type: 'text', text: '{{avocat.cabinet}}' }] },
              { type: 'paragraph', attrs: { textAlign: 'right' }, content: [{ type: 'text', text: '{{avocat.prenom}} {{avocat.nom}}' }] },
              { type: 'paragraph', attrs: { textAlign: 'right' }, content: [{ type: 'text', text: 'Avocat au Barreau de {{avocat.barreau}}' }] },
            ]},
            category: 'general', variables: [], isBuiltin: true, usageCount: 0, createdAt: '', updatedAt: '' },
          { id: 'block-client', nom: 'Coordonnees client', description: 'Bloc client avec variables', raccourci: '/client',
            contenu: { type: 'doc', content: [
              { type: 'paragraph', content: [{ type: 'text', text: '{{client.civilite}} {{client.nom}} {{client.prenom}}' }] },
              { type: 'paragraph', content: [{ type: 'text', text: '{{client.adresse}}' }] },
              { type: 'paragraph', content: [{ type: 'text', text: '{{client.code_postal}} {{client.ville}}' }] },
            ]},
            category: 'general', variables: [], isBuiltin: true, usageCount: 0, createdAt: '', updatedAt: '' },
          { id: 'block-adverse', nom: 'Coordonnees adverse', description: 'Bloc partie adverse', raccourci: '/adverse',
            contenu: { type: 'doc', content: [
              { type: 'paragraph', content: [{ type: 'text', text: '{{adverse.civilite}} {{adverse.nom}} {{adverse.prenom}}' }] },
              { type: 'paragraph', content: [{ type: 'text', text: '{{adverse.adresse}}' }] },
              { type: 'paragraph', content: [{ type: 'text', text: '{{adverse.code_postal}} {{adverse.ville}}' }] },
            ]},
            category: 'general', variables: [], isBuiltin: true, usageCount: 0, createdAt: '', updatedAt: '' },
          // /toc - Table des matieres
          { id: 'block-toc', nom: 'Table des matieres', description: 'Inserer la table des matieres du document', raccourci: '/toc',
            contenu: { type: 'text', text: '' }, // special: handled in onSelect
            category: 'general', variables: [], isBuiltin: true, usageCount: 0, createdAt: '', updatedAt: '' },
        ]

        // Regular snippet suggestions
        const snippets = useSnippetStore.getState().getSuggestions(query)

        // Variable suggestions (when query starts with 'var')
        const isVarQuery = /^var/i.test(query)
        if (isVarQuery) {
          const varQuery = query.replace(/^var\s*/i, '').toLowerCase()
          const defs = useVariableStore.getState().definitions
          const varSnippets: Snippet[] = defs
            .filter((d) => !varQuery || d.label.toLowerCase().includes(varQuery) || d.key.toLowerCase().includes(varQuery))
            .slice(0, 10)
            .map((d) => ({
              id: `var-${d.key}`,
              nom: d.label,
              description: `{{${d.key}}}`,
              raccourci: `/var ${d.key}`,
              contenu: { type: 'text', text: `{{${d.key}}}` },
              category: 'general' as const,
              variables: [],
              isBuiltin: true,
              usageCount: 0,
              createdAt: '',
              updatedAt: '',
            }))
          if (varSnippets.length > 0) {
            return [...snippets, ...varSnippets]
          }
        }

        // If query starts with 'art' or is a number, also search legal codes
        const isArticleQuery = /^(art|Art|ART|\d)/.test(query)
        if (isArticleQuery && query.length >= 2) {
          const articleQuery = query.replace(/^art\s*/i, '').trim()
          if (articleQuery.length > 0) {
            const articles = searchAllCodes(articleQuery).slice(0, 5)
            const articleSnippets: Snippet[] = articles.map((article) => ({
              id: `code-${article.code}-${article.numero}`,
              nom: `Art. ${article.numero} ${CODE_LABELS[article.code]}`,
              description: article.titre || article.contenu.slice(0, 60) + '...',
              raccourci: `/art${article.numero}`,
              contenu: formatArticleForInsertion(article, article.code),
              category: 'general' as const,
              variables: [],
              isBuiltin: true,
              usageCount: 0,
              createdAt: '',
              updatedAt: '',
            }))
            return [...snippets, ...articleSnippets]
          }
        }

        // Filtrer les blocs intégrés par query
        const lowerQuery = query.toLowerCase()
        const matchingBlocks = builtinBlocks.filter((b) => {
          if (!query) return true // "/" seul → tout montrer
          return b.nom.toLowerCase().includes(lowerQuery) ||
                 b.raccourci.toLowerCase().includes('/' + lowerQuery) ||
                 (b.description || '').toLowerCase().includes(lowerQuery)
        })

        return [...snippets, ...matchingBlocks]
      },
      (item) => {
        // Only increment usage for real snippets (not builtin blocks or article results)
        if (!item.id.startsWith('code-') && !item.id.startsWith('block-')) {
          useSnippetStore.getState().incrementUsage(item.id)
        }
      }
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

  // Legal numbering (I., A., 1., a.) - reads config dynamically from useSettingsStore
  LegalNumberingExtension.configure({
    enabled: true,
  }),

  // Footnotes (notes de bas de page pour citations juridiques)
  FootnoteExtension,

  // Comments (commentaires et annotations)
  CommentExtension,

  // Track changes marks and controller
  InsertionMark,
  DeletionMark,
  TrackChangesExtension,

  // French typography: auto NBSP before : ; ? ! and around guillemets
  FrenchTypographyExtension.configure({
    enabled: true, // reads dynamically from useSettingsStore in the plugin
  }),

  // Paste as plain text handler (Cmd+Shift+V)
  PasteHandlerExtension,

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
