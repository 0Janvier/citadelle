// Formules juridiques pour la rédaction contractuelle
// Ces formules sont utilisées par l'autocomplétion et les snippets

import type { Snippet } from '../../types/editor-features'

export const FORMULES_CONTRACTUEL: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>[] = [
  // === IDENTIFICATION DES PARTIES ===
  {
    nom: 'Entre les soussignés',
    description: 'En-tête classique de contrat',
    raccourci: '/soussignes',
    contenu: `ENTRE LES SOUSSIGNÉS :

{{partie1.nom}}, {{partie1.forme_juridique}}, au capital de {{partie1.capital}} euros, immatriculée au RCS de {{partie1.rcs_ville}} sous le numéro {{partie1.rcs_numero}}, dont le siège social est situé {{partie1.adresse}}, représentée par {{partie1.representant}}, en sa qualité de {{partie1.qualite}}, dûment habilité(e) aux fins des présentes,

Ci-après dénommée « {{partie1.denomination}} »

D'UNE PART,

ET :

{{partie2.nom}}, {{partie2.forme_juridique}}, au capital de {{partie2.capital}} euros, immatriculée au RCS de {{partie2.rcs_ville}} sous le numéro {{partie2.rcs_numero}}, dont le siège social est situé {{partie2.adresse}}, représentée par {{partie2.representant}}, en sa qualité de {{partie2.qualite}}, dûment habilité(e) aux fins des présentes,

Ci-après dénommée « {{partie2.denomination}} »

D'AUTRE PART,

Ci-après dénommées ensemble « les Parties » ou individuellement « la Partie »,`,
    category: 'contractuel',
    variables: [
      'partie1.nom', 'partie1.forme_juridique', 'partie1.capital', 'partie1.rcs_ville',
      'partie1.rcs_numero', 'partie1.adresse', 'partie1.representant', 'partie1.qualite', 'partie1.denomination',
      'partie2.nom', 'partie2.forme_juridique', 'partie2.capital', 'partie2.rcs_ville',
      'partie2.rcs_numero', 'partie2.adresse', 'partie2.representant', 'partie2.qualite', 'partie2.denomination'
    ],
    isBuiltin: true,
  },
  {
    nom: 'Partie personne physique',
    description: 'Identification d\'une personne physique',
    raccourci: '/partiephysique',
    contenu: `{{civilite}} {{prenom}} {{nom}}, né(e) le {{date_naissance}} à {{lieu_naissance}}, de nationalité {{nationalite}}, demeurant {{adresse}},

Ci-après dénommé(e) « {{denomination}} »`,
    category: 'contractuel',
    variables: ['civilite', 'prenom', 'nom', 'date_naissance', 'lieu_naissance', 'nationalite', 'adresse', 'denomination'],
    isBuiltin: true,
  },

  // === PRÉAMBULE ===
  {
    nom: 'Il a été préalablement exposé',
    description: 'Introduction du préambule',
    raccourci: '/preambule',
    contenu: `IL A ÉTÉ PRÉALABLEMENT EXPOSÉ CE QUI SUIT :

`,
    category: 'contractuel',
    variables: [],
    isBuiltin: true,
  },
  {
    nom: 'Ceci exposé, il a été convenu',
    description: 'Transition vers les clauses',
    raccourci: '/convenu',
    contenu: `CECI EXPOSÉ, IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT :

`,
    category: 'contractuel',
    variables: [],
    isBuiltin: true,
  },

  // === CLAUSES STANDARDS ===
  {
    nom: 'Article - Objet',
    description: 'Clause d\'objet du contrat',
    raccourci: '/objet',
    contenu: `ARTICLE {{numero}} – OBJET

Le présent contrat a pour objet de définir les conditions dans lesquelles {{description_objet}}.`,
    category: 'contractuel',
    variables: ['numero', 'description_objet'],
    isBuiltin: true,
  },
  {
    nom: 'Article - Durée',
    description: 'Clause de durée',
    raccourci: '/duree',
    contenu: `ARTICLE {{numero}} – DURÉE

Le présent contrat est conclu pour une durée de {{duree}} à compter de sa signature.

Il pourra être renouvelé par tacite reconduction pour des périodes successives de {{periode_renouvellement}}, sauf dénonciation par l'une des Parties adressée à l'autre par lettre recommandée avec accusé de réception, moyennant le respect d'un préavis de {{preavis}}.`,
    category: 'contractuel',
    variables: ['numero', 'duree', 'periode_renouvellement', 'preavis'],
    isBuiltin: true,
  },
  {
    nom: 'Article - Prix',
    description: 'Clause de prix',
    raccourci: '/prix',
    contenu: `ARTICLE {{numero}} – PRIX

En contrepartie des prestations fournies, {{partie_payeur}} versera à {{partie_beneficiaire}} la somme de {{montant}} euros hors taxes ({{montant_ttc}} euros TTC).

Le prix s'entend {{base_prix}}.`,
    category: 'contractuel',
    variables: ['numero', 'partie_payeur', 'partie_beneficiaire', 'montant', 'montant_ttc', 'base_prix'],
    isBuiltin: true,
  },
  {
    nom: 'Article - Paiement',
    description: 'Clause de modalités de paiement',
    raccourci: '/paiement',
    contenu: `ARTICLE {{numero}} – MODALITÉS DE PAIEMENT

Le paiement sera effectué par {{moyen_paiement}}, dans un délai de {{delai_paiement}} à compter de la réception de la facture.

En cas de retard de paiement, des pénalités de retard seront appliquées de plein droit, au taux de {{taux_penalites}} fois le taux d'intérêt légal, sans qu'un rappel soit nécessaire.

Une indemnité forfaitaire de 40 euros pour frais de recouvrement sera également due, conformément aux articles L. 441-10 et D. 441-5 du Code de commerce.`,
    category: 'contractuel',
    variables: ['numero', 'moyen_paiement', 'delai_paiement', 'taux_penalites'],
    isBuiltin: true,
  },

  // === CLAUSES DE RESPONSABILITÉ ===
  {
    nom: 'Article - Responsabilité',
    description: 'Clause de limitation de responsabilité',
    raccourci: '/responsabilite',
    contenu: `ARTICLE {{numero}} – RESPONSABILITÉ

Chaque Partie est responsable des dommages directs causés à l'autre Partie du fait de l'inexécution de ses obligations au titre du présent contrat.

En tout état de cause, la responsabilité de {{partie}} au titre du présent contrat ne pourra excéder {{plafond}} euros, tous préjudices confondus.

{{partie}} ne saurait être tenue responsable des dommages indirects tels que, notamment, le manque à gagner, la perte de clientèle, la perte de données ou tout préjudice financier ou commercial.`,
    category: 'contractuel',
    variables: ['numero', 'partie', 'plafond'],
    isBuiltin: true,
  },
  {
    nom: 'Article - Force majeure',
    description: 'Clause de force majeure',
    raccourci: '/forcemajeure',
    contenu: `ARTICLE {{numero}} – FORCE MAJEURE

Aucune des Parties ne sera tenue pour responsable d'un manquement à l'une quelconque de ses obligations si ce manquement est provoqué par un événement de force majeure au sens de l'article 1218 du Code civil.

La Partie invoquant un événement de force majeure devra en informer l'autre Partie dans un délai de {{delai_notification}} jours ouvrés à compter de sa survenance.

Si l'événement de force majeure perdure au-delà de {{duree_suspension}}, chacune des Parties pourra résilier le présent contrat de plein droit, sans indemnité, par lettre recommandée avec accusé de réception.`,
    category: 'contractuel',
    variables: ['numero', 'delai_notification', 'duree_suspension'],
    isBuiltin: true,
  },

  // === CLAUSES DE CONFIDENTIALITÉ ===
  {
    nom: 'Article - Confidentialité',
    description: 'Clause de confidentialité',
    raccourci: '/confidentialite',
    contenu: `ARTICLE {{numero}} – CONFIDENTIALITÉ

Chaque Partie s'engage à considérer comme strictement confidentielles toutes les informations de quelque nature qu'elles soient, écrites ou orales, relatives à l'autre Partie, dont elle aura eu connaissance à l'occasion de la négociation, de la conclusion ou de l'exécution du présent contrat.

Les Parties s'interdisent de divulguer ces informations à des tiers, sauf accord préalable et écrit de l'autre Partie.

Cette obligation de confidentialité perdurera pendant une durée de {{duree_confidentialite}} à compter de la fin du présent contrat, pour quelque cause que ce soit.`,
    category: 'contractuel',
    variables: ['numero', 'duree_confidentialite'],
    isBuiltin: true,
  },

  // === CLAUSES DE RÉSILIATION ===
  {
    nom: 'Article - Résiliation',
    description: 'Clause de résiliation',
    raccourci: '/resiliation',
    contenu: `ARTICLE {{numero}} – RÉSILIATION

{{numero}}.1. Résiliation pour convenance

Chaque Partie pourra résilier le présent contrat à tout moment, moyennant le respect d'un préavis de {{preavis}}, par lettre recommandée avec accusé de réception.

{{numero}}.2. Résiliation pour manquement

En cas de manquement par l'une des Parties à l'une quelconque de ses obligations au titre du présent contrat, non réparé dans un délai de {{delai_mise_en_demeure}} jours suivant mise en demeure restée infructueuse, l'autre Partie pourra résilier le présent contrat de plein droit, sans préjudice de tous dommages-intérêts auxquels elle pourrait prétendre.`,
    category: 'contractuel',
    variables: ['numero', 'preavis', 'delai_mise_en_demeure'],
    isBuiltin: true,
  },

  // === CLAUSES DE LITIGES ===
  {
    nom: 'Article - Droit applicable',
    description: 'Clause de loi applicable',
    raccourci: '/droitapplicable',
    contenu: `ARTICLE {{numero}} – DROIT APPLICABLE

Le présent contrat est soumis au droit français.`,
    category: 'contractuel',
    variables: ['numero'],
    isBuiltin: true,
  },
  {
    nom: 'Article - Attribution de juridiction',
    description: 'Clause attributive de compétence',
    raccourci: '/juridiction',
    contenu: `ARTICLE {{numero}} – ATTRIBUTION DE JURIDICTION

TOUT LITIGE RELATIF À LA VALIDITÉ, L'INTERPRÉTATION, L'EXÉCUTION OU LA RÉSILIATION DU PRÉSENT CONTRAT SERA SOUMIS À LA COMPÉTENCE EXCLUSIVE DES TRIBUNAUX DE {{ville}}, Y COMPRIS EN CAS DE RÉFÉRÉ, D'APPEL EN GARANTIE OU DE PLURALITÉ DE DÉFENDEURS.`,
    category: 'contractuel',
    variables: ['numero', 'ville'],
    isBuiltin: true,
  },
  {
    nom: 'Article - Médiation préalable',
    description: 'Clause de médiation',
    raccourci: '/mediation',
    contenu: `ARTICLE {{numero}} – MÉDIATION

Préalablement à toute action judiciaire, les Parties s'engagent à soumettre leur différend à un médiateur inscrit sur la liste des médiateurs de {{centre_mediation}}.

À défaut d'accord dans un délai de {{delai_mediation}} à compter de la saisine du médiateur, les Parties recouvreront leur liberté d'action.`,
    category: 'contractuel',
    variables: ['numero', 'centre_mediation', 'delai_mediation'],
    isBuiltin: true,
  },
  {
    nom: 'Article - Clause compromissoire',
    description: 'Clause d\'arbitrage',
    raccourci: '/arbitrage',
    contenu: `ARTICLE {{numero}} – ARBITRAGE

Tout différend découlant du présent contrat ou en relation avec celui-ci sera tranché définitivement suivant le Règlement d'arbitrage de {{centre_arbitrage}}, par un ou plusieurs arbitres nommés conformément à ce Règlement.

Le siège de l'arbitrage sera {{siege_arbitrage}}. La langue de l'arbitrage sera le français.`,
    category: 'contractuel',
    variables: ['numero', 'centre_arbitrage', 'siege_arbitrage'],
    isBuiltin: true,
  },

  // === CLAUSES DIVERSES ===
  {
    nom: 'Article - Notifications',
    description: 'Clause de notifications',
    raccourci: '/notifications',
    contenu: `ARTICLE {{numero}} – NOTIFICATIONS

Toute notification requise ou permise au titre du présent contrat sera faite par écrit et sera réputée avoir été valablement effectuée si elle est remise en main propre contre récépissé, envoyée par lettre recommandée avec accusé de réception ou par courrier électronique avec accusé de réception, aux adresses indiquées en tête des présentes.`,
    category: 'contractuel',
    variables: ['numero'],
    isBuiltin: true,
  },
  {
    nom: 'Article - Cession',
    description: 'Clause d\'incessibilité',
    raccourci: '/cession',
    contenu: `ARTICLE {{numero}} – CESSION

Le présent contrat est conclu intuitu personae. En conséquence, aucune des Parties ne pourra céder tout ou partie de ses droits et obligations au titre du présent contrat sans l'accord préalable et écrit de l'autre Partie.`,
    category: 'contractuel',
    variables: ['numero'],
    isBuiltin: true,
  },
  {
    nom: 'Article - Nullité partielle',
    description: 'Clause de divisibilité',
    raccourci: '/divisibilite',
    contenu: `ARTICLE {{numero}} – NULLITÉ PARTIELLE

Si l'une quelconque des stipulations du présent contrat s'avérait nulle ou inopposable au regard d'une règle de droit en vigueur ou d'une décision judiciaire devenue définitive, elle serait alors réputée non écrite, sans pour autant entraîner la nullité du contrat ni altérer la validité des autres dispositions.`,
    category: 'contractuel',
    variables: ['numero'],
    isBuiltin: true,
  },
  {
    nom: 'Article - Intégralité',
    description: 'Clause d\'intégralité',
    raccourci: '/integralite',
    contenu: `ARTICLE {{numero}} – INTÉGRALITÉ DE L'ACCORD

Le présent contrat, y compris ses annexes, constitue l'intégralité de l'accord entre les Parties relativement à son objet et annule et remplace tout accord, lettre d'intention, offre ou proposition antérieurs, écrits ou oraux, entre les Parties ayant le même objet.`,
    category: 'contractuel',
    variables: ['numero'],
    isBuiltin: true,
  },

  // === SIGNATURES ===
  {
    nom: 'Fait en exemplaires',
    description: 'Formule de signature',
    raccourci: '/fait',
    contenu: `Fait à {{lieu}}, le {{date}},

En {{nombre_exemplaires}} exemplaires originaux.


Pour {{partie1.denomination}}                    Pour {{partie2.denomination}}

{{partie1.representant}}                         {{partie2.representant}}
{{partie1.qualite}}                              {{partie2.qualite}}`,
    category: 'contractuel',
    variables: ['lieu', 'date', 'nombre_exemplaires', 'partie1.denomination', 'partie1.representant', 'partie1.qualite', 'partie2.denomination', 'partie2.representant', 'partie2.qualite'],
    isBuiltin: true,
  },
]
