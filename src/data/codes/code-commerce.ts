// Code de commerce français
// Articles les plus couramment utilisés en droit des affaires

import type { Article } from './code-civil'

export const CODE_COMMERCE_ARTICLES: Article[] = [
  // === ACTES DE COMMERCE ===
  {
    numero: 'L110-1',
    titre: 'Actes de commerce par nature',
    contenu: 'La loi répute actes de commerce :\n\n1° Tout achat de biens meubles pour les revendre, soit en nature, soit après les avoir travaillés et mis en oeuvre ;\n\n2° Tout achat de biens immeubles aux fins de les revendre, à moins que l\'acquéreur n\'ait agi en vue d\'édifier un ou plusieurs bâtiments et de les vendre en bloc ou par locaux ;\n\n3° Toutes opérations d\'intermédiaire pour l\'achat, la souscription ou la vente d\'immeubles, de fonds de commerce, d\'actions ou parts de sociétés immobilières ;\n\n4° Toute entreprise de location de meubles ;\n\n5° Toute entreprise de manufactures, de commission, de transport par terre ou par eau ;\n\n6° Toute entreprise de fournitures, d\'agences, bureaux d\'affaires, établissements de ventes à l\'encan, de spectacles publics ;\n\n7° Toute opération de change, banque, courtage, activité d\'émission et de gestion de monnaie électronique ;\n\n8° Toutes les opérations des banques publiques ;\n\n9° Toutes obligations entre négociants, marchands et banquiers ;\n\n10° Entre toutes personnes, les lettres de change.',
    dateVersion: '2013-01-28',
  },
  {
    numero: 'L110-3',
    titre: 'Prescription commerciale',
    contenu: 'Les obligations nées à l\'occasion de leur commerce entre commerçants ou entre commerçants et non-commerçants se prescrivent par cinq ans si elles ne sont pas soumises à des prescriptions spéciales plus courtes.',
    dateVersion: '2008-06-17',
  },
  {
    numero: 'L110-4',
    titre: 'Liberté de la preuve en matière commerciale',
    contenu: 'A l\'égard des commerçants, les actes de commerce peuvent se prouver par tous moyens à moins qu\'il n\'en soit autrement disposé par la loi.',
    dateVersion: '2000-05-12',
  },

  // === COMMERÇANTS ===
  {
    numero: 'L121-1',
    titre: 'Définition du commerçant',
    contenu: 'Sont commerçants ceux qui exercent des actes de commerce et en font leur profession habituelle.',
    dateVersion: '2000-09-21',
  },

  // === REGISTRE DU COMMERCE ===
  {
    numero: 'L123-1',
    titre: 'Obligation d\'immatriculation',
    contenu: 'Toute personne physique ayant la qualité de commerçant est tenue de s\'immatriculer au registre du commerce et des sociétés.',
    dateVersion: '2023-01-01',
  },

  // === BAIL COMMERCIAL ===
  {
    numero: 'L145-1',
    titre: 'Champ d\'application du statut des baux commerciaux',
    contenu: 'Les dispositions du présent chapitre s\'appliquent aux baux des immeubles ou locaux dans lesquels un fonds est exploité, que ce fonds appartienne, soit à un commerçant ou à un industriel immatriculé au registre du commerce et des sociétés, soit à un chef d\'une entreprise immatriculée au répertoire des métiers, accomplissant ou non des actes de commerce.',
    dateVersion: '2014-06-18',
  },
  {
    numero: 'L145-4',
    titre: 'Durée du bail commercial',
    contenu: 'La durée du contrat de location ne peut être inférieure à neuf ans.\n\nToutefois, le preneur a la faculté de donner congé à l\'expiration d\'une période triennale, dans les formes et délai de l\'article L. 145-9.',
    dateVersion: '2014-06-18',
  },
  {
    numero: 'L145-9',
    titre: 'Congé',
    contenu: 'Par dérogation aux articles 1736 et 1737 du code civil, les baux de locaux soumis au présent chapitre ne cessent que par l\'effet d\'un congé donné six mois à l\'avance ou d\'une demande de renouvellement.\n\nA défaut de congé ou de demande de renouvellement, le bail fait par écrit se poursuit par tacite prolongation au-delà du terme fixé par le contrat.',
    dateVersion: '2014-06-18',
  },
  {
    numero: 'L145-14',
    titre: 'Droit au renouvellement',
    contenu: 'Le bailleur peut refuser le renouvellement du bail. Toutefois, le bailleur doit, sauf exceptions prévues aux articles L. 145-17 et suivants, payer au locataire évincé une indemnité dite d\'éviction égale au préjudice causé par le défaut de renouvellement.',
    dateVersion: '2014-06-18',
  },
  {
    numero: 'L145-33',
    titre: 'Fixation du loyer du bail renouvelé',
    contenu: 'Le montant des loyers des baux renouvelés ou révisés doit correspondre à la valeur locative.\n\nA défaut d\'accord, cette valeur est déterminée d\'après :\n\n1° Les caractéristiques du local considéré ;\n\n2° La destination des lieux ;\n\n3° Les obligations respectives des parties ;\n\n4° Les facteurs locaux de commercialité ;\n\n5° Les prix couramment pratiqués dans le voisinage.',
    dateVersion: '2014-06-18',
  },

  // === SOCIÉTÉS COMMERCIALES ===
  {
    numero: 'L223-1',
    titre: 'SARL - Constitution',
    contenu: 'La société à responsabilité limitée est instituée par une ou plusieurs personnes qui ne supportent les pertes qu\'à concurrence de leurs apports.\n\nLorsque la société ne comporte qu\'une seule personne, celle-ci est dénommée \"associé unique\".',
    dateVersion: '2001-05-15',
  },
  {
    numero: 'L225-1',
    titre: 'SA - Constitution',
    contenu: 'La société anonyme est la société dont le capital est divisé en actions et qui est constituée entre sept associés au moins.',
    dateVersion: '2000-09-21',
  },
  {
    numero: 'L227-1',
    titre: 'SAS - Constitution',
    contenu: 'Une société par actions simplifiée peut être instituée par une ou plusieurs personnes qui ne supportent les pertes qu\'à concurrence de leur apport.\n\nLorsque cette société ne comporte qu\'une seule personne, celle-ci est dénommée \"associé unique\".\n\nLa société par actions simplifiée est désignée par une dénomination sociale, précédée ou suivie immédiatement et lisiblement des mots \"société par actions simplifiée\" ou des initiales \"SAS\" ou, lorsqu\'elle ne comporte qu\'une seule personne, des mots \"société par actions simplifiée unipersonnelle\" ou des initiales \"SASU\".',
    dateVersion: '2014-06-18',
  },

  // === PROCÉDURES COLLECTIVES ===
  {
    numero: 'L611-4',
    titre: 'Conciliation',
    contenu: 'Il est institué, devant le tribunal de commerce, une procédure de conciliation dont bénéficient les débiteurs exerçant une activité commerciale ou artisanale qui éprouvent une difficulté juridique, économique ou financière, avérée ou prévisible, et ne se trouvent pas en cessation des paiements depuis plus de quarante-cinq jours.',
    dateVersion: '2005-07-26',
  },
  {
    numero: 'L620-1',
    titre: 'Sauvegarde',
    contenu: 'Il est institué une procédure de sauvegarde ouverte sur demande d\'un débiteur mentionné à l\'article L. 620-2 qui, sans être en cessation des paiements, justifie de difficultés qu\'il n\'est pas en mesure de surmonter. Cette procédure est destinée à faciliter la réorganisation de l\'entreprise afin de permettre la poursuite de l\'activité économique, le maintien de l\'emploi et l\'apurement du passif.',
    dateVersion: '2005-07-26',
  },
  {
    numero: 'L631-1',
    titre: 'Redressement judiciaire',
    contenu: 'Il est institué une procédure de redressement judiciaire ouverte à tout débiteur mentionné aux articles L. 631-2 ou L. 631-3 qui, dans l\'impossibilité de faire face au passif exigible avec son actif disponible, est en cessation des paiements.\n\nLa procédure de redressement judiciaire est destinée à permettre la poursuite de l\'activité de l\'entreprise, le maintien de l\'emploi et l\'apurement du passif.',
    dateVersion: '2005-07-26',
  },
  {
    numero: 'L640-1',
    titre: 'Liquidation judiciaire',
    contenu: 'Il est institué une procédure de liquidation judiciaire ouverte à tout débiteur mentionné à l\'article L. 640-2 en cessation des paiements et dont le redressement est manifestement impossible.\n\nLa procédure de liquidation judiciaire est destinée à mettre fin à l\'activité de l\'entreprise ou à réaliser le patrimoine du débiteur par une cession globale ou séparée de ses droits et de ses biens.',
    dateVersion: '2005-07-26',
  },

  // === CONCURRENCE DÉLOYALE ===
  {
    numero: 'L442-1',
    titre: 'Pratiques restrictives de concurrence',
    contenu: 'I. - Engage la responsabilité de son auteur et l\'oblige à réparer le préjudice causé le fait, dans le cadre de la négociation commerciale, de la conclusion ou de l\'exécution d\'un contrat, par toute personne exerçant des activités de production, de distribution ou de services :\n\n1° D\'obtenir ou de tenter d\'obtenir de l\'autre partie un avantage ne correspondant à aucune contrepartie ou manifestement disproportionné au regard de la valeur de la contrepartie consentie ;\n\n2° De soumettre ou de tenter de soumettre l\'autre partie à des obligations créant un déséquilibre significatif dans les droits et obligations des parties.',
    dateVersion: '2019-04-22',
  },
]

// Fonction de recherche dans les articles du Code de commerce
export function searchArticlesCommerce(query: string): Article[] {
  const lowerQuery = query.toLowerCase()

  return CODE_COMMERCE_ARTICLES.filter(article =>
    article.numero.toLowerCase().includes(lowerQuery) ||
    article.titre?.toLowerCase().includes(lowerQuery) ||
    article.contenu.toLowerCase().includes(lowerQuery)
  )
}

// Trouver un article par numéro
export function findArticleCommerceByNumero(numero: string): Article | undefined {
  return CODE_COMMERCE_ARTICLES.find(article => article.numero === numero)
}
