/**
 * Version History Panel - Timeline des versions avec restauration et diff
 */

import { useState } from 'react'
import { Clock, RotateCcw, Trash2, Tag, X, GitCompare } from 'lucide-react'
import { useVersionStore, type DocumentVersion } from '../../store/useVersionStore'
import { useDocumentStore } from '../../store/useDocumentStore'
import { VersionDiffView } from './VersionDiffView'

interface VersionHistoryPanelProps {
  documentId: string
  onClose: () => void
}

export function VersionHistoryPanel({ documentId, onClose }: VersionHistoryPanelProps) {
  const versions = useVersionStore((s) => s.getVersionsForDocument(documentId))
  const createVersion = useVersionStore((s) => s.createVersion)
  const deleteVersion = useVersionStore((s) => s.deleteVersion)
  const updateDocument = useDocumentStore((s) => s.updateDocument)
  const doc = useDocumentStore((s) => s.documents.find((d) => d.id === documentId))

  const [labelInput, setLabelInput] = useState('')
  const [diffVersion, setDiffVersion] = useState<DocumentVersion | null>(null)

  const handleCreateSnapshot = () => {
    if (!doc) return
    const label = labelInput.trim() || `Snapshot ${new Date().toLocaleString('fr-FR')}`
    createVersion(documentId, label, doc.content, false)
    setLabelInput('')
  }

  const handleRestore = (version: DocumentVersion) => {
    if (!doc) return
    // Save current as auto-version before restoring
    createVersion(documentId, `Avant restauration de "${version.label}"`, doc.content, true)
    updateDocument(documentId, { content: version.content, isDirty: true })
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // If diff mode is active, show diff view
  if (diffVersion && doc) {
    return (
      <VersionDiffView
        oldContent={diffVersion.content}
        newContent={doc.content}
        oldLabel={diffVersion.label}
        newLabel="Version actuelle"
        onClose={() => setDiffVersion(null)}
      />
    )
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
        <h2 className="text-lg font-semibold">Historique des versions</h2>
        <button onClick={onClose} className="p-1 rounded hover:bg-[var(--bg-secondary)] transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Create snapshot */}
      <div className="p-4 border-b border-[var(--border-color)]">
        <div className="flex gap-2">
          <input
            type="text"
            value={labelInput}
            onChange={(e) => setLabelInput(e.target.value)}
            placeholder="Nom de la version..."
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateSnapshot()
            }}
          />
          <button
            onClick={handleCreateSnapshot}
            className="px-3 py-2 text-sm bg-[var(--accent)] text-white rounded-lg hover:opacity-90 shrink-0"
          >
            <Tag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-4">
        {versions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="mx-auto w-10 h-10 mb-3 opacity-50" />
            <p className="text-sm">Aucune version sauvegardée</p>
            <p className="text-xs mt-1">Créez un snapshot pour sauvegarder l'état actuel</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-3 top-0 bottom-0 w-px bg-[var(--border-color)]" />

            <div className="space-y-3">
              {versions.map((version) => (
                <div key={version.id} className="flex gap-3 relative">
                  {/* Timeline dot */}
                  <div className={`w-6 h-6 rounded-full border-2 shrink-0 z-10 flex items-center justify-center ${
                    version.isAuto
                      ? 'border-gray-300 dark:border-gray-600 bg-[var(--bg)]'
                      : 'border-[var(--accent)] bg-[var(--accent)] bg-opacity-20'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${version.isAuto ? 'bg-gray-400' : 'bg-[var(--accent)]'}`} />
                  </div>

                  {/* Version info */}
                  <div className="flex-1 p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{version.label}</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                          {formatDate(version.timestamp)}
                          {version.isAuto && <span className="ml-1 text-gray-400">(auto)</span>}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => setDiffVersion(version)}
                          className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-blue-500 transition-colors"
                          title="Comparer avec l'actuel"
                        >
                          <GitCompare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRestore(version)}
                          className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                          title="Restaurer cette version"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteVersion(version.id)}
                          className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="p-3 border-t border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
        {versions.length} version(s) - {versions.filter((v) => !v.isAuto).length} manuelle(s)
      </div>
    </div>
  )
}
