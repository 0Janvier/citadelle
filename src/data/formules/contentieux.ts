// Formules juridiques pour le contentieux
// Ces formules sont utilisées par l'autocomplétion et les snippets

import type { Snippet } from '../../types/editor-features'

export const FORMULES_CONTENTIEUX: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>[] = [
  // === EN-TÊTES ET FORMULES D'INTRODUCTION ===
  {
    nom: 'Plaise au Tribunal',
    description: 'Formule d\'introduction des conclusions',
    raccourci: '/plaise',
    contenu: `PLAISE AU TRIBUNAL

Vu les pièces versées aux débats,

Vu les articles {{articles}} du Code {{code}},`,
    category: 'contentieux',
    variables: ['articles', 'code'],
    isBuiltin: true,
  },
  {
    nom: 'Plaise à la Cour',
    description: 'Formule d\'introduction pour la Cour d\'appel',
    raccourci: '/plaisecour',
    contenu: `PLAISE À LA COUR

Vu l'appel interjeté par {{appelant}},

Vu les pièces versées aux débats,`,
    category: 'contentieux',
    variables: ['appelant'],
    isBuiltin: true,
  },

  // === ATTENDUS ET CONSIDÉRANTS ===
  {
    nom: 'Attendu que',
    description: 'Formule de motivation',
    raccourci: '/attendu',
    contenu: 'ATTENDU QUE ',
    category: 'contentieux',
    variables: [],
    isBuiltin: true,
  },
  {
    nom: 'Considérant que',
    description: 'Formule de motivation administrative',
    raccourci: '/considerant',
    contenu: 'CONSIDÉRANT QUE ',
    category: 'contentieux',
    variables: [],
    isBuiltin: true,
  },

  // === MOYENS ET ARGUMENTS ===
  {
    nom: 'Sur le premier moyen',
    description: 'Introduction d\'un moyen de cassation',
    raccourci: '/moyen1',
    contenu: `SUR LE PREMIER MOYEN

Il est fait grief à l'arrêt attaqué d'avoir `,
    category: 'contentieux',
    variables: [],
    isBuiltin: true,
  },
  {
    nom: 'En fait',
    description: 'Section des faits',
    raccourci: '/enfait',
    contenu: `I. EN FAIT

`,
    category: 'contentieux',
    variables: [],
    isBuiltin: true,
  },
  {
    nom: 'En droit',
    description: 'Section du droit applicable',
    raccourci: '/endroit',
    contenu: `II. EN DROIT

`,
    category: 'contentieux',
    variables: [],
    isBuiltin: true,
  },
  {
    nom: 'Discussion',
    description: 'Section de discussion',
    raccourci: '/discussion',
    contenu: `III. DISCUSSION

`,
    category: 'contentieux',
    variables: [],
    isBuiltin: true,
  },

  // === PAR CES MOTIFS ===
  {
    nom: 'Par ces motifs',
    description: 'Formule de conclusion (demandes)',
    raccourci: '/motifs',
    contenu: `PAR CES MOTIFS

{{client.civilite}} {{client.nom}} demande au Tribunal de bien vouloir :

- DÉCLARER recevable et bien fondée la présente action ;
- CONDAMNER {{adverse.nom}} à payer la somme de {{montant}} euros ;
- CONDAMNER {{adverse.nom}} aux entiers dépens ;
- CONDAMNER {{adverse.nom}} à payer la somme de {{article700}} euros au titre de l'article 700 du Code de procédure civile.`,
    category: 'contentieux',
    variables: ['client.civilite', 'client.nom', 'adverse.nom', 'montant', 'article700'],
    isBuiltin: true,
  },
  {
    nom: 'Par ces motifs (défense)',
    description: 'Formule de conclusion en défense',
    raccourci: '/motifsdef',
    contenu: `PAR CES MOTIFS

{{client.civilite}} {{client.nom}} demande au Tribunal de bien vouloir :

À TITRE PRINCIPAL :
- DÉCLARER irrecevables les demandes de {{adverse.nom}} ;
- DÉBOUTER {{adverse.nom}} de l'ensemble de ses demandes, fins et conclusions ;

À TITRE SUBSIDIAIRE :
- RÉDUIRE à de plus justes proportions les demandes de {{adverse.nom}} ;

EN TOUT ÉTAT DE CAUSE :
- CONDAMNER {{adverse.nom}} aux entiers dépens ;
- CONDAMNER {{adverse.nom}} à payer la somme de {{article700}} euros au titre de l'article 700 du Code de procédure civile.`,
    category: 'contentieux',
    variables: ['client.civilite', 'client.nom', 'adverse.nom', 'article700'],
    isBuiltin: true,
  },

  // === CITATIONS D'ARTICLES ===
  {
    nom: 'Aux termes de l\'article',
    description: 'Citation d\'un article de loi',
    raccourci: '/article',
    contenu: 'Aux termes de l\'article {{numero}} du {{code}} : « {{texte}} »',
    category: 'contentieux',
    variables: ['numero', 'code', 'texte'],
    isBuiltin: true,
  },
  {
    nom: 'Article 1240 Code civil',
    description: 'Responsabilité délictuelle',
    raccourci: '/1240',
    contenu: 'Aux termes de l\'article 1240 du Code civil : « Tout fait quelconque de l\'homme, qui cause à autrui un dommage, oblige celui par la faute duquel il est arrivé à le réparer. »',
    category: 'contentieux',
    variables: [],
    isBuiltin: true,
  },
  {
    nom: 'Article 1103 Code civil',
    description: 'Force obligatoire du contrat',
    raccourci: '/1103',
    contenu: 'Aux termes de l\'article 1103 du Code civil : « Les contrats légalement formés tiennent lieu de loi à ceux qui les ont faits. »',
    category: 'contentieux',
    variables: [],
    isBuiltin: true,
  },
  {
    nom: 'Article 1104 Code civil',
    description: 'Bonne foi contractuelle',
    raccourci: '/1104',
    contenu: 'Aux termes de l\'article 1104 du Code civil : « Les contrats doivent être négociés, formés et exécutés de bonne foi. Cette disposition est d\'ordre public. »',
    category: 'contentieux',
    variables: [],
    isBuiltin: true,
  },

  // === JURISPRUDENCE ===
  {
    nom: 'Jurisprudence constante',
    description: 'Référence à une jurisprudence constante',
    raccourci: '/jurisconstante',
    contenu: 'Il est de jurisprudence constante que ',
    category: 'contentieux',
    variables: [],
    isBuiltin: true,
  },
  {
    nom: 'Citation jurisprudence',
    description: 'Citation d\'une décision de justice',
    raccourci: '/juris',
    contenu: '({{juridiction}}, {{date}}, n° {{numero}})',
    category: 'contentieux',
    variables: ['juridiction', 'date', 'numero'],
    isBuiltin: true,
  },

  // === FORMULES PROCÉDURALES ===
  {
    nom: 'Sous toutes réserves',
    description: 'Mention de réserve',
    raccourci: '/reserves',
    contenu: 'Sous toutes réserves et ce sans reconnaissance préjudiciable de quelque nature que ce soit,',
    category: 'contentieux',
    variables: [],
    isBuiltin: true,
  },
  {
    nom: 'Sauf à parfaire',
    description: 'Mention de provision',
    raccourci: '/parfaire',
    contenu: ', sauf à parfaire,',
    category: 'contentieux',
    variables: [],
    isBuiltin: true,
  },
  {
    nom: 'À titre principal / subsidiaire',
    description: 'Structure des demandes',
    raccourci: '/principal',
    contenu: `À TITRE PRINCIPAL :


À TITRE SUBSIDIAIRE :


EN TOUT ÉTAT DE CAUSE :
`,
    category: 'contentieux',
    variables: [],
    isBuiltin: true,
  },

  // === RÉFÉRENCES AUX PIÈCES ===
  {
    nom: 'Pièce n°',
    description: 'Référence à une pièce',
    raccourci: '/piece',
    contenu: '(Pièce n°{{numero}})',
    category: 'contentieux',
    variables: ['numero'],
    isBuiltin: true,
  },
  {
    nom: 'Voir pièce',
    description: 'Renvoi vers une pièce',
    raccourci: '/voirpiece',
    contenu: '(cf. Pièce n°{{numero}} : {{description}})',
    category: 'contentieux',
    variables: ['numero', 'description'],
    isBuiltin: true,
  },

  // === DOMMAGES-INTÉRÊTS ===
  {
    nom: 'Préjudice moral',
    description: 'Demande de réparation du préjudice moral',
    raccourci: '/prejudicemoral',
    contenu: `Le préjudice moral subi par {{client.nom}} est caractérisé par {{description}}.

Ce préjudice sera justement réparé par l'allocation de la somme de {{montant}} euros à titre de dommages-intérêts.`,
    category: 'contentieux',
    variables: ['client.nom', 'description', 'montant'],
    isBuiltin: true,
  },
  {
    nom: 'Préjudice matériel',
    description: 'Demande de réparation du préjudice matériel',
    raccourci: '/prejudicemateriel',
    contenu: `Le préjudice matériel subi par {{client.nom}} s'établit comme suit :

- {{poste1}} : {{montant1}} euros
- {{poste2}} : {{montant2}} euros

TOTAL : {{total}} euros`,
    category: 'contentieux',
    variables: ['client.nom', 'poste1', 'montant1', 'poste2', 'montant2', 'total'],
    isBuiltin: true,
  },

  // === EXÉCUTION PROVISOIRE ===
  {
    nom: 'Exécution provisoire',
    description: 'Demande d\'exécution provisoire',
    raccourci: '/execprov',
    contenu: `ORDONNER l'exécution provisoire de la décision à intervenir, le caractère urgent de l'affaire et l'ancienneté de la créance le justifiant pleinement.`,
    category: 'contentieux',
    variables: [],
    isBuiltin: true,
  },

  // === IRRECEVABILITÉ ===
  {
    nom: 'Fin de non-recevoir',
    description: 'Soulever une fin de non-recevoir',
    raccourci: '/fnr',
    contenu: `En application de l'article 122 du Code de procédure civile, constitue une fin de non-recevoir tout moyen qui tend à faire déclarer l'adversaire irrecevable en sa demande, sans examen au fond, pour défaut de droit d'agir.

En l'espèce, {{motif}}.

La demande de {{adverse.nom}} est donc irrecevable.`,
    category: 'contentieux',
    variables: ['motif', 'adverse.nom'],
    isBuiltin: true,
  },
]
