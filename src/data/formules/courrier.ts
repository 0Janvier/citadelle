// Formules juridiques pour les courriers
// Ces formules sont utilisées par l'autocomplétion et les snippets

import type { Snippet } from '../../types/editor-features'

export const FORMULES_COURRIER: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>[] = [
  // === EN-TÊTES ===
  {
    nom: 'En-tête cabinet',
    description: 'En-tête avec informations du cabinet',
    raccourci: '/entete',
    contenu: `{{avocat.cabinet}}
{{avocat.nom}}
Avocat au Barreau de {{avocat.barreau}}
Toque {{avocat.toque}}

{{avocat.adresse}}
{{avocat.code_postal}} {{avocat.ville}}
Tél. : {{avocat.telephone}}
Email : {{avocat.email}}`,
    category: 'courrier',
    variables: ['avocat.cabinet', 'avocat.nom', 'avocat.barreau', 'avocat.toque', 'avocat.adresse', 'avocat.code_postal', 'avocat.ville', 'avocat.telephone', 'avocat.email'],
    isBuiltin: true,
  },

  // === RÉFÉRENCES ===
  {
    nom: 'Références dossier',
    description: 'Bloc de références',
    raccourci: '/refs',
    contenu: `Nos références : {{dossier.reference}}
Vos références : {{dossier.reference_adverse}}
Affaire : {{client.nom}} c/ {{adverse.nom}}`,
    category: 'courrier',
    variables: ['dossier.reference', 'dossier.reference_adverse', 'client.nom', 'adverse.nom'],
    isBuiltin: true,
  },

  // === FORMULES D'APPEL ===
  {
    nom: 'Madame, Monsieur',
    description: 'Formule d\'appel neutre',
    raccourci: '/mm',
    contenu: 'Madame, Monsieur,',
    category: 'courrier',
    variables: [],
    isBuiltin: true,
  },
  {
    nom: 'Cher Confrère',
    description: 'Formule d\'appel confrère',
    raccourci: '/confrere',
    contenu: 'Cher Confrère,',
    category: 'courrier',
    variables: [],
    isBuiltin: true,
  },
  {
    nom: 'Chère Consœur',
    description: 'Formule d\'appel consœur',
    raccourci: '/consoeur',
    contenu: 'Chère Consœur,',
    category: 'courrier',
    variables: [],
    isBuiltin: true,
  },
  {
    nom: 'Monsieur le Président',
    description: 'Formule d\'appel président tribunal',
    raccourci: '/president',
    contenu: 'Monsieur le Président,',
    category: 'courrier',
    variables: [],
    isBuiltin: true,
  },
  {
    nom: 'Monsieur le Bâtonnier',
    description: 'Formule d\'appel bâtonnier',
    raccourci: '/batonnier',
    contenu: 'Monsieur le Bâtonnier,',
    category: 'courrier',
    variables: [],
    isBuiltin: true,
  },
  {
    nom: 'Madame, Monsieur le Juge',
    description: 'Formule d\'appel juge',
    raccourci: '/juge',
    contenu: 'Madame, Monsieur le Juge,',
    category: 'courrier',
    variables: [],
    isBuiltin: true,
  },

  // === INTRODUCTIONS ===
  {
    nom: 'Suite à notre entretien',
    description: 'Référence à un entretien',
    raccourci: '/suiteentretien',
    contenu: 'Suite à notre entretien du {{date}}, je me permets de vous adresser ',
    category: 'courrier',
    variables: ['date'],
    isBuiltin: true,
  },
  {
    nom: 'J\'ai l\'honneur de',
    description: 'Formule d\'introduction formelle',
    raccourci: '/honneur',
    contenu: 'J\'ai l\'honneur de ',
    category: 'courrier',
    variables: [],
    isBuiltin: true,
  },
  {
    nom: 'Je me permets de',
    description: 'Formule d\'introduction polie',
    raccourci: '/permets',
    contenu: 'Je me permets de vous écrire afin de ',
    category: 'courrier',
    variables: [],
    isBuiltin: true,
  },
  {
    nom: 'Faisant suite à',
    description: 'Référence à une correspondance',
    raccourci: '/faisantsuite',
    contenu: 'Faisant suite à votre courrier du {{date}}, ',
    category: 'courrier',
    variables: ['date'],
    isBuiltin: true,
  },
  {
    nom: 'Accusé de réception',
    description: 'Accusé de réception de documents',
    raccourci: '/ar',
    contenu: 'J\'accuse réception de votre courrier du {{date}} et des documents qui y étaient joints.',
    category: 'courrier',
    variables: ['date'],
    isBuiltin: true,
  },

  // === CORPS DU COURRIER ===
  {
    nom: 'J\'interviens en qualité de',
    description: 'Présentation du mandat',
    raccourci: '/interviens',
    contenu: 'J\'interviens en ma qualité de conseil de {{client.civilite}} {{client.nom}} dans le cadre de {{objet}}.',
    category: 'courrier',
    variables: ['client.civilite', 'client.nom', 'objet'],
    isBuiltin: true,
  },
  {
    nom: 'Je vous prie de bien vouloir',
    description: 'Formule de demande polie',
    raccourci: '/priebv',
    contenu: 'Je vous prie de bien vouloir ',
    category: 'courrier',
    variables: [],
    isBuiltin: true,
  },
  {
    nom: 'Je vous serais obligé de',
    description: 'Formule de demande formelle',
    raccourci: '/oblige',
    contenu: 'Je vous serais obligé de bien vouloir me faire parvenir ',
    category: 'courrier',
    variables: [],
    isBuiltin: true,
  },
  {
    nom: 'Vous voudrez bien trouver ci-joint',
    description: 'Transmission de documents',
    raccourci: '/cijoint',
    contenu: 'Vous voudrez bien trouver ci-joint {{documents}}.',
    category: 'courrier',
    variables: ['documents'],
    isBuiltin: true,
  },
  {
    nom: 'Je reste à votre disposition',
    description: 'Disponibilité',
    raccourci: '/dispo',
    contenu: 'Je reste à votre entière disposition pour tout renseignement complémentaire.',
    category: 'courrier',
    variables: [],
    isBuiltin: true,
  },

  // === MISES EN DEMEURE ===
  {
    nom: 'Mise en demeure',
    description: 'En-tête mise en demeure',
    raccourci: '/med',
    contenu: `MISE EN DEMEURE

Lettre recommandée avec accusé de réception`,
    category: 'courrier',
    variables: [],
    isBuiltin: true,
  },
  {
    nom: 'Corps mise en demeure',
    description: 'Corps type d\'une mise en demeure',
    raccourci: '/medcorps',
    contenu: `Par la présente, j'ai l'honneur d'intervenir en ma qualité de conseil de {{client.civilite}} {{client.nom}}.

{{expose_faits}}

En conséquence, et par la présente valant mise en demeure, je vous somme de {{action_requise}} dans un délai de {{delai}} à compter de la réception de la présente.

À défaut d'exécution dans ce délai, {{client.civilite}} {{client.nom}} se verra contraint(e) de saisir la juridiction compétente aux fins d'obtenir {{sanctions}}, outre le remboursement des frais de justice et d'avocat.

Je vous invite à prendre cette mise en demeure avec tout le sérieux qu'elle mérite.`,
    category: 'courrier',
    variables: ['client.civilite', 'client.nom', 'expose_faits', 'action_requise', 'delai', 'sanctions'],
    isBuiltin: true,
  },

  // === FORMULES DE POLITESSE ===
  {
    nom: 'Salutations distinguées',
    description: 'Formule de politesse standard',
    raccourci: '/salutations',
    contenu: 'Je vous prie d\'agréer, Madame, Monsieur, l\'expression de mes salutations distinguées.',
    category: 'courrier',
    variables: [],
    isBuiltin: true,
  },
  {
    nom: 'Haute considération',
    description: 'Formule de politesse formelle',
    raccourci: '/consideration',
    contenu: 'Je vous prie d\'agréer, Madame, Monsieur, l\'expression de ma haute considération.',
    category: 'courrier',
    variables: [],
    isBuiltin: true,
  },
  {
    nom: 'Sentiments confraternels',
    description: 'Formule de politesse entre avocats',
    raccourci: '/confraternellement',
    contenu: 'Je vous prie d\'agréer, Cher Confrère, l\'expression de mes sentiments confraternels les meilleurs.',
    category: 'courrier',
    variables: [],
    isBuiltin: true,
  },
  {
    nom: 'Respectueux hommages (Bâtonnier)',
    description: 'Formule de politesse au Bâtonnier',
    raccourci: '/hommages',
    contenu: 'Je vous prie d\'agréer, Monsieur le Bâtonnier, l\'expression de mes respectueux hommages.',
    category: 'courrier',
    variables: [],
    isBuiltin: true,
  },
  {
    nom: 'Respectueuse considération (Juge)',
    description: 'Formule de politesse au magistrat',
    raccourci: '/respectueuse',
    contenu: 'Je vous prie d\'agréer, Madame, Monsieur le Juge, l\'expression de ma respectueuse considération.',
    category: 'courrier',
    variables: [],
    isBuiltin: true,
  },

  // === TRANSMISSION ===
  {
    nom: 'Copie à',
    description: 'Mention de copie',
    raccourci: '/copie',
    contenu: `Copie : {{destinataires}}`,
    category: 'courrier',
    variables: ['destinataires'],
    isBuiltin: true,
  },
  {
    nom: 'PJ',
    description: 'Liste des pièces jointes',
    raccourci: '/pj',
    contenu: `P.J. : {{pieces_jointes}}`,
    category: 'courrier',
    variables: ['pieces_jointes'],
    isBuiltin: true,
  },
]
