// Hook pour détecter l'état du curseur dans un tableau
import { useState, useEffect, useCallback } from 'react'
import type { Editor } from '@tiptap/react'

export interface TableState {
  isInTable: boolean
  canAddRowBefore: boolean
  canAddRowAfter: boolean
  canAddColumnBefore: boolean
  canAddColumnAfter: boolean
  canDeleteRow: boolean
  canDeleteColumn: boolean
  canDeleteTable: boolean
  canMergeCells: boolean
  canSplitCell: boolean
  canToggleHeaderRow: boolean
  canToggleHeaderColumn: boolean
  tableRect: DOMRect | null
  cellRect: DOMRect | null
}

const defaultState: TableState = {
  isInTable: false,
  canAddRowBefore: false,
  canAddRowAfter: false,
  canAddColumnBefore: false,
  canAddColumnAfter: false,
  canDeleteRow: false,
  canDeleteColumn: false,
  canDeleteTable: false,
  canMergeCells: false,
  canSplitCell: false,
  canToggleHeaderRow: false,
  canToggleHeaderColumn: false,
  tableRect: null,
  cellRect: null,
}

export function useTableState(editor: Editor | null): TableState {
  const [state, setState] = useState<TableState>(defaultState)

  const updateState = useCallback(() => {
    if (!editor) {
      setState(defaultState)
      return
    }

    const isInTable = editor.isActive('table')

    if (!isInTable) {
      setState(defaultState)
      return
    }

    // Get table and cell DOM elements
    let tableRect: DOMRect | null = null
    let cellRect: DOMRect | null = null

    try {
      const { selection } = editor.state
      const domAtPos = editor.view.domAtPos(selection.from)

      // Find cell element
      let cellElement: HTMLElement | null = domAtPos.node as HTMLElement
      while (cellElement && !['TD', 'TH'].includes(cellElement.tagName)) {
        cellElement = cellElement.parentElement
      }

      if (cellElement) {
        cellRect = cellElement.getBoundingClientRect()

        // Find table element
        let tableElement = cellElement.parentElement
        while (tableElement && tableElement.tagName !== 'TABLE') {
          tableElement = tableElement.parentElement
        }

        if (tableElement) {
          tableRect = tableElement.getBoundingClientRect()
        }
      }
    } catch {
      // Ignore errors in position calculation
    }

    setState({
      isInTable,
      canAddRowBefore: editor.can().addRowBefore(),
      canAddRowAfter: editor.can().addRowAfter(),
      canAddColumnBefore: editor.can().addColumnBefore(),
      canAddColumnAfter: editor.can().addColumnAfter(),
      canDeleteRow: editor.can().deleteRow(),
      canDeleteColumn: editor.can().deleteColumn(),
      canDeleteTable: editor.can().deleteTable(),
      canMergeCells: editor.can().mergeCells(),
      canSplitCell: editor.can().splitCell(),
      canToggleHeaderRow: editor.can().toggleHeaderRow(),
      canToggleHeaderColumn: editor.can().toggleHeaderColumn(),
      tableRect,
      cellRect,
    })
  }, [editor])

  useEffect(() => {
    if (!editor) return

    // Initial update
    updateState()

    // Listen for selection and content changes
    editor.on('selectionUpdate', updateState)
    editor.on('transaction', updateState)

    return () => {
      editor.off('selectionUpdate', updateState)
      editor.off('transaction', updateState)
    }
  }, [editor, updateState])

  return state
}
