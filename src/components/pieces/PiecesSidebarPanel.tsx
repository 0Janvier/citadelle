// Panneau des pièces justificatives pour la sidebar unifiée
import { useEffect, useMemo } from 'react'
import { open } from '@tauri-apps/api/dialog'
import { usePiecesStore, isClassified, type FileItem } from '../../store/usePiecesStore'
import { useDocumentStore } from '../../store/useDocumentStore'
import { useEditorStore } from '../../store/useEditorStore'

interface PiecesSidebarPanelProps {
  onClose?: () => void
}

export function PiecesSidebarPanel({ onClose }: PiecesSidebarPanelProps) {
  const files = usePiecesStore((state) => state.files)
  const isLoading = usePiecesStore((state) => state.isLoading)
  const searchQuery = usePiecesStore((state) => state.searchQuery)
  const setSearchQuery = usePiecesStore((state) => state.setSearchQuery)
  const getDocumentState = usePiecesStore((state) => state.getDocumentState)
  const setFolderPath = usePiecesStore((state) => state.setFolderPath)
  const loadFiles = usePiecesStore((state) => state.loadFiles)
  const insertPiece = usePiecesStore((state) => state.insertPiece)
  const classifyPiece = usePiecesStore((state) => state.classifyPiece)

  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId)
  const editor = useEditorStore((state) => state.activeEditor)

  // Get current document's pieces state
  const documentState = activeDocumentId ? getDocumentState(activeDocumentId) : null

  // Load files when folder path changes
  useEffect(() => {
    if (documentState?.folderPath) {
      loadFiles(documentState.folderPath)
    }
  }, [documentState?.folderPath, loadFiles])

  // Filter files by search query
  const filteredFiles = useMemo(() => {
    if (!searchQuery) return files
    const query = searchQuery.toLowerCase()
    return files.filter((file) => file.name.toLowerCase().includes(query))
  }, [files, searchQuery])

  const handleSelectFolder = async () => {
    if (!activeDocumentId) return

    try {
      const selected = await open({
        directory: true,
        multiple: false,
      })
      if (selected && typeof selected === 'string') {
        setFolderPath(activeDocumentId, selected)
        await loadFiles(selected)
      }
    } catch (error) {
      console.error('Failed to select folder:', error)
    }
  }

  const handleFileClick = async (file: FileItem) => {
    if (!editor || !activeDocumentId) return

    // Si le fichier n'est pas classé, le classer d'abord
    if (!isClassified(file.name)) {
      try {
        await classifyPiece(activeDocumentId, file)
        // Le fichier sera mis à jour dans la liste après classement
        return
      } catch (error) {
        console.error('Failed to classify piece:', error)
        return
      }
    }

    // Insérer la pièce classée
    const result = insertPiece(activeDocumentId, file)
    if (!result) return

    // Format: "Pièce n°XX. Filename"
    const pieceText = `Pièce n°${result.number}. ${result.displayName}`

    // Insert underlined text
    editor.chain()
      .focus()
      .insertContent(`<u>${pieceText}</u>`)
      .run()
  }

  // Get folder name from path
  const folderName = documentState?.folderPath?.split('/').pop() || null

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <h2 className="text-lg font-semibold">Pièces justificatives</h2>
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

      {/* No document warning */}
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
                Sélectionner dossier
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

          {/* Classified pieces count */}
          {documentState?.folderPath && (
            <div className="px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border)] flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">
                Pièces classées :
              </span>
              <span className="text-sm font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded">
                {files.filter(f => isClassified(f.name)).length}
              </span>
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
                <p className="font-medium mb-1">Aucun dossier sélectionné</p>
                <p className="text-xs">Sélectionnez un dossier pour voir les fichiers</p>
              </div>
            ) : isLoading ? (
              <div className="p-8 text-center text-[var(--text-secondary)]">
                <div className="animate-spin w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full mx-auto mb-3"></div>
                <p>Chargement des fichiers...</p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="p-8 text-center text-[var(--text-secondary)]">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                  <path d="M8 11h6" />
                </svg>
                <p>{searchQuery ? 'Aucun fichier correspondant' : 'Aucun fichier trouvé'}</p>
              </div>
            ) : (
              <div className="py-1">
                {filteredFiles.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => handleFileClick(file)}
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
          </div>

          {/* Footer - pieces inserted */}
          {documentState && documentState.insertedPieces.length > 0 && (
            <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--bg-secondary)]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">
                  Pièces insérées
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

// Helper component for file icons
function FileIcon({ filename }: { filename: string }) {
  const ext = filename.split('.').pop()?.toLowerCase() || ''

  // Determine icon color based on file type
  let iconColor = 'text-gray-400'
  let bgColor = 'bg-gray-100 dark:bg-gray-800'

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
