import { useState, useEffect } from 'react'
import { useRecentFilesStore } from '../store/useRecentFilesStore'
import { useDocumentStore } from '../store/useDocumentStore'
import { useFileOperations } from '../hooks/useFileOperations'

const ONBOARDING_KEY = 'citadelle-onboarding-done'

interface WelcomeScreenProps {
  onDismiss: () => void
}

export function WelcomeScreen({ onDismiss }: WelcomeScreenProps) {
  const recentFiles = useRecentFilesStore((s) => s.recentFiles)
  const addDocument = useDocumentStore((s) => s.addDocument)
  const { openFile, openFileFromPath } = useFileOperations()

  const handleNewDocument = () => {
    addDocument()
    handleDismiss()
  }

  const handleOpenFile = async () => {
    await openFile()
    handleDismiss()
  }

  const handleOpenRecent = async (path: string) => {
    await openFileFromPath(path)
    handleDismiss()
  }

  function handleDismiss() {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    onDismiss()
  }

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-4 animate-fadeIn"
      onClick={(e) => { if (e.target === e.currentTarget) handleDismiss() }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative bg-[var(--bg)] border border-[var(--border)] rounded-xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col animate-scaleIn overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-2 text-center">
          <h1 className="text-2xl font-bold text-[var(--text)]">Citadelle</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Editeur de documents juridiques
          </p>
        </div>

        {/* Actions principales */}
        <div className="px-8 py-4 flex gap-3">
          <button
            onClick={handleNewDocument}
            className="flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border border-[var(--border)] bg-[var(--editor-bg)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-colors"
          >
            <svg className="w-6 h-6 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
            <span className="text-sm font-medium text-[var(--text)]">Nouveau</span>
          </button>
          <button
            onClick={handleOpenFile}
            className="flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border border-[var(--border)] bg-[var(--editor-bg)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-colors"
          >
            <svg className="w-6 h-6 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <span className="text-sm font-medium text-[var(--text)]">Ouvrir</span>
          </button>
        </div>

        {/* Fichiers récents */}
        {recentFiles.length > 0 && (
          <div className="flex-1 overflow-y-auto px-8 pb-2">
            <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Fichiers récents
            </h3>
            <div className="space-y-0.5">
              {recentFiles.slice(0, 8).map((file) => {
                const fileName = file.path.split('/').pop() || file.path
                const dirPath = file.path.split('/').slice(-3, -1).join('/')
                return (
                  <button
                    key={file.path}
                    onClick={() => handleOpenRecent(file.path)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors text-left"
                  >
                    <svg className="w-4 h-4 text-[var(--text-secondary)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-[var(--text)] truncate">{fileName}</div>
                      <div className="text-xs text-[var(--text-secondary)] truncate">{dirPath}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Raccourcis rapides */}
        <div className="px-8 py-4 border-t border-[var(--border)]">
          <div className="flex items-center justify-center gap-6 text-xs text-[var(--text-secondary)]">
            <span><kbd className="px-1.5 py-0.5 font-mono bg-[var(--editor-bg)] border border-[var(--border)] rounded">/</kbd> Commandes</span>
            <span><kbd className="px-1.5 py-0.5 font-mono bg-[var(--editor-bg)] border border-[var(--border)] rounded">⌘⇧P</kbd> Palette</span>
            <span><kbd className="px-1.5 py-0.5 font-mono bg-[var(--editor-bg)] border border-[var(--border)] rounded">⌘/</kbd> Raccourcis</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function useShowWelcome(): [boolean, () => void] {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY)
    if (!done) {
      setShow(true)
    }
  }, [])

  return [show, () => setShow(false)]
}
