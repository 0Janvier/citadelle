import type { DocumentTemplate } from '../../../types/templates'

/**
 * Template : Conclusions récapitulatives
 *
 * Écritures judiciaires conformes au Code de procédure civile.
 * Structure respectant les exigences de l'article 954 du CPC
 * (prétentions récapitulées sous forme de dispositif).
 */
export const CONCLUSIONS_TEMPLATE: DocumentTemplate = {
  id: 'legal-conclusions',
  name: 'Conclusions récapitulatives',
  description: 'Conclusions conformes au CPC avec exposé des faits, discussion et dispositif',
  category: 'legal',
  icon: 'file-text',
  version: '1.0.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isBuiltin: true,
  isCustom: false,
  content: {
    type: 'doc',
    content: [
      // En-tête avec références
      {
        type: 'paragraph',
        attrs: { textAlign: 'right' },
        content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'TRIBUNAL JUDICIAIRE DE [VILLE]' },
        ],
      },
      {
        type: 'paragraph',
        attrs: { textAlign: 'right' },
        content: [{ type: 'text', text: 'RG n° [Numéro]' }],
      },
      {
        type: 'paragraph',
        attrs: { textAlign: 'right' },
        content: [{ type: 'text', text: 'Audience du [Date]' }],
      },
      {
        type: 'paragraph',
        content: [],
      },
      // Titre principal
      {
        type: 'heading',
        attrs: { level: 1, textAlign: 'center' },
        content: [{ type: 'text', text: 'CONCLUSIONS RÉCAPITULATIVES' }],
      },
      {
        type: 'paragraph',
        attrs: { textAlign: 'center' },
        content: [
          { type: 'text', marks: [{ type: 'italic' }], text: 'en demande / en défense' },
        ],
      },
      {
        type: 'paragraph',
        content: [],
      },
      // Identification des parties
      {
        type: 'horizontalRule',
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'POUR : ' },
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
          { type: 'text', text: 'Né(e) le [Date de naissance] à [Lieu de naissance]' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'De nationalité [Nationalité]' },
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
        content: [
          { type: 'text', marks: [{ type: 'italic' }], text: 'Demandeur / Défendeur' },
        ],
      },
      {
        type: 'paragraph',
        content: [],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Ayant pour avocat constitué :' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Maître [Prénom NOM], Avocat au Barreau de [Ville]' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: '[Adresse du cabinet]' },
        ],
      },
      {
        type: 'paragraph',
        content: [],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'CONTRE : ' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: '[Civilité, Prénom NOM ou Dénomination sociale]' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Demeurant / Dont le siège social est [Adresse]' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', marks: [{ type: 'italic' }], text: 'Défendeur / Demandeur' },
        ],
      },
      {
        type: 'horizontalRule',
      },
      {
        type: 'paragraph',
        content: [],
      },
      // I. Exposé des faits et de la procédure
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'I. EXPOSÉ DES FAITS ET DE LA PROCÉDURE' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: '[Exposer ici les faits de manière chronologique et objective, ainsi que l\'historique procédural de l\'affaire.]',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [],
      },
      // II. Discussion
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'II. DISCUSSION' }],
      },
      {
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: 'A. Sur [premier moyen / première demande]' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: '[Développer l\'argumentation juridique en citant les textes applicables et la jurisprudence pertinente.]',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [],
      },
      {
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: 'B. Sur [deuxième moyen / deuxième demande]' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: '[Développer l\'argumentation juridique.]',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [],
      },
      // III. Par ces motifs (Dispositif)
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'III. PAR CES MOTIFS' }],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', marks: [{ type: 'italic' }], text: 'Plaise au Tribunal,' },
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
                  {
                    type: 'text',
                    text: 'DÉCLARER [Partie] recevable et bien fondé(e) en ses demandes ;',
                  },
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
                  {
                    type: 'text',
                    text: 'CONDAMNER [Partie adverse] à payer à [Partie] la somme de [Montant] euros à titre de [dommages et intérêts / principal / etc.] ;',
                  },
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
                  {
                    type: 'text',
                    text: 'CONDAMNER [Partie adverse] à payer à [Partie] la somme de [Montant] euros au titre de l\'article 700 du Code de procédure civile ;',
                  },
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
                  {
                    type: 'text',
                    text: 'CONDAMNER [Partie adverse] aux entiers dépens.',
                  },
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
        content: [{ type: 'text', text: '[Ville], le [Date]' }],
      },
      {
        type: 'paragraph',
        content: [],
      },
      {
        type: 'paragraph',
        attrs: { textAlign: 'right' },
        content: [{ type: 'text', text: 'Pour [Partie],' }],
      },
      {
        type: 'paragraph',
        attrs: { textAlign: 'right' },
        content: [{ type: 'text', text: 'Son Conseil,' }],
      },
    ],
  },
  metadata: {
    defaultStyles: ['legal-title', 'legal-body', 'legal-heading-partie', 'legal-heading-section'],
    suggestedLength: 'long',
    tags: ['juridique', 'conclusions', 'procédure', 'tribunal', 'écritures'],
  },
}

export default CONCLUSIONS_TEMPLATE
