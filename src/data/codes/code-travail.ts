// Code du travail français
// Articles les plus couramment utilisés en droit du travail

import type { Article } from './code-civil'

export const CODE_TRAVAIL_ARTICLES: Article[] = [
  // === CONTRAT DE TRAVAIL ===
  {
    numero: 'L1221-1',
    titre: 'Soumission aux règles du droit commun',
    contenu: 'Le contrat de travail est soumis aux règles du droit commun. Il peut être établi selon les formes que les parties contractantes décident d\'adopter.',
    dateVersion: '2008-05-01',
  },
  {
    numero: 'L1221-2',
    titre: 'Présomption de CDI',
    contenu: 'Le contrat de travail est conclu pour une durée indéterminée.\n\nToutefois, dans les cas et dans les conditions fixés au titre IV relatif au contrat de travail à durée déterminée, il peut comporter un terme fixé avec précision dès sa conclusion ou résultant de la réalisation de l\'objet pour lequel il est conclu.',
    dateVersion: '2008-05-01',
  },
  {
    numero: 'L1222-1',
    titre: 'Bonne foi dans l\'exécution',
    contenu: 'Le contrat de travail est exécuté de bonne foi.',
    dateVersion: '2008-05-01',
  },

  // === PÉRIODE D'ESSAI ===
  {
    numero: 'L1221-19',
    titre: 'Définition de la période d\'essai',
    contenu: 'La période d\'essai permet à l\'employeur d\'évaluer les compétences du salarié dans son travail, notamment au regard de son expérience, et au salarié d\'apprécier si les fonctions occupées lui conviennent.',
    dateVersion: '2008-06-27',
  },
  {
    numero: 'L1221-20',
    titre: 'Existence écrite de la période d\'essai',
    contenu: 'La période d\'essai et la possibilité de la renouveler ne se présument pas. Elles sont expressément stipulées dans la lettre d\'engagement ou le contrat de travail.',
    dateVersion: '2008-06-27',
  },

  // === CDD ===
  {
    numero: 'L1242-1',
    titre: 'Objet du CDD',
    contenu: 'Un contrat de travail à durée déterminée, quel que soit son motif, ne peut avoir ni pour objet ni pour effet de pourvoir durablement un emploi lié à l\'activité normale et permanente de l\'entreprise.',
    dateVersion: '2008-05-01',
  },
  {
    numero: 'L1242-2',
    titre: 'Cas de recours au CDD',
    contenu: 'Sous réserve des dispositions de l\'article L. 1242-3, un contrat de travail à durée déterminée ne peut être conclu que pour l\'exécution d\'une tâche précise et temporaire, et seulement dans les cas suivants :\n\n1° Remplacement d\'un salarié en cas d\'absence, de passage provisoire à temps partiel, de suspension de son contrat de travail, de départ définitif précédant la suppression de son poste de travail ou d\'attente de l\'entrée en service effective du salarié recruté par contrat à durée indéterminée appelé à le remplacer ;\n\n2° Accroissement temporaire de l\'activité de l\'entreprise ;\n\n3° Emplois à caractère saisonnier ;\n\n4° Remplacement d\'un chef d\'entreprise artisanale, industrielle ou commerciale.',
    dateVersion: '2015-08-06',
  },
  {
    numero: 'L1243-8',
    titre: 'Indemnité de fin de contrat',
    contenu: 'Lorsque, à l\'issue d\'un contrat de travail à durée déterminée, les relations contractuelles de travail ne se poursuivent pas par un contrat à durée indéterminée, le salarié a droit, à titre de complément de salaire, à une indemnité de fin de contrat destinée à compenser la précarité de sa situation.\n\nCette indemnité est égale à 10 % de la rémunération totale brute versée au salarié.',
    dateVersion: '2008-05-01',
  },

  // === LICENCIEMENT ===
  {
    numero: 'L1231-1',
    titre: 'Rupture du CDI',
    contenu: 'Le contrat de travail à durée indéterminée peut être rompu à l\'initiative de l\'employeur ou du salarié, ou d\'un commun accord, dans les conditions prévues par les dispositions du présent titre.',
    dateVersion: '2008-05-01',
  },
  {
    numero: 'L1232-1',
    titre: 'Cause réelle et sérieuse',
    contenu: 'Tout licenciement pour motif personnel est motivé dans les conditions définies par le présent chapitre.\n\nIl est justifié par une cause réelle et sérieuse.',
    dateVersion: '2008-05-01',
  },
  {
    numero: 'L1232-2',
    titre: 'Entretien préalable',
    contenu: 'L\'employeur qui envisage de licencier un salarié le convoque, avant toute décision, à un entretien préalable.\n\nLa convocation est effectuée par lettre recommandée ou par lettre remise en main propre contre décharge. Cette lettre indique l\'objet de la convocation.\n\nL\'entretien préalable ne peut avoir lieu moins de cinq jours ouvrables après la présentation de la lettre recommandée ou la remise en main propre de la lettre de convocation.',
    dateVersion: '2008-05-01',
  },
  {
    numero: 'L1232-6',
    titre: 'Notification du licenciement',
    contenu: 'Lorsque l\'employeur décide de licencier un salarié, il lui notifie sa décision par lettre recommandée avec avis de réception.\n\nCette lettre comporte l\'énoncé du ou des motifs invoqués par l\'employeur.',
    dateVersion: '2017-09-22',
  },
  {
    numero: 'L1234-1',
    titre: 'Préavis',
    contenu: 'Lorsque le licenciement n\'est pas motivé par une faute grave, le salarié a droit :\n\n1° S\'il justifie chez le même employeur d\'une ancienneté de services continus inférieure à six mois, à un préavis dont la durée est déterminée par la loi, la convention ou l\'accord collectif de travail ou, à défaut, par les usages pratiqués dans la localité et la profession ;\n\n2° S\'il justifie chez le même employeur d\'une ancienneté de services continus comprise entre six mois et moins de deux ans, à un préavis d\'un mois ;\n\n3° S\'il justifie chez le même employeur d\'une ancienneté de services continus d\'au moins deux ans, à un préavis de deux mois.',
    dateVersion: '2008-05-01',
  },
  {
    numero: 'L1234-9',
    titre: 'Indemnité de licenciement',
    contenu: 'Le salarié titulaire d\'un contrat de travail à durée indéterminée, licencié alors qu\'il compte 8 mois d\'ancienneté ininterrompus au service du même employeur, a droit, sauf en cas de faute grave, à une indemnité de licenciement.\n\nLes modalités de calcul de cette indemnité sont fonction de la rémunération brute dont le salarié bénéficiait antérieurement à la rupture du contrat de travail. Ce taux et ces modalités sont déterminés par voie réglementaire.',
    dateVersion: '2017-09-22',
  },
  {
    numero: 'L1235-3',
    titre: 'Indemnité pour licenciement sans cause réelle et sérieuse',
    contenu: 'Si le licenciement d\'un salarié survient pour une cause qui n\'est pas réelle et sérieuse, le juge peut proposer la réintégration du salarié dans l\'entreprise, avec maintien de ses avantages acquis.\n\nSi l\'une ou l\'autre des parties refuse cette réintégration, le juge octroie au salarié une indemnité à la charge de l\'employeur, dont le montant est compris entre les montants minimaux et maximaux fixés dans le tableau ci-dessous.',
    dateVersion: '2017-09-22',
  },

  // === LICENCIEMENT ÉCONOMIQUE ===
  {
    numero: 'L1233-3',
    titre: 'Définition du licenciement économique',
    contenu: 'Constitue un licenciement pour motif économique le licenciement effectué par un employeur pour un ou plusieurs motifs non inhérents à la personne du salarié résultant d\'une suppression ou transformation d\'emploi ou d\'une modification, refusée par le salarié, d\'un élément essentiel du contrat de travail, consécutives notamment :\n\n1° A des difficultés économiques caractérisées soit par l\'évolution significative d\'au moins un indicateur économique tel qu\'une baisse des commandes ou du chiffre d\'affaires, des pertes d\'exploitation ou une dégradation de la trésorerie ou de l\'excédent brut d\'exploitation, soit par tout autre élément de nature à justifier de ces difficultés ;\n\n2° A des mutations technologiques ;\n\n3° A une réorganisation de l\'entreprise nécessaire à la sauvegarde de sa compétitivité ;\n\n4° A la cessation d\'activité de l\'entreprise.',
    dateVersion: '2016-08-08',
  },

  // === DURÉE DU TRAVAIL ===
  {
    numero: 'L3121-1',
    titre: 'Définition du temps de travail effectif',
    contenu: 'La durée du travail effectif est le temps pendant lequel le salarié est à la disposition de l\'employeur et se conforme à ses directives sans pouvoir vaquer librement à des occupations personnelles.',
    dateVersion: '2016-08-08',
  },
  {
    numero: 'L3121-27',
    titre: 'Durée légale du travail',
    contenu: 'La durée légale de travail effectif des salariés à temps complet est fixée à trente-cinq heures par semaine.',
    dateVersion: '2016-08-08',
  },
  {
    numero: 'L3121-28',
    titre: 'Heures supplémentaires',
    contenu: 'Toute heure accomplie au delà de la durée légale hebdomadaire ou de la durée considérée comme équivalente est une heure supplémentaire qui ouvre droit à une majoration salariale ou, le cas échéant, à un repos compensateur équivalent.',
    dateVersion: '2016-08-08',
  },

  // === HARCÈLEMENT ===
  {
    numero: 'L1152-1',
    titre: 'Harcèlement moral',
    contenu: 'Aucun salarié ne doit subir les agissements répétés de harcèlement moral qui ont pour objet ou pour effet une dégradation de ses conditions de travail susceptible de porter atteinte à ses droits et à sa dignité, d\'altérer sa santé physique ou mentale ou de compromettre son avenir professionnel.',
    dateVersion: '2008-05-01',
  },
  {
    numero: 'L1153-1',
    titre: 'Harcèlement sexuel',
    contenu: 'Aucun salarié ne doit subir des faits :\n\n1° Soit de harcèlement sexuel, constitué par des propos ou comportements à connotation sexuelle ou sexiste répétés qui soit portent atteinte à sa dignité en raison de leur caractère dégradant ou humiliant, soit créent à son encontre une situation intimidante, hostile ou offensante ;\n\n2° Soit assimilés au harcèlement sexuel, consistant en toute forme de pression grave, même non répétée, exercée dans le but réel ou apparent d\'obtenir un acte de nature sexuelle, que celui-ci soit recherché au profit de l\'auteur des faits ou au profit d\'un tiers.',
    dateVersion: '2022-03-21',
  },

  // === DISCRIMINATION ===
  {
    numero: 'L1132-1',
    titre: 'Principe de non-discrimination',
    contenu: 'Aucune personne ne peut être écartée d\'une procédure de recrutement ou de nomination ou de l\'accès à un stage ou à une période de formation en entreprise, aucun salarié ne peut être sanctionné, licencié ou faire l\'objet d\'une mesure discriminatoire, directe ou indirecte, telle que définie à l\'article 1er de la loi n° 2008-496 du 27 mai 2008 portant diverses dispositions d\'adaptation au droit communautaire dans le domaine de la lutte contre les discriminations, notamment en matière de rémunération, de mesures d\'intéressement ou de distribution d\'actions, de formation, de reclassement, d\'affectation, de qualification, de classification, de promotion professionnelle, d\'horaires de travail, d\'évaluation de la performance, de mutation ou de renouvellement de contrat.',
    dateVersion: '2023-07-12',
  },

  // === RUPTURE CONVENTIONNELLE ===
  {
    numero: 'L1237-11',
    titre: 'Rupture conventionnelle',
    contenu: 'L\'employeur et le salarié peuvent convenir en commun des conditions de la rupture du contrat de travail qui les lie.\n\nLa rupture conventionnelle, exclusive du licenciement ou de la démission, ne peut être imposée par l\'une ou l\'autre des parties.\n\nElle résulte d\'une convention signée par les parties au contrat. Elle est soumise aux dispositions de la présente section destinées à garantir la liberté du consentement des parties.',
    dateVersion: '2008-06-27',
  },

  // === CONGÉS PAYÉS ===
  {
    numero: 'L3141-1',
    titre: 'Droit aux congés payés',
    contenu: 'Tout salarié a droit chaque année à un congé payé à la charge de l\'employeur.',
    dateVersion: '2016-08-08',
  },
  {
    numero: 'L3141-3',
    titre: 'Durée des congés payés',
    contenu: 'Le salarié a droit à un congé de deux jours et demi ouvrables par mois de travail effectif chez le même employeur.\n\nLa durée totale du congé exigible ne peut excéder trente jours ouvrables.',
    dateVersion: '2016-08-08',
  },
]

// Fonction de recherche dans les articles du Code du travail
export function searchArticlesTravail(query: string): Article[] {
  const lowerQuery = query.toLowerCase()

  return CODE_TRAVAIL_ARTICLES.filter(article =>
    article.numero.toLowerCase().includes(lowerQuery) ||
    article.titre?.toLowerCase().includes(lowerQuery) ||
    article.contenu.toLowerCase().includes(lowerQuery)
  )
}

// Trouver un article par numéro
export function findArticleTravailByNumero(numero: string): Article | undefined {
  return CODE_TRAVAIL_ARTICLES.find(article => article.numero === numero)
}
