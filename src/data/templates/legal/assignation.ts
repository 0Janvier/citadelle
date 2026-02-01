import type { DocumentTemplate } from '../../../types/templates'

/**
 * Template : Assignation devant le Tribunal judiciaire
 *
 * Acte introductif d'instance conforme aux articles 54, 56 et 752
 * du Code de procédure civile.
 */
export const ASSIGNATION_TEMPLATE: DocumentTemplate = {
  id: 'legal-assignation',
  name: 'Assignation',
  description: 'Acte introductif d\'instance devant le Tribunal judiciaire',
  category: 'legal',
  icon: 'send',
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
        attrs: { textAlign: 'center' },
        content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'ASSIGNATION' },
        ],
      },
      {
        type: 'paragraph',
        attrs: { textAlign: 'center' },
        content: [
          { type: 'text', text: 'DEVANT LE TRIBUNAL JUDICIAIRE DE [VILLE]' },
        ],
      },
      {
        type: 'paragraph',
        attrs: { textAlign: 'center' },
        content: [
          { type: 'text', marks: [{ type: 'italic' }], text: '(Articles 54, 56 et 752 du Code de procédure civile)' },
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
      // L'an...
      {
        type: 'paragraph',
        content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'L\'an [Année]' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'Et le [Date en toutes lettres]' },
        ],
      },
      {
        type: 'paragraph',
        content: [],
      },
      // À la requête de
      {
        type: 'paragraph',
        content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'À LA REQUÊTE DE :' },
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
          { type: 'text', text: 'Profession : [Profession]' },
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
          { type: 'text', marks: [{ type: 'italic' }], text: 'Ci-après dénommé(e) « le Demandeur »' },
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
          { type: 'text', marks: [{ type: 'bold' }], text: 'Maître [Prénom NOM]' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Avocat au Barreau de [Ville]' },
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
        content: [
          { type: 'text', text: 'Tél. : [Numéro] - Email : [Email]' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'RPVA : [Numéro RPVA]' },
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
      // J'ai... huissier
      {
        type: 'paragraph',
        content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'J\'AI, [Prénom NOM],' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Huissier de Justice associé au sein de [Nom de l\'étude]' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Sise [Adresse de l\'étude]' },
        ],
      },
      {
        type: 'paragraph',
        content: [],
      },
      // Donné assignation à
      {
        type: 'paragraph',
        content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'DONNÉ ASSIGNATION À :' },
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
          { type: 'text', text: 'Demeurant / Dont le siège social est [Adresse complète]' },
        ],
      },
      {
        type: 'paragraph',
        content: [],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', marks: [{ type: 'italic' }], text: 'Ci-après dénommé(e) « le Défendeur »' },
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
      // De comparaître
      {
        type: 'paragraph',
        content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'DE COMPARAÎTRE :' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Devant le Tribunal judiciaire de [Ville], sis [Adresse du tribunal],' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Le [Date d\'audience] à [Heure],' },
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
            text: 'Le défendeur est informé qu\'il doit constituer avocat dans un délai de quinze jours à compter de la date de l\'assignation et qu\'à défaut, il s\'expose à ce qu\'un jugement soit rendu contre lui sur les seuls éléments fournis par son adversaire.',
          },
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
      // Objet de la demande
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'OBJET DE LA DEMANDE' }],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: '[Indiquer ici l\'objet de la demande de manière synthétique]' },
        ],
      },
      {
        type: 'paragraph',
        content: [],
      },
      // Exposé des faits
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'EXPOSÉ DES FAITS' }],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: '[Exposer ici les faits de manière chronologique et objective]' },
        ],
      },
      {
        type: 'paragraph',
        content: [],
      },
      // Discussion juridique
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'DISCUSSION' }],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: '[Développer l\'argumentation juridique]' },
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
        content: [{ type: 'text', text: 'PAR CES MOTIFS' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Il est demandé au Tribunal judiciaire de [Ville] de bien vouloir :',
          },
        ],
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
                  { type: 'text', text: 'DÉCLARER [Demandeur] recevable et bien fondé(e) en ses demandes ;' },
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
                  { type: 'text', text: 'CONDAMNER [Défendeur] à [Objet de la condamnation] ;' },
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
                  { type: 'text', text: 'CONDAMNER [Défendeur] à payer à [Demandeur] la somme de [Montant] euros au titre de l\'article 700 du CPC ;' },
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
                  { type: 'text', text: 'CONDAMNER [Défendeur] aux entiers dépens.' },
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
      // Pièces
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'PIÈCES COMMUNIQUÉES' }],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', marks: [{ type: 'italic' }], text: 'Cf. bordereau de pièces annexé' },
        ],
      },
    ],
  },
  metadata: {
    defaultStyles: ['legal-title', 'legal-body', 'legal-heading-partie'],
    suggestedLength: 'long',
    tags: ['juridique', 'assignation', 'procédure', 'acte introductif', 'tribunal'],
  },
}

export default ASSIGNATION_TEMPLATE
