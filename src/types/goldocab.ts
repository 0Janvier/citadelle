// Types pour l'acces en lecture a la base GoldoCab

export interface GoldocabClient {
  id: number
  denomination: string | null
  type_client: string | null // "PersonnePhysique" ou "PersonneMorale"
  telephone: string | null
  email: string | null
  ville: string | null
  code_postal: string | null
  statut_client: string | null
  nom: string | null
  prenom: string | null
  civilite: string | null
  profession: string | null
  forme_juridique: string | null
  numero_siren: string | null
}

export interface GoldocabDossier {
  id: number
  nom: string | null
  type_dossier: string | null // "Avocat", "Elu", "Perso"
  client_id: number | null
  client_name: string | null // JOIN depuis clients
  statut_gestion: string | null
  etat: string | null
  numero_rg: string | null
  juridiction: string | null
  date_audience: string | null
  priorite: number | null
  est_favori: boolean | null
}

export interface GoldocabItem {
  id: number
  titre: string | null
  contexte: string | null
  dossier_id: number | null
  est_tache: boolean | null
  date_echeance: string | null
  urgence: number | null
  gtd_phase: string | null
  en_cours: boolean | null
}

export interface GoldocabStatus {
  available: boolean
  database_path: string
  client_count: number | null
  dossier_count: number | null
}

export interface LinkedDossier {
  dossierId: number
  dossierName: string
  clientId?: number
  clientName?: string
  numeroRg?: string
  juridiction?: string
}

export function getClientDisplayName(client: GoldocabClient): string {
  if (client.type_client === 'PersonneMorale' && client.denomination) {
    return client.denomination
  }
  const parts = [client.civilite, client.prenom, client.nom].filter(Boolean)
  return parts.join(' ') || client.denomination || `Client #${client.id}`
}

export function getDossierDisplayName(dossier: GoldocabDossier): string {
  const parts: string[] = []
  if (dossier.nom) parts.push(dossier.nom)
  if (dossier.numero_rg) parts.push(`(${dossier.numero_rg})`)
  return parts.join(' ') || `Dossier #${dossier.id}`
}

export function getClientShortName(client: GoldocabClient): string {
  if (client.type_client === 'PersonneMorale' && client.denomination) {
    return client.denomination
  }
  const parts = [client.prenom, client.nom].filter(Boolean)
  return parts.join(' ') || client.denomination || `Client #${client.id}`
}
