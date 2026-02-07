// Panneau des pieces justificatives pour la sidebar unifiee
// Phase 3 : drag-and-drop, titres editables, metadonnees, insertion references
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { open } from '@tauri-apps/api/dialog'
import {
  usePiecesStore,
  isClassified,
  extractPieceNumber,
  getDisplayName,
  type FileItem,
} from '../../store/usePiecesStore'
import { useDocumentStore } from '../../store/useDocumentStore'
import { useEditorStore } from '../../store/useEditorStore'
import { useStampStore } from '../../store/useStampStore'
import { useToastStore } from '../../store/useToastStore'
import { PIECE_NATURE_LABELS } from '../../types/legal'
import type { PieceNature } from '../../types/legal'
import { StampConfigDialog } from './StampConfigDialog'
import { BordereauDialog } from './BordereauDialog'

interface PiecesSidebarPanelProps {
  onClose?: () => void
}

export function PiecesSidebarPanel({ onClose }: PiecesSidebarPanelProps) {
  const files = usePiecesStore((s) => s.files)
  const isLoading = usePiecesStore((s) => s.isLoading)
  const isRenaming = usePiecesStore((s) => s.isRenaming)
  const searchQuery = usePiecesStore((s) => s.searchQuery)
  const setSearchQuery = usePiecesStore((s) => s.setSearchQuery)
  const getDocumentState = usePiecesStore((s) => s.getDocumentState)
  const setFolderPath = usePiecesStore((s) => s.setFolderPath)
  const loadFiles = usePiecesStore((s) => s.loadFiles)
  const insertPiece = usePiecesStore((s) => s.insertPiece)
  const classifyPiece = usePiecesStore((s) => s.classifyPiece)
  const getEffectiveTitle = usePiecesStore((s) => s.getEffectiveTitle)
  const setPieceTitle = usePiecesStore((s) => s.setPieceTitle)
  const reorderPieces = usePiecesStore((s) => s.reorderPieces)
  const removePieceAndRenumber = usePiecesStore((s) => s.removePieceAndRenumber)

  const activeDocumentId = useDocumentStore((s) => s.activeDocumentId)
  const editor = useEditorStore((s) => s.activeEditor)

  const isStamping = useStampStore((s) => s.isStamping)
  const stampProgress = useStampStore((s) => s.stampProgress)
  const stampAndCopyPiece = useStampStore((s) => s.stampAndCopyPiece)
  const stampAndCopyAll = useStampStore((s) => s.stampAndCopyAll)
  const setConfigDialogOpen = useStampStore((s) => s.setConfigDialogOpen)

  // Local UI state
  const [stampingFileId, setStampingFileId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState<string | null>(null) // filename being edited
  const [editingTitleValue, setEditingTitleValue] = useState('')
  const [expandedMeta, setExpandedMeta] = useState<string | null>(null) // filename with expanded metadata
  const [bordereauOpen, setBordereauOpen] = useState(false)

  // Drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const titleInputRef = useRef<HTMLInputElement>(null)

  // Get current document's pieces state
  const documentState = activeDocumentId ? getDocumentState(activeDocumentId) : null

  // Load files when folder path changes
  useEffect(() => {
    if (documentState?.folderPath) {
      loadFiles(documentState.folderPath)
    }
  }, [documentState?.folderPath, loadFiles])

  // Focus title input when editing starts
  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [editingTitle])

  // Separate classified and unclassified files
  const { classifiedFiles, unclassifiedFiles } = useMemo(() => {
    const query = searchQuery.toLowerCase()
    const filtered = searchQuery
      ? files.filter((file) => file.name.toLowerCase().includes(query))
      : files

    const classified = filtered
      .filter((f) => isClassified(f.name))
      .sort((a, b) => {
        const numA = extractPieceNumber(a.name) || 0
        const numB = extractPieceNumber(b.name) || 0
        return numA - numB
      })
    const unclassified = filtered.filter((f) => !isClassified(f.name))

    return { classifiedFiles: classified, unclassifiedFiles: unclassified }
  }, [files, searchQuery])

  // Get next available number for "Prochain" display
  const nextNumber = useMemo(() => {
    const nums = files
      .map((f) => extractPieceNumber(f.name))
      .filter((n): n is number => n !== null)
    return nums.length === 0 ? 1 : Math.max(...nums) + 1
  }, [files])

  // -- Handlers --

  const handleSelectFolder = async () => {
    if (!activeDocumentId) return
    try {
      const selected = await open({ directory: true, multiple: false })
      if (selected && typeof selected === 'string') {
        setFolderPath(activeDocumentId, selected)
        await loadFiles(selected)
      }
    } catch (error) {
      console.error('Failed to select folder:', error)
    }
  }

  const handleClassify = async (file: FileItem) => {
    if (!activeDocumentId) return
    try {
      await classifyPiece(activeDocumentId, file)
    } catch (error) {
      console.error('Failed to classify piece:', error)
    }
  }

  const handleInsertRef = (file: FileItem) => {
    if (!editor || !activeDocumentId) return
    const result = insertPiece(activeDocumentId, file)
    if (!result) return
    const text = `(Pi\u00E8ce n\u00B0${result.number})`
    editor.chain().focus().insertContent(`<strong>${text}</strong>`).run()
  }

  const handleInsertRefWithTitle = (file: FileItem) => {
    if (!editor || !activeDocumentId) return
    const result = insertPiece(activeDocumentId, file)
    if (!result) return
    // Tiret cadratin (convention juridique francaise)
    const text = `(Pi\u00E8ce n\u00B0${result.number} \u2013 ${result.displayName})`
    editor.chain().focus().insertContent(`<strong>${text}</strong>`).run()
  }

  const handleStampOne = async (file: FileItem) => {
    if (!documentState?.folderPath) return
    setStampingFileId(file.path)
    const outputFolder = documentState.folderPath + '/PT'
    const result = await stampAndCopyPiece(file, outputFolder)
    setStampingFileId(null)
    if (result) {
      useToastStore.getState().addToast({ type: 'success', message: `Tampon applique : ${result.split('/').pop()}` })
    } else {
      useToastStore.getState().addToast({ type: 'error', message: 'Echec du tamponnage' })
    }
  }

  const handleStampAll = async () => {
    if (!documentState?.folderPath || classifiedFiles.length === 0) return
    const outputFolder = documentState.folderPath + '/PT'
    const results = await stampAndCopyAll(classifiedFiles, outputFolder)
    if (results.length > 0) {
      useToastStore.getState().addToast({
        type: 'success',
        message: `${results.length} piece${results.length > 1 ? 's' : ''} tamponnee${results.length > 1 ? 's' : ''} dans PT/`,
      })
    }
  }

  // -- Inline title editing --

  const handleStartTitleEdit = (filename: string) => {
    if (!activeDocumentId) return
    setEditingTitle(filename)
    setEditingTitleValue(getEffectiveTitle(filename, activeDocumentId))
  }

  const handleSaveTitle = () => {
    if (!editingTitle || !activeDocumentId) return
    setPieceTitle(activeDocumentId, editingTitle, editingTitleValue.trim())
    setEditingTitle(null)
  }

  const handleCancelTitle = () => {
    setEditingTitle(null)
    setEditingTitleValue('')
  }

  // -- Metadata panel --

  const toggleMetaPanel = (filename: string) => {
    setExpandedMeta((prev) => (prev === filename ? null : filename))
  }

  // -- Remove piece --

  const handleRemovePiece = async (file: FileItem) => {
    if (!activeDocumentId) return
    try {
      await removePieceAndRenumber(activeDocumentId, file)
      useToastStore.getState().addToast({ type: 'success', message: 'Piece retiree et renumerotee' })
    } catch (error) {
      console.error('Failed to remove piece:', error)
      useToastStore.getState().addToast({ type: 'error', message: 'Erreur lors du retrait' })
    }
  }

  // -- Drag and drop --

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    setDragOverIndex(null)
    if (draggedIndex === null || draggedIndex === dropIndex || !activeDocumentId) {
      setDraggedIndex(null)
      return
    }
    try {
      await reorderPieces(activeDocumentId, draggedIndex, dropIndex)
    } catch (error) {
      console.error('Failed to reorder:', error)
      useToastStore.getState().addToast({ type: 'error', message: 'Erreur lors du reordonnancement' })
    }
    setDraggedIndex(null)
  }, [draggedIndex, activeDocumentId, reorderPieces])

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }, [])

  const folderName = documentState?.folderPath?.split('/').pop() || null

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] relative">
      {/* Dialogs */}
      <StampConfigDialog />
      {bordereauOpen && activeDocumentId && (
        <BordereauDialog
          docId={activeDocumentId}
          onClose={() => setBordereauOpen(false)}
        />
      )}

      {/* Renaming overlay */}
      {isRenaming && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/30 rounded-lg">
          <div className="flex items-center gap-2 bg-[var(--bg-primary)] px-4 py-3 rounded-lg shadow-lg border border-[var(--border)]">
            <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Renumerotation...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <h2 className="text-lg font-semibold">Pieces justificatives</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setConfigDialogOpen(true)}
            title="Configuration du tampon"
            className="p-1.5 rounded hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-secondary)] hover:text-[var(--accent)]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
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
      </div>

      {/* No document */}
      {!activeDocumentId && (
        <div className="flex-1 flex items-center justify-center p-4 text-center text-[var(--text-secondary)]">
          <div>
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>Aucun document actif</p>
          </div>
        </div>
      )}

      {activeDocumentId && (
        <>
          {/* Folder selection */}
          <div className="p-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={handleSelectFolder}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                Selectionner dossier
              </button>
            </div>
            {folderName && (
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)] rounded-lg px-3 py-2">
                <svg className="w-4 h-4 flex-shrink-0 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                <span className="truncate" title={documentState?.folderPath || ''}>
                  {folderName}
                </span>
              </div>
            )}
          </div>

          {/* Search */}
          {documentState?.folderPath && (
            <div className="px-4 py-3 border-b border-[var(--border)]">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Rechercher un fichier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Files list */}
          <div className="flex-1 overflow-y-auto">
            {!documentState?.folderPath ? (
              <div className="p-8 text-center text-[var(--text-secondary)]">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  <path d="M12 11v6" />
                  <path d="M9 14h6" />
                </svg>
                <p className="font-medium mb-1">Aucun dossier selectionne</p>
                <p className="text-xs">Selectionnez un dossier pour voir les fichiers</p>
              </div>
            ) : isLoading ? (
              <div className="p-8 text-center text-[var(--text-secondary)]">
                <div className="animate-spin w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full mx-auto mb-3" />
                <p>Chargement des fichiers...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="p-8 text-center text-[var(--text-secondary)]">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                  <path d="M8 11h6" />
                </svg>
                <p>{searchQuery ? 'Aucun fichier correspondant' : 'Aucun fichier trouve'}</p>
              </div>
            ) : (
              <>
                {/* ===== Classified pieces section ===== */}
                {classifiedFiles.length > 0 && (
                  <div>
                    <div className="px-4 py-2.5 bg-green-50 dark:bg-green-900/15 border-b border-[var(--border)] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">
                          Pieces classees
                        </span>
                        <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
                          {classifiedFiles.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {/* Bordereau button */}
                        <button
                          onClick={() => setBordereauOpen(true)}
                          disabled={classifiedFiles.length === 0}
                          title="Generer le bordereau de communication"
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                            <rect x="9" y="3" width="6" height="4" rx="1" />
                            <path d="M9 12h6M9 16h6" />
                          </svg>
                          Bordereau
                        </button>
                        {/* Batch stamp button */}
                        <button
                          onClick={handleStampAll}
                          disabled={isStamping}
                          title="Tamponner toutes les pieces classees"
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors disabled:opacity-50"
                        >
                          <StampIcon className="w-3.5 h-3.5" />
                          {isStamping ? 'Tamponnage...' : 'Tamponner'}
                        </button>
                      </div>
                    </div>

                    {/* Stamp progress bar */}
                    {isStamping && stampProgress && (
                      <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/10 border-b border-[var(--border)]">
                        <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 mb-1">
                          <span>Tamponnage en cours...</span>
                          <span>{stampProgress.current}/{stampProgress.total}</span>
                        </div>
                        <div className="w-full h-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-300"
                            style={{ width: `${(stampProgress.current / stampProgress.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Classified file list with drag-and-drop */}
                    {classifiedFiles.map((file, index) => {
                      const pieceNum = extractPieceNumber(file.name)
                      const isPdf = file.name.toLowerCase().endsWith('.pdf')
                      const isFileStamping = stampingFileId === file.path
                      const isDragging = draggedIndex === index
                      const isDragOver = dragOverIndex === index
                      const isEditingThis = editingTitle === file.name
                      const isMetaExpanded = expandedMeta === file.name
                      const meta = documentState?.pieceMetadata?.[file.name]
                      const effectiveTitle = activeDocumentId
                        ? getEffectiveTitle(file.name, activeDocumentId)
                        : getDisplayName(file.name)

                      return (
                        <div key={file.path}>
                          <div
                            draggable={!isEditingThis && !isRenaming}
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`w-full px-2 py-1.5 flex items-start gap-1.5 transition-colors group ${
                              isDragging ? 'opacity-40' : ''
                            } ${isDragOver ? 'border-t-2 border-t-[var(--accent)]' : 'border-t-2 border-t-transparent'
                            } hover:bg-[var(--bg-secondary)]`}
                          >
                            {/* Drag handle */}
                            <div className="flex-shrink-0 mt-1.5 cursor-grab active:cursor-grabbing text-[var(--text-secondary)] opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity">
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="9" cy="6" r="2" />
                                <circle cx="15" cy="6" r="2" />
                                <circle cx="9" cy="12" r="2" />
                                <circle cx="15" cy="12" r="2" />
                                <circle cx="9" cy="18" r="2" />
                                <circle cx="15" cy="18" r="2" />
                              </svg>
                            </div>

                            {/* Piece number badge */}
                            <div className="w-6 h-6 rounded bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">
                              {pieceNum}
                            </div>

                            {/* Title area */}
                            <div className="flex-1 min-w-0">
                              {isEditingThis ? (
                                <input
                                  ref={titleInputRef}
                                  type="text"
                                  value={editingTitleValue}
                                  onChange={(e) => setEditingTitleValue(e.target.value)}
                                  onBlur={handleSaveTitle}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveTitle()
                                    if (e.key === 'Escape') handleCancelTitle()
                                  }}
                                  className="w-full text-sm px-1.5 py-0.5 border border-[var(--accent)] rounded bg-[var(--bg-secondary)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                                />
                              ) : (
                                <div
                                  className="text-sm text-[var(--text)] truncate cursor-text hover:text-[var(--accent)] transition-colors"
                                  onClick={() => handleStartTitleEdit(file.name)}
                                  title="Cliquer pour modifier le titre"
                                >
                                  {effectiveTitle}
                                </div>
                              )}
                              <div className="text-[10px] text-[var(--text-secondary)] truncate">
                                {file.name}
                              </div>
                            </div>

                            {/* Actions (visible on hover) */}
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5">
                              {/* Insert n° reference */}
                              <button
                                onClick={() => handleInsertRef(file)}
                                title="Inserer (Piece n°X)"
                                className="p-1 rounded hover:bg-[var(--accent)]/10 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors text-[10px] font-semibold"
                              >
                                n°
                              </button>

                              {/* Insert reference with title */}
                              <button
                                onClick={() => handleInsertRefWithTitle(file)}
                                title="Inserer (Piece n°X – Titre)"
                                className="p-1 rounded hover:bg-[var(--accent)]/10 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors text-[10px] font-semibold"
                              >
                                +t
                              </button>

                              {/* Stamp individual PDF */}
                              {isPdf && (
                                <button
                                  onClick={() => handleStampOne(file)}
                                  disabled={isStamping}
                                  title="Tamponner ce PDF"
                                  className="p-1 rounded hover:bg-amber-100 dark:hover:bg-amber-900/30 text-[var(--text-secondary)] hover:text-amber-600 dark:hover:text-amber-400 transition-colors disabled:opacity-50"
                                >
                                  {isFileStamping ? (
                                    <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <StampIcon className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}

                              {/* Metadata toggle */}
                              <button
                                onClick={() => toggleMetaPanel(file.name)}
                                title="Modifier les metadonnees"
                                className={`p-1 rounded transition-colors ${
                                  isMetaExpanded
                                    ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                                    : 'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text)]'
                                }`}
                              >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>

                              {/* Remove piece */}
                              <button
                                onClick={() => handleRemovePiece(file)}
                                title="Retirer et renumeroter"
                                className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Metadata editing panel */}
                          {isMetaExpanded && activeDocumentId && (
                            <MetadataPanel
                              docId={activeDocumentId}
                              filename={file.name}
                              meta={meta}
                              onClose={() => setExpandedMeta(null)}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* ===== Unclassified files section ===== */}
                {unclassifiedFiles.length > 0 && (
                  <div>
                    <div className="px-4 py-2.5 bg-[var(--bg-secondary)] border-y border-[var(--border)] flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                        A classer
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[var(--text-secondary)]">
                          Prochain : P{nextNumber}
                        </span>
                        <span className="text-xs text-[var(--text-secondary)]">
                          {unclassifiedFiles.length} fichier{unclassifiedFiles.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {unclassifiedFiles.map((file) => (
                      <button
                        key={file.path}
                        onClick={() => handleClassify(file)}
                        className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-[var(--bg-secondary)] transition-colors group"
                      >
                        <FileIcon filename={file.name} />
                        <span className="flex-1 text-sm text-[var(--text)] truncate group-hover:text-[var(--accent)]">
                          {file.name}
                        </span>
                        <svg
                          className="w-4 h-4 text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer - pieces inserted */}
          {documentState && documentState.insertedPieces.length > 0 && (
            <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--bg-secondary)]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">
                  Pieces inserees
                </span>
                <span className="text-sm font-medium text-[var(--accent)]">
                  {documentState.insertedPieces.length}
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ============================================================================
// Metadata sub-panel
// ============================================================================

function MetadataPanel({
  docId,
  filename,
  meta,
  onClose,
}: {
  docId: string
  filename: string
  meta?: { titre: string; nature: PieceNature; dateDocument?: string; description?: string }
  onClose: () => void
}) {
  const setPieceNature = usePiecesStore((s) => s.setPieceNature)
  const setPieceDateDocument = usePiecesStore((s) => s.setPieceDateDocument)
  const setPieceDescription = usePiecesStore((s) => s.setPieceDescription)

  const [nature, setNature] = useState<PieceNature>(meta?.nature || 'autre')
  const [dateDoc, setDateDoc] = useState(meta?.dateDocument || '')
  const [desc, setDesc] = useState(meta?.description || '')

  const handleSave = () => {
    setPieceNature(docId, filename, nature)
    setPieceDateDocument(docId, filename, dateDoc || undefined)
    setPieceDescription(docId, filename, desc || undefined)
    onClose()
  }

  return (
    <div className="mx-2 mb-2 p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] space-y-2.5">
      {/* Nature */}
      <div>
        <label className="block text-[10px] text-[var(--text-secondary)] uppercase tracking-wide mb-1">
          Nature
        </label>
        <select
          value={nature}
          onChange={(e) => setNature(e.target.value as PieceNature)}
          className="w-full text-xs px-2 py-1.5 border border-[var(--border)] rounded bg-[var(--bg-primary)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        >
          {Object.entries(PIECE_NATURE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Date du document */}
      <div>
        <label className="block text-[10px] text-[var(--text-secondary)] uppercase tracking-wide mb-1">
          Date du document
        </label>
        <input
          type="date"
          value={dateDoc}
          onChange={(e) => setDateDoc(e.target.value)}
          className="w-full text-xs px-2 py-1.5 border border-[var(--border)] rounded bg-[var(--bg-primary)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>

      {/* Observations */}
      <div>
        <label className="block text-[10px] text-[var(--text-secondary)] uppercase tracking-wide mb-1">
          Observations
        </label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={2}
          className="w-full text-xs px-2 py-1.5 border border-[var(--border)] rounded bg-[var(--bg-primary)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
          placeholder="Notes pour le bordereau..."
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          onClick={onClose}
          className="px-2.5 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1 text-xs font-medium bg-[var(--accent)] text-white rounded hover:opacity-90 transition-opacity"
        >
          Enregistrer
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// Helper components
// ============================================================================

function StampIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 21h14" />
      <path d="M5 18h14v3H5z" />
      <path d="M9 14V8a3 3 0 0 1 6 0v6" />
      <path d="M7 14h10l1 4H6l1-4z" />
    </svg>
  )
}

function FileIcon({ filename }: { filename: string }) {
  const ext = filename.split('.').pop()?.toLowerCase() || ''

  let iconColor = 'text-[var(--text-secondary)]'
  let bgColor = 'bg-[var(--bg-hover)]'

  if (['pdf'].includes(ext)) {
    iconColor = 'text-red-500'
    bgColor = 'bg-red-50 dark:bg-red-900/20'
  } else if (['doc', 'docx', 'odt', 'rtf'].includes(ext)) {
    iconColor = 'text-blue-500'
    bgColor = 'bg-blue-50 dark:bg-blue-900/20'
  } else if (['xls', 'xlsx', 'ods', 'csv'].includes(ext)) {
    iconColor = 'text-green-500'
    bgColor = 'bg-green-50 dark:bg-green-900/20'
  } else if (['jpg', 'jpeg', 'png', 'gif', 'tiff', 'bmp', 'webp'].includes(ext)) {
    iconColor = 'text-purple-500'
    bgColor = 'bg-purple-50 dark:bg-purple-900/20'
  } else if (['eml', 'msg'].includes(ext)) {
    iconColor = 'text-yellow-500'
    bgColor = 'bg-yellow-50 dark:bg-yellow-900/20'
  }

  return (
    <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0`}>
      <svg className={`w-4 h-4 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    </div>
  )
}
