import { useState, useEffect } from 'react'
import { Editor } from '@tiptap/react'
import { useEditorStore } from '../store/useEditorStore'
import { useSettingsStore, HIGHLIGHT_COLORS, HighlightColor } from '../store/useSettingsStore'
import { useFileOperations } from '../hooks/useFileOperations'
import { usePrint } from '../hooks/usePrint'
import { useDocumentStore } from '../store/useDocumentStore'
import { usePanelStore } from '../store/usePanelStore'
import { usePageStore } from '../store/usePageStore'
import { UnifiedExportDialog } from './UnifiedExportDialog'
import { StylePicker } from './styles'
import { TableGridPicker, TableIcon } from './table'

interface ToolbarProps {
  editor?: Editor | null
}

export function Toolbar({ editor }: ToolbarProps) {
  const showToolbar = useEditorStore((state) => state.showToolbar)
  const isDistractionFree = useEditorStore((state) => state.isDistractionFree)
  const toggleDistractionFree = useEditorStore((state) => state.toggleDistractionFree)
  const setSettingsOpen = useEditorStore((state) => state.setSettingsOpen)
  const theme = useSettingsStore((state) => state.theme)
  const toggleTheme = useSettingsStore((state) => state.toggleTheme)
  const typewriterMode = useSettingsStore((state) => state.typewriterMode)
  const toggleTypewriterMode = useSettingsStore((state) => state.toggleTypewriterMode)
  const typewriterHighlightStyle = useSettingsStore((state) => state.typewriterHighlightStyle)
  const setTypewriterHighlightStyle = useSettingsStore((state) => state.setTypewriterHighlightStyle)
  const typewriterScrollPosition = useSettingsStore((state) => state.typewriterScrollPosition)
  const setTypewriterScrollPosition = useSettingsStore((state) => state.setTypewriterScrollPosition)
  const typewriterMarkLine = useSettingsStore((state) => state.typewriterMarkLine)
  const setTypewriterMarkLine = useSettingsStore((state) => state.setTypewriterMarkLine)
  const highlightColor = useSettingsStore((state) => state.highlightColor)
  const setHighlightColor = useSettingsStore((state) => state.setHighlightColor)
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId)
  const viewMode = usePageStore((state) => state.viewMode)
  const toggleViewMode = usePageStore((state) => state.toggleViewMode)
  const { openFile, saveFile, saveFileAs } = useFileOperations()
  const { printDocument, isPrinting } = usePrint()

  const [isVisible, setIsVisible] = useState(true)
  const [isPinned, setIsPinned] = useState(true)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showTypewriterMenu, setShowTypewriterMenu] = useState(false)
  const [showHighlightMenu, setShowHighlightMenu] = useState(false)
  const [showTableMenu, setShowTableMenu] = useState(false)

  useEffect(() => {
    if (!isDistractionFree || isPinned) {
      setIsVisible(true)
      return
    }

    let timeout: ReturnType<typeof setTimeout>

    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY < 100) {
        setIsVisible(true)
        clearTimeout(timeout)
        timeout = setTimeout(() => setIsVisible(false), 3000)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(timeout)
    }
  }, [isDistractionFree, isPinned])

  useEffect(() => {
    const handleClickOutside = () => {
      if (showExportMenu) setShowExportMenu(false)
      if (showTypewriterMenu) setShowTypewriterMenu(false)
      if (showHighlightMenu) setShowHighlightMenu(false)
      if (showTableMenu) setShowTableMenu(false)
    }

    if (showExportMenu || showTypewriterMenu || showHighlightMenu || showTableMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showExportMenu, showTypewriterMenu, showHighlightMenu, showTableMenu])

  // Handle Cmd+P keyboard shortcut for printing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault()
        if (activeDocumentId && !isPrinting) {
          printDocument(activeDocumentId)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeDocumentId, isPrinting, printDocument])

  if (!showToolbar) return null

  const ToolbarButton = ({
    onClick,
    onContextMenu,
    isActive,
    disabled,
    title,
    children,
    className = '',
  }: {
    onClick: (e: React.MouseEvent) => void
    onContextMenu?: (e: React.MouseEvent) => void
    isActive?: boolean
    disabled?: boolean
    title: string
    children: React.ReactNode
    className?: string
  }) => (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
      disabled={disabled}
      title={title}
      className={`
        w-9 h-9 flex items-center justify-center
        rounded-hig-md
        transition-all duration-fast
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1
        ${isActive
          ? 'bg-[var(--accent)] text-white'
          : 'hover:bg-[var(--editor-bg)] text-[var(--text)]'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
    </button>
  )

  const Separator = () => (
    <div className="w-px h-6 bg-[var(--border)] mx-2" />
  )

  return (
    <div
      className={`
        min-h-[44px] border-b border-[var(--border)] flex items-center justify-between px-3 py-1 bg-[var(--bg)]
        toolbar transition-opacity duration-slow
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
    >
      <div className="flex items-center gap-0.5">
        {/* File operations */}
        <ToolbarButton
          onClick={() => openFile()}
          title="Ouvrir un fichier (Cmd+O)"
        >
          <FolderOpenIcon />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => activeDocumentId && saveFile(activeDocumentId)}
          disabled={!activeDocumentId}
          title="Sauvegarder (Cmd+S)"
        >
          <SaveIcon />
        </ToolbarButton>

        {/* Export menu */}
        <div className="relative">
          <ToolbarButton
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={!activeDocumentId}
            title="Exporter"
          >
            <ExportIcon />
          </ToolbarButton>

          {showExportMenu && activeDocumentId && (
            <div className="absolute top-full left-0 mt-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg shadow-lg py-1 z-50 min-w-[180px]">
              <button
                onClick={() => {
                  printDocument(activeDocumentId)
                  setShowExportMenu(false)
                }}
                disabled={isPrinting}
                className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--editor-bg)] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <PrintIcon />
                Imprimer...
                <span className="ml-auto text-xs text-gray-400">⌘P</span>
              </button>
              <div className="h-px bg-[var(--border)] my-1" />
              <button
                onClick={() => {
                  setShowExportDialog(true)
                  setShowExportMenu(false)
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--editor-bg)] transition-colors flex items-center gap-2"
              >
                <ExportIcon />
                Exporter...
              </button>
              <div className="h-px bg-[var(--border)] my-1" />
              <button
                onClick={() => {
                  saveFileAs(activeDocumentId)
                  setShowExportMenu(false)
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--editor-bg)] transition-colors flex items-center gap-2"
              >
                <DocumentIcon />
                Sauvegarder sous...
              </button>
            </div>
          )}
        </div>

        <Separator />

        {/* Style picker - only show when editor is available */}
        {editor && (
          <div className="mr-2">
            <StylePicker editor={editor} />
          </div>
        )}

        {/* Text formatting - only show when editor is available */}
        {editor && (
          <>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Gras (Cmd+B)"
            >
              <BoldIcon />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italique (Cmd+I)"
            >
              <ItalicIcon />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              title="Souligné (Cmd+U)"
            >
              <UnderlineIcon />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              title="Barré (Cmd+Shift+X)"
            >
              <StrikeIcon />
            </ToolbarButton>

            {/* Highlight with color picker */}
            <div className="relative">
              <ToolbarButton
                onClick={(e) => {
                  e.stopPropagation()
                  // Get current color value
                  const isDark = document.documentElement.classList.contains('dark')
                  const colorValue = isDark
                    ? HIGHLIGHT_COLORS[highlightColor].dark
                    : HIGHLIGHT_COLORS[highlightColor].light
                  editor.chain().focus().toggleHighlight({ color: colorValue }).run()
                }}
                onContextMenu={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowHighlightMenu(!showHighlightMenu)
                }}
                isActive={editor.isActive('highlight')}
                title="Surligner (Cmd+Shift+H) - Clic droit pour changer la couleur"
              >
                <HighlightIconColored color={highlightColor} />
              </ToolbarButton>

              {showHighlightMenu && (
                <div
                  className="absolute top-full left-0 mt-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg shadow-lg py-2 z-50 min-w-[140px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Couleur
                  </div>
                  <div className="grid grid-cols-3 gap-1 px-2">
                    {(Object.keys(HIGHLIGHT_COLORS) as HighlightColor[]).map((color) => {
                      const isDark = document.documentElement.classList.contains('dark')
                      const colorValue = isDark
                        ? HIGHLIGHT_COLORS[color].dark
                        : HIGHLIGHT_COLORS[color].light
                      const isSelected = highlightColor === color

                      return (
                        <button
                          key={color}
                          onClick={() => {
                            setHighlightColor(color)
                            // Apply highlight with new color if text is selected
                            if (!editor.state.selection.empty) {
                              editor.chain().focus().toggleHighlight({ color: colorValue }).run()
                            }
                            setShowHighlightMenu(false)
                          }}
                          className={`
                            w-8 h-8 rounded-md transition-all
                            ${isSelected ? 'ring-2 ring-[var(--accent)] ring-offset-1' : 'hover:scale-110'}
                          `}
                          style={{ backgroundColor: HIGHLIGHT_COLORS[color].light }}
                          title={HIGHLIGHT_COLORS[color].name}
                        />
                      )
                    })}
                  </div>
                  <div className="h-px bg-[var(--border)] my-2" />
                  <button
                    onClick={() => {
                      editor.chain().focus().unsetHighlight().run()
                      setShowHighlightMenu(false)
                    }}
                    className="w-full px-3 py-1.5 text-left text-sm hover:bg-[var(--editor-bg)] transition-colors text-[var(--text)]"
                  >
                    Supprimer le surlignage
                  </button>
                </div>
              )}
            </div>

            <Separator />

            {/* Headings */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
              title="Titre 1 (Cmd+1)"
            >
              <H1Icon />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
              title="Titre 2 (Cmd+2)"
            >
              <H2Icon />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
              title="Titre 3 (Cmd+3)"
            >
              <H3Icon />
            </ToolbarButton>

            <Separator />

            {/* Text Alignment */}
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })}
              title="Aligner à gauche (⌘⇧L)"
            >
              <AlignLeftIcon />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={editor.isActive({ textAlign: 'center' })}
              title="Centrer (⌘⇧E)"
            >
              <AlignCenterIcon />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })}
              title="Aligner à droite (⌘⇧R)"
            >
              <AlignRightIcon />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              isActive={editor.isActive({ textAlign: 'justify' })}
              title="Justifier (⌘⇧J)"
            >
              <AlignJustifyIcon />
            </ToolbarButton>

            <Separator />

            {/* Lists */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Liste à puces (Cmd+Shift+U)"
            >
              <BulletListIcon />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="Liste numérotée (Cmd+Shift+O)"
            >
              <OrderedListIcon />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              isActive={editor.isActive('taskList')}
              title="Liste de tâches"
            >
              <TaskListIcon />
            </ToolbarButton>

            <Separator />

            {/* Block formatting */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="Citation (Cmd+Shift+Q)"
            >
              <QuoteIcon />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive('code')}
              title="Code inline (Cmd+E)"
            >
              <CodeIcon />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={editor.isActive('codeBlock')}
              title="Bloc de code (Cmd+Shift+C)"
            >
              <CodeBlockIcon />
            </ToolbarButton>

            <Separator />

            {/* Actions */}
            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Ligne horizontale (Cmd+Shift+-)"
            >
              <HorizontalRuleIcon />
            </ToolbarButton>

            {/* Table insertion */}
            <div className="relative">
              <ToolbarButton
                onClick={(e) => {
                  e.stopPropagation()
                  setShowTableMenu(!showTableMenu)
                }}
                isActive={editor.isActive('table')}
                title="Insérer un tableau"
              >
                <TableIcon />
              </ToolbarButton>
              <TableGridPicker
                editor={editor}
                isOpen={showTableMenu}
                onClose={() => setShowTableMenu(false)}
              />
            </div>

            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Annuler (Cmd+Z)"
            >
              <UndoIcon />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Rétablir (Cmd+Shift+Z)"
            >
              <RedoIcon />
            </ToolbarButton>

            <Separator />

            {/* Recherche globale - reste dans la toolbar car c'est une modale */}
            <ToolbarButton
              onClick={() => usePanelStore.getState().togglePanel('search')}
              isActive={usePanelStore.getState().activePanel === 'search'}
              title="Recherche globale (Cmd+Shift+F)"
            >
              <GlobalSearchIcon />
            </ToolbarButton>
          </>
        )}

        {/* Theme toggle */}
        <ToolbarButton
          onClick={toggleTheme}
          title="Changer le thème"
        >
          {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
        </ToolbarButton>

        {/* Typewriter mode toggle with dropdown */}
        <div className="relative">
          <ToolbarButton
            onClick={(e) => {
              e.stopPropagation()
              if (e.shiftKey || e.altKey) {
                // Shift/Alt+click opens menu
                setShowTypewriterMenu(!showTypewriterMenu)
              } else {
                toggleTypewriterMode()
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault()
              setShowTypewriterMenu(!showTypewriterMenu)
            }}
            isActive={typewriterMode}
            title="Mode machine à écrire (Cmd+Shift+T) - Clic droit pour options"
          >
            <TypewriterIcon />
          </ToolbarButton>

          {showTypewriterMenu && (
            <div
              className="absolute top-full left-0 mt-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg shadow-lg py-1 z-50 min-w-[200px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Mode Focus
              </div>
              <button
                onClick={() => setTypewriterHighlightStyle('paragraph')}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--editor-bg)] transition-colors flex items-center justify-between ${
                  typewriterHighlightStyle === 'paragraph' ? 'text-[var(--accent)]' : ''
                }`}
              >
                <span>Paragraphe</span>
                {typewriterHighlightStyle === 'paragraph' && <CheckIcon />}
              </button>
              <button
                onClick={() => setTypewriterHighlightStyle('sentence')}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--editor-bg)] transition-colors flex items-center justify-between ${
                  typewriterHighlightStyle === 'sentence' ? 'text-[var(--accent)]' : ''
                }`}
              >
                <span>Phrase</span>
                {typewriterHighlightStyle === 'sentence' && <CheckIcon />}
              </button>
              <button
                onClick={() => setTypewriterHighlightStyle('line')}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--editor-bg)] transition-colors flex items-center justify-between ${
                  typewriterHighlightStyle === 'line' ? 'text-[var(--accent)]' : ''
                }`}
              >
                <span>Ligne</span>
                {typewriterHighlightStyle === 'line' && <CheckIcon />}
              </button>

              <div className="h-px bg-[var(--border)] my-1" />

              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Position du défilement
              </div>
              <button
                onClick={() => setTypewriterScrollPosition('none')}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--editor-bg)] transition-colors flex items-center justify-between ${
                  typewriterScrollPosition === 'none' ? 'text-[var(--accent)]' : ''
                }`}
              >
                <span>Sur place</span>
                {typewriterScrollPosition === 'none' && <CheckIcon />}
              </button>
              <button
                onClick={() => setTypewriterScrollPosition('top')}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--editor-bg)] transition-colors flex items-center justify-between ${
                  typewriterScrollPosition === 'top' ? 'text-[var(--accent)]' : ''
                }`}
              >
                <span>Haut</span>
                {typewriterScrollPosition === 'top' && <CheckIcon />}
              </button>
              <button
                onClick={() => setTypewriterScrollPosition('middle')}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--editor-bg)] transition-colors flex items-center justify-between ${
                  typewriterScrollPosition === 'middle' ? 'text-[var(--accent)]' : ''
                }`}
              >
                <span>Milieu</span>
                {typewriterScrollPosition === 'middle' && <CheckIcon />}
              </button>
              <button
                onClick={() => setTypewriterScrollPosition('bottom')}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--editor-bg)] transition-colors flex items-center justify-between ${
                  typewriterScrollPosition === 'bottom' ? 'text-[var(--accent)]' : ''
                }`}
              >
                <span>Bas</span>
                {typewriterScrollPosition === 'bottom' && <CheckIcon />}
              </button>
              <button
                onClick={() => setTypewriterScrollPosition('variable')}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--editor-bg)] transition-colors flex items-center justify-between ${
                  typewriterScrollPosition === 'variable' ? 'text-[var(--accent)]' : ''
                }`}
              >
                <span>Variable</span>
                {typewriterScrollPosition === 'variable' && <CheckIcon />}
              </button>

              <div className="h-px bg-[var(--border)] my-1" />

              <button
                onClick={() => setTypewriterMarkLine(!typewriterMarkLine)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--editor-bg)] transition-colors flex items-center justify-between"
              >
                <span>Marquer la ligne</span>
                {typewriterMarkLine && <CheckIcon />}
              </button>

              <div className="h-px bg-[var(--border)] my-1" />

              <button
                onClick={() => {
                  toggleTypewriterMode()
                  setShowTypewriterMenu(false)
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--editor-bg)] transition-colors"
              >
                {typewriterMode ? 'Désactiver' : 'Activer'} le mode focus
              </button>
            </div>
          )}
        </div>

        {/* Distraction-free mode toggle */}
        <ToolbarButton
          onClick={toggleDistractionFree}
          isActive={isDistractionFree}
          title="Mode sans distraction (Cmd+Shift+D)"
        >
          <ExpandIcon />
        </ToolbarButton>

        {/* Page view mode toggle */}
        <ToolbarButton
          onClick={toggleViewMode}
          isActive={viewMode === 'page'}
          title={`Mode ${viewMode === 'scroll' ? 'page' : 'defilement'} (Cmd+Shift+L)`}
        >
          <PageViewIcon />
        </ToolbarButton>

        <Separator />

        {/* Settings button */}
        <ToolbarButton
          onClick={() => setSettingsOpen(true)}
          title="Paramètres (Cmd+,)"
        >
          <SettingsIcon />
        </ToolbarButton>
      </div>

      <div className="flex items-center gap-2">
        {/* Pin toolbar button (in distraction-free) */}
        {isDistractionFree && (
          <ToolbarButton
            onClick={() => setIsPinned(!isPinned)}
            isActive={isPinned}
            title={isPinned ? 'Détacher la toolbar' : 'Épingler la toolbar'}
          >
            <PinIcon filled={isPinned} />
          </ToolbarButton>
        )}
      </div>

      {/* Export Dialog */}
      {activeDocumentId && (
        <UnifiedExportDialog
          open={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          documentId={activeDocumentId}
        />
      )}
    </div>
  )
}

// Icon components (Apple SF Symbols style - thin strokes)
const FolderOpenIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
)

const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
)

const ExportIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const DocumentIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const PrintIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
)

const BoldIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6V4zm0 8h9a4 4 0 014 4 4 4 0 01-4 4H6v-8z" />
  </svg>
)

const ItalicIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="4" x2="10" y2="4" />
    <line x1="14" y1="20" x2="5" y2="20" />
    <line x1="15" y1="4" x2="9" y2="20" />
  </svg>
)

const UnderlineIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3" />
    <line x1="4" y1="21" x2="20" y2="21" />
  </svg>
)

const StrikeIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7 0-5.3.7-5.3 3.6 0 1.5 1.8 3.3 7.2 3.4" />
    <path d="M8.5 15c0 2.6 2.6 3.1 5.4 3.1 1.9 0 5.7-.5 5.7-3.4 0-1.5-.5-2.4-1.6-3.1" />
    <line x1="2" y1="12" x2="22" y2="12" />
  </svg>
)

const HighlightIconColored = ({ color }: { color: HighlightColor }) => {
  const colorValue = HIGHLIGHT_COLORS[color].light
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" stroke={colorValue} strokeWidth="3" />
      <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" fill={colorValue} fillOpacity="0.6" />
    </svg>
  )
}

const H1Icon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <text x="2" y="18" fontSize="14" fontWeight="bold" fontFamily="system-ui">H1</text>
  </svg>
)

const H2Icon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <text x="2" y="18" fontSize="14" fontWeight="bold" fontFamily="system-ui">H2</text>
  </svg>
)

const H3Icon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <text x="2" y="18" fontSize="14" fontWeight="bold" fontFamily="system-ui">H3</text>
  </svg>
)

const BulletListIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="9" y1="6" x2="20" y2="6" />
    <line x1="9" y1="12" x2="20" y2="12" />
    <line x1="9" y1="18" x2="20" y2="18" />
    <circle cx="5" cy="6" r="1.5" fill="currentColor" />
    <circle cx="5" cy="12" r="1.5" fill="currentColor" />
    <circle cx="5" cy="18" r="1.5" fill="currentColor" />
  </svg>
)

const OrderedListIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="10" y1="6" x2="21" y2="6" />
    <line x1="10" y1="12" x2="21" y2="12" />
    <line x1="10" y1="18" x2="21" y2="18" />
    <text x="3" y="8" fontSize="8" fill="currentColor" stroke="none" fontFamily="system-ui">1</text>
    <text x="3" y="14" fontSize="8" fill="currentColor" stroke="none" fontFamily="system-ui">2</text>
    <text x="3" y="20" fontSize="8" fill="currentColor" stroke="none" fontFamily="system-ui">3</text>
  </svg>
)

const TaskListIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="5" width="4" height="4" rx="1" />
    <line x1="10" y1="7" x2="21" y2="7" />
    <rect x="3" y="15" width="4" height="4" rx="1" />
    <path d="M4 17l1.5 1.5L7 16" strokeWidth="1.5" />
    <line x1="10" y1="17" x2="21" y2="17" />
  </svg>
)

const QuoteIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
  </svg>
)

const CodeIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
)

const CodeBlockIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <polyline points="14 9 17 12 14 15" />
    <polyline points="10 9 7 12 10 15" />
  </svg>
)

const HorizontalRuleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="12" x2="21" y2="12" />
  </svg>
)

const UndoIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
  </svg>
)

const RedoIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 7v6h-6" />
    <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3L21 13" />
  </svg>
)

const MoonIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
)

const SunIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const ExpandIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>
)

const PinIcon = ({ filled }: { filled: boolean }) => (
  <svg className="w-4 h-4" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
)

const TypewriterIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    {/* Typewriter body */}
    <rect x="3" y="8" width="18" height="10" rx="2" />
    {/* Paper coming out */}
    <path d="M7 8V5a1 1 0 011-1h8a1 1 0 011 1v3" />
    {/* Keys row */}
    <line x1="7" y1="12" x2="17" y2="12" />
    <line x1="7" y1="15" x2="17" y2="15" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const SettingsIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    {/* Anneau central - Presidium */}
    <circle cx="12" cy="12" r="3" />
    {/* Les 5 Wards - bras de la Citadelle */}
    {/* Bras supérieur (0°) */}
    <line x1="12" y1="9" x2="12" y2="2" strokeLinecap="round" />
    {/* Bras supérieur droit (72°) */}
    <line x1="14.85" y1="10.07" x2="21.51" y2="5.23" strokeLinecap="round" />
    {/* Bras inférieur droit (144°) */}
    <line x1="13.76" y1="14.35" x2="17.94" y2="20.11" strokeLinecap="round" />
    {/* Bras inférieur gauche (216°) */}
    <line x1="10.24" y1="14.35" x2="6.06" y2="20.11" strokeLinecap="round" />
    {/* Bras supérieur gauche (288°) */}
    <line x1="9.15" y1="10.07" x2="2.49" y2="5.23" strokeLinecap="round" />
  </svg>
)

const GlobalSearchIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
    <path d="M11 8v6" />
    <path d="M8 11h6" />
  </svg>
)

const PageViewIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    {/* Document pages stacked */}
    <rect x="4" y="2" width="12" height="16" rx="1" />
    <rect x="8" y="6" width="12" height="16" rx="1" fill="var(--bg)" />
    <line x1="11" y1="10" x2="17" y2="10" />
    <line x1="11" y1="14" x2="17" y2="14" />
    <line x1="11" y1="18" x2="15" y2="18" />
  </svg>
)

// Text Alignment Icons
const AlignLeftIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="15" y2="12" />
    <line x1="3" y1="18" x2="18" y2="18" />
  </svg>
)

const AlignCenterIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="6" y1="12" x2="18" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
)

const AlignRightIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="9" y1="12" x2="21" y2="12" />
    <line x1="6" y1="18" x2="21" y2="18" />
  </svg>
)

const AlignJustifyIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)
