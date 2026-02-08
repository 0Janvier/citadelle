/**
 * Recovery Banner - Bannière non-bloquante pour la restauration de backups
 * Remplace l'ancien modal intrusif par une bannière fine en haut de l'éditeur.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Clock, RotateCcw, X, ChevronDown, ChevronUp } from 'lucide-react'
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
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-40 ${isClosing ? 'recovery-banner-exit' : 'recovery-banner-enter'}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false)
        lastTickRef.current = Date.now()
      }}
    >
      {/* Single backup: compact toast */}
      {singleBackup ? (
        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg shadow-md text-xs">
          {/* Progress indicator */}
          <div className="w-1 h-4 rounded-full bg-amber-200 dark:bg-amber-900/40 overflow-hidden shrink-0">
            <div
              className="w-full bg-amber-500 dark:bg-amber-500 transition-none rounded-full"
              style={{ height: `${progress}%` }}
            />
          </div>
          <Clock className="w-3 h-3 text-amber-500 shrink-0" />
          <span className="text-[var(--text-secondary)]">
            Backup de <strong className="text-[var(--text)] font-medium">{singleBackup.title}</strong>
            <span className="ml-1 opacity-60">
              {new Date(singleBackup.timestamp).toLocaleString('fr-FR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </span>
          <button
            onClick={() => handleRestore(singleBackup)}
            className="ml-1 flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 rounded hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Restaurer
          </button>
          <button
            onClick={() => handleDismiss(singleBackup.id)}
            className="p-0.5 text-[var(--text-secondary)] rounded hover:bg-[var(--bg-secondary)] transition-colors"
            title="Ignorer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Multiple backups: compact expandable */
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-lg shadow-md overflow-hidden">
          <div className="flex items-center gap-2.5 px-3 py-1.5 text-xs">
            <div className="w-1 h-4 rounded-full bg-amber-200 dark:bg-amber-900/40 overflow-hidden shrink-0">
              <div
                className="w-full bg-amber-500 dark:bg-amber-500 transition-none rounded-full"
                style={{ height: `${progress}%` }}
              />
            </div>
            <Clock className="w-3 h-3 text-amber-500 shrink-0" />
            <span className="text-[var(--text-secondary)]">
              <strong className="text-[var(--text)] font-medium">{backups.length} backups</strong> récupérables
            </span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-1 flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 rounded hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors"
            >
              {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              {expanded ? 'Masquer' : 'Voir'}
            </button>
            <button
              onClick={closeWithAnimation}
              className="p-0.5 text-[var(--text-secondary)] rounded hover:bg-[var(--bg-secondary)] transition-colors"
              title="Tout ignorer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Expanded backup list */}
          {expanded && (
            <div className="border-t border-[var(--border)] px-3 py-1.5 space-y-1 max-h-[160px] overflow-y-auto">
              {backups.map((backup) => (
                <div key={backup.id} className="flex items-center gap-2 py-1 text-xs">
                  <span className="text-[var(--text-secondary)] shrink-0">
                    {new Date(backup.timestamp).toLocaleString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="font-medium truncate text-[var(--text)]">{backup.title}</span>
                  <div className="ml-auto flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleRestore(backup)}
                      className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 rounded hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Restaurer
                    </button>
                    <button
                      onClick={() => handleDismiss(backup.id)}
                      className="p-0.5 text-[var(--text-secondary)] rounded hover:bg-[var(--bg-secondary)] transition-colors"
                      title="Ignorer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
