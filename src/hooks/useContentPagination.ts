/**
 * Hook de pagination basée sur le contenu ProseMirror
 * Calcule les sauts de page en utilisant les positions réelles du document
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Editor } from '@tiptap/react'

export interface ContentPageInfo {
  pageIndex: number
  startPos: number      // Position ProseMirror (offset caractère)
  endPos: number        // Position ProseMirror fin
  startPixel: number    // Offset pixel depuis le haut de l'éditeur
  endPixel: number      // Offset pixel fin
  hasManualBreak: boolean
}

interface UseContentPaginationOptions {
  editor: Editor | null
  pageContentHeight: number
  enabled?: boolean
}

interface UseContentPaginationResult {
  pages: ContentPageInfo[]
  totalPages: number
  getPageForPosition: (pos: number) => number
  recalculate: () => void
}

export function useContentPagination({
  editor,
  pageContentHeight,
  enabled = true,
}: UseContentPaginationOptions): UseContentPaginationResult {
  const [pages, setPages] = useState<ContentPageInfo[]>([])
  const recalculateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const editorTopRef = useRef<number>(0)

  // Calculer les pages basées sur le contenu
  const calculatePages = useCallback(() => {
    if (!editor || !enabled || pageContentHeight <= 0) {
      setPages([{ pageIndex: 0, startPos: 0, endPos: 0, startPixel: 0, endPixel: pageContentHeight, hasManualBreak: false }])
      return
    }

    try {
      const editorDom = editor.view.dom as HTMLElement
      if (!editorDom) {
        setPages([{ pageIndex: 0, startPos: 0, endPos: 0, startPixel: 0, endPixel: pageContentHeight, hasManualBreak: false }])
        return
      }

      // Obtenir la position du haut de l'éditeur
      const editorRect = editorDom.getBoundingClientRect()
      editorTopRef.current = editorRect.top

      const doc = editor.state.doc
      const newPages: ContentPageInfo[] = []

      let currentPageIndex = 0
      let pageStartPos = 0
      let pageStartPixel = 0
      let accumulatedHeight = 0

      // Parcourir tous les nœuds de premier niveau du document
      doc.forEach((node, offset) => {
        // Vérifier si c'est un saut de page manuel
        if (node.type.name === 'pageBreak') {
          // Fermer la page actuelle
          const nodeEndPixel = getPixelOffsetForPos(editor, offset + node.nodeSize, editorRect.top)

          newPages.push({
            pageIndex: currentPageIndex,
            startPos: pageStartPos,
            endPos: offset,
            startPixel: pageStartPixel,
            endPixel: nodeEndPixel,
            hasManualBreak: true,
          })

          currentPageIndex++
          pageStartPos = offset + node.nodeSize
          pageStartPixel = nodeEndPixel
          accumulatedHeight = 0
          return
        }

        // Obtenir la hauteur du nœud
        const nodeStartPixel = getPixelOffsetForPos(editor, offset, editorRect.top)
        const nodeEndPixel = getPixelOffsetForPos(editor, offset + node.nodeSize, editorRect.top)
        const nodeHeight = nodeEndPixel - nodeStartPixel

        // Vérifier si le nœud dépasse la page actuelle
        if (accumulatedHeight + nodeHeight > pageContentHeight && accumulatedHeight > 0) {
          // Fermer la page actuelle AVANT ce nœud
          newPages.push({
            pageIndex: currentPageIndex,
            startPos: pageStartPos,
            endPos: offset,
            startPixel: pageStartPixel,
            endPixel: nodeStartPixel,
            hasManualBreak: false,
          })

          currentPageIndex++
          pageStartPos = offset
          pageStartPixel = nodeStartPixel
          accumulatedHeight = nodeHeight
        } else {
          accumulatedHeight += nodeHeight
        }
      })

      // Ajouter la dernière page
      const totalHeight = editorDom.scrollHeight
      newPages.push({
        pageIndex: currentPageIndex,
        startPos: pageStartPos,
        endPos: doc.content.size,
        startPixel: pageStartPixel,
        endPixel: totalHeight,
        hasManualBreak: false,
      })

      setPages(newPages)
    } catch (error) {
      console.error('Erreur lors du calcul des pages:', error)
      setPages([{ pageIndex: 0, startPos: 0, endPos: 0, startPixel: 0, endPixel: pageContentHeight, hasManualBreak: false }])
    }
  }, [editor, pageContentHeight, enabled])

  // Recalculer avec debounce
  const recalculate = useCallback(() => {
    if (recalculateTimeoutRef.current) {
      clearTimeout(recalculateTimeoutRef.current)
    }
    recalculateTimeoutRef.current = setTimeout(() => {
      calculatePages()
    }, 100)
  }, [calculatePages])

  // Recalculer quand l'éditeur change
  useEffect(() => {
    if (!editor || !enabled) return

    // Calcul initial après un court délai
    const initialTimeout = setTimeout(() => {
      calculatePages()
    }, 200)

    // Écouter les mises à jour du contenu
    const handleUpdate = () => {
      recalculate()
    }

    editor.on('update', handleUpdate)

    // Écouter les changements de taille de fenêtre
    const handleResize = () => {
      recalculate()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(initialTimeout)
      if (recalculateTimeoutRef.current) {
        clearTimeout(recalculateTimeoutRef.current)
      }
      editor.off('update', handleUpdate)
      window.removeEventListener('resize', handleResize)
    }
  }, [editor, enabled, calculatePages, recalculate])

  // Recalculer si la hauteur de page change
  useEffect(() => {
    if (enabled) {
      recalculate()
    }
  }, [pageContentHeight, enabled, recalculate])

  // Trouver la page pour une position donnée
  const getPageForPosition = useCallback((pos: number): number => {
    const pageIndex = pages.findIndex(page =>
      pos >= page.startPos && pos <= page.endPos
    )
    return pageIndex >= 0 ? pageIndex : 0
  }, [pages])

  return {
    pages,
    totalPages: pages.length,
    getPageForPosition,
    recalculate,
  }
}

/**
 * Obtient l'offset en pixels pour une position ProseMirror
 */
function getPixelOffsetForPos(editor: Editor, pos: number, editorTop: number): number {
  try {
    // Clamp la position dans les limites du document
    const clampedPos = Math.max(0, Math.min(pos, editor.state.doc.content.size))
    const coords = editor.view.coordsAtPos(clampedPos)
    return coords.top - editorTop
  } catch {
    return 0
  }
}
