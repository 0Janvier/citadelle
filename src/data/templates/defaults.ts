import type { DocumentTemplate } from '../../types/templates'

// Default templates that are bundled with the app
export const DEFAULT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'blank',
    name: 'Document vide',
    description: 'Un document vide pour commencer de zéro',
    category: 'writing',
    icon: 'file',
    version: '1.0.0',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isBuiltin: true,
    isCustom: false,
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
        },
      ],
    },
    metadata: {
      defaultStyles: [],
      tags: ['vide', 'blank'],
    },
  },
  {
    id: 'article',
    name: 'Article',
    description: 'Structure classique pour un article de blog ou de presse',
    category: 'writing',
    icon: 'newspaper',
    version: '1.0.0',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isBuiltin: true,
    isCustom: false,
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Titre de l\'article' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              marks: [{ type: 'italic' }],
              text: 'Chapeau introductif qui résume l\'article en quelques lignes...',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Première section' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Contenu de la première section...' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Deuxième section' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Contenu de la deuxième section...' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Conclusion' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Résumé et conclusion de l\'article...' }],
        },
      ],
    },
    metadata: {
      defaultStyles: ['title', 'lead', 'heading2', 'body'],
      suggestedLength: 'medium',
      tags: ['article', 'blog', 'presse'],
    },
  },
  {
    id: 'report',
    name: 'Rapport',
    description: 'Structure professionnelle pour un rapport détaillé',
    category: 'business',
    icon: 'clipboard-list',
    version: '1.0.0',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isBuiltin: true,
    isCustom: false,
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Titre du rapport' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Date : ' },
            { type: 'text', text: '[Date]' },
          ],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Auteur : ' },
            { type: 'text', text: '[Nom de l\'auteur]' },
          ],
        },
        {
          type: 'horizontalRule',
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Résumé exécutif' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Synthèse des points clés du rapport...' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '1. Introduction' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Contexte et objectifs du rapport...' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '2. Analyse' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Détail de l\'analyse et des observations...' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '3. Recommandations' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Première recommandation' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Deuxième recommandation' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Troisième recommandation' }] }],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '4. Conclusion' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Synthèse finale et prochaines étapes...' }],
        },
      ],
    },
    metadata: {
      defaultStyles: ['title', 'heading2', 'body'],
      suggestedLength: 'long',
      tags: ['rapport', 'business', 'professionnel'],
    },
  },
  {
    id: 'letter',
    name: 'Lettre',
    description: 'Format de lettre formelle ou professionnelle',
    category: 'business',
    icon: 'envelope',
    version: '1.0.0',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isBuiltin: true,
    isCustom: false,
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '[Votre nom]' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '[Votre adresse]' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '[Code postal, Ville]' }],
        },
        {
          type: 'paragraph',
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '[Nom du destinataire]' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '[Adresse du destinataire]' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '[Code postal, Ville]' }],
        },
        {
          type: 'paragraph',
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '[Lieu], le [Date]' }],
        },
        {
          type: 'paragraph',
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Objet : ' },
            { type: 'text', text: '[Objet de la lettre]' },
          ],
        },
        {
          type: 'paragraph',
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Madame, Monsieur,' }],
        },
        {
          type: 'paragraph',
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '[Corps de la lettre...]' }],
        },
        {
          type: 'paragraph',
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Je vous prie d\'agréer, Madame, Monsieur, l\'expression de mes salutations distinguées.' }],
        },
        {
          type: 'paragraph',
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '[Signature]' }],
        },
      ],
    },
    metadata: {
      defaultStyles: ['body'],
      suggestedLength: 'short',
      tags: ['lettre', 'courrier', 'formel'],
    },
  },
  {
    id: 'notes',
    name: 'Notes de réunion',
    description: 'Structure pour prendre des notes pendant une réunion',
    category: 'business',
    icon: 'clipboard',
    version: '1.0.0',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isBuiltin: true,
    isCustom: false,
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Notes de réunion' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Date : ' },
            { type: 'text', text: '[Date]' },
          ],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Participants : ' },
            { type: 'text', text: '[Liste des participants]' },
          ],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Objet : ' },
            { type: 'text', text: '[Sujet de la réunion]' },
          ],
        },
        {
          type: 'horizontalRule',
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Ordre du jour' }],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Point 1' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Point 2' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Point 3' }] }],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Notes' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '...' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Actions à suivre' }],
        },
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Action 1 - [Responsable]' }] }],
            },
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Action 2 - [Responsable]' }] }],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Prochaine réunion' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '[Date et heure de la prochaine réunion]' }],
        },
      ],
    },
    metadata: {
      defaultStyles: ['title', 'heading2', 'body'],
      suggestedLength: 'medium',
      tags: ['notes', 'réunion', 'meeting'],
    },
  },
  {
    id: 'essay',
    name: 'Dissertation',
    description: 'Structure académique pour une dissertation ou un essai',
    category: 'academic',
    icon: 'book-open',
    version: '1.0.0',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isBuiltin: true,
    isCustom: false,
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Titre de la dissertation' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'italic' }], text: '[Nom de l\'auteur] - [Date]' },
          ],
        },
        {
          type: 'horizontalRule',
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Introduction' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Présentation du sujet, contexte, problématique et annonce du plan...' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'I. Première partie' }],
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'A. Premier argument' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Développement du premier argument...' }],
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'B. Deuxième argument' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Développement du deuxième argument...' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'II. Deuxième partie' }],
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'A. Premier argument' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Développement...' }],
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'B. Deuxième argument' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Développement...' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Conclusion' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Synthèse des arguments, réponse à la problématique et ouverture...' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Bibliographie' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '[Référence 1]' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '[Référence 2]' }] }],
            },
          ],
        },
      ],
    },
    metadata: {
      defaultStyles: ['title', 'heading2', 'heading3', 'body'],
      suggestedLength: 'long',
      tags: ['dissertation', 'essai', 'académique'],
    },
  },
  {
    id: 'todo-list',
    name: 'Liste de tâches',
    description: 'Liste simple pour organiser vos tâches',
    category: 'personal',
    icon: 'check-square',
    version: '1.0.0',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isBuiltin: true,
    isCustom: false,
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Liste de tâches' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'italic' }], text: 'Dernière mise à jour : [Date]' },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Priorité haute' }],
        },
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Tâche urgente 1' }] }],
            },
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Tâche urgente 2' }] }],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Priorité normale' }],
        },
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Tâche normale 1' }] }],
            },
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Tâche normale 2' }] }],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Plus tard' }],
        },
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Tâche à faire plus tard' }] }],
            },
          ],
        },
      ],
    },
    metadata: {
      defaultStyles: ['title', 'heading2'],
      suggestedLength: 'short',
      tags: ['todo', 'tâches', 'liste'],
    },
  },
  // Templates juridiques
  {
    id: 'conclusions',
    name: 'Conclusions au fond',
    description: 'Structure de conclusions devant le Tribunal judiciaire',
    category: 'legal',
    icon: 'scale',
    version: '1.0.0',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isBuiltin: true,
    isCustom: false,
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'CONCLUSIONS' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'POUR : {{client.nom}}, demeurant {{client.adresse}}' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'CONTRE : {{adverse.nom}}, demeurant {{adverse.adresse}}' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'PLAISE AU TRIBUNAL' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'I. FAITS' }] },
        { type: 'paragraph', content: [] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'II. DISCUSSION' }] },
        { type: 'paragraph', content: [] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'PAR CES MOTIFS' }] },
        { type: 'paragraph', content: [] },
      ],
    },
    metadata: {
      defaultStyles: ['title', 'heading2'],
      tags: ['conclusions', 'tribunal', 'contentieux'],
    },
  },
  {
    id: 'assignation',
    name: 'Assignation',
    description: 'Assignation devant le Tribunal judiciaire',
    category: 'legal',
    icon: 'scale',
    version: '1.0.0',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isBuiltin: true,
    isCustom: false,
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'ASSIGNATION' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'L\'an deux mille vingt-cinq et le' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'A LA REQUETE DE : {{client.nom}}' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'J\'AI, huissier soussigné, donné assignation à :' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '{{adverse.nom}}, demeurant {{adverse.adresse}}' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'OBJET DE LA DEMANDE' }] },
        { type: 'paragraph', content: [] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'FAITS' }] },
        { type: 'paragraph', content: [] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'DISCUSSION' }] },
        { type: 'paragraph', content: [] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'PAR CES MOTIFS' }] },
        { type: 'paragraph', content: [] },
      ],
    },
    metadata: {
      defaultStyles: ['title', 'heading2'],
      tags: ['assignation', 'tribunal', 'contentieux'],
    },
  },
  {
    id: 'courrier-avocat',
    name: 'Courrier avocat-client',
    description: 'Modèle de courrier entre avocat et client',
    category: 'legal',
    icon: 'mail',
    version: '1.0.0',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isBuiltin: true,
    isCustom: false,
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: '{{avocat.cabinet}}' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '{{avocat.adresse}}' }] },
        { type: 'paragraph', content: [] },
        { type: 'paragraph', content: [{ type: 'text', text: '{{client.nom}}' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '{{client.adresse}}' }] },
        { type: 'paragraph', content: [] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Objet : {{dossier.objet}}' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Ref : {{dossier.reference}}' }] },
        { type: 'paragraph', content: [] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Cher(e) {{client.nom}},' }] },
        { type: 'paragraph', content: [] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Je vous prie d\'agreer, Cher(e) Client(e), l\'expression de mes salutations distinguees.' }] },
        { type: 'paragraph', content: [] },
        { type: 'paragraph', content: [{ type: 'text', text: '{{avocat.prenom}} {{avocat.nom}}\nAvocat au Barreau de {{avocat.barreau}}' }] },
      ],
    },
    metadata: {
      defaultStyles: [],
      tags: ['courrier', 'lettre', 'client'],
    },
  },
  {
    id: 'contrat-prestation',
    name: 'Contrat de prestation',
    description: 'Modèle de contrat de prestation de services',
    category: 'legal',
    icon: 'file-text',
    version: '1.0.0',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isBuiltin: true,
    isCustom: false,
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'CONTRAT DE PRESTATION DE SERVICES' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'ENTRE LES SOUSSIGNES :' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '{{client.nom}}, ci-apres denomme "le Client"' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'ET' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '{{adverse.nom}}, ci-apres denomme "le Prestataire"' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Article 1 - Objet' }] },
        { type: 'paragraph', content: [] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Article 2 - Duree' }] },
        { type: 'paragraph', content: [] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Article 3 - Prix' }] },
        { type: 'paragraph', content: [] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Article 4 - Obligations des parties' }] },
        { type: 'paragraph', content: [] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Article 5 - Resiliation' }] },
        { type: 'paragraph', content: [] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Article 6 - Litiges' }] },
        { type: 'paragraph', content: [] },
      ],
    },
    metadata: {
      defaultStyles: ['title', 'heading2'],
      tags: ['contrat', 'prestation', 'services'],
    },
  },
  {
    id: 'note-interne',
    name: 'Note interne',
    description: 'Note interne de cabinet pour analyse juridique',
    category: 'legal',
    icon: 'clipboard',
    version: '1.0.0',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isBuiltin: true,
    isCustom: false,
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'NOTE INTERNE' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Dossier : {{dossier.reference}}' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Date : {{date.jour}}' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Redacteur : {{avocat.prenom}} {{avocat.nom}}' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '1. Faits' }] },
        { type: 'paragraph', content: [] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '2. Question juridique' }] },
        { type: 'paragraph', content: [] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '3. Analyse' }] },
        { type: 'paragraph', content: [] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '4. Conclusion et recommandations' }] },
        { type: 'paragraph', content: [] },
      ],
    },
    metadata: {
      defaultStyles: ['title', 'heading2'],
      tags: ['note', 'interne', 'analyse'],
    },
  },
]
