// Menu contextuel pour les tableaux (clic-droit)
import { useState, useEffect, useCallback, useRef } from 'react'
import type { Editor } from '@tiptap/react'
import {
  AddRowAboveIcon,
  AddRowBelowIcon,
  AddColumnLeftIcon,
  AddColumnRightIcon,
  DeleteRowIcon,
  DeleteColumnIcon,
  DeleteTableIcon,
  MergeCellsIcon,
  SplitCellIcon,
  CellColorIcon,
  HeaderRowIcon,
} from './TableIcons'

interface TableContextMenuProps {
  editor: Editor | null
}

interface Position {
  x: number
  y: number
}

interface MenuItemProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  shortcut?: string
}

function MenuItem({ icon, label, onClick, disabled, danger, shortcut }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex items-center gap-3 px-3 py-2 text-left text-sm
        rounded-hig-sm transition-colors duration-fast
        focus:outline-none focus-visible:bg-[var(--bg-hover)]
        ${disabled
          ? 'opacity-40 cursor-not-allowed'
          : danger
            ? 'hover:bg-red-500/10 hover:text-red-500'
            : 'hover:bg-[var(--bg-hover)]'
        }
      `}
    >
      <span className="w-4 h-4 flex-shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      {shortcut && (
        <span className="text-xs text-[var(--text-muted)] ml-2">{shortcut}</span>
      )}
    </button>
  )
}

function MenuSeparator() {
  return <div className="h-px bg-[var(--border)] my-1" />
}

interface SubMenuProps {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}

function SubMenu({ icon, label, children }: SubMenuProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<'right' | 'left'>('right')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      if (rect.right + 200 > window.innerWidth) {
        setPosition('left')
      } else {
        setPosition('right')
      }
    }
  }, [open])

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="
          w-full flex items-center gap-3 px-3 py-2 text-left text-sm
          rounded-hig-sm transition-colors duration-fast
          hover:bg-[var(--bg-hover)]
          focus:outline-none focus-visible:bg-[var(--bg-hover)]
        "
      >
        <span className="w-4 h-4 flex-shrink-0">{icon}</span>
        <span className="flex-1">{label}</span>
        <svg className="w-3 h-3 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {open && (
        <div
          className={`
            absolute top-0 min-w-[180px] p-1
            bg-[var(--bg)] border border-[var(--border)] rounded-hig-lg shadow-hig-popover
            animate-scaleIn z-50
            ${position === 'right' ? 'left-full ml-1' : 'right-full mr-1'}
          `}
        >
          {children}
        </div>
      )}
    </div>
  )
}

export function TableContextMenu({ editor }: TableContextMenuProps) {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const menuRef = useRef<HTMLDivElement>(null)

  const handleContextMenu = useCallback((e: MouseEvent) => {
    if (!editor) return

    // Check if right-click is inside a table
    const target = e.target as HTMLElement
    const cell = target.closest('td, th')
    const table = target.closest('table')

    if (cell && table && editor.isActive('table')) {
      e.preventDefault()

      // Calculate position
      let x = e.clientX
      let y = e.clientY

      // Adjust if menu would go off screen
      const menuWidth = 220
      const menuHeight = 350 // Approximate
      const padding = 8

      if (x + menuWidth > window.innerWidth - padding) {
        x = window.innerWidth - menuWidth - padding
      }
      if (y + menuHeight > window.innerHeight - padding) {
        y = window.innerHeight - menuHeight - padding
      }

      setPosition({ x, y })
      setVisible(true)
    }
  }, [editor])

  const closeMenu = useCallback(() => {
    setVisible(false)
  }, [])

  // Listen for context menu events
  useEffect(() => {
    document.addEventListener('contextmenu', handleContextMenu)
    return () => document.removeEventListener('contextmenu', handleContextMenu)
  }, [handleContextMenu])

  // Close on click outside or escape
  useEffect(() => {
    if (!visible) return

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu()
      }
    }

    const handleScroll = () => closeMenu()

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    document.addEventListener('scroll', handleScroll, true)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('scroll', handleScroll, true)
    }
  }, [visible, closeMenu])

  if (!editor || !visible) return null

  const runCommand = (command: () => boolean) => {
    command()
    closeMenu()
  }

  return (
    <div
      ref={menuRef}
      className="fixed min-w-[200px] p-1 bg-[var(--bg)] border border-[var(--border)] rounded-hig-lg shadow-hig-popover z-[200] animate-scaleIn"
      style={{ left: position.x, top: position.y }}
    >
      {/* Insérer */}
      <SubMenu
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }
        label="Insérer"
      >
        <MenuItem
          icon={<AddRowAboveIcon />}
          label="Ligne au-dessus"
          onClick={() => runCommand(() => editor.chain().focus().addRowBefore().run())}
          disabled={!editor.can().addRowBefore()}
        />
        <MenuItem
          icon={<AddRowBelowIcon />}
          label="Ligne en dessous"
          onClick={() => runCommand(() => editor.chain().focus().addRowAfter().run())}
          disabled={!editor.can().addRowAfter()}
        />
        <MenuSeparator />
        <MenuItem
          icon={<AddColumnLeftIcon />}
          label="Colonne à gauche"
          onClick={() => runCommand(() => editor.chain().focus().addColumnBefore().run())}
          disabled={!editor.can().addColumnBefore()}
        />
        <MenuItem
          icon={<AddColumnRightIcon />}
          label="Colonne à droite"
          onClick={() => runCommand(() => editor.chain().focus().addColumnAfter().run())}
          disabled={!editor.can().addColumnAfter()}
        />
      </SubMenu>

      {/* Supprimer */}
      <SubMenu
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        }
        label="Supprimer"
      >
        <MenuItem
          icon={<DeleteRowIcon />}
          label="Ligne"
          onClick={() => runCommand(() => editor.chain().focus().deleteRow().run())}
          disabled={!editor.can().deleteRow()}
          danger
        />
        <MenuItem
          icon={<DeleteColumnIcon />}
          label="Colonne"
          onClick={() => runCommand(() => editor.chain().focus().deleteColumn().run())}
          disabled={!editor.can().deleteColumn()}
          danger
        />
        <MenuSeparator />
        <MenuItem
          icon={<DeleteTableIcon />}
          label="Tableau"
          onClick={() => runCommand(() => editor.chain().focus().deleteTable().run())}
          disabled={!editor.can().deleteTable()}
          danger
        />
      </SubMenu>

      <MenuSeparator />

      {/* Fusion */}
      <MenuItem
        icon={<MergeCellsIcon />}
        label="Fusionner les cellules"
        onClick={() => runCommand(() => editor.chain().focus().mergeCells().run())}
        disabled={!editor.can().mergeCells()}
      />
      <MenuItem
        icon={<SplitCellIcon />}
        label="Diviser la cellule"
        onClick={() => runCommand(() => editor.chain().focus().splitCell().run())}
        disabled={!editor.can().splitCell()}
      />

      <MenuSeparator />

      {/* En-tête */}
      <MenuItem
        icon={<HeaderRowIcon />}
        label="Ligne d'en-tête"
        onClick={() => runCommand(() => editor.chain().focus().toggleHeaderRow().run())}
        disabled={!editor.can().toggleHeaderRow()}
      />

      <MenuSeparator />

      {/* Couleur - simplified for context menu */}
      <MenuItem
        icon={<CellColorIcon />}
        label="Couleur de fond..."
        onClick={() => {
          // Could open a modal or use the floating toolbar color picker
          closeMenu()
        }}
      />
    </div>
  )
}
