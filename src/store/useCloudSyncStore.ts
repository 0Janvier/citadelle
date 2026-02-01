// Store pour la synchronisation cloud (iCloud, Dropbox, OneDrive, Google Drive)
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CloudProvider, CloudSyncState } from '../types/editor-features'

interface CloudConfig {
  provider: CloudProvider
  rootPath: string        // Chemin racine pour la sync
  autoSync: boolean       // Sync automatique
  syncInterval: number    // Intervalle en minutes
}

interface SyncedFile {
  localPath: string
  cloudPath: string
  lastModified: string
  lastSynced: string
  status: 'synced' | 'modified_local' | 'modified_cloud' | 'conflict'
}

interface CloudSyncStore extends CloudSyncState {
  // Configuration
  config: CloudConfig | null
  syncedFiles: SyncedFile[]

  // Actions de connexion
  connect: (provider: CloudProvider, config?: Partial<CloudConfig>) => Promise<boolean>
  disconnect: () => void

  // Actions de synchronisation
  sync: () => Promise<void>
  syncFile: (localPath: string) => Promise<void>
  resolveConflict: (localPath: string, useLocal: boolean) => Promise<void>

  // Gestion des fichiers
  addFileToSync: (localPath: string, cloudPath: string) => void
  removeFileFromSync: (localPath: string) => void
  getSyncedFiles: () => SyncedFile[]
  getFileStatus: (localPath: string) => SyncedFile | undefined

  // Configuration
  setAutoSync: (enabled: boolean) => void
  setSyncInterval: (minutes: number) => void
  setRootPath: (path: string) => void

  // État
  clearError: () => void
}

// Chemins par défaut selon le provider
const DEFAULT_PATHS: Record<CloudProvider, string> = {
  icloud: '~/Library/Mobile Documents/com~apple~CloudDocs/Citadelle',
  dropbox: '~/Dropbox/Citadelle',
  onedrive: '~/OneDrive/Citadelle',
  google_drive: '~/Google Drive/Citadelle',
}

export const useCloudSyncStore = create<CloudSyncStore>()(
  persist(
    (set, get) => ({
      // État initial
      provider: null,
      connected: false,
      lastSync: null,
      syncInProgress: false,
      error: null,
      config: null,
      syncedFiles: [],

      connect: async (provider, configOverrides) => {
        set({ syncInProgress: true, error: null })

        try {
          // Vérifier si le dossier cloud existe
          const rootPath = configOverrides?.rootPath || DEFAULT_PATHS[provider]

          // Note: En vrai, on utiliserait Tauri's fs API pour vérifier l'existence
          // Pour l'instant, on simule une connexion réussie

          const config: CloudConfig = {
            provider,
            rootPath,
            autoSync: configOverrides?.autoSync ?? true,
            syncInterval: configOverrides?.syncInterval ?? 5,
          }

          set({
            provider,
            connected: true,
            config,
            syncInProgress: false,
            lastSync: null,
          })

          return true
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Erreur de connexion',
            syncInProgress: false,
          })
          return false
        }
      },

      disconnect: () => {
        set({
          provider: null,
          connected: false,
          config: null,
          lastSync: null,
          error: null,
        })
      },

      sync: async () => {
        const { connected, config, syncedFiles } = get()
        if (!connected || !config) {
          set({ error: 'Non connecté' })
          return
        }

        set({ syncInProgress: true, error: null })

        try {
          // Simuler une synchronisation
          await new Promise((resolve) => setTimeout(resolve, 1500))

          // Mettre à jour le statut des fichiers
          const updatedFiles = syncedFiles.map((file) => ({
            ...file,
            lastSynced: new Date().toISOString(),
            status: 'synced' as const,
          }))

          set({
            syncedFiles: updatedFiles,
            lastSync: new Date().toISOString(),
            syncInProgress: false,
          })
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Erreur de synchronisation',
            syncInProgress: false,
          })
        }
      },

      syncFile: async (localPath) => {
        const { connected, syncedFiles } = get()
        if (!connected) {
          set({ error: 'Non connecté' })
          return
        }

        const fileIndex = syncedFiles.findIndex((f) => f.localPath === localPath)
        if (fileIndex === -1) {
          set({ error: 'Fichier non trouvé dans la liste de synchronisation' })
          return
        }

        set({ syncInProgress: true, error: null })

        try {
          // Simuler une synchronisation du fichier
          await new Promise((resolve) => setTimeout(resolve, 500))

          const updatedFiles = [...syncedFiles]
          updatedFiles[fileIndex] = {
            ...updatedFiles[fileIndex],
            lastSynced: new Date().toISOString(),
            status: 'synced',
          }

          set({
            syncedFiles: updatedFiles,
            syncInProgress: false,
          })
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Erreur de synchronisation',
            syncInProgress: false,
          })
        }
      },

      resolveConflict: async (localPath, _useLocal) => {
        const { syncedFiles } = get()
        const fileIndex = syncedFiles.findIndex((f) => f.localPath === localPath)
        if (fileIndex === -1) return

        set({ syncInProgress: true, error: null })

        try {
          // Simuler la résolution du conflit
          await new Promise((resolve) => setTimeout(resolve, 500))

          const updatedFiles = [...syncedFiles]
          updatedFiles[fileIndex] = {
            ...updatedFiles[fileIndex],
            lastSynced: new Date().toISOString(),
            status: 'synced',
          }

          set({
            syncedFiles: updatedFiles,
            syncInProgress: false,
          })
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Erreur de résolution',
            syncInProgress: false,
          })
        }
      },

      addFileToSync: (localPath, cloudPath) => {
        const { syncedFiles } = get()

        // Vérifier si le fichier est déjà dans la liste
        if (syncedFiles.some((f) => f.localPath === localPath)) {
          return
        }

        const newFile: SyncedFile = {
          localPath,
          cloudPath,
          lastModified: new Date().toISOString(),
          lastSynced: new Date().toISOString(),
          status: 'synced',
        }

        set({
          syncedFiles: [...syncedFiles, newFile],
        })
      },

      removeFileFromSync: (localPath) => {
        set((state) => ({
          syncedFiles: state.syncedFiles.filter((f) => f.localPath !== localPath),
        }))
      },

      getSyncedFiles: () => get().syncedFiles,

      getFileStatus: (localPath) => {
        return get().syncedFiles.find((f) => f.localPath === localPath)
      },

      setAutoSync: (enabled) => {
        const { config } = get()
        if (!config) return

        set({
          config: { ...config, autoSync: enabled },
        })
      },

      setSyncInterval: (minutes) => {
        const { config } = get()
        if (!config) return

        set({
          config: { ...config, syncInterval: minutes },
        })
      },

      setRootPath: (path) => {
        const { config } = get()
        if (!config) return

        set({
          config: { ...config, rootPath: path },
        })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'citadelle-cloud-sync',
      partialize: (state) => ({
        provider: state.provider,
        connected: state.connected,
        config: state.config,
        syncedFiles: state.syncedFiles,
        lastSync: state.lastSync,
      }),
    }
  )
)

// Labels pour les providers
export const CLOUD_PROVIDER_LABELS: Record<CloudProvider, string> = {
  icloud: 'iCloud Drive',
  dropbox: 'Dropbox',
  onedrive: 'OneDrive',
  google_drive: 'Google Drive',
}

// Icônes (noms pour référence)
export const CLOUD_PROVIDER_ICONS: Record<CloudProvider, string> = {
  icloud: 'cloud',
  dropbox: 'dropbox',
  onedrive: 'microsoft',
  google_drive: 'google',
}
