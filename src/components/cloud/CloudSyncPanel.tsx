// Panneau de synchronisation cloud
import { useState } from 'react'
import { useCloudSyncStore, CLOUD_PROVIDER_LABELS } from '../../store/useCloudSyncStore'
import type { CloudProvider } from '../../types/editor-features'

interface CloudSyncPanelProps {
  onClose?: () => void
}

export function CloudSyncPanel({ onClose }: CloudSyncPanelProps) {
  const {
    provider,
    connected,
    lastSync,
    syncInProgress,
    error,
    config,
    syncedFiles,
    connect,
    disconnect,
    sync,
    syncFile,
    setAutoSync,
    setSyncInterval,
    clearError,
  } = useCloudSyncStore()

  const [selectedProvider, setSelectedProvider] = useState<CloudProvider | null>(provider)
  const [customPath, setCustomPath] = useState(config?.rootPath || '')

  const handleConnect = async () => {
    if (!selectedProvider) return

    await connect(selectedProvider, {
      rootPath: customPath || undefined,
    })
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Jamais'
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synced':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      case 'modified_local':
      case 'modified_cloud':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
      case 'conflict':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'synced':
        return 'Synchronisé'
      case 'modified_local':
        return 'Modifié localement'
      case 'modified_cloud':
        return 'Modifié dans le cloud'
      case 'conflict':
        return 'Conflit'
      default:
        return status
    }
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* En-tête */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
        <h2 className="text-lg font-semibold">Synchronisation Cloud</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Erreur */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
          <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
          <button onClick={clearError} className="text-red-500 hover:text-red-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {!connected ? (
        // Configuration de la connexion
        <div className="flex-1 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Service cloud</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(CLOUD_PROVIDER_LABELS) as [CloudProvider, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedProvider(key)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedProvider === key
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-[var(--border-color)] hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CloudIcon provider={key} />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedProvider && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Chemin de synchronisation
                </label>
                <input
                  type="text"
                  value={customPath}
                  onChange={(e) => setCustomPath(e.target.value)}
                  placeholder="Laisser vide pour le chemin par défaut"
                  className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Par défaut : ~/
                  {selectedProvider === 'icloud'
                    ? 'iCloud Drive'
                    : selectedProvider === 'dropbox'
                    ? 'Dropbox'
                    : selectedProvider === 'onedrive'
                    ? 'OneDrive'
                    : 'Google Drive'}
                  /Citadelle
                </p>
              </div>

              <button
                onClick={handleConnect}
                disabled={syncInProgress}
                className="w-full px-4 py-3 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {syncInProgress ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Connecter
                  </>
                )}
              </button>
            </>
          )}
        </div>
      ) : (
        // État connecté
        <>
          {/* Statut */}
          <div className="p-4 border-b border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <CloudIcon provider={provider!} />
                </div>
                <div>
                  <div className="font-medium">{CLOUD_PROVIDER_LABELS[provider!]}</div>
                  <div className="text-sm text-gray-500">
                    Dernière sync : {formatDate(lastSync)}
                  </div>
                </div>
              </div>
              <button
                onClick={disconnect}
                className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                Déconnecter
              </button>
            </div>

            {/* Bouton de sync */}
            <button
              onClick={sync}
              disabled={syncInProgress}
              className="w-full mt-4 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {syncInProgress ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Synchronisation...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Synchroniser maintenant
                </>
              )}
            </button>
          </div>

          {/* Configuration */}
          <div className="p-4 border-b border-[var(--border-color)]">
            <h3 className="font-medium mb-3">Configuration</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm">Synchronisation automatique</span>
                <input
                  type="checkbox"
                  checked={config?.autoSync ?? true}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
              </label>
              {config?.autoSync && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Intervalle</span>
                  <select
                    value={config.syncInterval}
                    onChange={(e) => setSyncInterval(parseInt(e.target.value))}
                    className="px-3 py-1 rounded border border-[var(--border-color)] bg-[var(--bg-secondary)]"
                  >
                    <option value={1}>1 minute</option>
                    <option value={5}>5 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 heure</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Fichiers synchronisés */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="font-medium mb-3">
              Fichiers synchronisés ({syncedFiles.length})
            </h3>
            {syncedFiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Aucun fichier synchronisé</p>
                <p className="text-sm mt-1">Sauvegardez un document pour le synchroniser</p>
              </div>
            ) : (
              <div className="space-y-2">
                {syncedFiles.map((file) => (
                  <div
                    key={file.localPath}
                    className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {file.localPath.split('/').pop()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Sync : {formatDate(file.lastSynced)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(file.status)}`}>
                          {getStatusLabel(file.status)}
                        </span>
                        <button
                          onClick={() => syncFile(file.localPath)}
                          disabled={syncInProgress}
                          className="p-1 hover:bg-[var(--bg-primary)] rounded"
                          title="Synchroniser"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// Composant d'icône cloud
function CloudIcon({ provider }: { provider: CloudProvider }) {
  switch (provider) {
    case 'icloud':
      return (
        <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
        </svg>
      )
    case 'dropbox':
      return (
        <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 14.56l4.24-2.84L21 14.28l-4.76 2.84L12 14.56zm0-5.12L7.76 6.6 3 9.16l4.24 2.84L12 9.44zm-4.24 2.84L3 9.44v5.72l4.76-2.84V12.28zm8.48 0l4.76 2.84v-5.72l-4.76 2.84v.04z" />
        </svg>
      )
    case 'onedrive':
      return (
        <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10.5 18H18a5 5 0 10-3.18-8.83A4 4 0 0010.5 6c-1.78 0-3.36 1.16-3.88 2.85A5.5 5.5 0 008 20c0-.66-.18-1.4-.5-2z" />
        </svg>
      )
    case 'google_drive':
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M7.71 15.68L4.05 9.8 8.3 2h3.65l-4.24 7.88z" />
          <path fill="#FBBC04" d="M15.95 22H8.05l3.65-6.32h11.2l-3.65 6.32z" />
          <path fill="#34A853" d="M23.55 15.68L19.3 9.8h-7.3l4.25 7.88h7.3z" />
        </svg>
      )
    default:
      return null
  }
}
