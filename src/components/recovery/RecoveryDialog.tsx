/**
 * Recovery Banner - Bannière non-bloquante pour la restauration de backups
 * Remplace l'ancien modal intrusif par une bannière fine en haut de l'éditeur.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { AlertTriangle, Clock, RotateCcw, X, ChevronDown, ChevronUp } from 'lucide-react'
import { BackupManager, type Backup } from '../../lib/backupManager'
import { useDocumentStore } from '../../store/useDocumentStore'

const AUTO_DISMISS_MS = 15000

export function RecoveryDialog() {
  const [backups, setBackups] = useState<Backup[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const elapsedRef = useRef(0)
  const lastTickRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const [progress, setProgress] = useState(100)

  const updateDocument = useDocumentStore((s) => s.updateDocument)
  const documents = useDocumentStore((s) => s.documents)

  // Animated close
  const closeWithAnimation = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
      setBackups([])
    }, 300)
  }, [])

  // Auto-dismiss timer with progress tracking
  useEffect(() => {
    if (!isOpen || isPaused || backups.length === 0) return

    lastTickRef.current = Date.now()

    const tick = () => {
      const now = Date.now()
      elapsedRef.current += now - lastTickRef.current
      lastTickRef.current = now

      const remaining = Math.max(0, 1 - elapsedRef.current / AUTO_DISMISS_MS)
      setProgress(remaining * 100)

      if (remaining <= 0) {
        closeWithAnimation()
        return
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isOpen, isPaused, backups.length, closeWithAnimation])

  // Check backups on mount
  useEffect(() => {
    const checkBackups = async () => {
      await BackupManager.cleanOldBackups()

      const allBackups: Backup[] = []
      for (const doc of documents) {
        const latest = await BackupManager.getLatestBackup(doc.id)
        if (latest) {
          const lastSaved = doc.lastSaved ? new Date(doc.lastSaved).getTime() : 0
          if (latest.timestamp > lastSaved + 60000) {
            allBackups.push(latest)
          }
        }
      }

      if (allBackups.length > 0) {
        setBackups(allBackups)
        setIsOpen(true)
      }
    }

    const timer = setTimeout(checkBackups, 2000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRestore = (backup: Backup) => {
    updateDocument(backup.documentId, {
      content: backup.content,
      isDirty: true,
    })
    const remaining = backups.filter((b) => b.id !== backup.id)
    setBackups(remaining)
    if (remaining.length === 0) {
      closeWithAnimation()
    }
  }

  const handleDismiss = (backupId: string) => {
    const remaining = backups.filter((b) => b.id !== backupId)
    setBackups(remaining)
    if (remaining.length === 0) {
      closeWithAnimation()
    }
  }

  if (!isOpen || backups.length === 0) return null

  const singleBackup = backups.length === 1 ? backups[0] : null

  return (
    <div
      className={`fixed top-[88px] left-0 right-0 z-40 ${isClosing ? 'recovery-banner-exit' : 'recovery-banner-enter'}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false)
        lastTickRef.current = Date.now()
      }}
    >
      <div className="mx-auto max-w-4xl px-4">
        <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/50 rounded-lg shadow-lg overflow-hidden">
          {/* Progress bar */}
          <div className="h-0.5 bg-amber-100 dark:bg-amber-900/30">
            <div
              className="h-full bg-amber-400 dark:bg-amber-600 transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Single backup: compact one-liner */}
          {singleBackup ? (
            <div className="flex items-center gap-3 px-4 py-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-sm text-[var(--text)]">
                Version plus récente de{' '}
                <strong>{singleBackup.title}</strong>
                <span className="text-[var(--text-secondary)] ml-1.5">
                  ({new Date(singleBackup.timestamp).toLocaleString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })})
                </span>
              </span>
              <div className="ml-auto flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleRestore(singleBackup)}
                  className="flex items-center gap-1.5 px-3 py-1 text-sm font-medium bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restaurer
                </button>
                <button
                  onClick={() => handleDismiss(singleBackup.id)}
                  className="p-1.5 text-[var(--text-secondary)] rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                  title="Ignorer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Multiple backups: summary + expandable list */
            <>
              <div className="flex items-center gap-3 px-4 py-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-sm text-[var(--text)]">
                  <strong>{backups.length} documents</strong> ont des versions récupérables
                </span>
                <div className="ml-auto flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-1.5 px-3 py-1 text-sm font-medium border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                  >
                    {expanded ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        Masquer
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        Voir
                      </>
                    )}
                  </button>
                  <button
                    onClick={closeWithAnimation}
                    className="p-1.5 text-[var(--text-secondary)] rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                    title="Tout ignorer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded backup list */}
              {expanded && (
                <div className="border-t border-amber-200 dark:border-amber-800/50 px-4 py-2 space-y-2 max-h-[200px] overflow-y-auto">
                  {backups.map((backup) => (
                    <div
                      key={backup.id}
                      className="flex items-center gap-3 py-1.5"
                    >
                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] shrink-0">
                        <Clock className="w-3 h-3" />
                        {new Date(backup.timestamp).toLocaleString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <span className="text-sm font-medium truncate">{backup.title}</span>
                      <div className="ml-auto flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleRestore(backup)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Restaurer
                        </button>
                        <button
                          onClick={() => handleDismiss(backup.id)}
                          className="p-1 text-[var(--text-secondary)] rounded hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                          title="Ignorer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
