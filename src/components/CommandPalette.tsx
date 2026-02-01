import { useEffect, useState } from 'react'
import { Command } from 'cmdk'
import { useEditorStore } from '../store/useEditorStore'
import { useDocumentStore } from '../store/useDocumentStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { useRecentFilesStore } from '../store/useRecentFilesStore'
import { usePiecesStore } from '../store/usePiecesStore'
import { useTocStore } from '../store/useTocStore'
import { useFileOperations } from '../hooks/useFileOperations'
import { invoke } from '@tauri-apps/api/tauri'
import './CommandPalette.css'

interface CommandItem {
  id: string
  label: string
  shortcut?: string
  category: string
  action: () => void
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const addDocument = useDocumentStore((state) => state.addDocument)
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId)
  const markAsSaved = useDocumentStore((state) => state.markAsSaved)
  const toggleDistractionFree = useEditorStore((state) => state.toggleDistractionFree)
  const setFindDialogOpen = useEditorStore((state) => state.setFindDialogOpen)
  const toggleTheme = useSettingsStore((state) => state.toggleTheme)
  const setTheme = useSettingsStore((state) => state.setTheme)
  const increaseZoom = useEditorStore((state) => state.increaseZoom)
  const decreaseZoom = useEditorStore((state) => state.decreaseZoom)
  const resetZoom = useEditorStore((state) => state.resetZoom)
  const recentFiles = useRecentFilesStore((state) => state.recentFiles)

  const { openFile, saveFile, saveFileAs, markdownToJson } = useFileOperations()

  // Open a recent file by path
  const openRecentFile = async (path: string) => {
    try {
      const content = await invoke<string>('read_file', { path })
      const jsonContent = markdownToJson(content)
      const fileName = path.split('/').pop() || 'Untitled'

      const id = addDocument({
        title: fileName,
        content: jsonContent,
        filePath: path,
        isDirty: false,
      })

      markAsSaved(id)
    } catch (error) {
      console.error('Error opening recent file:', error)
    }
  }

  // Command palette commands
  const commands: CommandItem[] = [
    {
      id: 'new-file',
      label: 'Nouveau fichier',
      shortcut: 'Cmd+N',
      category: 'Fichier',
      action: () => addDocument(),
    },
    {
      id: 'open-file',
      label: 'Ouvrir fichier',
      shortcut: 'Cmd+O',
      category: 'Fichier',
      action: openFile,
    },
    {
      id: 'save-file',
      label: 'Sauvegarder',
      shortcut: 'Cmd+S',
      category: 'Fichier',
      action: () => activeDocumentId && saveFile(activeDocumentId),
    },
    {
      id: 'save-file-as',
      label: 'Sauvegarder sous',
      shortcut: 'Cmd+Shift+S',
      category: 'Fichier',
      action: () => activeDocumentId && saveFileAs(activeDocumentId),
    },
    {
      id: 'find',
      label: 'Rechercher',
      shortcut: 'Cmd+F',
      category: 'Édition',
      action: () => setFindDialogOpen(true),
    },
    {
      id: 'find-replace',
      label: 'Rechercher et remplacer',
      shortcut: 'Cmd+H',
      category: 'Édition',
      action: () => {
        setFindDialogOpen(true)
        // Also show replace panel
        useEditorStore.getState().setShowReplace(true)
      },
    },
    {
      id: 'toggle-pieces-panel',
      label: 'Pieces justificatives',
      shortcut: 'Cmd+Shift+P',
      category: 'Édition',
      action: () => usePiecesStore.getState().togglePanel(),
    },
    {
      id: 'toggle-toc-panel',
      label: 'Table des matieres',
      shortcut: 'Cmd+Shift+M',
      category: 'Édition',
      action: () => useTocStore.getState().togglePanel(),
    },
    {
      id: 'toggle-distraction-free',
      label: 'Mode sans distraction',
      shortcut: 'Cmd+Shift+D',
      category: 'Vue',
      action: toggleDistractionFree,
    },
    {
      id: 'toggle-theme',
      label: 'Basculer le thème',
      shortcut: 'Cmd+T',
      category: 'Vue',
      action: toggleTheme,
    },
    {
      id: 'theme-light',
      label: 'Thème clair',
      category: 'Vue',
      action: () => setTheme('light'),
    },
    {
      id: 'theme-dark',
      label: 'Thème sombre',
      category: 'Vue',
      action: () => setTheme('dark'),
    },
    {
      id: 'theme-sepia',
      label: 'Thème sepia',
      category: 'Vue',
      action: () => setTheme('sepia'),
    },
    {
      id: 'theme-auto',
      label: 'Thème automatique',
      category: 'Vue',
      action: () => setTheme('auto'),
    },
    {
      id: 'zoom-in',
      label: 'Agrandir',
      shortcut: 'Cmd++',
      category: 'Vue',
      action: increaseZoom,
    },
    {
      id: 'zoom-out',
      label: 'Réduire',
      shortcut: 'Cmd+-',
      category: 'Vue',
      action: decreaseZoom,
    },
    {
      id: 'zoom-reset',
      label: 'Réinitialiser le zoom',
      shortcut: 'Cmd+0',
      category: 'Vue',
      action: resetZoom,
    },
  ]

  // Group commands by category
  const categories = Array.from(new Set(commands.map((cmd) => cmd.category)))

  // Listen for Cmd+P
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey

      if (cmdOrCtrl && e.key === 'p') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    if (open) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  if (!open) return null

  return (
    <div className="command-palette-overlay" onClick={() => setOpen(false)}>
      <div className="command-palette-container" onClick={(e) => e.stopPropagation()}>
        <Command label="Command Palette" className="command-palette">
          <div className="command-input-wrapper">
            <svg
              className="command-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <Command.Input
              placeholder="Rechercher une commande..."
              value={search}
              onValueChange={setSearch}
              className="command-input"
            />
          </div>

          <Command.List className="command-list">
            <Command.Empty className="command-empty">
              Aucune commande trouvée
            </Command.Empty>

            {/* Recent Files Section */}
            {recentFiles.length > 0 && (
              <Command.Group heading="Fichiers récents" className="command-group">
                {recentFiles.slice(0, 5).map((file) => (
                  <Command.Item
                    key={file.path}
                    onSelect={() => {
                      openRecentFile(file.path)
                      setOpen(false)
                    }}
                    className="command-item"
                  >
                    <div className="flex flex-col flex-1">
                      <span>{file.title}</span>
                      <span className="text-xs opacity-60 truncate">{file.path}</span>
                    </div>
                    <span className="text-xs opacity-60">
                      {new Date(file.lastOpened).toLocaleDateString('fr-FR', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {categories.map((category) => (
              <Command.Group key={category} heading={category} className="command-group">
                {commands
                  .filter((cmd) => cmd.category === category)
                  .map((cmd) => (
                    <Command.Item
                      key={cmd.id}
                      onSelect={() => {
                        cmd.action()
                        setOpen(false)
                      }}
                      className="command-item"
                    >
                      <span>{cmd.label}</span>
                      {cmd.shortcut && (
                        <span className="command-shortcut">{cmd.shortcut}</span>
                      )}
                    </Command.Item>
                  ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
