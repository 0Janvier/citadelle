import { useState, useRef, useCallback } from 'react'
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

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; docId: string } | null>(null)

  // Drag & drop state
  const dragRef = useRef<{ dragIndex: number; overIndex: number } | null>(null)
  const reorderDocuments = useDocumentStore((state) => state.reorderDocuments)

  const handleContextMenu = useCallback((e: React.MouseEvent, docId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, docId })
  }, [])

  const closeContextMenu = useCallback(() => setContextMenu(null), [])

  const handleContextAction = useCallback((action: string) => {
    if (!contextMenu) return
    const { docId } = contextMenu
    const idx = documents.findIndex(d => d.id === docId)

    switch (action) {
      case 'close':
        removeDocument(docId)
        break
      case 'close-others':
        documents.forEach(d => { if (d.id !== docId) removeDocument(d.id) })
        break
      case 'close-right':
        documents.slice(idx + 1).forEach(d => removeDocument(d.id))
        break
      case 'copy-path': {
        const doc = documents.find(d => d.id === docId)
        if (doc?.filePath) navigator.clipboard.writeText(doc.filePath)
        break
      }
    }
    setContextMenu(null)
  }, [contextMenu, documents, removeDocument])

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
        {documents.map((doc, index) => (
          <div
            key={doc.id}
            data-no-drag
            draggable
            onDragStart={() => { dragRef.current = { dragIndex: index, overIndex: index } }}
            onDragOver={(e) => { e.preventDefault(); if (dragRef.current) dragRef.current.overIndex = index }}
            onDrop={() => {
              if (dragRef.current && dragRef.current.dragIndex !== dragRef.current.overIndex && reorderDocuments) {
                reorderDocuments(dragRef.current.dragIndex, dragRef.current.overIndex)
              }
              dragRef.current = null
            }}
            onDragEnd={() => { dragRef.current = null }}
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
            onContextMenu={(e) => handleContextMenu(e, doc.id)}
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
            {doc.isDirty && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            )}
            <span className={`flex-1 truncate text-callout ${doc.isDirty ? 'text-amber-600 dark:text-amber-400' : ''}`}>
              {doc.title}
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

      {/* Context menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeContextMenu} />
          <div
            className="fixed z-50 bg-[var(--bg)] border border-[var(--border)] rounded-lg shadow-xl py-1 min-w-[180px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button className="w-full px-3 py-1.5 text-sm text-left hover:bg-[var(--bg-hover)] text-[var(--text)]" onClick={() => handleContextAction('close')}>Fermer</button>
            <button className="w-full px-3 py-1.5 text-sm text-left hover:bg-[var(--bg-hover)] text-[var(--text)]" onClick={() => handleContextAction('close-others')}>Fermer les autres</button>
            <button className="w-full px-3 py-1.5 text-sm text-left hover:bg-[var(--bg-hover)] text-[var(--text)]" onClick={() => handleContextAction('close-right')}>Fermer à droite</button>
            <div className="h-px bg-[var(--border)] my-1" />
            <button className="w-full px-3 py-1.5 text-sm text-left hover:bg-[var(--bg-hover)] text-[var(--text)]" onClick={() => handleContextAction('copy-path')}>Copier le chemin</button>
          </div>
        </>
      )}
    </div>
  )
}
