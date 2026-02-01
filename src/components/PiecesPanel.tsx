import { useEffect, useMemo, useState } from 'react'
import { open } from '@tauri-apps/api/dialog'
import { usePiecesStore, isClassified, extractPieceNumber, getDisplayName, type FileItem } from '../store/usePiecesStore'
import { useDocumentStore } from '../store/useDocumentStore'
import { useEditorStore } from '../store/useEditorStore'

export function PiecesPanel() {
  const panelOpen = usePiecesStore((state) => state.panelOpen)
  const setPanelOpen = usePiecesStore((state) => state.setPanelOpen)
  const files = usePiecesStore((state) => state.files)
  const isLoading = usePiecesStore((state) => state.isLoading)
  const searchQuery = usePiecesStore((state) => state.searchQuery)
  const setSearchQuery = usePiecesStore((state) => state.setSearchQuery)
  const getDocumentState = usePiecesStore((state) => state.getDocumentState)
  const setFolderPath = usePiecesStore((state) => state.setFolderPath)
  const loadFiles = usePiecesStore((state) => state.loadFiles)
  const classifyPiece = usePiecesStore((state) => state.classifyPiece)
  const insertPiece = usePiecesStore((state) => state.insertPiece)
  const unclassifyPiece = usePiecesStore((state) => state.unclassifyPiece)

  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId)
  const editor = useEditorStore((state) => state.activeEditor)

  const [isClassifying, setIsClassifying] = useState(false)

  // Get current document's pieces state
  const documentState = activeDocumentId ? getDocumentState(activeDocumentId) : null

  // Load files when folder path changes or panel opens
  useEffect(() => {
    if (panelOpen && documentState?.folderPath) {
      loadFiles(documentState.folderPath)
    }
  }, [panelOpen, documentState?.folderPath, loadFiles])

  // Separate and filter files
  const { classifiedFiles, unclassifiedFiles } = useMemo(() => {
    const query = searchQuery.toLowerCase()
    const filtered = searchQuery
      ? files.filter((file) => file.name.toLowerCase().includes(query))
      : files

    const classified = filtered
      .filter(f => isClassified(f.name))
      .sort((a, b) => {
        const numA = extractPieceNumber(a.name) || 0
        const numB = extractPieceNumber(b.name) || 0
        return numA - numB
      })

    const unclassified = filtered
      .filter(f => !isClassified(f.name))
      .sort((a, b) => a.name.localeCompare(b.name, 'fr', { numeric: true }))

    return { classifiedFiles: classified, unclassifiedFiles: unclassified }
  }, [files, searchQuery])

  // Get next piece number
  const nextPieceNumber = useMemo(() => {
    const usedNumbers = files
      .map(f => extractPieceNumber(f.name))
      .filter((n): n is number => n !== null)

    if (usedNumbers.length === 0) return 1
    return Math.max(...usedNumbers) + 1
  }, [files])

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

  const handleClassify = async (file: FileItem) => {
    if (!activeDocumentId || isClassifying) return

    setIsClassifying(true)
    try {
      await classifyPiece(activeDocumentId, file)
    } catch (error) {
      console.error('Failed to classify piece:', error)
      alert('Erreur lors du classement de la pièce. Vérifiez que le fichier n\'est pas ouvert.')
    } finally {
      setIsClassifying(false)
    }
  }

  const handleUnclassify = async (file: FileItem) => {
    if (!activeDocumentId || isClassifying) return

    if (!confirm('Retirer le classement de cette pièce ?')) return

    setIsClassifying(true)
    try {
      await unclassifyPiece(activeDocumentId, file)
    } catch (error) {
      console.error('Failed to unclassify piece:', error)
      alert('Erreur lors du déclassement de la pièce.')
    } finally {
      setIsClassifying(false)
    }
  }

  const handleInsert = (file: FileItem) => {
    if (!editor || !activeDocumentId) return

    const result = insertPiece(activeDocumentId, file)
    if (!result) {
      alert('Cette pièce doit d\'abord être classée.')
      return
    }

    // Format ALTeIA : "(Pièce n°XX)" en gras
    const pieceText = `(Pièce n°${result.number})`

    // Insert bold text with space after
    editor.chain()
      .focus()
      .insertContent(`<strong>${pieceText}</strong> `)
      .run()
  }

  const handleInsertWithName = (file: FileItem) => {
    if (!editor || !activeDocumentId) return

    const result = insertPiece(activeDocumentId, file)
    if (!result) {
      alert('Cette pièce doit d\'abord être classée.')
      return
    }

    // Format ALTeIA complet : "(Pièce n°XX - NomFichier)" en gras
    const pieceText = `(Pièce n°${result.number} - ${result.displayName})`

    editor.chain()
      .focus()
      .insertContent(`<strong>${pieceText}</strong> `)
      .run()
  }

  const handleInsertBordereau = () => {
    if (!editor || !activeDocumentId) return

    if (classifiedFiles.length === 0) {
      alert('Aucune pièce classée à lister.')
      return
    }

    // Construire le bordereau de pièces
    const bordereauLines = classifiedFiles.map((file) => {
      const pieceNumber = extractPieceNumber(file.name)
      const displayName = getDisplayName(file.name)
      return `Pièce n°${pieceNumber} : ${displayName}`
    })

    // Créer le contenu HTML avec titre et liste
    const bordereauHtml = `
      <p><strong>BORDEREAU DE PIÈCES</strong></p>
      <p></p>
      ${bordereauLines.map(line => `<p>${line}</p>`).join('')}
      <p></p>
    `

    editor.chain()
      .focus()
      .insertContent(bordereauHtml)
      .run()
  }

  const handleClose = () => {
    setPanelOpen(false)
    setSearchQuery('')
  }

  // Get folder name from path
  const folderName = documentState?.folderPath?.split('/').pop() || null

  if (!panelOpen) return null

  return (
    <div className="fixed right-0 top-0 bottom-0 w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-lg z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">Pièces justificatives</h2>
        <button
          onClick={handleClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* No document warning */}
      {!activeDocumentId && (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          Aucun document actif
        </div>
      )}

      {activeDocumentId && (
        <>
          {/* Folder selection */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSelectFolder}
              className="w-full px-3 py-2 text-sm bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Sélectionner dossier
            </button>
            {folderName && (
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400 truncate">
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Files list */}
          <div className="flex-1 overflow-y-auto">
            {!documentState?.folderPath ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                <p>Sélectionnez un dossier pour voir les fichiers</p>
              </div>
            ) : isLoading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-[var(--accent)] rounded-full mx-auto mb-2"></div>
                Chargement...
              </div>
            ) : classifiedFiles.length === 0 && unclassifiedFiles.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                {searchQuery ? 'Aucun fichier correspondant' : 'Aucun fichier trouvé'}
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {/* Classified pieces section */}
                {classifiedFiles.length > 0 && (
                  <div className="py-2">
                    <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">
                        Pièces classées ({classifiedFiles.length})
                      </h3>
                      <button
                        onClick={handleInsertBordereau}
                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                        title="Insérer le bordereau de pièces"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          <path d="M9 12h6M9 16h6" />
                        </svg>
                        Bordereau
                      </button>
                    </div>
                    {classifiedFiles.map((file) => {
                      const pieceNumber = extractPieceNumber(file.name)
                      const displayName = getDisplayName(file.name)

                      return (
                        <div
                          key={file.path}
                          className="px-4 py-2 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <span className="text-xs font-bold text-green-700 dark:text-green-400">
                              {pieceNumber}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <FileIcon filename={file.name} />
                              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                {displayName}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleInsert(file)}
                              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              title="Insérer (Pièce n°X)"
                            >
                              n°
                            </button>
                            <button
                              onClick={() => handleInsertWithName(file)}
                              className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                              title="Insérer (Pièce n°X - Nom)"
                            >
                              +nom
                            </button>
                            <button
                              onClick={() => handleUnclassify(file)}
                              disabled={isClassifying}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              title="Retirer le classement"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Unclassified pieces section */}
                {unclassifiedFiles.length > 0 && (
                  <div className="py-2">
                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          À classer ({unclassifiedFiles.length})
                        </h3>
                        <span className="text-xs text-gray-400">
                          Prochain : P{nextPieceNumber}
                        </span>
                      </div>
                    </div>
                    {unclassifiedFiles.map((file) => (
                      <div
                        key={file.path}
                        className="px-4 py-2 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                      >
                        <FileIcon filename={file.name} />
                        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                          {file.name}
                        </span>
                        <button
                          onClick={() => handleClassify(file)}
                          disabled={isClassifying}
                          className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                          title={`Classer comme P${nextPieceNumber}`}
                        >
                          {isClassifying ? '...' : `P${nextPieceNumber}`}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {documentState && documentState.insertedPieces.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {documentState.insertedPieces.length} pièce{documentState.insertedPieces.length > 1 ? 's' : ''} insérée{documentState.insertedPieces.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Helper component for file icons
function FileIcon({ filename }: { filename: string }) {
  // Remove P[N] prefix if present to get real extension
  const cleanName = filename.replace(/^P\d+\s+/, '')
  const ext = cleanName.split('.').pop()?.toLowerCase() || ''

  // Determine icon color based on file type
  let iconColor = 'text-gray-400'
  if (['pdf'].includes(ext)) {
    iconColor = 'text-red-500'
  } else if (['doc', 'docx', 'odt', 'rtf'].includes(ext)) {
    iconColor = 'text-blue-500'
  } else if (['xls', 'xlsx', 'ods', 'csv'].includes(ext)) {
    iconColor = 'text-green-500'
  } else if (['jpg', 'jpeg', 'png', 'gif', 'tiff', 'bmp', 'webp'].includes(ext)) {
    iconColor = 'text-purple-500'
  } else if (['eml', 'msg'].includes(ext)) {
    iconColor = 'text-yellow-500'
  }

  return (
    <svg className={`w-4 h-4 flex-shrink-0 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}
