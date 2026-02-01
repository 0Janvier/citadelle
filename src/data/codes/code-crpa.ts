// Code des relations entre le public et l'administration (CRPA)
// Articles les plus couramment utilisés en pratique administrative

import type { Article } from './code-civil'

export const CODE_CRPA_ARTICLES: Article[] = [
  // === DISPOSITIONS PRÉLIMINAIRES ===
  {
    numero: 'L100-1',
    titre: 'Champ d\'application',
    contenu: 'Le présent code régit les relations entre le public et l\'administration en l\'absence de dispositions spéciales applicables.',
    dateVersion: '2016-01-01',
  },
  {
    numero: 'L100-2',
    titre: 'Définition de l\'administration',
    contenu: 'Au sens du présent code et sauf disposition contraire de celui-ci, on entend par :\n\n1° Administration : les administrations de l\'État, les collectivités territoriales, leurs établissements publics administratifs et les organismes et personnes de droit public et de droit privé chargés d\'une mission de service public administratif, y compris les organismes de sécurité sociale ;\n\n2° Public : toute personne physique ainsi que toute personne morale de droit privé, à l\'exception de celles qui sont chargées d\'une mission de service public lorsqu\'est en cause l\'exercice de cette mission.',
    dateVersion: '2016-01-01',
  },
  {
    numero: 'L100-3',
    titre: 'Principes de l\'action administrative',
    contenu: 'L\'administration agit dans l\'intérêt général et respecte le principe de légalité. Elle est tenue à l\'obligation de neutralité et au respect du principe de laïcité. Elle se conforme au principe d\'égalité et garantit à chacun un traitement impartial.',
    dateVersion: '2016-01-01',
  },

  // === ÉCHANGES AVEC L'ADMINISTRATION ===
  {
    numero: 'L111-2',
    titre: 'Droit à l\'information',
    contenu: 'Toute personne a le droit de connaître le prénom, le nom, la qualité et l\'adresse administratives de l\'agent chargé d\'instruire sa demande ou de traiter l\'affaire qui la concerne ; ces éléments figurent sur les correspondances qui lui sont adressées. Si des motifs intéressant la sécurité publique ou la sécurité des personnes le justifient, l\'anonymat de l\'agent est respecté.',
    dateVersion: '2016-01-01',
  },
  {
    numero: 'L112-2',
    titre: 'Accusé de réception',
    contenu: 'Les administrations accusent réception des demandes qui leur sont adressées.\n\nLes délais de recours ne sont pas opposables à l\'auteur d\'une demande lorsque l\'accusé de réception ne lui a pas été transmis ou ne comporte pas les indications exigées par la réglementation.',
    dateVersion: '2016-01-01',
  },
  {
    numero: 'L112-3',
    titre: 'Transmission à l\'administration compétente',
    contenu: 'Lorsqu\'une demande est adressée à une administration incompétente, cette dernière la transmet à l\'administration compétente et en avise l\'intéressé.\n\nLe délai au terme duquel est susceptible d\'intervenir une décision implicite d\'acceptation ou de rejet court à compter de la date de réception de la demande par l\'administration initialement saisie.',
    dateVersion: '2016-01-01',
  },
  {
    numero: 'L114-5',
    titre: 'Régularisation des demandes',
    contenu: 'Lorsqu\'une demande adressée à l\'administration est incomplète, celle-ci indique au demandeur les pièces et informations manquantes exigées par les textes législatifs et réglementaires en vigueur. Elle fixe un délai pour la réception de ces pièces et informations.\n\nLe délai au terme duquel, à défaut de décision expresse, la demande est réputée acceptée ou rejetée ne court qu\'à compter de la réception des pièces et informations requises.',
    dateVersion: '2016-01-01',
  },

  // === DÉCISIONS IMPLICITES ===
  {
    numero: 'L231-1',
    titre: 'Principe : silence vaut acceptation',
    contenu: 'Le silence gardé pendant deux mois par l\'administration sur une demande vaut décision d\'acceptation.\n\nLa liste des procédures pour lesquelles le silence gardé sur une demande vaut décision d\'acceptation est publiée sur un site internet relevant du Premier ministre.',
    dateVersion: '2016-01-01',
  },
  {
    numero: 'L231-4',
    titre: 'Exceptions : silence vaut rejet',
    contenu: 'Par dérogation à l\'article L. 231-1, le silence gardé par l\'administration pendant deux mois vaut décision de rejet :\n\n1° Lorsque la demande ne tend pas à l\'adoption d\'une décision présentant le caractère d\'une décision individuelle ;\n\n2° Lorsque la demande ne s\'inscrit pas dans une procédure prévue par un texte législatif ou réglementaire ou présente le caractère d\'une réclamation ou d\'un recours administratif ;\n\n3° Si la demande présente un caractère financier sauf, en matière de sécurité sociale, dans les cas prévus par décret ;\n\n4° Dans les cas, précisés par décret en Conseil d\'État, où une acceptation implicite ne serait pas compatible avec le respect des engagements internationaux et européens de la France, la protection de la sécurité nationale, la protection des libertés et des principes à valeur constitutionnelle et la sauvegarde de l\'ordre public ;\n\n5° Dans les relations entre les autorités administratives et leurs agents.',
    dateVersion: '2016-01-01',
  },
  {
    numero: 'L232-2',
    titre: 'Délai de deux mois',
    contenu: 'Le délai au terme duquel le silence gardé par l\'administration sur une demande vaut décision d\'acceptation ou de rejet est de deux mois.\n\nIl court à compter de la date de réception de la demande par l\'administration compétente.',
    dateVersion: '2016-01-01',
  },

  // === MOTIVATION DES DÉCISIONS ===
  {
    numero: 'L211-2',
    titre: 'Obligation de motivation',
    contenu: 'Les personnes physiques ou morales ont le droit d\'être informées sans délai des motifs des décisions administratives individuelles défavorables qui les concernent.\n\nÀ cet effet, doivent être motivées les décisions qui :\n\n1° Restreignent l\'exercice des libertés publiques ou, de manière générale, constituent une mesure de police ;\n\n2° Infligent une sanction ;\n\n3° Subordonnent l\'octroi d\'une autorisation à des conditions restrictives ou imposent des sujétions ;\n\n4° Retirent ou abrogent une décision créatrice de droits ;\n\n5° Opposent une prescription, une forclusion ou une déchéance ;\n\n6° Refusent un avantage dont l\'attribution constitue un droit pour les personnes qui remplissent les conditions légales pour l\'obtenir ;\n\n7° Refusent une autorisation, sauf lorsque la communication des motifs pourrait être de nature à porter atteinte à l\'un des secrets ou intérêts protégés par les dispositions du a au f du 2° de l\'article L. 311-5 ;\n\n8° Rejettent un recours administratif dont la présentation est obligatoire préalablement à tout recours contentieux en application d\'une disposition législative ou réglementaire.',
    dateVersion: '2016-01-01',
  },
  {
    numero: 'L211-5',
    titre: 'Forme de la motivation',
    contenu: 'La motivation exigée par le présent chapitre doit être écrite et comporter l\'énoncé des considérations de droit et de fait qui constituent le fondement de la décision.',
    dateVersion: '2016-01-01',
  },

  // === PROCÉDURE CONTRADICTOIRE ===
  {
    numero: 'L121-1',
    titre: 'Principe du contradictoire',
    contenu: 'Exception faite des cas où il est statué sur une demande, les décisions individuelles qui doivent être motivées en application de l\'article L. 211-2, ainsi que les décisions qui, bien que non mentionnées à cet article, sont prises en considération de la personne, sont soumises au respect d\'une procédure contradictoire préalable.',
    dateVersion: '2016-01-01',
  },
  {
    numero: 'L121-2',
    titre: 'Mise en œuvre du contradictoire',
    contenu: 'Les décisions mentionnées à l\'article L. 121-1 n\'interviennent qu\'après que la personne intéressée a été mise à même de présenter des observations écrites et, le cas échéant, sur sa demande, des observations orales. Cette personne peut se faire assister par un conseil ou représenter par un mandataire de son choix.',
    dateVersion: '2016-01-01',
  },

  // === RETRAIT ET ABROGATION ===
  {
    numero: 'L242-1',
    titre: 'Retrait des décisions créatrices de droits',
    contenu: 'L\'administration ne peut abroger ou retirer une décision créatrice de droits de sa propre initiative ou sur la demande d\'un tiers que si elle est illégale et si l\'abrogation ou le retrait intervient dans le délai de quatre mois suivant la prise de cette décision.',
    dateVersion: '2016-01-01',
  },
  {
    numero: 'L242-2',
    titre: 'Retrait sur demande du bénéficiaire',
    contenu: 'Par dérogation à l\'article L. 242-1, l\'administration peut, sans condition de délai, abroger ou retirer une décision créatrice de droits :\n\n1° Si les conditions mises à son édiction n\'étaient pas remplies dès l\'origine ;\n\n2° Si les conditions mises à son édiction ont cessé d\'être remplies postérieurement ;\n\n3° Si le bénéficiaire en demande le retrait et que ce retrait ne porte pas atteinte aux droits des tiers.',
    dateVersion: '2016-01-01',
  },

  // === ACCÈS AUX DOCUMENTS ADMINISTRATIFS ===
  {
    numero: 'L300-1',
    titre: 'Droit d\'accès aux documents administratifs',
    contenu: 'Le droit de toute personne à l\'information est précisé et garanti par les dispositions des titres Ier, III et IV du présent livre en ce qui concerne la liberté d\'accès aux documents administratifs.',
    dateVersion: '2016-01-01',
  },
  {
    numero: 'L311-1',
    titre: 'Documents communicables',
    contenu: 'Sous réserve des dispositions des articles L. 311-5 et L. 311-6, les administrations mentionnées à l\'article L. 300-2 sont tenues de publier en ligne ou de communiquer les documents administratifs qu\'elles détiennent aux personnes qui en font la demande, dans les conditions prévues par le présent livre.',
    dateVersion: '2016-01-01',
  },
  {
    numero: 'L311-5',
    titre: 'Documents non communicables',
    contenu: 'Ne sont pas communicables :\n\n1° Les avis du Conseil d\'État et des juridictions administratives, les documents de la Cour des comptes mentionnés à l\'article L. 141-10 du code des juridictions financières et les documents des chambres régionales des comptes mentionnés à l\'article L. 241-6 du même code, les documents élaborés ou détenus par l\'Autorité de la concurrence dans le cadre de l\'exercice de ses pouvoirs d\'enquête, d\'instruction et de décision, les documents élaborés ou détenus par la Haute Autorité pour la transparence de la vie publique dans le cadre des missions prévues à l\'article 20 de la loi n° 2013-907 du 11 octobre 2013, les documents préalables à l\'élaboration du rapport d\'accréditation des établissements de santé prévu à l\'article L. 6113-6 du code de la santé publique, les documents préalables à l\'accréditation des laboratoires de biologie médicale prévu à l\'article L. 6221-1 du même code, ainsi que les rapports d\'audit des établissements de santé mentionnés à l\'article 40 de la loi n° 2000-1257 du 23 décembre 2000 ;\n\n2° Les autres documents administratifs dont la consultation ou la communication porterait atteinte :\na) Au secret des délibérations du Gouvernement et des autorités responsables relevant du pouvoir exécutif ;\nb) Au secret de la défense nationale ;\nc) À la conduite de la politique extérieure de la France ;\nd) À la sûreté de l\'État, à la sécurité publique, à la sécurité des personnes ou à la sécurité des systèmes d\'information des administrations ;\ne) À la monnaie et au crédit public ;\nf) Au déroulement des procédures engagées devant les juridictions ou d\'opérations préliminaires à de telles procédures, sauf autorisation donnée par l\'autorité compétente ;\ng) À la recherche et à la prévention, par les services compétents, d\'infractions de toute nature ;\nh) Ou sous réserve de l\'article L. 124-4 du code de l\'environnement, aux autres secrets protégés par la loi.',
    dateVersion: '2016-01-01',
  },

  // === DROIT À LA COMMUNICATION DES DONNÉES PERSONNELLES ===
  {
    numero: 'L311-6',
    titre: 'Protection de la vie privée',
    contenu: 'Ne sont communicables qu\'à l\'intéressé les documents administratifs :\n\n1° Dont la communication porterait atteinte à la protection de la vie privée, au secret médical et au secret des affaires, lequel comprend le secret des procédés, des informations économiques et financières et des stratégies commerciales ou industrielles ;\n\n2° Portant une appréciation ou un jugement de valeur sur une personne physique, nommément désignée ou facilement identifiable ;\n\n3° Faisant apparaître le comportement d\'une personne, dès lors que la divulgation de ce comportement pourrait lui porter préjudice.',
    dateVersion: '2016-01-01',
  },
]

// Fonction de recherche dans les articles du CRPA
export function searchArticlesCRPA(query: string): Article[] {
  const lowerQuery = query.toLowerCase()

  return CODE_CRPA_ARTICLES.filter(article =>
    article.numero.toLowerCase().includes(lowerQuery) ||
    article.titre?.toLowerCase().includes(lowerQuery) ||
    article.contenu.toLowerCase().includes(lowerQuery)
  )
}

// Trouver un article par numéro
export function findArticleCRPAByNumero(numero: string): Article | undefined {
  return CODE_CRPA_ARTICLES.find(article => article.numero === numero)
}
