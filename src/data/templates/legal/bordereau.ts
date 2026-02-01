import type { DocumentTemplate } from '../../../types/templates'

/**
 * Template : Bordereau de communication de pièces
 *
 * Document listant les pièces produites dans une procédure judiciaire.
 * Conforme aux exigences du Code de procédure civile (art. 132 et s.)
 */
export const BORDEREAU_TEMPLATE: DocumentTemplate = {
  id: 'legal-bordereau',
  name: 'Bordereau de pièces',
  description: 'Liste numérotée des pièces produites à l\'appui des conclusions',
  category: 'legal',
  icon: 'list-ordered',
  version: '1.0.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isBuiltin: true,
  isCustom: false,
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'BORDEREAU DE COMMUNICATION DE PIÈCES' }],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'Affaire : ' },
          { type: 'text', text: '[Demandeur] c/ [Défendeur]' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'Devant : ' },
          { type: 'text', text: '[Juridiction]' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'RG n° : ' },
          { type: 'text', text: '[Numéro RG]' },
        ],
      },
      {
        type: 'horizontalRule',
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Pièces produites par [Partie]' }],
      },
      {
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableHeader',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'N°' }] }],
              },
              {
                type: 'tableHeader',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Désignation de la pièce' }] }],
              },
              {
                type: 'tableHeader',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Date' }] }],
              },
              {
                type: 'tableHeader',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Pages' }] }],
              },
            ],
          },
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: '1' }] }],
              },
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: '[Description pièce 1]' }] }],
              },
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: '[Date]' }] }],
              },
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: '1-3' }] }],
              },
            ],
          },
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: '2' }] }],
              },
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: '[Description pièce 2]' }] }],
              },
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: '[Date]' }] }],
              },
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: '4-5' }] }],
              },
            ],
          },
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: '3' }] }],
              },
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: '[Description pièce 3]' }] }],
              },
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: '[Date]' }] }],
              },
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: '6-8' }] }],
              },
            ],
          },
        ],
      },
      {
        type: 'paragraph',
        content: [],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Fait à [Ville], le [Date]' }],
      },
      {
        type: 'paragraph',
        content: [],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Pour [Partie],' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Son Conseil,' }],
      },
    ],
  },
  metadata: {
    defaultStyles: ['legal-title', 'legal-body'],
    suggestedLength: 'short',
    tags: ['juridique', 'bordereau', 'pièces', 'procédure', 'communication'],
  },
}

export default BORDEREAU_TEMPLATE
