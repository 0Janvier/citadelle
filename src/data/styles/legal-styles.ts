import type { TextStyle } from '../../types/templates'

/**
 * Styles typographiques pour le domaine juridique
 *
 * Ces styles suivent les conventions typographiques des documents
 * juridiques français (conclusions, assignations, jugements, etc.)
 *
 * Caractéristiques principales :
 * - Police Times New Roman (serif)
 * - Corps 12pt pour le texte principal
 * - Texte justifié avec alinéas
 * - Hiérarchie claire des titres (I, II, A, B, 1, 2)
 */

export const LEGAL_STYLES: TextStyle[] = [
  // ============================================
  // TITRES
  // ============================================
  {
    id: 'legal-title',
    name: 'Titre principal',
    shortcut: 'Mod-Alt-0',
    isBuiltin: true,
    category: 'headings',
    nodeType: 'heading',
    attrs: { level: 1 },
    formatting: {
      fontFamily: '"Times New Roman", Times, serif',
      fontSize: '14pt',
      fontWeight: '700',
      textTransform: 'uppercase',
      textAlign: 'center',
      letterSpacing: '0.05em',
      marginTop: '0',
      marginBottom: '1.5rem',
    },
  },
  {
    id: 'legal-heading-partie',
    name: 'Partie (I, II, III...)',
    shortcut: 'Mod-Alt-1',
    isBuiltin: true,
    category: 'headings',
    nodeType: 'heading',
    attrs: { level: 2 },
    formatting: {
      fontFamily: '"Times New Roman", Times, serif',
      fontSize: '12pt',
      fontWeight: '700',
      textTransform: 'uppercase',
      textAlign: 'left',
      marginTop: '1.5rem',
      marginBottom: '0.75rem',
    },
  },
  {
    id: 'legal-heading-section',
    name: 'Section (A, B, C...)',
    shortcut: 'Mod-Alt-2',
    isBuiltin: true,
    category: 'headings',
    nodeType: 'heading',
    attrs: { level: 3 },
    formatting: {
      fontFamily: '"Times New Roman", Times, serif',
      fontSize: '12pt',
      fontWeight: '700',
      fontStyle: 'normal',
      textAlign: 'left',
      marginTop: '1rem',
      marginBottom: '0.5rem',
    },
  },
  {
    id: 'legal-heading-point',
    name: 'Point (1, 2, 3...)',
    shortcut: 'Mod-Alt-3',
    isBuiltin: true,
    category: 'headings',
    nodeType: 'heading',
    attrs: { level: 4 },
    formatting: {
      fontFamily: '"Times New Roman", Times, serif',
      fontSize: '12pt',
      fontWeight: '700',
      fontStyle: 'italic',
      textAlign: 'left',
      marginTop: '0.75rem',
      marginBottom: '0.5rem',
    },
  },

  // ============================================
  // CORPS DE TEXTE
  // ============================================
  {
    id: 'legal-body',
    name: 'Corps juridique',
    shortcut: 'Mod-Alt-P',
    isBuiltin: true,
    category: 'body',
    nodeType: 'paragraph',
    formatting: {
      fontFamily: '"Times New Roman", Times, serif',
      fontSize: '12pt',
      lineHeight: '1.5',
      textAlign: 'justify',
      textIndent: '1.5cm',
      marginBottom: '0.5rem',
    },
  },
  {
    id: 'legal-body-no-indent',
    name: 'Corps sans alinéa',
    isBuiltin: true,
    category: 'body',
    nodeType: 'paragraph',
    formatting: {
      fontFamily: '"Times New Roman", Times, serif',
      fontSize: '12pt',
      lineHeight: '1.5',
      textAlign: 'justify',
      textIndent: '0',
      marginBottom: '0.5rem',
    },
  },
  {
    id: 'legal-parties',
    name: 'Identification des parties',
    isBuiltin: true,
    category: 'body',
    nodeType: 'paragraph',
    formatting: {
      fontFamily: '"Times New Roman", Times, serif',
      fontSize: '12pt',
      lineHeight: '1.4',
      textAlign: 'left',
      marginBottom: '0.25rem',
    },
  },

  // ============================================
  // BLOCS SPÉCIAUX
  // ============================================
  {
    id: 'legal-citation',
    name: 'Citation jurisprudence',
    shortcut: 'Mod-Alt-Q',
    isBuiltin: true,
    category: 'blocks',
    nodeType: 'blockquote',
    formatting: {
      fontFamily: '"Times New Roman", Times, serif',
      fontSize: '11pt',
      fontStyle: 'italic',
      lineHeight: '1.4',
      marginLeft: '2cm',
      marginRight: '2cm',
      marginTop: '0.75rem',
      marginBottom: '0.75rem',
      paddingLeft: '0.75rem',
      borderLeftWidth: '3px',
      borderLeftColor: '#4b5563',
      borderLeftStyle: 'solid',
    },
    darkMode: {
      borderLeftColor: '#9ca3af',
    },
  },
  {
    id: 'legal-visa',
    name: 'Visa (Vu l\'article...)',
    isBuiltin: true,
    category: 'body',
    nodeType: 'paragraph',
    formatting: {
      fontFamily: '"Times New Roman", Times, serif',
      fontSize: '12pt',
      fontStyle: 'italic',
      lineHeight: '1.4',
      textIndent: '0',
      marginBottom: '0.25rem',
    },
  },
  {
    id: 'legal-attendu',
    name: 'Attendu / Motif',
    isBuiltin: true,
    category: 'body',
    nodeType: 'paragraph',
    formatting: {
      fontFamily: '"Times New Roman", Times, serif',
      fontSize: '12pt',
      lineHeight: '1.5',
      textAlign: 'justify',
      textIndent: '0',
      marginBottom: '0.5rem',
    },
  },
  {
    id: 'legal-dispositif',
    name: 'Dispositif (Par ces motifs...)',
    isBuiltin: true,
    category: 'body',
    nodeType: 'paragraph',
    formatting: {
      fontFamily: '"Times New Roman", Times, serif',
      fontSize: '12pt',
      fontWeight: '700',
      lineHeight: '1.5',
      textAlign: 'justify',
      textIndent: '0',
      marginTop: '1rem',
      marginBottom: '0.5rem',
    },
  },

  // ============================================
  // ÉLÉMENTS DE PROCÉDURE
  // ============================================
  {
    id: 'legal-reference',
    name: 'Référence (RG, n°...)',
    isBuiltin: true,
    category: 'body',
    nodeType: 'paragraph',
    formatting: {
      fontFamily: '"Times New Roman", Times, serif',
      fontSize: '11pt',
      textAlign: 'right',
      marginBottom: '0.5rem',
    },
  },
  {
    id: 'legal-signature',
    name: 'Signature',
    isBuiltin: true,
    category: 'body',
    nodeType: 'paragraph',
    formatting: {
      fontFamily: '"Times New Roman", Times, serif',
      fontSize: '12pt',
      textAlign: 'right',
      marginTop: '2rem',
      marginBottom: '0.5rem',
    },
  },
  {
    id: 'legal-mention',
    name: 'Mention (Sous toutes réserves)',
    isBuiltin: true,
    category: 'body',
    nodeType: 'paragraph',
    formatting: {
      fontFamily: '"Times New Roman", Times, serif',
      fontSize: '10pt',
      fontStyle: 'italic',
      textAlign: 'right',
      marginTop: '1rem',
    },
  },

  // ============================================
  // PIÈCES ET BORDEREAUX
  // ============================================
  {
    id: 'legal-piece-numero',
    name: 'Numéro de pièce',
    isBuiltin: true,
    category: 'inline',
    nodeType: 'paragraph',
    formatting: {
      fontFamily: '"Times New Roman", Times, serif',
      fontSize: '12pt',
      fontWeight: '700',
    },
  },
  {
    id: 'legal-bordereau-header',
    name: 'En-tête bordereau',
    isBuiltin: true,
    category: 'headings',
    nodeType: 'heading',
    attrs: { level: 1 },
    formatting: {
      fontFamily: '"Times New Roman", Times, serif',
      fontSize: '14pt',
      fontWeight: '700',
      textTransform: 'uppercase',
      textAlign: 'center',
      letterSpacing: '0.1em',
      marginBottom: '1rem',
    },
  },
]

/**
 * Catégories de styles juridiques pour l'UI
 */
export const LEGAL_STYLE_CATEGORIES = [
  {
    id: 'headings',
    label: 'Titres',
    styles: ['legal-title', 'legal-heading-partie', 'legal-heading-section', 'legal-heading-point'],
  },
  {
    id: 'body',
    label: 'Corps de texte',
    styles: ['legal-body', 'legal-body-no-indent', 'legal-parties'],
  },
  {
    id: 'special',
    label: 'Blocs spéciaux',
    styles: ['legal-citation', 'legal-visa', 'legal-attendu', 'legal-dispositif'],
  },
  {
    id: 'procedure',
    label: 'Procédure',
    styles: ['legal-reference', 'legal-signature', 'legal-mention'],
  },
  {
    id: 'pieces',
    label: 'Pièces',
    styles: ['legal-piece-numero', 'legal-bordereau-header'],
  },
]

export default LEGAL_STYLES
