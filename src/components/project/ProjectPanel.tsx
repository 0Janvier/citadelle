// Panel affichant le projet actif et ses documents
import { useState } from 'react'
import { useProjectStore, ProjectDocument } from '../../store/useProjectStore'
import { useDocumentStore } from '../../store/useDocumentStore'
import { useEditorStore } from '../../store/useEditorStore'
import { invoke } from '@tauri-apps/api/tauri'
import { open } from '@tauri-apps/api/dialog'

interface ProjectPanelProps {
  onClose: () => void
}

export function ProjectPanel({ onClose }: ProjectPanelProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState('')

  const currentProject = useProjectStore((state) => state.currentProject)
  const openProject = useProjectStore((state) => state.openProject)
  const closeProject = useProjectStore((state) => state.closeProject)
  const refreshProject = useProjectStore((state) => state.refreshProject)
  const recentProjects = useProjectStore((state) => state.recentProjects)
  const isLoading = useProjectStore((state) => state.isLoading)

  const addDocument = useDocumentStore((state) => state.addDocument)
  const setProjectSearchOpen = useEditorStore((state) => state.setProjectSearchOpen)

  const handleOpenProject = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Sélectionner un dossier projet',
      })

      if (selected && typeof selected === 'string') {
        await openProject(selected)
      }
    } catch (error) {
      console.error('Failed to open project folder:', error)
    }
  }

  const handleOpenFile = async (doc: ProjectDocument) => {
    try {
      const content = await invoke<string>('read_file', { path: doc.path })

      const lines = content.split('\n')
      const jsonContent = {
        type: 'doc',
        content: lines.map((line) => ({
          type: 'paragraph',
          content: line ? [{ type: 'text', text: line }] : [],
        })),
      }

      addDocument({
        title: doc.name,
        content: jsonContent,
        filePath: doc.path,
      })
    } catch (error) {
      console.error('Failed to open file:', error)
    }
  }

  const filteredDocuments = currentProject?.documents.filter((doc) =>
    doc.name.toLowerCase().includes(filter.toLowerCase())
  )

  // Group documents by folder
  const groupedDocuments = groupDocumentsByFolder(filteredDocuments || [])

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(folderPath)) {
        next.delete(folderPath)
      } else {
        next.add(folderPath)
      }
      return next
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[var(--border)]">
        <h2 className="font-semibold text-[var(--text)]">Projet</h2>
        <div className="flex items-center gap-1">
          {currentProject && (
            <>
              <button
                onClick={() => setProjectSearchOpen(true)}
                className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                title="Rechercher (Cmd+Shift+F)"
              >
                <SearchIcon className="w-4 h-4" />
              </button>
              <button
                onClick={refreshProject}
                className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                title="Actualiser"
              >
                <RefreshIcon className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : currentProject ? (
        <>
          {/* Project info */}
          <div className="p-3 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
            <div className="flex items-center gap-2">
              <FolderIcon className="w-5 h-5 text-[var(--accent)]" />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-[var(--text)] truncate">
                  {currentProject.name}
                </h3>
                <p className="text-xs text-[var(--text-tertiary)] truncate">
                  {currentProject.rootPath}
                </p>
              </div>
              <button
                onClick={closeProject}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text)] px-2 py-1 rounded hover:bg-[var(--bg-tertiary)]"
              >
                Fermer
              </button>
            </div>
            <div className="mt-2 text-xs text-[var(--text-secondary)]">
              {currentProject.documents.length} fichiers
            </div>
          </div>

          {/* Filter */}
          <div className="p-2 border-b border-[var(--border)]">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filtrer les fichiers..."
              className="w-full px-2 py-1.5 text-sm bg-[var(--bg-secondary)] border border-[var(--border)] rounded outline-none focus:border-[var(--accent)]"
            />
          </div>

          {/* File tree */}
          <div className="flex-1 overflow-y-auto p-2">
            {Object.entries(groupedDocuments).length === 0 ? (
              <div className="text-sm text-[var(--text-tertiary)] text-center py-4">
                Aucun fichier trouvé
              </div>
            ) : (
              <div className="space-y-1">
                {Object.entries(groupedDocuments).map(([folder, docs]) => (
                  <div key={folder}>
                    {folder !== '' && (
                      <button
                        onClick={() => toggleFolder(folder)}
                        className="w-full flex items-center gap-1 py-1 px-1 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] rounded"
                      >
                        <ChevronIcon
                          className={`w-3 h-3 transition-transform ${
                            expandedFolders.has(folder) ? 'rotate-90' : ''
                          }`}
                        />
                        <FolderIcon className="w-4 h-4" />
                        <span className="truncate">{folder}</span>
                      </button>
                    )}
                    {(folder === '' || expandedFolders.has(folder)) && (
                      <div className={folder !== '' ? 'ml-4' : ''}>
                        {docs.map((doc) => (
                          <button
                            key={doc.id}
                            onClick={() => handleOpenFile(doc)}
                            className="w-full flex items-center gap-2 py-1.5 px-2 text-sm text-[var(--text)] hover:bg-[var(--bg-tertiary)] rounded"
                          >
                            <FileIcon type={doc.type} className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{doc.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <FolderIcon className="w-12 h-12 text-[var(--text-tertiary)] mb-4" />
          <h3 className="font-medium text-[var(--text)] mb-2">Aucun projet ouvert</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Ouvrez un dossier pour le traiter comme un projet
          </p>
          <button
            onClick={handleOpenProject}
            className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90"
          >
            Ouvrir un dossier
          </button>

          {/* Recent projects */}
          {recentProjects.length > 0 && (
            <div className="mt-6 w-full">
              <h4 className="text-xs font-medium text-[var(--text-secondary)] mb-2">
                Projets récents
              </h4>
              <div className="space-y-1">
                {recentProjects.slice(0, 5).map((project) => (
                  <button
                    key={project.id}
                    onClick={() => openProject(project.rootPath)}
                    className="w-full flex items-center gap-2 p-2 text-left text-sm hover:bg-[var(--bg-tertiary)] rounded"
                  >
                    <FolderIcon className="w-4 h-4 text-[var(--accent)]" />
                    <div className="flex-1 min-w-0">
                      <span className="block truncate text-[var(--text)]">
                        {project.name}
                      </span>
                      <span className="block truncate text-xs text-[var(--text-tertiary)]">
                        {project.rootPath}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Keyboard shortcut hint */}
      <div className="p-2 border-t border-[var(--border)] bg-[var(--bg-secondary)] text-xs text-[var(--text-tertiary)] text-center">
        <kbd className="px-1 py-0.5 bg-[var(--bg)] rounded">Cmd+Shift+O</kbd> Ouvrir un projet
      </div>
    </div>
  )
}

// Helper function to group documents by folder
function groupDocumentsByFolder(documents: ProjectDocument[]): Record<string, ProjectDocument[]> {
  const groups: Record<string, ProjectDocument[]> = {}

  for (const doc of documents) {
    const parts = doc.path.split('/')
    parts.pop() // Remove filename
    const folder = parts.length > 0 ? parts[parts.length - 1] : ''

    if (!groups[folder]) {
      groups[folder] = []
    }
    groups[folder].push(doc)
  }

  // Sort documents within each group
  for (const folder of Object.keys(groups)) {
    groups[folder].sort((a, b) => a.name.localeCompare(b.name))
  }

  return groups
}

// Icons
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

function FileIcon({ type, className }: { type: ProjectDocument['type']; className?: string }) {
  const colors: Record<ProjectDocument['type'], string> = {
    md: 'text-blue-500',
    txt: 'text-gray-500',
    docx: 'text-blue-600',
    pdf: 'text-red-500',
    other: 'text-gray-400',
  }

  return (
    <svg className={`${className} ${colors[type]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}
