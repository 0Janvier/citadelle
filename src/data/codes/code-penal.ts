// Code pénal français
// Articles les plus couramment utilisés en pratique pénale

import type { Article } from './code-civil'

export const CODE_PENAL_ARTICLES: Article[] = [
  // === PRINCIPES GÉNÉRAUX ===
  {
    numero: '111-1',
    titre: 'Principe de légalité des délits et des peines',
    contenu: 'Les infractions pénales sont classées, suivant leur gravité, en crimes, délits et contraventions.',
    dateVersion: '1994-03-01',
  },
  {
    numero: '111-2',
    titre: 'Définition des infractions',
    contenu: 'La loi détermine les crimes et délits et fixe les peines applicables à leurs auteurs.\n\nLe règlement détermine les contraventions et fixe, dans les limites et selon les distinctions établies par la loi, les peines applicables aux contrevenants.',
    dateVersion: '1994-03-01',
  },
  {
    numero: '111-3',
    titre: 'Interprétation stricte de la loi pénale',
    contenu: 'Nul ne peut être puni pour un crime ou pour un délit dont les éléments ne sont pas définis par la loi, ou pour une contravention dont les éléments ne sont pas définis par le règlement.\n\nNul ne peut être puni d\'une peine qui n\'est pas prévue par la loi, si l\'infraction est un crime ou un délit, ou par le règlement, si l\'infraction est une contravention.',
    dateVersion: '1994-03-01',
  },
  {
    numero: '111-4',
    titre: 'Interprétation stricte',
    contenu: 'La loi pénale est d\'interprétation stricte.',
    dateVersion: '1994-03-01',
  },
  {
    numero: '112-1',
    titre: 'Non-rétroactivité de la loi pénale',
    contenu: 'Sont seuls punissables les faits constitutifs d\'une infraction à la date à laquelle ils ont été commis.\n\nPeuvent seules être prononcées les peines légalement applicables à la même date.\n\nToutefois, les dispositions nouvelles s\'appliquent aux infractions commises avant leur entrée en vigueur et n\'ayant pas donné lieu à une condamnation passée en force de chose jugée lorsqu\'elles sont moins sévères que les dispositions anciennes.',
    dateVersion: '1994-03-01',
  },

  // === RESPONSABILITÉ PÉNALE ===
  {
    numero: '121-1',
    titre: 'Responsabilité pénale personnelle',
    contenu: 'Nul n\'est responsable pénalement que de son propre fait.',
    dateVersion: '1994-03-01',
  },
  {
    numero: '121-2',
    titre: 'Responsabilité pénale des personnes morales',
    contenu: 'Les personnes morales, à l\'exclusion de l\'État, sont responsables pénalement, selon les distinctions des articles 121-4 à 121-7 et dans les cas prévus par la loi ou le règlement, des infractions commises, pour leur compte, par leurs organes ou représentants.\n\nToutefois, les collectivités territoriales et leurs groupements ne sont responsables pénalement que des infractions commises dans l\'exercice d\'activités susceptibles de faire l\'objet de conventions de délégation de service public.\n\nLa responsabilité pénale des personnes morales n\'exclut pas celle des personnes physiques auteurs ou complices des mêmes faits, sous réserve des dispositions du quatrième alinéa de l\'article 121-3.',
    dateVersion: '2004-12-10',
  },
  {
    numero: '121-3',
    titre: 'Élément moral de l\'infraction',
    contenu: 'Il n\'y a point de crime ou de délit sans intention de le commettre.\n\nToutefois, lorsque la loi le prévoit, il y a délit en cas de mise en danger délibérée de la personne d\'autrui.\n\nIl y a également délit, lorsque la loi le prévoit, en cas de faute d\'imprudence, de négligence ou de manquement à une obligation de prudence ou de sécurité prévue par la loi ou le règlement, s\'il est établi que l\'auteur des faits n\'a pas accompli les diligences normales compte tenu, le cas échéant, de la nature de ses missions ou de ses fonctions, de ses compétences ainsi que du pouvoir et des moyens dont il disposait.\n\nDans le cas prévu par l\'alinéa qui précède, les personnes physiques qui n\'ont pas causé directement le dommage, mais qui ont créé ou contribué à créer la situation qui a permis la réalisation du dommage ou qui n\'ont pas pris les mesures permettant de l\'éviter, sont responsables pénalement s\'il est établi qu\'elles ont, soit violé de façon manifestement délibérée une obligation particulière de prudence ou de sécurité prévue par la loi ou le règlement, soit commis une faute caractérisée et qui exposait autrui à un risque d\'une particulière gravité qu\'elles ne pouvaient ignorer.\n\nIl n\'y a point de contravention en cas de force majeure.',
    dateVersion: '2000-07-10',
  },
  {
    numero: '121-4',
    titre: 'Auteur de l\'infraction',
    contenu: 'Est auteur de l\'infraction la personne qui :\n\n1° Commet les faits incriminés ;\n\n2° Tente de commettre un crime ou, dans les cas prévus par la loi, un délit.',
    dateVersion: '1994-03-01',
  },
  {
    numero: '121-5',
    titre: 'Tentative',
    contenu: 'La tentative est constituée dès lors que, manifestée par un commencement d\'exécution, elle n\'a été suspendue ou n\'a manqué son effet qu\'en raison de circonstances indépendantes de la volonté de son auteur.',
    dateVersion: '1994-03-01',
  },
  {
    numero: '121-6',
    titre: 'Complicité',
    contenu: 'Sera puni comme auteur le complice de l\'infraction, au sens de l\'article 121-7.',
    dateVersion: '1994-03-01',
  },
  {
    numero: '121-7',
    titre: 'Définition de la complicité',
    contenu: 'Est complice d\'un crime ou d\'un délit la personne qui sciemment, par aide ou assistance, en a facilité la préparation ou la consommation.\n\nEst également complice la personne qui par don, promesse, menace, ordre, abus d\'autorité ou de pouvoir aura provoqué à une infraction ou donné des instructions pour la commettre.',
    dateVersion: '1994-03-01',
  },

  // === CAUSES D'IRRESPONSABILITÉ ===
  {
    numero: '122-1',
    titre: 'Trouble mental',
    contenu: 'N\'est pas pénalement responsable la personne qui était atteinte, au moment des faits, d\'un trouble psychique ou neuropsychique ayant aboli son discernement ou le contrôle de ses actes.\n\nLa personne qui était atteinte, au moment des faits, d\'un trouble psychique ou neuropsychique ayant altéré son discernement ou entravé le contrôle de ses actes demeure punissable. Toutefois, la juridiction tient compte de cette circonstance lorsqu\'elle détermine la peine et en fixe le régime. Si est encourue une peine privative de liberté, celle-ci est réduite du tiers ou, en cas de crime puni de la réclusion criminelle ou de la détention criminelle à perpétuité, est ramenée à trente ans. La juridiction peut toutefois, par une décision spécialement motivée en matière correctionnelle, décider de ne pas appliquer cette diminution de peine. Lorsque, après avis médical, la juridiction considère que la nature du trouble le justifie, elle s\'assure que la peine prononcée permette que le condamné fasse l\'objet de soins adaptés à son état.',
    dateVersion: '2022-01-25',
  },
  {
    numero: '122-4',
    titre: 'Autorisation de la loi ou ordre de l\'autorité légitime',
    contenu: 'N\'est pas pénalement responsable la personne qui accomplit un acte prescrit ou autorisé par des dispositions législatives ou réglementaires.\n\nN\'est pas pénalement responsable la personne qui accomplit un acte commandé par l\'autorité légitime, sauf si cet acte est manifestement illégal.',
    dateVersion: '1994-03-01',
  },
  {
    numero: '122-5',
    titre: 'Légitime défense',
    contenu: 'N\'est pas pénalement responsable la personne qui, devant une atteinte injustifiée envers elle-même ou autrui, accomplit, dans le même temps, un acte commandé par la nécessité de la légitime défense d\'elle-même ou d\'autrui, sauf s\'il y a disproportion entre les moyens de défense employés et la gravité de l\'atteinte.\n\nN\'est pas pénalement responsable la personne qui, pour interrompre l\'exécution d\'un crime ou d\'un délit contre un bien, accomplit un acte de défense, autre qu\'un homicide volontaire, lorsque cet acte est strictement nécessaire au but poursuivi dès lors que les moyens employés sont proportionnés à la gravité de l\'infraction.',
    dateVersion: '1994-03-01',
  },
  {
    numero: '122-6',
    titre: 'Présomption de légitime défense',
    contenu: 'Est présumé avoir agi en état de légitime défense celui qui accomplit l\'acte :\n\n1° Pour repousser, de nuit, l\'entrée par effraction, violence ou ruse dans un lieu habité ;\n\n2° Pour se défendre contre les auteurs de vols ou de pillages exécutés avec violence.',
    dateVersion: '1994-03-01',
  },
  {
    numero: '122-7',
    titre: 'État de nécessité',
    contenu: 'N\'est pas pénalement responsable la personne qui, face à un danger actuel ou imminent qui menace elle-même, autrui ou un bien, accomplit un acte nécessaire à la sauvegarde de la personne ou du bien, sauf s\'il y a disproportion entre les moyens employés et la gravité de la menace.',
    dateVersion: '1994-03-01',
  },

  // === ATTEINTES À LA VIE ===
  {
    numero: '221-1',
    titre: 'Meurtre',
    contenu: 'Le fait de donner volontairement la mort à autrui constitue un meurtre. Il est puni de trente ans de réclusion criminelle.',
    dateVersion: '1994-03-01',
  },
  {
    numero: '221-3',
    titre: 'Assassinat',
    contenu: 'Le meurtre commis avec préméditation ou guet-apens constitue un assassinat. Il est puni de la réclusion criminelle à perpétuité.\n\nLes deux premiers alinéas de l\'article 132-23 relatif à la période de sûreté sont applicables à l\'infraction prévue par le présent article. Toutefois, lorsque la victime est un mineur de quinze ans et que l\'assassinat est précédé ou accompagné d\'un viol, de tortures ou d\'actes de barbarie ou lorsque l\'assassinat a été commis sur un magistrat, un fonctionnaire de la police nationale, un militaire de la gendarmerie, un membre du personnel de l\'administration pénitentiaire ou toute autre personne dépositaire de l\'autorité publique, à l\'occasion de l\'exercice ou en raison de ses fonctions, la cour d\'assises peut, par décision spéciale, soit porter la période de sûreté jusqu\'à trente ans, soit, si elle prononce la réclusion criminelle à perpétuité, décider qu\'aucune des mesures énumérées à l\'article 132-23 ne pourra être accordée au condamné.',
    dateVersion: '2017-02-28',
  },
  {
    numero: '221-6',
    titre: 'Homicide involontaire',
    contenu: 'Le fait de causer, dans les conditions et selon les distinctions prévues à l\'article 121-3, par maladresse, imprudence, inattention, négligence ou manquement à une obligation de prudence ou de sécurité imposée par la loi ou le règlement, la mort d\'autrui constitue un homicide involontaire puni de trois ans d\'emprisonnement et de 45 000 euros d\'amende.\n\nEn cas de violation manifestement délibérée d\'une obligation particulière de prudence ou de sécurité imposée par la loi ou le règlement, les peines encourues sont portées à cinq ans d\'emprisonnement et à 75 000 euros d\'amende.',
    dateVersion: '2000-07-10',
  },

  // === ATTEINTES À L'INTÉGRITÉ PHYSIQUE ===
  {
    numero: '222-1',
    titre: 'Tortures et actes de barbarie',
    contenu: 'Le fait de soumettre une personne à des tortures ou à des actes de barbarie est puni de quinze ans de réclusion criminelle.',
    dateVersion: '1994-03-01',
  },
  {
    numero: '222-7',
    titre: 'Violences ayant entraîné la mort sans intention de la donner',
    contenu: 'Les violences ayant entraîné la mort sans intention de la donner sont punies de quinze ans de réclusion criminelle.',
    dateVersion: '1994-03-01',
  },
  {
    numero: '222-11',
    titre: 'Violences ayant entraîné une ITT supérieure à 8 jours',
    contenu: 'Les violences ayant entraîné une incapacité totale de travail pendant plus de huit jours sont punies de trois ans d\'emprisonnement et de 45 000 euros d\'amende.',
    dateVersion: '1994-03-01',
  },
  {
    numero: '222-13',
    titre: 'Violences aggravées',
    contenu: 'Les violences ayant entraîné une incapacité de travail inférieure ou égale à huit jours ou n\'ayant entraîné aucune incapacité de travail sont punies de trois ans d\'emprisonnement et de 45 000 euros d\'amende lorsqu\'elles sont commises :\n\n1° Sur un mineur de quinze ans ;\n\n2° Sur une personne dont la particulière vulnérabilité, due à son âge, à une maladie, à une infirmité, à une déficience physique ou psychique ou à un état de grossesse, est apparente ou connue de leur auteur ;\n\n3° Sur un ascendant légitime ou naturel ou sur les père ou mère adoptifs ;\n\n4° Sur un magistrat, un juré, un avocat, un officier public ou ministériel, un membre ou un agent de la Cour pénale internationale, un militaire de la gendarmerie nationale, un fonctionnaire de la police nationale, des douanes, de l\'administration pénitentiaire ou toute autre personne dépositaire de l\'autorité publique, un sapeur-pompier professionnel ou volontaire, un gardien assermenté d\'immeubles ou de groupes d\'immeubles ou un agent exerçant pour le compte d\'un bailleur des fonctions de gardiennage ou de surveillance des immeubles à usage d\'habitation en application de l\'article L. 127-1 du code de la construction et de l\'habitation, dans l\'exercice ou du fait de ses fonctions.',
    dateVersion: '2022-01-25',
  },

  // === VIOL ET AGRESSIONS SEXUELLES ===
  {
    numero: '222-22',
    titre: 'Définition de l\'agression sexuelle',
    contenu: 'Constitue une agression sexuelle toute atteinte sexuelle commise avec violence, contrainte, menace ou surprise ou, dans les cas prévus par la loi, commise sur un mineur par un majeur.\n\nConstitue également une agression sexuelle le fait de contraindre une personne par la violence, la menace ou la surprise à subir une atteinte sexuelle de la part d\'un tiers.',
    dateVersion: '2024-04-21',
  },
  {
    numero: '222-23',
    titre: 'Définition du viol',
    contenu: 'Tout acte de pénétration sexuelle, de quelque nature qu\'il soit, ou tout acte bucco-génital commis sur la personne d\'autrui ou sur la personne de l\'auteur par violence, contrainte, menace ou surprise est un viol.\n\nLe viol est puni de quinze ans de réclusion criminelle.',
    dateVersion: '2021-04-21',
  },

  // === VOL ===
  {
    numero: '311-1',
    titre: 'Définition du vol',
    contenu: 'Le vol est la soustraction frauduleuse de la chose d\'autrui.',
    dateVersion: '1994-03-01',
  },
  {
    numero: '311-3',
    titre: 'Peine du vol simple',
    contenu: 'Le vol est puni de trois ans d\'emprisonnement et de 45 000 euros d\'amende.',
    dateVersion: '1994-03-01',
  },
  {
    numero: '311-4',
    titre: 'Vol aggravé',
    contenu: 'Le vol est puni de cinq ans d\'emprisonnement et de 75 000 euros d\'amende :\n\n1° Lorsqu\'il est commis par plusieurs personnes agissant en qualité d\'auteur ou de complice, sans qu\'aucune d\'elles soit munie d\'une arme ;\n\n2° Lorsqu\'il est commis par une personne qui pénètre dans les lieux par ruse, effraction ou escalade ou en faisant usage de fausses clefs ;\n\n3° Lorsqu\'il est commis au préjudice d\'une personne dont la particulière vulnérabilité, due à son âge, à une maladie, à une infirmité, à une déficience physique ou psychique ou à un état de grossesse, est apparente ou connue de son auteur ;\n\n4° Lorsqu\'il est commis dans un local d\'habitation ou dans un lieu utilisé ou destiné à l\'entrepôt de fonds, valeurs, marchandises ou matériels ;\n\n5° Lorsqu\'il est commis dans un véhicule affecté au transport collectif de voyageurs ou dans un lieu destiné à l\'accès à un moyen de transport collectif de voyageurs.',
    dateVersion: '2004-03-09',
  },

  // === ESCROQUERIE ===
  {
    numero: '313-1',
    titre: 'Définition de l\'escroquerie',
    contenu: 'L\'escroquerie est le fait, soit par l\'usage d\'un faux nom ou d\'une fausse qualité, soit par l\'abus d\'une qualité vraie, soit par l\'emploi de manœuvres frauduleuses, de tromper une personne physique ou morale et de la déterminer ainsi, à son préjudice ou au préjudice d\'un tiers, à remettre des fonds, des valeurs ou un bien quelconque, à fournir un service ou à consentir un acte opérant obligation ou décharge.\n\nL\'escroquerie est punie de cinq ans d\'emprisonnement et de 375 000 euros d\'amende.',
    dateVersion: '1994-03-01',
  },

  // === ABUS DE CONFIANCE ===
  {
    numero: '314-1',
    titre: 'Définition de l\'abus de confiance',
    contenu: 'L\'abus de confiance est le fait par une personne de détourner, au préjudice d\'autrui, des fonds, des valeurs ou un bien quelconque qui lui ont été remis et qu\'elle a acceptés à charge de les rendre, de les représenter ou d\'en faire un usage déterminé.\n\nL\'abus de confiance est puni de trois ans d\'emprisonnement et de 375 000 euros d\'amende.',
    dateVersion: '1994-03-01',
  },

  // === RECEL ===
  {
    numero: '321-1',
    titre: 'Définition du recel',
    contenu: 'Le recel est le fait de dissimuler, de détenir ou de transmettre une chose, ou de faire office d\'intermédiaire afin de la transmettre, en sachant que cette chose provient d\'un crime ou d\'un délit.\n\nConstitue également un recel le fait, en connaissance de cause, de bénéficier, par tout moyen, du produit d\'un crime ou d\'un délit.\n\nLe recel est puni de cinq ans d\'emprisonnement et de 375 000 euros d\'amende.',
    dateVersion: '1994-03-01',
  },

  // === DESTRUCTION, DÉGRADATIONS ===
  {
    numero: '322-1',
    titre: 'Destruction et dégradation',
    contenu: 'La destruction, la dégradation ou la détérioration d\'un bien appartenant à autrui est punie de deux ans d\'emprisonnement et de 30 000 euros d\'amende, sauf s\'il n\'en est résulté qu\'un dommage léger.\n\nLe fait de tracer des inscriptions, des signes ou des dessins, sans autorisation préalable, sur les façades, les véhicules, les voies publiques ou le mobilier urbain est puni de 3 750 euros d\'amende et d\'une peine de travail d\'intérêt général lorsqu\'il n\'en est résulté qu\'un dommage léger.',
    dateVersion: '2002-03-04',
  },

  // === FAUX ET USAGE DE FAUX ===
  {
    numero: '441-1',
    titre: 'Définition du faux',
    contenu: 'Constitue un faux toute altération frauduleuse de la vérité, de nature à causer un préjudice et accomplie par quelque moyen que ce soit, dans un écrit ou tout autre support d\'expression de la pensée qui a pour objet ou qui peut avoir pour effet d\'établir la preuve d\'un droit ou d\'un fait ayant des conséquences juridiques.\n\nLe faux et l\'usage de faux sont punis de trois ans d\'emprisonnement et de 45 000 euros d\'amende.',
    dateVersion: '1994-03-01',
  },

  // === ATTEINTES À L'ADMINISTRATION PUBLIQUE ===
  {
    numero: '432-11',
    titre: 'Corruption passive',
    contenu: 'Est puni de dix ans d\'emprisonnement et d\'une amende de 1 000 000 €, dont le montant peut être porté au double du produit tiré de l\'infraction, le fait, par une personne dépositaire de l\'autorité publique, chargée d\'une mission de service public, ou investie d\'un mandat électif public, de solliciter ou d\'agréer, sans droit, à tout moment, directement ou indirectement, des offres, des promesses, des dons, des présents ou des avantages quelconques pour elle-même ou pour autrui :\n\n1° Soit pour accomplir ou avoir accompli, pour s\'abstenir ou s\'être abstenue d\'accomplir un acte de sa fonction, de sa mission ou de son mandat ou facilité par sa fonction, sa mission ou son mandat ;\n\n2° Soit pour abuser ou avoir abusé de son influence réelle ou supposée en vue de faire obtenir d\'une autorité ou d\'une administration publique des distinctions, des emplois, des marchés ou toute autre décision favorable.',
    dateVersion: '2013-12-06',
  },
  {
    numero: '433-1',
    titre: 'Corruption active',
    contenu: 'Est puni de dix ans d\'emprisonnement et d\'une amende de 1 000 000 €, dont le montant peut être porté au double du produit tiré de l\'infraction, le fait, par quiconque, de proposer sans droit, à tout moment, directement ou indirectement, des offres, des promesses, des dons, des présents ou des avantages quelconques à une personne dépositaire de l\'autorité publique, chargée d\'une mission de service public ou investie d\'un mandat électif public, pour elle-même ou pour autrui :\n\n1° Soit pour qu\'elle accomplisse ou s\'abstienne d\'accomplir, ou parce qu\'elle a accompli ou s\'est abstenue d\'accomplir, un acte de sa fonction, de sa mission ou de son mandat, ou facilité par sa fonction, sa mission ou son mandat ;\n\n2° Soit pour qu\'elle abuse, ou parce qu\'elle a abusé, de son influence réelle ou supposée en vue de faire obtenir d\'une autorité ou d\'une administration publique des distinctions, des emplois, des marchés ou toute autre décision favorable.',
    dateVersion: '2013-12-06',
  },
]

// Fonction de recherche dans les articles du Code pénal
export function searchArticlesPenal(query: string): Article[] {
  const lowerQuery = query.toLowerCase()

  return CODE_PENAL_ARTICLES.filter(article =>
    article.numero.toLowerCase().includes(lowerQuery) ||
    article.titre?.toLowerCase().includes(lowerQuery) ||
    article.contenu.toLowerCase().includes(lowerQuery)
  )
}

// Trouver un article par numéro
export function findArticlePenalByNumero(numero: string): Article | undefined {
  return CODE_PENAL_ARTICLES.find(article => article.numero === numero)
}
