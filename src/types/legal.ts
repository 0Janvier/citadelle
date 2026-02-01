// Types pour le domaine juridique - Pièces et Jurisprudences

// ============================================================================
// Pièces Juridiques
// ============================================================================

export type PieceNature =
  | 'contrat'
  | 'facture'
  | 'courrier'
  | 'email'
  | 'attestation'
  | 'proces_verbal'
  | 'rapport'
  | 'decision_justice'
  | 'acte_authentique'
  | 'extrait_kbis'
  | 'statuts'
  | 'photo'
  | 'plan'
  | 'autre'

export const PIECE_NATURE_LABELS: Record<PieceNature, string> = {
  contrat: 'Contrat',
  facture: 'Facture',
  courrier: 'Courrier',
  email: 'Email / Courriel',
  attestation: 'Attestation',
  proces_verbal: 'Procès-verbal',
  rapport: 'Rapport',
  decision_justice: 'Décision de justice',
  acte_authentique: 'Acte authentique',
  extrait_kbis: 'Extrait Kbis',
  statuts: 'Statuts',
  photo: 'Photographie',
  plan: 'Plan',
  autre: 'Autre',
}

export type PieceProvenance = 'demandeur' | 'défendeur' | 'tiers'

export const PIECE_PROVENANCE_LABELS: Record<PieceProvenance, string> = {
  demandeur: 'Demandeur',
  défendeur: 'Défendeur',
  tiers: 'Tiers',
}

export interface Piece {
  id: string
  numero: number                    // Numéro dans le bordereau (1, 2, 3...)
  reference: string                 // Référence courte (ex: "Pièce n°1")
  titre: string                     // Titre descriptif
  description?: string              // Description optionnelle
  nature: PieceNature               // Type de pièce
  provenance: PieceProvenance       // Origine de la pièce
  dateDocument?: string             // Date du document original (ISO)
  confidentiel: boolean             // Pièce confidentielle
  pagination?: {
    debut: number                   // Page de début dans le dossier
    fin: number                     // Page de fin
  }
  fichierPath?: string              // Chemin vers le fichier associé
  createdAt: string                 // Date de création (ISO)
  updatedAt: string                 // Date de modification (ISO)
}

export interface BordereauPieces {
  id: string
  affaireReference: string          // Référence du dossier (RG n°...)
  parties: {
    demandeur: string
    défendeur: string
  }
  juridiction?: string              // Tribunal
  numeroRG?: string                 // Numéro de rôle général
  pieces: Piece[]
  dateCreation: string
  dateModification: string
}

// ============================================================================
// Jurisprudences
// ============================================================================

export type JuridictionType =
  | 'cass_civ_1'
  | 'cass_civ_2'
  | 'cass_civ_3'
  | 'cass_com'
  | 'cass_soc'
  | 'cass_crim'
  | 'cass_ass_plen'
  | 'cass_ch_mixte'
  | 'conseil_etat'
  | 'conseil_const'
  | 'cour_appel'
  | 'tribunal_judiciaire'
  | 'tribunal_commerce'
  | 'conseil_prudhommes'
  | 'tribunal_administratif'
  | 'cour_administrative_appel'
  | 'cjue'
  | 'cedh'
  | 'autre'

export const JURIDICTION_LABELS: Record<JuridictionType, string> = {
  cass_civ_1: 'Cass. civ. 1re',
  cass_civ_2: 'Cass. civ. 2e',
  cass_civ_3: 'Cass. civ. 3e',
  cass_com: 'Cass. com.',
  cass_soc: 'Cass. soc.',
  cass_crim: 'Cass. crim.',
  cass_ass_plen: 'Cass. ass. plén.',
  cass_ch_mixte: 'Cass. ch. mixte',
  conseil_etat: 'CE',
  conseil_const: 'Cons. const.',
  cour_appel: 'CA',
  tribunal_judiciaire: 'TJ',
  tribunal_commerce: 'T. com.',
  conseil_prudhommes: 'CPH',
  tribunal_administratif: 'TA',
  cour_administrative_appel: 'CAA',
  cjue: 'CJUE',
  cedh: 'CEDH',
  autre: '',
}

export const JURIDICTION_FULL_LABELS: Record<JuridictionType, string> = {
  cass_civ_1: 'Cour de cassation, première chambre civile',
  cass_civ_2: 'Cour de cassation, deuxième chambre civile',
  cass_civ_3: 'Cour de cassation, troisième chambre civile',
  cass_com: 'Cour de cassation, chambre commerciale',
  cass_soc: 'Cour de cassation, chambre sociale',
  cass_crim: 'Cour de cassation, chambre criminelle',
  cass_ass_plen: 'Cour de cassation, assemblée plénière',
  cass_ch_mixte: 'Cour de cassation, chambre mixte',
  conseil_etat: 'Conseil d\'État',
  conseil_const: 'Conseil constitutionnel',
  cour_appel: 'Cour d\'appel',
  tribunal_judiciaire: 'Tribunal judiciaire',
  tribunal_commerce: 'Tribunal de commerce',
  conseil_prudhommes: 'Conseil de prud\'hommes',
  tribunal_administratif: 'Tribunal administratif',
  cour_administrative_appel: 'Cour administrative d\'appel',
  cjue: 'Cour de justice de l\'Union européenne',
  cedh: 'Cour européenne des droits de l\'homme',
  autre: 'Autre juridiction',
}

export type SolutionType =
  | 'cassation'
  | 'rejet'
  | 'cassation_partielle'
  | 'annulation'
  | 'confirmation'
  | 'infirmation'
  | 'irrecevabilite'
  | 'non_lieu'
  | 'autre'

export const SOLUTION_LABELS: Record<SolutionType, string> = {
  cassation: 'Cassation',
  rejet: 'Rejet',
  cassation_partielle: 'Cassation partielle',
  annulation: 'Annulation',
  confirmation: 'Confirmation',
  infirmation: 'Infirmation',
  irrecevabilite: 'Irrecevabilité',
  non_lieu: 'Non-lieu à statuer',
  autre: 'Autre',
}

export interface Jurisprudence {
  id: string

  // Identification
  juridiction: JuridictionType
  formation?: string                // Ex: "1re civ.", "ch. mixte", "sect."
  ville?: string                    // Pour CA, TJ, etc. (ex: "Paris", "Lyon")
  date: string                      // Format ISO (YYYY-MM-DD)
  numero?: string                   // Numéro de pourvoi ou de décision
  ecli?: string                     // Identifiant ECLI européen

  // Parties (optionnel pour protection)
  parties?: {
    demandeur?: string
    défendeur?: string
  }

  // Publication
  publication?: {
    bulletin?: boolean              // Publié au bulletin
    revues?: string[]               // Ex: ["JCP G 2024, 123", "D. 2024, p. 456"]
    legifrance?: string             // Lien Légifrance
  }

  // Contenu
  resume?: string                   // Résumé/chapeau de l'arrêt
  attenduPrincipal?: string         // Attendu/motif principal cité
  solution: SolutionType

  // Métadonnées
  matieres: string[]                // Ex: ["contrats", "responsabilité"]
  motsClefs: string[]

  // Citation formatée (générées automatiquement)
  citationCourte: string            // Ex: "Cass. civ. 1re, 15 janv. 2024, n° 22-12.345"
  citationComplete: string          // Citation complète avec références

  // Timestamps
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Utilitaires de formatage
// ============================================================================

/**
 * Formate une date en format juridique français
 * @param dateISO Date au format ISO (YYYY-MM-DD)
 * @returns Date formatée (ex: "15 janvier 2024")
 */
export function formatDateJuridique(dateISO: string): string {
  const mois = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ]

  const [year, month, day] = dateISO.split('-')
  const monthIndex = parseInt(month, 10) - 1
  const dayNum = parseInt(day, 10)

  return `${dayNum} ${mois[monthIndex]} ${year}`
}

/**
 * Formate une date en format juridique abrégé
 * @param dateISO Date au format ISO (YYYY-MM-DD)
 * @returns Date abrégée (ex: "15 janv. 2024")
 */
export function formatDateJuridiqueAbregee(dateISO: string): string {
  const mois = [
    'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
    'juill.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'
  ]

  const [year, month, day] = dateISO.split('-')
  const monthIndex = parseInt(month, 10) - 1
  const dayNum = parseInt(day, 10)

  return `${dayNum} ${mois[monthIndex]} ${year}`
}

/**
 * Génère la citation courte d'une jurisprudence
 */
export function genererCitationCourte(juris: Jurisprudence): string {
  const juridiction = JURIDICTION_LABELS[juris.juridiction] || juris.juridiction
  const ville = juris.ville ? ` ${juris.ville}` : ''
  const date = formatDateJuridiqueAbregee(juris.date)
  const numero = juris.numero ? `, n° ${juris.numero}` : ''

  return `${juridiction}${ville}, ${date}${numero}`
}

/**
 * Génère la citation complète d'une jurisprudence
 */
export function genererCitationComplete(juris: Jurisprudence): string {
  const base = genererCitationCourte(juris)

  const elements: string[] = [base]

  if (juris.ecli) {
    elements.push(`ECLI:${juris.ecli}`)
  }

  if (juris.publication?.bulletin) {
    elements.push('Bull. civ.')
  }

  if (juris.publication?.revues && juris.publication.revues.length > 0) {
    elements.push(juris.publication.revues.join(' ; '))
  }

  return elements.join(' ; ')
}

/**
 * Génère la référence d'une pièce
 */
export function genererReferencePiece(numero: number): string {
  return `Pièce n°${numero}`
}

// ============================================================================
// Types pour le store
// ============================================================================

export interface LegalStoreState {
  // Pièces
  pieces: Piece[]
  bordereaux: BordereauPieces[]

  // Jurisprudences
  jurisprudences: Jurisprudence[]
  favoris: string[]                 // IDs des jurisprudences favorites

  // État
  isLoading: boolean
  error: string | null
}
