/**
 * Panneau de formatage pour la sidebar
 * Regroupe tous les outils de mise en forme du texte
 */

import { useState } from 'react'
import { useEditorStore } from '../../store/useEditorStore'
import { useSettingsStore, HIGHLIGHT_COLORS, type HighlightColor } from '../../store/useSettingsStore'
import { usePageStore } from '../../store/usePageStore'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  ListChecks,
  Indent,
  Outdent,
  Quote,
  Code,
  Minus,
  Link,
  Image,
  Table,
  ChevronDown,
  Type,
  FileText,
  ScrollText,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react'

// Section pliable
function Section({
  title,
  children,
  defaultOpen = true
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-[var(--border)]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider hover:bg-[var(--bg-hover)] transition-colors"
      >
        {title}
        <ChevronDown size={14} className={`transition-transform ${isOpen ? '' : '-rotate-90'}`} />
      </button>
      {isOpen && (
        <div className="px-3 pb-3">
          {children}
        </div>
      )}
    </div>
  )
}

// Bouton d'outil
function ToolButton({
  onClick,
  isActive,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        w-8 h-8 flex items-center justify-center rounded-md transition-all
        ${isActive
          ? 'bg-[var(--accent)] text-white'
          : 'hover:bg-[var(--bg-hover)] text-[var(--text)]'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
      `}
    >
      {children}
    </button>
  )
}

export function FormattingPanel() {
  const editor = useEditorStore((state) => state.activeEditor)
  const [showHighlightColors, setShowHighlightColors] = useState(false)

  // Page store
  const viewMode = usePageStore((state) => state.viewMode)
  const setViewMode = usePageStore((state) => state.setViewMode)
  const pageZoom = usePageStore((state) => state.pageZoom)
  const setPageZoom = usePageStore((state) => state.setPageZoom)

  // Settings
  const typewriterMode = useSettingsStore((state) => state.typewriterMode)
  const toggleTypewriterMode = useSettingsStore((state) => state.toggleTypewriterMode)

  // Editor store
  const isDistractionFree = useEditorStore((state) => state.isDistractionFree)
  const toggleDistractionFree = useEditorStore((state) => state.toggleDistractionFree)

  if (!editor) {
    return (
      <div className="p-4 text-center text-[var(--text-secondary)]">
        <p className="text-sm">Aucun document ouvert</p>
      </div>
    )
  }

  // Surlignage
  const handleHighlight = (color: HighlightColor) => {
    const colorData = HIGHLIGHT_COLORS[color]
    editor.chain().focus().toggleHighlight({ color: colorData.light }).run()
    setShowHighlightColors(false)
  }

  // Insertion lien
  const handleInsertLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL:', previousUrl || 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }

  // Insertion image
  const handleInsertImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = () => {
          editor.chain().focus().setImage({ src: reader.result as string }).run()
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Styles de texte */}
      <Section title="Texte">
        <div className="flex flex-wrap gap-1">
          <ToolButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Gras (Cmd+B)"
          >
            <Bold size={16} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italique (Cmd+I)"
          >
            <Italic size={16} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Souligné (Cmd+U)"
          >
            <Underline size={16} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Barré"
          >
            <Strikethrough size={16} />
          </ToolButton>
          <div className="relative">
            <ToolButton
              onClick={() => setShowHighlightColors(!showHighlightColors)}
              isActive={editor.isActive('highlight')}
              title="Surligner"
            >
              <Highlighter size={16} />
            </ToolButton>
            {showHighlightColors && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-[var(--bg)] border border-[var(--border)]
                rounded-lg shadow-lg z-dropdown grid grid-cols-3 gap-1">
                {(Object.keys(HIGHLIGHT_COLORS) as HighlightColor[]).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleHighlight(color)}
                    className="w-6 h-6 rounded border border-[var(--border)] hover:scale-110 transition-transform"
                    style={{ backgroundColor: HIGHLIGHT_COLORS[color].light }}
                    title={HIGHLIGHT_COLORS[color].name}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Titres */}
      <Section title="Titres">
        <div className="flex flex-wrap gap-1">
          <ToolButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Titre 1"
          >
            <span className="text-xs font-bold">H1</span>
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Titre 2"
          >
            <span className="text-xs font-bold">H2</span>
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Titre 3"
          >
            <span className="text-xs font-bold">H3</span>
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().setParagraph().run()}
            isActive={editor.isActive('paragraph')}
            title="Paragraphe"
          >
            <span className="text-xs font-bold">P</span>
          </ToolButton>
        </div>
      </Section>

      {/* Alignement */}
      <Section title="Alignement">
        <div className="flex flex-wrap gap-1">
          <ToolButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Aligner à gauche"
          >
            <AlignLeft size={16} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Centrer"
          >
            <AlignCenter size={16} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Aligner à droite"
          >
            <AlignRight size={16} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
            title="Justifier"
          >
            <AlignJustify size={16} />
          </ToolButton>
        </div>
      </Section>

      {/* Listes */}
      <Section title="Listes">
        <div className="flex flex-wrap gap-1">
          <ToolButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Liste à puces"
          >
            <List size={16} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Liste numérotée"
          >
            <ListOrdered size={16} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            isActive={editor.isActive('taskList')}
            title="Liste de tâches"
          >
            <ListChecks size={16} />
          </ToolButton>
          <div className="w-px h-6 bg-[var(--border)] mx-1" />
          <ToolButton
            onClick={() => {
              if (editor.isActive('listItem')) {
                editor.chain().focus().liftListItem('listItem').run()
              }
            }}
            title="Diminuer le retrait"
          >
            <Outdent size={16} />
          </ToolButton>
          <ToolButton
            onClick={() => {
              if (editor.isActive('listItem')) {
                editor.chain().focus().sinkListItem('listItem').run()
              }
            }}
            title="Augmenter le retrait"
          >
            <Indent size={16} />
          </ToolButton>
        </div>
      </Section>

      {/* Blocs */}
      <Section title="Blocs">
        <div className="flex flex-wrap gap-1">
          <ToolButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Citation"
          >
            <Quote size={16} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Bloc de code"
          >
            <Code size={16} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Ligne horizontale"
          >
            <Minus size={16} />
          </ToolButton>
        </div>
      </Section>

      {/* Insertion */}
      <Section title="Insertion">
        <div className="flex flex-wrap gap-1">
          <ToolButton
            onClick={handleInsertLink}
            isActive={editor.isActive('link')}
            title="Insérer un lien"
          >
            <Link size={16} />
          </ToolButton>
          <ToolButton
            onClick={handleInsertImage}
            title="Insérer une image"
          >
            <Image size={16} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            title="Insérer un tableau"
          >
            <Table size={16} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().setPageBreak().run()}
            title="Saut de page"
          >
            <FileText size={16} />
          </ToolButton>
        </div>
      </Section>

      {/* Affichage */}
      <Section title="Affichage">
        <div className="space-y-2">
          {/* Mode de vue */}
          <div className="flex items-center gap-1">
            <ToolButton
              onClick={() => setViewMode('scroll')}
              isActive={viewMode === 'scroll'}
              title="Mode défilement"
            >
              <ScrollText size={16} />
            </ToolButton>
            <ToolButton
              onClick={() => setViewMode('page')}
              isActive={viewMode === 'page'}
              title="Mode page"
            >
              <FileText size={16} />
            </ToolButton>
            <div className="w-px h-6 bg-[var(--border)] mx-1" />
            <ToolButton
              onClick={toggleTypewriterMode}
              isActive={typewriterMode}
              title="Mode machine à écrire"
            >
              <Type size={16} />
            </ToolButton>
            <ToolButton
              onClick={toggleDistractionFree}
              isActive={isDistractionFree}
              title="Mode sans distraction"
            >
              <Maximize2 size={16} />
            </ToolButton>
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-1">
            <ToolButton
              onClick={() => setPageZoom(Math.max(0.5, pageZoom - 0.1))}
              disabled={pageZoom <= 0.5}
              title="Réduire"
            >
              <ZoomOut size={16} />
            </ToolButton>
            <button
              type="button"
              onClick={() => setPageZoom(1)}
              className="px-2 py-1 min-w-[50px] text-xs text-center rounded-md
                hover:bg-[var(--bg-hover)] transition-colors"
              title="Réinitialiser à 100%"
            >
              {Math.round(pageZoom * 100)}%
            </button>
            <ToolButton
              onClick={() => setPageZoom(Math.min(2, pageZoom + 0.1))}
              disabled={pageZoom >= 2}
              title="Agrandir"
            >
              <ZoomIn size={16} />
            </ToolButton>
          </div>
        </div>
      </Section>
    </div>
  )
}
