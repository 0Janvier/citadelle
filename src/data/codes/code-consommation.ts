// Code de la consommation français
// Articles les plus couramment utilisés en droit de la consommation

import type { Article } from './code-civil'

export const CODE_CONSOMMATION_ARTICLES: Article[] = [
  // === INFORMATION DU CONSOMMATEUR ===
  {
    numero: 'L111-1',
    titre: 'Obligation d\'information précontractuelle',
    contenu: 'Avant que le consommateur ne soit lié par un contrat de vente de biens ou de fourniture de services, le professionnel communique au consommateur, de manière lisible et compréhensible, les informations suivantes :\n\n1° Les caractéristiques essentielles du bien ou du service, compte tenu du support de communication utilisé et du bien ou service concerné ;\n\n2° Le prix du bien ou du service, en application des articles L. 112-1 à L. 112-4 ;\n\n3° En l\'absence d\'exécution immédiate du contrat, la date ou le délai auquel le professionnel s\'engage à livrer le bien ou à exécuter le service ;\n\n4° Les informations relatives à son identité, à ses coordonnées postales, téléphoniques et électroniques et à ses activités.',
    dateVersion: '2016-07-01',
  },

  // === PRATIQUES COMMERCIALES DÉLOYALES ===
  {
    numero: 'L121-1',
    titre: 'Interdiction des pratiques commerciales déloyales',
    contenu: 'Les pratiques commerciales déloyales sont interdites.\n\nUne pratique commerciale est déloyale lorsqu\'elle est contraire aux exigences de la diligence professionnelle et qu\'elle altère ou est susceptible d\'altérer de manière substantielle le comportement économique du consommateur normalement informé et raisonnablement attentif et avisé, à l\'égard d\'un bien ou d\'un service.',
    dateVersion: '2016-07-01',
  },
  {
    numero: 'L121-2',
    titre: 'Pratiques commerciales trompeuses',
    contenu: 'Une pratique commerciale est trompeuse si elle est commise dans l\'une des circonstances suivantes :\n\n1° Lorsqu\'elle crée une confusion avec un autre bien ou service, une marque, un nom commercial ou un autre signe distinctif d\'un concurrent ;\n\n2° Lorsqu\'elle repose sur des allégations, indications ou présentations fausses ou de nature à induire en erreur.',
    dateVersion: '2016-07-01',
  },

  // === CLAUSES ABUSIVES ===
  {
    numero: 'L212-1',
    titre: 'Définition des clauses abusives',
    contenu: 'Dans les contrats conclus entre professionnels et consommateurs, sont abusives les clauses qui ont pour objet ou pour effet de créer, au détriment du consommateur, un déséquilibre significatif entre les droits et obligations des parties au contrat.\n\nSans préjudice des règles d\'interprétation prévues aux articles 1188, 1189, 1191 et 1192 du code civil, le caractère abusif d\'une clause s\'apprécie en se référant, au moment de la conclusion du contrat, à toutes les circonstances qui entourent sa conclusion, de même qu\'à toutes les autres clauses du contrat. Il s\'apprécie également au regard de celles contenues dans un autre contrat lorsque les deux contrats sont juridiquement liés dans leur conclusion ou leur exécution.',
    dateVersion: '2016-07-01',
  },
  {
    numero: 'L212-2',
    titre: 'Clauses présumées abusives',
    contenu: 'Dans les contrats conclus entre professionnels et consommateurs, sont présumées abusives au sens des dispositions des premier et cinquième alinéas de l\'article L. 212-1, sauf au professionnel à rapporter la preuve contraire, les clauses ayant pour objet ou pour effet de :\n\n1° Prévoir un engagement du consommateur tandis que l\'exécution des prestations du professionnel est assujettie à une condition dont la réalisation dépend de sa seule volonté ;\n\n2° Restreindre l\'obligation pour le professionnel de respecter les engagements pris par ses mandataires.',
    dateVersion: '2016-07-01',
  },

  // === DROIT DE RÉTRACTATION ===
  {
    numero: 'L221-18',
    titre: 'Droit de rétractation',
    contenu: 'Le consommateur dispose d\'un délai de quatorze jours pour exercer son droit de rétractation d\'un contrat conclu à distance, à la suite d\'un démarchage téléphonique ou hors établissement, sans avoir à motiver sa décision ni à supporter d\'autres coûts que ceux prévus aux articles L. 221-23 à L. 221-25.\n\nLe délai mentionné au premier alinéa court à compter du jour :\n\n1° De la conclusion du contrat, pour les contrats de prestation de services ;\n\n2° De la réception du bien par le consommateur ou un tiers, autre que le transporteur, désigné par lui, pour les contrats de vente de biens.',
    dateVersion: '2016-07-01',
  },
  {
    numero: 'L221-20',
    titre: 'Information sur le droit de rétractation',
    contenu: 'Lorsque les informations relatives au droit de rétractation n\'ont pas été fournies au consommateur dans les conditions prévues au 2° de l\'article L. 221-5, le délai de rétractation est prolongé de douze mois à compter de l\'expiration du délai de rétractation initial.',
    dateVersion: '2016-07-01',
  },

  // === GARANTIES ===
  {
    numero: 'L217-3',
    titre: 'Garantie légale de conformité',
    contenu: 'Le vendeur délivre un bien conforme au contrat ainsi qu\'aux critères énoncés à l\'article L. 217-5.\n\nIl répond des défauts de conformité existant au moment de la délivrance du bien au sens de l\'article L. 216-1, qui apparaissent dans un délai de deux ans à compter de celle-ci.',
    dateVersion: '2022-01-01',
  },
  {
    numero: 'L217-12',
    titre: 'Mise en oeuvre de la garantie de conformité',
    contenu: 'Le consommateur a droit à la mise en conformité du bien par réparation ou remplacement dans un délai de trente jours suivant sa demande, sans frais et sans inconvénient majeur pour lui, compte tenu de la nature du bien et de l\'usage recherché par le consommateur.',
    dateVersion: '2022-01-01',
  },

  // === CRÉDIT À LA CONSOMMATION ===
  {
    numero: 'L312-1',
    titre: 'Champ d\'application du crédit à la consommation',
    contenu: 'Les dispositions du présent chapitre s\'appliquent au crédit mentionné au 4° de l\'article L. 311-1 accordé de manière habituelle par des personnes physiques ou morales, que ce crédit soit consenti à titre onéreux ou à titre gratuit.\n\nUn décret fixe le montant du crédit au-delà duquel ou en deçà duquel ces dispositions ne sont pas applicables.',
    dateVersion: '2016-07-01',
  },
  {
    numero: 'L312-25',
    titre: 'Rétractation du crédit à la consommation',
    contenu: 'L\'emprunteur peut se rétracter sans motifs dans un délai de quatorze jours calendaires révolus à compter du jour de l\'acceptation de l\'offre de contrat de crédit comprenant les informations prévues à l\'article L. 312-28.',
    dateVersion: '2016-07-01',
  },

  // === SURENDETTEMENT ===
  {
    numero: 'L711-1',
    titre: 'Procédure de surendettement',
    contenu: 'Le bénéfice des mesures de traitement des situations de surendettement est ouvert aux personnes physiques de bonne foi.\n\nLa situation de surendettement est caractérisée par l\'impossibilité manifeste de faire face à l\'ensemble de ses dettes non professionnelles exigibles et à échoir. Le seul fait d\'être propriétaire de son logement principal dont la valeur estimée à la date du dépôt du dossier de surendettement est égale ou supérieure au montant de l\'ensemble des dettes non professionnelles exigibles et à échoir ne fait pas obstacle à la caractérisation de la situation de surendettement.',
    dateVersion: '2022-01-01',
  },

  // === DÉMARCHAGE ET VENTE À DISTANCE ===
  {
    numero: 'L221-1',
    titre: 'Définition de la vente à distance',
    contenu: 'I. - Est un contrat à distance tout contrat conclu entre un professionnel et un consommateur, dans le cadre d\'un système organisé de vente ou de prestation de services à distance, sans la présence physique simultanée du professionnel et du consommateur, par le recours exclusif à une ou plusieurs techniques de communication à distance jusqu\'à la conclusion du contrat.\n\nII. - Est un contrat hors établissement tout contrat conclu entre un professionnel et un consommateur :\n\n1° Dans un lieu qui n\'est pas celui où le professionnel exerce son activité en permanence ou de manière habituelle.',
    dateVersion: '2016-07-01',
  },
  {
    numero: 'L221-5',
    titre: 'Information précontractuelle dans la vente à distance',
    contenu: 'Préalablement à la conclusion d\'un contrat de vente ou de fourniture de services, le professionnel fournit au consommateur, de manière lisible et compréhensible, les informations suivantes :\n\n1° Les informations prévues aux articles L. 111-1 et L. 111-2 ;\n\n2° Lorsque le droit de rétractation existe, les conditions, le délai et les modalités d\'exercice de ce droit ainsi que le formulaire type de rétractation ;\n\n3° Le cas échéant, le fait que le consommateur supporte les frais de renvoi du bien en cas de rétractation.',
    dateVersion: '2016-07-01',
  },

  // === MÉDIATION ===
  {
    numero: 'L612-1',
    titre: 'Droit à la médiation de la consommation',
    contenu: 'Tout consommateur a le droit de recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable du litige qui l\'oppose à un professionnel. A cet effet, le professionnel garantit au consommateur le recours effectif à un dispositif de médiation de la consommation.',
    dateVersion: '2016-07-01',
  },
]

// Fonction de recherche dans les articles du Code de la consommation
export function searchArticlesConsommation(query: string): Article[] {
  const lowerQuery = query.toLowerCase()

  return CODE_CONSOMMATION_ARTICLES.filter(article =>
    article.numero.toLowerCase().includes(lowerQuery) ||
    article.titre?.toLowerCase().includes(lowerQuery) ||
    article.contenu.toLowerCase().includes(lowerQuery)
  )
}

// Trouver un article par numéro
export function findArticleConsommationByNumero(numero: string): Article | undefined {
  return CODE_CONSOMMATION_ARTICLES.find(article => article.numero === numero)
}
