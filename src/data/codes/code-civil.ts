// Extraits du Code civil français pour référence rapide
// Ces articles sont les plus couramment utilisés en pratique

export interface Article {
  numero: string
  titre?: string
  contenu: string
  dateVersion?: string
}

export const CODE_CIVIL_ARTICLES: Article[] = [
  // === DROIT DES CONTRATS (Réforme 2016) ===
  {
    numero: '1101',
    titre: 'Définition du contrat',
    contenu: 'Le contrat est un accord de volontés entre deux ou plusieurs personnes destiné à créer, modifier, transmettre ou éteindre des obligations.',
    dateVersion: '2016-10-01',
  },
  {
    numero: '1102',
    titre: 'Liberté contractuelle',
    contenu: 'Chacun est libre de contracter ou de ne pas contracter, de choisir son cocontractant et de déterminer le contenu et la forme du contrat dans les limites fixées par la loi.\n\nLa liberté contractuelle ne permet pas de déroger aux règles qui intéressent l\'ordre public.',
    dateVersion: '2016-10-01',
  },
  {
    numero: '1103',
    titre: 'Force obligatoire du contrat',
    contenu: 'Les contrats légalement formés tiennent lieu de loi à ceux qui les ont faits.',
    dateVersion: '2016-10-01',
  },
  {
    numero: '1104',
    titre: 'Bonne foi',
    contenu: 'Les contrats doivent être négociés, formés et exécutés de bonne foi.\n\nCette disposition est d\'ordre public.',
    dateVersion: '2016-10-01',
  },
  {
    numero: '1112',
    titre: 'Négociations précontractuelles',
    contenu: 'L\'initiative, le déroulement et la rupture des négociations précontractuelles sont libres. Ils doivent impérativement satisfaire aux exigences de la bonne foi.\n\nEn cas de faute commise dans les négociations, la réparation du préjudice qui en résulte ne peut avoir pour objet de compenser ni la perte des avantages attendus du contrat non conclu, ni la perte de chance d\'obtenir ces avantages.',
    dateVersion: '2016-10-01',
  },
  {
    numero: '1112-1',
    titre: 'Devoir d\'information',
    contenu: 'Celle des parties qui connaît une information dont l\'importance est déterminante pour le consentement de l\'autre doit l\'en informer dès lors que, légitimement, cette dernière ignore cette information ou fait confiance à son cocontractant.\n\nNéanmoins, ce devoir d\'information ne porte pas sur l\'estimation de la valeur de la prestation.\n\nOnt une importance déterminante les informations qui ont un lien direct et nécessaire avec le contenu du contrat ou la qualité des parties.\n\nIl incombe à celui qui prétend qu\'une information lui était due de prouver que l\'autre partie la lui devait, à charge pour cette autre partie de prouver qu\'elle l\'a fournie.\n\nLes parties ne peuvent ni limiter, ni exclure ce devoir.\n\nOutre la responsabilité de celui qui en était tenu, le manquement à ce devoir d\'information peut entraîner l\'annulation du contrat dans les conditions prévues aux articles 1130 et suivants.',
    dateVersion: '2016-10-01',
  },
  {
    numero: '1128',
    titre: 'Conditions de validité du contrat',
    contenu: 'Sont nécessaires à la validité d\'un contrat :\n\n1° Le consentement des parties ;\n\n2° Leur capacité de contracter ;\n\n3° Un contenu licite et certain.',
    dateVersion: '2016-10-01',
  },
  {
    numero: '1130',
    titre: 'Vices du consentement',
    contenu: 'L\'erreur, le dol et la violence vicient le consentement lorsqu\'ils sont de telle nature que, sans eux, l\'une des parties n\'aurait pas contracté ou aurait contracté à des conditions substantiellement différentes.\n\nLeur caractère déterminant s\'apprécie eu égard aux personnes et aux circonstances dans lesquelles le consentement a été donné.',
    dateVersion: '2016-10-01',
  },
  {
    numero: '1137',
    titre: 'Dol',
    contenu: 'Le dol est le fait pour un contractant d\'obtenir le consentement de l\'autre par des manœuvres ou des mensonges.\n\nConstitue également un dol la dissimulation intentionnelle par l\'un des contractants d\'une information dont il sait le caractère déterminant pour l\'autre partie.\n\nNéanmoins, ne constitue pas un dol le fait pour une partie de ne pas révéler à son cocontractant son estimation de la valeur de la prestation.',
    dateVersion: '2016-10-01',
  },
  {
    numero: '1170',
    titre: 'Clauses privant de substance l\'obligation',
    contenu: 'Toute clause qui prive de sa substance l\'obligation essentielle du débiteur est réputée non écrite.',
    dateVersion: '2016-10-01',
  },
  {
    numero: '1171',
    titre: 'Clauses abusives',
    contenu: 'Dans un contrat d\'adhésion, toute clause non négociable, déterminée à l\'avance par l\'une des parties, qui crée un déséquilibre significatif entre les droits et obligations des parties au contrat est réputée non écrite.\n\nL\'appréciation du déséquilibre significatif ne porte ni sur l\'objet principal du contrat ni sur l\'adéquation du prix à la prestation.',
    dateVersion: '2016-10-01',
  },
  {
    numero: '1195',
    titre: 'Imprévision',
    contenu: 'Si un changement de circonstances imprévisible lors de la conclusion du contrat rend l\'exécution excessivement onéreuse pour une partie qui n\'avait pas accepté d\'en assumer le risque, celle-ci peut demander une renégociation du contrat à son cocontractant. Elle continue à exécuter ses obligations durant la renégociation.\n\nEn cas de refus ou d\'échec de la renégociation, les parties peuvent convenir de la résolution du contrat, à la date et aux conditions qu\'elles déterminent, ou demander d\'un commun accord au juge de procéder à son adaptation. A défaut d\'accord dans un délai raisonnable, le juge peut, à la demande d\'une partie, réviser le contrat ou y mettre fin, à la date et aux conditions qu\'il fixe.',
    dateVersion: '2016-10-01',
  },
  {
    numero: '1217',
    titre: 'Sanctions de l\'inexécution',
    contenu: 'La partie envers laquelle l\'engagement n\'a pas été exécuté, ou l\'a été imparfaitement, peut :\n\n- refuser d\'exécuter ou suspendre l\'exécution de sa propre obligation ;\n\n- poursuivre l\'exécution forcée en nature de l\'obligation ;\n\n- obtenir une réduction du prix ;\n\n- provoquer la résolution du contrat ;\n\n- demander réparation des conséquences de l\'inexécution.\n\nLes sanctions qui ne sont pas incompatibles peuvent être cumulées ; des dommages et intérêts peuvent toujours s\'y ajouter.',
    dateVersion: '2016-10-01',
  },
  {
    numero: '1218',
    titre: 'Force majeure',
    contenu: 'Il y a force majeure en matière contractuelle lorsqu\'un événement échappant au contrôle du débiteur, qui ne pouvait être raisonnablement prévu lors de la conclusion du contrat et dont les effets ne peuvent être évités par des mesures appropriées, empêche l\'exécution de son obligation par le débiteur.\n\nSi l\'empêchement est temporaire, l\'exécution de l\'obligation est suspendue à moins que le retard qui en résulterait ne justifie la résolution du contrat. Si l\'empêchement est définitif, le contrat est résolu de plein droit et les parties sont libérées de leurs obligations dans les conditions prévues aux articles 1351 et 1351-1.',
    dateVersion: '2016-10-01',
  },

  // === RESPONSABILITÉ CIVILE ===
  {
    numero: '1240',
    titre: 'Responsabilité du fait personnel',
    contenu: 'Tout fait quelconque de l\'homme, qui cause à autrui un dommage, oblige celui par la faute duquel il est arrivé à le réparer.',
    dateVersion: '1804-03-21',
  },
  {
    numero: '1241',
    titre: 'Responsabilité pour imprudence ou négligence',
    contenu: 'Chacun est responsable du dommage qu\'il a causé non seulement par son fait, mais encore par sa négligence ou par son imprudence.',
    dateVersion: '1804-03-21',
  },
  {
    numero: '1242',
    titre: 'Responsabilité du fait d\'autrui',
    contenu: 'On est responsable non seulement du dommage que l\'on cause par son propre fait, mais encore de celui qui est causé par le fait des personnes dont on doit répondre, ou des choses que l\'on a sous sa garde.',
    dateVersion: '1804-03-21',
  },
  {
    numero: '1245',
    titre: 'Responsabilité du fait des produits défectueux',
    contenu: 'Le producteur est responsable du dommage causé par un défaut de son produit, qu\'il soit ou non lié par un contrat avec la victime.',
    dateVersion: '1998-05-19',
  },

  // === PROPRIÉTÉ ===
  {
    numero: '544',
    titre: 'Définition de la propriété',
    contenu: 'La propriété est le droit de jouir et disposer des choses de la manière la plus absolue, pourvu qu\'on n\'en fasse pas un usage prohibé par les lois ou par les règlements.',
    dateVersion: '1804-03-21',
  },
  {
    numero: '545',
    titre: 'Expropriation',
    contenu: 'Nul ne peut être contraint de céder sa propriété, si ce n\'est pour cause d\'utilité publique, et moyennant une juste et préalable indemnité.',
    dateVersion: '1804-03-21',
  },

  // === PRESCRIPTION ===
  {
    numero: '2224',
    titre: 'Prescription extinctive de droit commun',
    contenu: 'Les actions personnelles ou mobilières se prescrivent par cinq ans à compter du jour où le titulaire d\'un droit a connu ou aurait dû connaître les faits lui permettant de l\'exercer.',
    dateVersion: '2008-06-17',
  },
  {
    numero: '2232',
    titre: 'Prescription trentenaire',
    contenu: 'Le report du point de départ, la suspension ou l\'interruption de la prescription ne peut avoir pour effet de porter le délai de la prescription extinctive au-delà de vingt ans à compter du jour de la naissance du droit.\n\nLe premier alinéa n\'est pas applicable dans les cas mentionnés aux articles 2226, 2227, 2233 et 2236, au premier alinéa de l\'article 2241 et à l\'article 2244. Il ne s\'applique pas non plus aux actions relatives à l\'état des personnes.',
    dateVersion: '2008-06-17',
  },
]

// Fonction de recherche dans les articles
export function searchArticles(query: string): Article[] {
  const lowerQuery = query.toLowerCase()

  return CODE_CIVIL_ARTICLES.filter(article =>
    article.numero.includes(query) ||
    article.titre?.toLowerCase().includes(lowerQuery) ||
    article.contenu.toLowerCase().includes(lowerQuery)
  )
}

// Trouver un article par numéro
export function findArticleByNumero(numero: string): Article | undefined {
  return CODE_CIVIL_ARTICLES.find(article => article.numero === numero)
}
