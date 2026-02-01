import type { DocumentTemplate } from '../../../types/templates'

/**
 * Template : Requête au Juge
 *
 * Requête unilatérale adressée au juge (ordonnance sur requête,
 * mesures conservatoires, etc.) conforme aux articles 493 et suivants
 * du Code de procédure civile.
 */
export const REQUETE_TEMPLATE: DocumentTemplate = {
  id: 'legal-requete',
  name: 'Requête',
  description: 'Requête unilatérale adressée au Juge',
  category: 'legal',
  icon: 'file-check',
  version: '1.0.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isBuiltin: true,
  isCustom: false,
  content: {
    type: 'doc',
    content: [
      // En-tête
      {
        type: 'paragraph',
        attrs: { textAlign: 'right' },
        content: [
          { type: 'text', text: '[Ville], le [Date]' },
        ],
      },
      {
        type: 'paragraph',
        content: [],
      },
      {
        type: 'paragraph',
        attrs: { textAlign: 'center' },
        content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'REQUÊTE' },
        ],
      },
      {
        type: 'paragraph',
        attrs: { textAlign: 'center' },
        content: [
          { type: 'text', text: 'aux fins de [objet de la requête]' },
        ],
      },
      {
        type: 'paragraph',
        attrs: { textAlign: 'center' },
        content: [
          { type: 'text', marks: [{ type: 'italic' }], text: '(Articles 493 et suivants du Code de procédure civile)' },
        ],
      },
      {
        type: 'paragraph',
        content: [],
      },
      {
        type: 'horizontalRule',
      },
      {
        type: 'paragraph',
        content: [],
      },
      // Destinataire
      {
        type: 'paragraph',
        content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'À ' },
          { type: 'text', text: 'Monsieur / Madame le Président du Tribunal judiciaire de [Ville]' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', marks: [{ type: 'italic' }], text: 'Statuant en qualité de juge des requêtes' },
        ],
      },
      {
        type: 'paragraph',
        content: [],
      },
      {
        type: 'horizontalRule',
      },
      {
        type: 'paragraph',
        content: [],
      },
      // Requérant
      {
        type: 'paragraph',
        content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'A l\'honneur de vous exposer :' },
        ],
      },
      {
        type: 'paragraph',
        content: [],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'Le requérant :' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: '[Civilité, Prénom NOM]' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Demeurant [Adresse complète]' },
        ],
      },
      {
        type: 'paragraph',
        content: [],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Représenté par Maître [Prénom NOM], Avocat au Barreau de [Ville]' },
        ],
      },
      {
        type: 'paragraph',
        content: [],
      },
      {
        type: 'horizontalRule',
      },
      {
        type: 'paragraph',
        content: [],
      },
      // Exposé des faits
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'I. EXPOSÉ DES FAITS' }],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: '[Exposer ici les faits justifiant la requête]' },
        ],
      },
      {
        type: 'paragraph',
        content: [],
      },
      // Justification de la non-contradiction
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'II. SUR LA NÉCESSITÉ DE STATUER NON CONTRADICTOIREMENT' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Aux termes de l\'article 493 du Code de procédure civile, « L\'ordonnance sur requête est une décision provisoire rendue non contradictoirement dans les cas où le requérant est fondé à ne pas appeler de partie adverse. »',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'En l\'espèce, [justifier pourquoi la procédure doit être non contradictoire : effet de surprise nécessaire, urgence, etc.]',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [],
      },
      // Discussion
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'III. DISCUSSION' }],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: '[Développer l\'argumentation juridique justifiant la demande]' },
        ],
      },
      {
        type: 'paragraph',
        content: [],
      },
      // Par ces motifs
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'IV. PAR CES MOTIFS' }],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', marks: [{ type: 'italic' }], text: 'Plaise au Président du Tribunal judiciaire de [Ville],' },
        ],
      },
      {
        type: 'paragraph',
        content: [],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'Vu ' },
          { type: 'text', text: 'les articles 493 et suivants du Code de procédure civile,' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'Vu ' },
          { type: 'text', text: '[autres textes applicables],' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'Vu ' },
          { type: 'text', text: 'les pièces versées au soutien de la présente requête,' },
        ],
      },
      {
        type: 'paragraph',
        content: [],
      },
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  { type: 'text', text: 'ORDONNER [Mesure sollicitée] ;' },
                ],
              },
            ],
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  { type: 'text', text: 'AUTORISER [le requérant] à [Action autorisée] ;' },
                ],
              },
            ],
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  { type: 'text', text: 'DIRE que la présente ordonnance sera exécutoire sur minute et avant enregistrement ;' },
                ],
              },
            ],
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  { type: 'text', text: 'RÉSERVER les dépens.' },
                ],
              },
            ],
          },
        ],
      },
      {
        type: 'paragraph',
        content: [],
      },
      // Signature
      {
        type: 'paragraph',
        attrs: { textAlign: 'right' },
        content: [{ type: 'text', marks: [{ type: 'italic' }], text: 'Sous toutes réserves' }],
      },
      {
        type: 'paragraph',
        content: [],
      },
      {
        type: 'paragraph',
        attrs: { textAlign: 'right' },
        content: [{ type: 'text', text: 'Pour le requérant,' }],
      },
      {
        type: 'paragraph',
        attrs: { textAlign: 'right' },
        content: [{ type: 'text', text: 'Son Conseil,' }],
      },
      {
        type: 'paragraph',
        content: [],
      },
      {
        type: 'paragraph',
        content: [],
      },
      // Pièces
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'PIÈCES JOINTES' }],
      },
      {
        type: 'orderedList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: '[Description pièce 1]' }],
              },
            ],
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: '[Description pièce 2]' }],
              },
            ],
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: '[Description pièce 3]' }],
              },
            ],
          },
        ],
      },
    ],
  },
  metadata: {
    defaultStyles: ['legal-title', 'legal-body', 'legal-visa'],
    suggestedLength: 'medium',
    tags: ['juridique', 'requête', 'ordonnance', 'procédure', 'unilatéral'],
  },
}

export default REQUETE_TEMPLATE
