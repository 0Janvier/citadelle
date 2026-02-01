// Barre d'outils flottante pour la gestion des tableaux
import { useState, useEffect, useRef } from 'react'
import type { Editor } from '@tiptap/react'
import { useTableState } from '../../hooks/useTableState'
import { TableCellColorPicker } from './TableCellColorPicker'
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

interface TableFloatingToolbarProps {
  editor: Editor | null
}

interface ToolbarButtonProps {
  onClick: () => void
  disabled?: boolean
  title: string
  children: React.ReactNode
  danger?: boolean
}

function ToolbarButton({ onClick, disabled, title, children, danger }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        w-8 h-8 flex items-center justify-center
        rounded-hig-md transition-colors duration-fast
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
        ${disabled
          ? 'opacity-40 cursor-not-allowed'
          : danger
            ? 'hover:bg-red-500/20 hover:text-red-500'
            : 'hover:bg-[var(--bg-hover)]'
        }
      `}
    >
      {children}
    </button>
  )
}

function Separator() {
  return <div className="w-px h-5 bg-[var(--border)] mx-1" />
}

export function TableFloatingToolbar({ editor }: TableFloatingToolbarProps) {
  const tableState = useTableState(editor)
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [showColorPicker, setShowColorPicker] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Show/hide with delay
  useEffect(() => {
    if (tableState.isInTable && tableState.tableRect) {
      // Clear hide timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = null
      }

      // Show with delay
      showTimeoutRef.current = setTimeout(() => {
        setVisible(true)
      }, 150)
    } else {
      // Clear show timeout
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current)
        showTimeoutRef.current = null
      }

      // Hide with delay
      hideTimeoutRef.current = setTimeout(() => {
        setVisible(false)
        setShowColorPicker(false)
      }, 100)
    }

    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current)
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
    }
  }, [tableState.isInTable, tableState.tableRect])

  // Update position
  useEffect(() => {
    if (!visible || !tableState.tableRect || !toolbarRef.current) return

    const toolbar = toolbarRef.current
    const toolbarRect = toolbar.getBoundingClientRect()
    const tableRect = tableState.tableRect

    // Position above the table, centered
    let top = tableRect.top - toolbarRect.height - 8
    let left = tableRect.left + (tableRect.width - toolbarRect.width) / 2

    // Keep within viewport
    const padding = 8
    if (top < padding) {
      // Position below table if no room above
      top = tableRect.bottom + 8
    }
    if (left < padding) left = padding
    if (left + toolbarRect.width > window.innerWidth - padding) {
      left = window.innerWidth - toolbarRect.width - padding
    }

    setPosition({ top, left })
  }, [visible, tableState.tableRect])

  if (!editor || !visible) return null

  return (
    <div
      ref={toolbarRef}
      className="table-floating-toolbar fixed flex items-center gap-0.5 p-1 bg-[var(--bg)] border border-[var(--border)] rounded-hig-lg shadow-hig-popover animate-slideUp z-floating"
      style={{ top: position.top, left: position.left }}
    >
      {/* Lignes */}
      <ToolbarButton
        onClick={() => editor.chain().focus().addRowBefore().run()}
        disabled={!tableState.canAddRowBefore}
        title="Ajouter une ligne au-dessus"
      >
        <AddRowAboveIcon />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().addRowAfter().run()}
        disabled={!tableState.canAddRowAfter}
        title="Ajouter une ligne en dessous"
      >
        <AddRowBelowIcon />
      </ToolbarButton>

      <Separator />

      {/* Colonnes */}
      <ToolbarButton
        onClick={() => editor.chain().focus().addColumnBefore().run()}
        disabled={!tableState.canAddColumnBefore}
        title="Ajouter une colonne à gauche"
      >
        <AddColumnLeftIcon />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().addColumnAfter().run()}
        disabled={!tableState.canAddColumnAfter}
        title="Ajouter une colonne à droite"
      >
        <AddColumnRightIcon />
      </ToolbarButton>

      <Separator />

      {/* Supprimer */}
      <ToolbarButton
        onClick={() => editor.chain().focus().deleteRow().run()}
        disabled={!tableState.canDeleteRow}
        title="Supprimer la ligne"
        danger
      >
        <DeleteRowIcon />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().deleteColumn().run()}
        disabled={!tableState.canDeleteColumn}
        title="Supprimer la colonne"
        danger
      >
        <DeleteColumnIcon />
      </ToolbarButton>

      <Separator />

      {/* Fusion/Division */}
      <ToolbarButton
        onClick={() => editor.chain().focus().mergeCells().run()}
        disabled={!tableState.canMergeCells}
        title="Fusionner les cellules"
      >
        <MergeCellsIcon />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().splitCell().run()}
        disabled={!tableState.canSplitCell}
        title="Diviser la cellule"
      >
        <SplitCellIcon />
      </ToolbarButton>

      <Separator />

      {/* En-tête */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeaderRow().run()}
        disabled={!tableState.canToggleHeaderRow}
        title="Ligne d'en-tête"
      >
        <HeaderRowIcon />
      </ToolbarButton>

      <Separator />

      {/* Couleur */}
      <div className="relative">
        <ToolbarButton
          onClick={() => setShowColorPicker(!showColorPicker)}
          title="Couleur de fond"
        >
          <CellColorIcon />
        </ToolbarButton>
        {showColorPicker && (
          <TableCellColorPicker
            editor={editor}
            onClose={() => setShowColorPicker(false)}
          />
        )}
      </div>

      <Separator />

      {/* Supprimer tableau */}
      <ToolbarButton
        onClick={() => editor.chain().focus().deleteTable().run()}
        disabled={!tableState.canDeleteTable}
        title="Supprimer le tableau"
        danger
      >
        <DeleteTableIcon />
      </ToolbarButton>
    </div>
  )
}
