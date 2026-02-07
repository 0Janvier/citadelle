/**
 * Recovery Dialog - Proposer la restauration de backups plus récents
 */

import { useState, useEffect } from 'react'
import { AlertTriangle, Clock, RotateCcw, Trash2, X } from 'lucide-react'
import { BackupManager, type Backup } from '../../lib/backupManager'
import { useDocumentStore } from '../../store/useDocumentStore'

export function RecoveryDialog() {
  const [backups, setBackups] = useState<Backup[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const updateDocument = useDocumentStore((s) => s.updateDocument)
  const documents = useDocumentStore((s) => s.documents)

  useEffect(() => {
    // On mount, check for available backups and clean old ones
    const checkBackups = async () => {
      await BackupManager.cleanOldBackups()

      // Check each open document for newer backups
      const allBackups: Backup[] = []
      for (const doc of documents) {
        const latest = await BackupManager.getLatestBackup(doc.id)
        if (latest) {
          const lastSaved = doc.lastSaved ? new Date(doc.lastSaved).getTime() : 0
          if (latest.timestamp > lastSaved + 60000) {
            // Backup is >1 minute newer than last save
            allBackups.push(latest)
          }
        }
      }

      if (allBackups.length > 0) {
        setBackups(allBackups)
        setIsOpen(true)
      }
    }

    // Only check on first mount
    const timer = setTimeout(checkBackups, 2000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRestore = async (backup: Backup) => {
    updateDocument(backup.documentId, {
      content: backup.content,
      isDirty: true,
    })
    setBackups((prev) => prev.filter((b) => b.id !== backup.id))
    if (backups.length <= 1) {
      setIsOpen(false)
    }
  }

  const handleDismiss = (backupId: string) => {
    setBackups((prev) => prev.filter((b) => b.id !== backupId))
    if (backups.length <= 1) {
      setIsOpen(false)
    }
  }

  const handleDismissAll = () => {
    setIsOpen(false)
    setBackups([])
  }

  if (!isOpen || backups.length === 0) return null

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-[var(--bg)] rounded-xl shadow-2xl w-[440px] max-h-[70vh] overflow-hidden border border-[var(--border)]">
        <div className="flex items-center gap-3 p-4 border-b border-[var(--border)] bg-amber-50 dark:bg-amber-900/20">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <h2 className="font-semibold">Récupération de documents</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Des sauvegardes automatiques plus récentes ont été trouvées
            </p>
          </div>
          <button onClick={handleDismissAll} className="ml-auto p-1 rounded hover:bg-black/10">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto max-h-[50vh]">
          {backups.map((backup) => (
            <div key={backup.id} className="p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{backup.title}</span>
                <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                  <Clock className="w-3 h-3" />
                  {new Date(backup.timestamp).toLocaleString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRestore(backup)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[var(--accent)] text-white rounded-lg hover:opacity-90"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restaurer
                </button>
                <button
                  onClick={() => handleDismiss(backup.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg hover:bg-[var(--bg-hover)]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Ignorer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
