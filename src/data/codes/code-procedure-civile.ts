// Extraits du Code de procédure civile français pour référence rapide
// Ces articles sont les plus couramment utilisés en pratique contentieuse

import type { Article } from './code-civil'

export const CODE_PROCEDURE_CIVILE_ARTICLES: Article[] = [
  // === PRINCIPES DIRECTEURS DU PROCÈS ===
  {
    numero: '1',
    titre: 'Initiative du litige',
    contenu: 'Seules les parties introduisent l\'instance, hors les cas où la loi en dispose autrement. Elles ont la liberté d\'y mettre fin avant qu\'elle ne s\'éteigne par l\'effet du jugement ou en vertu de la loi.',
    dateVersion: '1975-12-05',
  },
  {
    numero: '2',
    titre: 'Impulsion processuelle',
    contenu: 'Les parties conduisent l\'instance sous les charges qui leur incombent. Il leur appartient d\'accomplir les actes de la procédure dans les formes et délais requis.',
    dateVersion: '1975-12-05',
  },
  {
    numero: '6',
    titre: 'Principe dispositif',
    contenu: 'A l\'appui de leurs prétentions, les parties ont la charge d\'alléguer les faits propres à les fonder.',
    dateVersion: '1975-12-05',
  },
  {
    numero: '9',
    titre: 'Charge de la preuve',
    contenu: 'Il incombe à chaque partie de prouver conformément à la loi les faits nécessaires au succès de sa prétention.',
    dateVersion: '1975-12-05',
  },
  {
    numero: '12',
    titre: 'Office du juge',
    contenu: 'Le juge tranche le litige conformément aux règles de droit qui lui sont applicables.\n\nIl doit donner ou restituer leur exacte qualification aux faits et actes litigieux sans s\'arrêter à la dénomination que les parties en auraient proposée.\n\nToutefois, il ne peut changer la dénomination ou le fondement juridique lorsque les parties, en vertu d\'un accord exprès et pour les droits dont elles ont la libre disposition, l\'ont lié par les qualifications et points de droit auxquels elles entendent limiter le débat.',
    dateVersion: '1975-12-05',
  },
  {
    numero: '14',
    titre: 'Principe du contradictoire',
    contenu: 'Nulle partie ne peut être jugée sans avoir été entendue ou appelée.',
    dateVersion: '1975-12-05',
  },
  {
    numero: '16',
    titre: 'Respect du contradictoire par le juge',
    contenu: 'Le juge doit, en toutes circonstances, faire observer et observer lui-même le principe de la contradiction.\n\nIl ne peut retenir, dans sa décision, les moyens, les explications et les documents invoqués ou produits par les parties que si celles-ci ont été à même d\'en débattre contradictoirement.\n\nIl ne peut fonder sa décision sur les moyens de droit qu\'il a relevés d\'office sans avoir au préalable invité les parties à présenter leurs observations.',
    dateVersion: '1975-12-05',
  },

  // === FINS DE NON-RECEVOIR ===
  {
    numero: '122',
    titre: 'Fin de non-recevoir - Définition',
    contenu: 'Constitue une fin de non-recevoir tout moyen qui tend à faire déclarer l\'adversaire irrecevable en sa demande, sans examen au fond, pour défaut de droit d\'agir, tel le défaut de qualité, le défaut d\'intérêt, la prescription, le délai préfix, la chose jugée.',
    dateVersion: '1975-12-05',
  },
  {
    numero: '123',
    titre: 'Invocation des fins de non-recevoir',
    contenu: 'Les fins de non-recevoir peuvent être proposées en tout état de cause, à moins qu\'il en soit disposé autrement et sauf la possibilité pour le juge de condamner à des dommages-intérêts ceux qui se seraient abstenus, dans une intention dilatoire, de les soulever plus tôt.',
    dateVersion: '1975-12-05',
  },
  {
    numero: '125',
    titre: 'Relevé d\'office des fins de non-recevoir',
    contenu: 'Les fins de non-recevoir doivent être relevées d\'office lorsqu\'elles ont un caractère d\'ordre public, notamment lorsqu\'elles résultent de l\'inobservation des délais dans lesquels doivent être exercées les voies de recours ou de l\'absence d\'ouverture d\'une voie de recours.\n\nLe juge peut relever d\'office la fin de non-recevoir tirée du défaut d\'intérêt, du défaut de qualité ou de la chose jugée.',
    dateVersion: '1975-12-05',
  },

  // === MESURES D'INSTRUCTION ===
  {
    numero: '143',
    titre: 'Mesures d\'instruction',
    contenu: 'Les faits dont dépend la solution du litige peuvent, à la demande des parties ou d\'office, être l\'objet de toute mesure d\'instruction légalement admissible.',
    dateVersion: '1975-12-05',
  },
  {
    numero: '144',
    titre: 'Conditions des mesures d\'instruction',
    contenu: 'Les mesures d\'instruction peuvent être ordonnées en tout état de cause, dès lors que le juge ne dispose pas d\'éléments suffisants pour statuer.',
    dateVersion: '1975-12-05',
  },
  {
    numero: '145',
    titre: 'Mesures d\'instruction in futurum',
    contenu: 'S\'il existe un motif légitime de conserver ou d\'établir avant tout procès la preuve de faits dont pourrait dépendre la solution d\'un litige, les mesures d\'instruction légalement admissibles peuvent être ordonnées à la demande de tout intéressé, sur requête ou en référé.',
    dateVersion: '1975-12-05',
  },

  // === RÉFÉRÉ ===
  {
    numero: '808',
    titre: 'Référé d\'urgence',
    contenu: 'Dans tous les cas d\'urgence, le président du tribunal judiciaire ou le juge du contentieux de la protection dans les limites de sa compétence, peuvent ordonner en référé toutes les mesures qui ne se heurtent à aucune contestation sérieuse ou que justifie l\'existence d\'un différend.',
    dateVersion: '2019-12-11',
  },
  {
    numero: '809',
    titre: 'Référé provision et injonction',
    contenu: 'Le président peut toujours, même en présence d\'une contestation sérieuse, prescrire en référé les mesures conservatoires ou de remise en état qui s\'imposent, soit pour prévenir un dommage imminent, soit pour faire cesser un trouble manifestement illicite.\n\nDans les cas où l\'existence de l\'obligation n\'est pas sérieusement contestable, il peut accorder une provision au créancier, ou ordonner l\'exécution de l\'obligation même s\'il s\'agit d\'une obligation de faire.',
    dateVersion: '2019-12-11',
  },

  // === VOIES DE RECOURS ===
  {
    numero: '538',
    titre: 'Effet suspensif de l\'appel',
    contenu: 'L\'appel n\'est pas suspensif d\'exécution.',
    dateVersion: '2019-12-11',
  },
  {
    numero: '539',
    titre: 'Délai d\'appel',
    contenu: 'Le délai d\'appel est d\'un mois en matière contentieuse et de quinze jours en matière gracieuse.',
    dateVersion: '2019-12-11',
  },
  {
    numero: '542',
    titre: 'Objet de l\'appel',
    contenu: 'L\'appel tend, par la critique du jugement rendu par une juridiction du premier degré, à sa réformation ou à son annulation par la cour d\'appel.',
    dateVersion: '2019-12-11',
  },
  {
    numero: '564',
    titre: 'Demandes nouvelles en appel',
    contenu: 'A peine d\'irrecevabilité relevée d\'office, les parties ne peuvent soumettre à la cour de nouvelles prétentions si ce n\'est pour opposer compensation, faire écarter les prétentions adverses ou faire juger les questions nées de l\'intervention d\'un tiers, ou de la survenance ou de la révélation d\'un fait.',
    dateVersion: '2019-12-11',
  },

  // === FRAIS ET DÉPENS ===
  {
    numero: '695',
    titre: 'Dépens',
    contenu: 'Les dépens afférents aux instances, actes et procédures d\'exécution comprennent :\n\n1° Les droits, taxes, redevances ou émoluments perçus par les secrétariats des juridictions ou l\'administration des impôts à l\'exception des droits, taxes et pénalités éventuellement dus sur les actes et titres produits à l\'appui des prétentions des parties ;\n\n2° Les frais de traduction des actes lorsque celle-ci est rendue nécessaire par la loi ou par un engagement international ;\n\n3° Les indemnités des témoins ;\n\n4° La rémunération des techniciens ;\n\n5° Les débours tarifés ;\n\n6° Les émoluments des officiers publics ou ministériels ;\n\n7° La rémunération des avocats dans la mesure où elle est réglementée y compris les droits de plaidoirie.',
    dateVersion: '2017-03-11',
  },
  {
    numero: '696',
    titre: 'Condamnation aux dépens',
    contenu: 'La partie perdante est condamnée aux dépens, à moins que le juge, par décision motivée, n\'en mette la totalité ou une fraction à la charge d\'une autre partie.',
    dateVersion: '1975-12-05',
  },
  {
    numero: '700',
    titre: 'Frais irrépétibles',
    contenu: 'Le juge condamne la partie tenue aux dépens ou qui perd son procès à payer :\n\n1° A l\'autre partie la somme qu\'il détermine, au titre des frais exposés et non compris dans les dépens ;\n\n2° Et, le cas échéant, à l\'avocat du bénéficiaire de l\'aide juridictionnelle partielle ou totale une somme au titre des honoraires et frais, non compris dans les dépens, que le bénéficiaire de l\'aide aurait exposés s\'il n\'avait pas eu cette aide. Dans ce cas, il est procédé comme il est dit aux alinéas 3 et 4 de l\'article 37 de la loi n° 91-647 du 10 juillet 1991.\n\nDans tous les cas, le juge tient compte de l\'équité ou de la situation économique de la partie condamnée. Il peut, même d\'office, pour des raisons tirées des mêmes considérations, dire qu\'il n\'y a pas lieu à ces condamnations. Néanmoins, s\'il alloue une somme au titre du 2° du présent article, celle-ci ne peut être inférieure à la part contributive de l\'État.',
    dateVersion: '2017-03-11',
  },
]

// Fonction de recherche dans les articles CPC
export function searchArticlesCPC(query: string): Article[] {
  const lowerQuery = query.toLowerCase()

  return CODE_PROCEDURE_CIVILE_ARTICLES.filter(article =>
    article.numero.includes(query) ||
    article.titre?.toLowerCase().includes(lowerQuery) ||
    article.contenu.toLowerCase().includes(lowerQuery)
  )
}

// Trouver un article par numéro
export function findArticleCPCByNumero(numero: string): Article | undefined {
  return CODE_PROCEDURE_CIVILE_ARTICLES.find(article => article.numero === numero)
}
