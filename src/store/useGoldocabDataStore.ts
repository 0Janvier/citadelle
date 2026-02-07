// Store pour l'acces en lecture a la base de donnees GoldoCab
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { invoke } from '@tauri-apps/api/tauri'
import type {
  GoldocabClient,
  GoldocabDossier,
  GoldocabItem,
  GoldocabStatus,
  LinkedDossier,
} from '../types/goldocab'

// Cache en memoire (non persiste)
const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 60_000 // 60 secondes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() })
}

interface GoldocabDataStore {
  // Statut
  isAvailable: boolean
  lastChecked: number | null

  // Recherche
  clientResults: GoldocabClient[]
  dossierResults: GoldocabDossier[]
  isSearching: boolean
  searchError: string | null

  // Dossier lie par document (persiste)
  linkedDossiers: Record<string, LinkedDossier>

  // Derniere actualisation par dossier
  lastFetchedAt: Record<number, number>

  // Actions
  checkStatus: () => Promise<boolean>
  searchClients: (query: string) => Promise<GoldocabClient[]>
  searchDossiers: (query: string) => Promise<GoldocabDossier[]>
  getClient: (id: number) => Promise<GoldocabClient | null>
  getDossierItems: (dossierId: number) => Promise<GoldocabItem[]>

  // Liaison dossier
  linkDossierToDocument: (documentId: string, dossier: GoldocabDossier, client?: GoldocabClient) => void
  unlinkDossier: (documentId: string) => void
  getLinkedDossier: (documentId: string) => LinkedDossier | null

  // Refresh
  refreshLinkedDossierIfStale: (documentId: string) => Promise<GoldocabDossier | null>

  // Cache
  clearCache: () => void
  clearSearchResults: () => void
}

export const useGoldocabDataStore = create<GoldocabDataStore>()(
  persist(
    (set, get) => ({
      isAvailable: false,
      lastChecked: null,
      clientResults: [],
      dossierResults: [],
      isSearching: false,
      searchError: null,
      linkedDossiers: {},
      lastFetchedAt: {},

      checkStatus: async () => {
        try {
          const status = await invoke<GoldocabStatus>('check_goldocab_status')
          set({ isAvailable: status.available, lastChecked: Date.now() })
          return status.available
        } catch {
          set({ isAvailable: false, lastChecked: Date.now() })
          return false
        }
      },

      searchClients: async (query: string) => {
        if (!query.trim()) {
          set({ clientResults: [] })
          return []
        }

        const cacheKey = `clients:${query.toLowerCase()}`
        const cached = getCached<GoldocabClient[]>(cacheKey)
        if (cached) {
          set({ clientResults: cached })
          return cached
        }

        set({ isSearching: true, searchError: null })
        try {
          const results = await invoke<GoldocabClient[]>('search_goldocab_clients', {
            query,
            limit: 20,
          })
          setCache(cacheKey, results)
          set({ clientResults: results, isSearching: false })
          return results
        } catch (e) {
          const err = String(e)
          if (err.includes('GOLDOCAB_UNAVAILABLE')) {
            set({ isAvailable: false, isSearching: false, clientResults: [] })
          } else {
            set({ searchError: err, isSearching: false, clientResults: [] })
          }
          return []
        }
      },

      searchDossiers: async (query: string) => {
        if (!query.trim()) {
          set({ dossierResults: [] })
          return []
        }

        const cacheKey = `dossiers:${query.toLowerCase()}`
        const cached = getCached<GoldocabDossier[]>(cacheKey)
        if (cached) {
          set({ dossierResults: cached })
          return cached
        }

        set({ isSearching: true, searchError: null })
        try {
          const results = await invoke<GoldocabDossier[]>('search_goldocab_dossiers', {
            query,
            limit: 20,
          })
          setCache(cacheKey, results)
          set({ dossierResults: results, isSearching: false })
          return results
        } catch (e) {
          const err = String(e)
          if (err.includes('GOLDOCAB_UNAVAILABLE')) {
            set({ isAvailable: false, isSearching: false, dossierResults: [] })
          } else {
            set({ searchError: err, isSearching: false, dossierResults: [] })
          }
          return []
        }
      },

      getClient: async (id: number) => {
        const cacheKey = `client:${id}`
        const cached = getCached<GoldocabClient>(cacheKey)
        if (cached) return cached

        try {
          const client = await invoke<GoldocabClient | null>('get_goldocab_client', { id })
          if (client) setCache(cacheKey, client)
          return client
        } catch {
          return null
        }
      },

      getDossierItems: async (dossierId: number) => {
        const cacheKey = `items:${dossierId}`
        const cached = getCached<GoldocabItem[]>(cacheKey)
        if (cached) return cached

        try {
          const items = await invoke<GoldocabItem[]>('get_goldocab_dossier_items', {
            dossierId,
          })
          setCache(cacheKey, items)
          set((state) => ({
            lastFetchedAt: { ...state.lastFetchedAt, [dossierId]: Date.now() },
          }))
          return items
        } catch {
          return []
        }
      },

      linkDossierToDocument: (documentId, dossier, client) => {
        const linked: LinkedDossier = {
          dossierId: dossier.id,
          dossierName: dossier.nom || `Dossier #${dossier.id}`,
          clientId: dossier.client_id ?? undefined,
          clientName: dossier.client_name ?? undefined,
          numeroRg: dossier.numero_rg ?? undefined,
          juridiction: dossier.juridiction ?? undefined,
        }
        if (client) {
          linked.clientId = client.id
          const parts = [client.prenom, client.nom].filter(Boolean)
          linked.clientName = parts.join(' ') || client.denomination || undefined
        }
        set((state) => ({
          linkedDossiers: { ...state.linkedDossiers, [documentId]: linked },
        }))
      },

      unlinkDossier: (documentId) => {
        set((state) => {
          const { [documentId]: _, ...rest } = state.linkedDossiers
          return { linkedDossiers: rest }
        })
      },

      getLinkedDossier: (documentId) => {
        return get().linkedDossiers[documentId] || null
      },

      refreshLinkedDossierIfStale: async (documentId: string) => {
        const linked = get().getLinkedDossier(documentId)
        if (!linked) return null

        const lastFetch = get().lastFetchedAt[linked.dossierId] || 0
        const fiveMinutes = 5 * 60 * 1000
        if (Date.now() - lastFetch < fiveMinutes) return null

        // Re-fetch dossier
        try {
          const dossiers = await invoke<GoldocabDossier[]>('search_goldocab_dossiers', {
            query: linked.dossierName,
            limit: 5,
          })
          const dossier = dossiers.find((d) => d.id === linked.dossierId)
          if (dossier) {
            // Mettre a jour le linked dossier si les infos ont change
            const updated: LinkedDossier = {
              ...linked,
              dossierName: dossier.nom || linked.dossierName,
              clientName: dossier.client_name ?? linked.clientName,
              numeroRg: dossier.numero_rg ?? linked.numeroRg,
              juridiction: dossier.juridiction ?? linked.juridiction,
            }
            set((state) => ({
              linkedDossiers: { ...state.linkedDossiers, [documentId]: updated },
              lastFetchedAt: { ...state.lastFetchedAt, [linked.dossierId]: Date.now() },
            }))
            return dossier
          }
        } catch {
          // Silencieux
        }
        return null
      },

      clearCache: () => {
        cache.clear()
      },

      clearSearchResults: () => {
        set({ clientResults: [], dossierResults: [], searchError: null })
      },
    }),
    {
      name: 'citadelle-goldocab-data',
      partialize: (state) => ({
        linkedDossiers: state.linkedDossiers,
      }),
    }
  )
)
