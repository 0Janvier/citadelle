import { useState } from 'react'
import { useDocumentStore } from '../store/useDocumentStore'
import { useEditorStore } from '../store/useEditorStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { Dialog } from './Dialog'

export function TabBar() {
  const documents = useDocumentStore((state) => state.documents)
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId)
  const setActiveDocument = useDocumentStore((state) => state.setActiveDocument)
  const removeDocument = useDocumentStore((state) => state.removeDocument)
  const addDocument = useDocumentStore((state) => state.addDocument)
  const showTabBar = useEditorStore((state) => state.showTabBar)
  const confirmTabClose = useSettingsStore((state) => state.confirmTabClose)
  const [confirmClose, setConfirmClose] = useState<{ id: string; title: string } | null>(null)

  if (!showTabBar) return null

  const handleCloseTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const doc = documents.find((d) => d.id === id)

    if (doc?.isDirty && confirmTabClose) {
      setConfirmClose({ id: doc.id, title: doc.title })
      return
    }

    removeDocument(id)
  }

  const handleConfirmClose = () => {
    if (confirmClose) {
      removeDocument(confirmClose.id)
      setConfirmClose(null)
    }
  }

  const handleNewTab = () => {
    addDocument()
  }

  return (
    <div className="min-h-[44px] border-b border-[var(--border)] flex items-center pl-20 pr-2 bg-[var(--bg)] tab-bar" data-tauri-drag-region>
      <div className="flex-1 flex items-center gap-1 overflow-x-auto" data-no-drag>
        {documents.map((doc) => (
          <div
            key={doc.id}
            data-no-drag
            className={`
              flex items-center gap-2 px-3 min-h-button-md rounded-hig-md cursor-pointer
              transition-colors duration-fast min-w-[120px] max-w-[200px]
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1
              ${
                doc.id === activeDocumentId
                  ? 'bg-[var(--editor-bg)] text-[var(--text)]'
                  : 'hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]'
              }
            `}
            onClick={() => setActiveDocument(doc.id)}
            tabIndex={0}
            role="tab"
            aria-selected={doc.id === activeDocumentId}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setActiveDocument(doc.id)
              }
            }}
          >
            <span className="flex-1 truncate text-callout">
              {doc.title}
              {doc.isDirty && (
                <span className="ml-1 text-[var(--accent)]">•</span>
              )}
            </span>
            <button
              className="
                w-7 h-7 -mr-1
                flex items-center justify-center
                hover:bg-[var(--bg-tertiary)] rounded-hig-sm
                transition-colors duration-fast
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
              "
              onClick={(e) => handleCloseTab(e, doc.id)}
              aria-label="Fermer l'onglet"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <button
        data-no-drag
        className="
          ml-2 w-9 h-9
          flex items-center justify-center
          hover:bg-[var(--bg-hover)] rounded-hig-md
          transition-colors duration-fast
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1
        "
        onClick={handleNewTab}
        aria-label="Nouveau document"
        title="Nouveau document (Cmd+N)"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      {confirmClose && (
        <Dialog
          open={true}
          onClose={() => setConfirmClose(null)}
          title="Fermer le document ?"
          description={`Le document "${confirmClose.title}" contient des modifications non sauvegardées.`}
          type="confirm"
          confirmText="Fermer sans sauvegarder"
          cancelText="Annuler"
          destructive={true}
          onConfirm={handleConfirmClose}
        />
      )}
    </div>
  )
}
