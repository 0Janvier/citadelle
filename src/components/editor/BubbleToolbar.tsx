// Barre d'outils flottante sur selection de texte
import { BubbleMenu, type Editor } from '@tiptap/react'
import { useSettingsStore, HIGHLIGHT_COLORS } from '../../store/useSettingsStore'

interface BubbleToolbarProps {
  editor: Editor
}

export function BubbleToolbar({ editor }: BubbleToolbarProps) {
  const showBubbleToolbar = useSettingsStore((state) => state.showBubbleToolbar)
  const highlightColor = useSettingsStore((state) => state.highlightColor)

  if (!showBubbleToolbar) return null

  const colorData = HIGHLIGHT_COLORS[highlightColor]

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 150,
        placement: 'top',
        appendTo: () => document.body,
      }}
      shouldShow={({ editor: ed, state }) => {
        const { from, to } = state.selection
        // Only show on text selection (not on empty or node selection)
        if (from === to) return false
        // Don't show for code blocks
        if (ed.isActive('codeBlock')) return false
        // Don't show for images
        if (ed.isActive('image') || ed.isActive('resizableImage')) return false
        return true
      }}
    >
      <div className="flex items-center gap-0.5 px-1.5 py-1 rounded-lg shadow-lg border border-[var(--border)] bg-[var(--bg)] backdrop-blur-sm">
        <BubbleButton
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Gras (Cmd+B)"
        >
          <BoldIcon />
        </BubbleButton>

        <BubbleButton
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italique (Cmd+I)"
        >
          <ItalicIcon />
        </BubbleButton>

        <BubbleButton
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Souligner (Cmd+U)"
        >
          <UnderlineIcon />
        </BubbleButton>

        <div className="w-px h-5 bg-[var(--border)] mx-0.5" />

        <BubbleButton
          active={editor.isActive('highlight')}
          onClick={() => editor.chain().focus().toggleHighlight({ color: colorData.light }).run()}
          title="Surligner"
        >
          <HighlightIcon color={colorData.light} />
        </BubbleButton>

        <BubbleButton
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Barrer"
        >
          <StrikeIcon />
        </BubbleButton>

        <div className="w-px h-5 bg-[var(--border)] mx-0.5" />

        <BubbleButton
          active={editor.isActive('link')}
          onClick={() => {
            if (editor.isActive('link')) {
              editor.chain().focus().unsetLink().run()
            } else {
              const url = window.prompt('URL :', 'https://')
              if (url) {
                editor.chain().focus().setLink({ href: url }).run()
              }
            }
          }}
          title="Lien"
        >
          <LinkIcon />
        </BubbleButton>
      </div>
    </BubbleMenu>
  )
}

function BubbleButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
        active
          ? 'bg-[var(--accent)] text-white'
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]'
      }`}
    >
      {children}
    </button>
  )
}

// Compact SVG icons
function BoldIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  )
}

function ItalicIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <line x1="19" y1="4" x2="10" y2="4" />
      <line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  )
}

function UnderlineIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
      <line x1="4" y1="21" x2="20" y2="21" />
    </svg>
  )
}

function HighlightIcon({ color }: { color: string }) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      <rect x="3" y="19" width="18" height="3" rx="1" fill={color} stroke="none" />
    </svg>
  )
}

function StrikeIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M17.3 4.9c-1.6-1.1-3.6-1.5-5.5-1.1C9.9 4.2 8.4 5.4 7.6 7c-.4.8-.6 1.8-.5 2.7" />
      <path d="M4 12h16" />
      <path d="M7 16.5c.4.8 1 1.5 1.8 2 1.6 1.1 3.6 1.5 5.5 1.1 1.9-.4 3.4-1.6 4.2-3.2" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}
