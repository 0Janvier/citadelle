import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react'
import { useDocumentStore } from '../store/useDocumentStore'
import { useEditorStore } from '../store/useEditorStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { useClosedTabsStore } from '../store/useClosedTabsStore'
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

  // Drag & drop state (reactive for drop indicator)
  const [dragState, setDragState] = useState<{ dragIndex: number; overIndex: number } | null>(null)
  const dragRef = useRef<{ dragIndex: number; overIndex: number } | null>(null)
  const reorderDocuments = useDocumentStore((state) => state.reorderDocuments)
  const duplicateDocument = useDocumentStore((state) => state.duplicateDocument)
  const closedTabsCount = useClosedTabsStore((state) => state.closedTabs.length)

  // Sliding underline refs
  const tabsContainerRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [underlineStyle, setUnderlineStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 })
  const [underlineReady, setUnderlineReady] = useState(false)

  // Measure active tab position for sliding underline
  const updateUnderline = useCallback(() => {
    if (!activeDocumentId || !tabsContainerRef.current) return
    const tabEl = tabRefs.current.get(activeDocumentId)
    if (!tabEl) return
    const containerRect = tabsContainerRef.current.getBoundingClientRect()
    const tabRect = tabEl.getBoundingClientRect()
    setUnderlineStyle({
      left: tabRect.left - containerRect.left,
      width: tabRect.width,
    })
    setUnderlineReady(true)
  }, [activeDocumentId])

  useLayoutEffect(() => {
    updateUnderline()
  }, [activeDocumentId, documents.length, updateUnderline])

  // Also update on resize
  useEffect(() => {
    const observer = new ResizeObserver(updateUnderline)
    if (tabsContainerRef.current) observer.observe(tabsContainerRef.current)
    return () => observer.disconnect()
  }, [updateUnderline])

  const handleReopenClosed = useCallback(() => {
    const tab = useClosedTabsStore.getState().popClosedTab()
    if (tab) {
      addDocument({
        title: tab.title,
        content: tab.content,
        filePath: tab.filePath,
        isDirty: true,
      })
    }
  }, [addDocument])

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
      case 'close-saved':
        documents.forEach(d => { if (!d.isDirty) removeDocument(d.id) })
        break
      case 'close-all': {
        const hasDirty = documents.some(d => d.isDirty)
        if (hasDirty) {
          const confirmed = window.confirm('Certains documents contiennent des modifications non sauvegardees. Fermer tous les onglets ?')
          if (!confirmed) break
        }
        documents.forEach(d => removeDocument(d.id))
        break
      }
      case 'copy-path': {
        const doc = documents.find(d => d.id === docId)
        if (doc?.filePath) navigator.clipboard.writeText(doc.filePath)
        break
      }
      case 'duplicate':
        duplicateDocument(docId)
        break
      case 'reopen-closed':
        handleReopenClosed()
        break
    }
    setContextMenu(null)
  }, [contextMenu, documents, removeDocument, duplicateDocument, handleReopenClosed])

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
      <div ref={tabsContainerRef} className="flex-1 flex items-center gap-1 overflow-x-auto relative" data-no-drag>
        {documents.map((doc, index) => {
          const isDragging = dragState !== null && dragState.dragIndex === index
          const showDropBefore = dragState !== null &&
            dragState.overIndex === index &&
            dragState.dragIndex !== index &&
            dragState.dragIndex > index
          const showDropAfter = dragState !== null &&
            dragState.overIndex === index &&
            dragState.dragIndex !== index &&
            dragState.dragIndex < index

          return (
            <div key={doc.id} className="relative flex items-center">
              {/* Drop indicator - before */}
              {showDropBefore && (
                <div className="absolute -left-0.5 top-2 bottom-2 w-0.5 bg-[var(--accent)] rounded-full z-10 animate-scaleIn" />
              )}

              <div
                ref={(el) => { if (el) tabRefs.current.set(doc.id, el); else tabRefs.current.delete(doc.id) }}
                data-no-drag
                draggable
                onDragStart={() => {
                  const state = { dragIndex: index, overIndex: index }
                  dragRef.current = state
                  setDragState(state)
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  if (dragRef.current && dragRef.current.overIndex !== index) {
                    dragRef.current.overIndex = index
                    setDragState({ ...dragRef.current })
                  }
                }}
                onDrop={() => {
                  if (dragRef.current && dragRef.current.dragIndex !== dragRef.current.overIndex && reorderDocuments) {
                    reorderDocuments(dragRef.current.dragIndex, dragRef.current.overIndex)
                  }
                  dragRef.current = null
                  setDragState(null)
                }}
                onDragEnd={() => {
                  dragRef.current = null
                  setDragState(null)
                }}
                className={`
                  flex items-center gap-2 px-3 min-h-button-md rounded-hig-md cursor-pointer
                  transition-all duration-fast min-w-[120px] max-w-[200px]
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1
                  ${isDragging ? 'opacity-40' : ''}
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

              {/* Drop indicator - after */}
              {showDropAfter && (
                <div className="absolute -right-0.5 top-2 bottom-2 w-0.5 bg-[var(--accent)] rounded-full z-10 animate-scaleIn" />
              )}
            </div>
          )
        })}

        {/* Sliding underline indicator */}
        {underlineReady && documents.length > 0 && (
          <div
            className="absolute bottom-0 h-[2px] bg-[var(--accent)] rounded-full transition-all duration-200 ease-out"
            style={{
              left: underlineStyle.left,
              width: underlineStyle.width,
            }}
          />
        )}
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
          description={`Le document "${confirmClose.title}" contient des modifications non sauvegardees.`}
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
          <div className="fixed inset-0 z-40" onClick={closeContextMenu} onKeyDown={(e) => { if (e.key === 'Escape') closeContextMenu() }} />
          <div
            className="fixed z-50 bg-[var(--bg)] border border-[var(--border)] rounded-lg shadow-xl py-1 min-w-[200px] animate-scaleIn"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {/* Close group */}
            <ContextMenuItem icon="close" label="Fermer" shortcut="Cmd+W" onClick={() => handleContextAction('close')} />
            <ContextMenuItem icon="close-others" label="Fermer les autres" onClick={() => handleContextAction('close-others')} />
            <ContextMenuItem icon="close-right" label="Fermer a droite" onClick={() => handleContextAction('close-right')} />
            <ContextMenuItem icon="close-saved" label="Fermer les enregistres" onClick={() => handleContextAction('close-saved')} />
            <ContextMenuItem icon="close-all" label="Fermer tous" onClick={() => handleContextAction('close-all')} destructive />

            <div className="h-px bg-[var(--border)] my-1" />

            {/* Actions group */}
            <ContextMenuItem icon="duplicate" label="Dupliquer" onClick={() => handleContextAction('duplicate')} />
            {closedTabsCount > 0 && (
              <ContextMenuItem icon="reopen" label="Rouvrir le dernier ferme" shortcut="Cmd+Shift+R" onClick={() => handleContextAction('reopen-closed')} />
            )}

            <div className="h-px bg-[var(--border)] my-1" />

            {/* Utility group */}
            <ContextMenuItem icon="path" label="Copier le chemin" onClick={() => handleContextAction('copy-path')} />
          </div>
        </>
      )}
    </div>
  )
}

// Context menu item with icon
function ContextMenuItem({ icon, label, shortcut, onClick, destructive }: {
  icon: string
  label: string
  shortcut?: string
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <button
      className={`w-full px-3 py-1.5 text-sm text-left hover:bg-[var(--bg-hover)] flex items-center gap-2.5 ${
        destructive ? 'text-red-500' : 'text-[var(--text)]'
      }`}
      onClick={onClick}
    >
      <span className="w-4 h-4 shrink-0 flex items-center justify-center text-[var(--text-secondary)]">
        <ContextMenuIcon type={icon} />
      </span>
      <span className="flex-1">{label}</span>
      {shortcut && (
        <span className="text-xs text-[var(--text-muted)] ml-4">{shortcut}</span>
      )}
    </button>
  )
}

function ContextMenuIcon({ type }: { type: string }) {
  const cls = "w-3.5 h-3.5"
  switch (type) {
    case 'close':
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
    case 'close-others':
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" /></svg>
    case 'close-right':
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
    case 'close-saved':
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    case 'close-all':
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
    case 'duplicate':
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>
    case 'reopen':
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
    case 'path':
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-3.072a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.25 8.184" /></svg>
    default:
      return null
  }
}
