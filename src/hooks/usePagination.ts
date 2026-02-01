import { useState, useEffect, useCallback, useRef } from 'react'
import { Editor } from '@tiptap/react'
import { usePageStore } from '../store/usePageStore'

export interface PageInfo {
  index: number
  startOffset: number
  endOffset: number
  hasManualBreak: boolean
}

interface UsePaginationOptions {
  editor: Editor | null
  enabled: boolean
}

interface UsePaginationResult {
  pages: PageInfo[]
  totalPages: number
  currentPage: number
  setCurrentPage: (page: number) => void
  recalculate: () => void
}

export function usePagination({
  editor,
  enabled,
}: UsePaginationOptions): UsePaginationResult {
  const [pages, setPages] = useState<PageInfo[]>([{ index: 0, startOffset: 0, endOffset: 0, hasManualBreak: false }])
  const [currentPage, setCurrentPage] = useState(1)
  const recalculateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const getContentHeight = usePageStore((state) => state.getContentHeight)
  const setTotalPages = usePageStore((state) => state.setTotalPages)
  const setStoredCurrentPage = usePageStore((state) => state.setCurrentPage)

  const calculatePageBreaks = useCallback(() => {
    if (!editor || !enabled) {
      setPages([{ index: 0, startOffset: 0, endOffset: 0, hasManualBreak: false }])
      setTotalPages(1)
      return
    }

    const contentHeight = getContentHeight()
    if (contentHeight <= 0) {
      setPages([{ index: 0, startOffset: 0, endOffset: 0, hasManualBreak: false }])
      setTotalPages(1)
      return
    }

    const proseMirrorDom = editor.view.dom as HTMLElement
    if (!proseMirrorDom) {
      setPages([{ index: 0, startOffset: 0, endOffset: 0, hasManualBreak: false }])
      setTotalPages(1)
      return
    }

    // Get all block-level elements using improved detection
    const getAllBlocks = (container: HTMLElement): HTMLElement[] => {
      const result: HTMLElement[] = []

      // First, get direct children that are block elements
      const directChildren = Array.from(container.children) as HTMLElement[]

      for (const child of directChildren) {
        // Check if it's a page break
        if (child.hasAttribute('data-page-break') || child.classList.contains('page-break')) {
          result.push(child)
          continue
        }

        // Check if it's a block-level element
        const display = getComputedStyle(child).display
        if (display === 'block' || display === 'list-item' || display === 'table' ||
            display === 'flex' || display === 'grid') {
          result.push(child)
        }
      }

      return result
    }

    const blocks = getAllBlocks(proseMirrorDom)

    if (blocks.length === 0) {
      // If no blocks, use the whole content
      const totalHeight = proseMirrorDom.scrollHeight
      const pageCount = Math.max(1, Math.ceil(totalHeight / contentHeight))
      const newPages: PageInfo[] = []

      for (let i = 0; i < pageCount; i++) {
        newPages.push({
          index: i,
          startOffset: i * contentHeight,
          endOffset: Math.min((i + 1) * contentHeight, totalHeight),
          hasManualBreak: false,
        })
      }

      setPages(newPages)
      setTotalPages(newPages.length)
      return
    }

    const newPages: PageInfo[] = []
    let currentPageStart = 0
    let currentHeight = 0
    let pageIndex = 0

    // Get the container's offset to calculate relative positions
    const containerRect = proseMirrorDom.getBoundingClientRect()
    const containerTop = proseMirrorDom.scrollTop

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i] as HTMLElement
      const rect = block.getBoundingClientRect()
      const blockTop = rect.top - containerRect.top + containerTop
      const blockHeight = rect.height

      // Check for manual page break
      if (block.hasAttribute('data-page-break') || block.classList.contains('page-break')) {
        // End current page at this break
        newPages.push({
          index: pageIndex++,
          startOffset: currentPageStart,
          endOffset: blockTop,
          hasManualBreak: true,
        })
        currentPageStart = blockTop + blockHeight
        currentHeight = 0
        continue
      }

      // Check if block fits on current page
      if (currentHeight + blockHeight > contentHeight && currentHeight > 0) {
        // Start new page before this block
        newPages.push({
          index: pageIndex++,
          startOffset: currentPageStart,
          endOffset: blockTop,
          hasManualBreak: false,
        })
        currentPageStart = blockTop
        currentHeight = blockHeight
      } else {
        currentHeight += blockHeight
      }
    }

    // Add final page
    const totalScrollHeight = proseMirrorDom.scrollHeight
    newPages.push({
      index: pageIndex,
      startOffset: currentPageStart,
      endOffset: totalScrollHeight,
      hasManualBreak: false,
    })

    setPages(newPages)
    setTotalPages(newPages.length)
  }, [editor, enabled, getContentHeight, setTotalPages])

  const recalculate = useCallback(() => {
    // Debounce recalculation
    if (recalculateTimeoutRef.current) {
      clearTimeout(recalculateTimeoutRef.current)
    }
    recalculateTimeoutRef.current = setTimeout(() => {
      calculatePageBreaks()
    }, 100)
  }, [calculatePageBreaks])

  // Recalculate on content changes
  useEffect(() => {
    if (!editor || !enabled) return

    const handleUpdate = () => {
      recalculate()
    }

    editor.on('update', handleUpdate)

    // Initial calculation
    // Wait for DOM to be ready
    const timeout = setTimeout(() => {
      calculatePageBreaks()
    }, 100)

    return () => {
      editor.off('update', handleUpdate)
      clearTimeout(timeout)
      if (recalculateTimeoutRef.current) {
        clearTimeout(recalculateTimeoutRef.current)
      }
    }
  }, [editor, enabled, calculatePageBreaks, recalculate])

  // Recalculate when images load
  useEffect(() => {
    if (!editor || !enabled) return

    const proseMirrorDom = editor.view.dom as HTMLElement
    if (!proseMirrorDom) return

    const handleImageLoad = () => {
      // Recalculate after image loads
      recalculate()
    }

    // Observe existing images
    const images = proseMirrorDom.querySelectorAll('img')
    const pendingImages: HTMLImageElement[] = []

    images.forEach((img) => {
      if (!img.complete) {
        img.addEventListener('load', handleImageLoad)
        img.addEventListener('error', handleImageLoad)
        pendingImages.push(img)
      }
    })

    // Also use MutationObserver to catch new images
    const mutationObserver = new MutationObserver((mutations) => {
      let hasNewImages = false
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement
            if (el.tagName === 'IMG') {
              hasNewImages = true
              if (!(el as HTMLImageElement).complete) {
                el.addEventListener('load', handleImageLoad)
                el.addEventListener('error', handleImageLoad)
              }
            }
            // Check for images inside added elements
            el.querySelectorAll?.('img').forEach((img) => {
              hasNewImages = true
              if (!img.complete) {
                img.addEventListener('load', handleImageLoad)
                img.addEventListener('error', handleImageLoad)
              }
            })
          }
        })
      })
      if (hasNewImages) {
        recalculate()
      }
    })

    mutationObserver.observe(proseMirrorDom, {
      childList: true,
      subtree: true,
    })

    return () => {
      pendingImages.forEach((img) => {
        img.removeEventListener('load', handleImageLoad)
        img.removeEventListener('error', handleImageLoad)
      })
      mutationObserver.disconnect()
    }
  }, [editor, enabled, recalculate])

  // Sync current page with store
  useEffect(() => {
    setStoredCurrentPage(currentPage)
  }, [currentPage, setStoredCurrentPage])

  // Recalculate when page settings change
  useEffect(() => {
    if (enabled) {
      recalculate()
    }
  }, [enabled, recalculate])

  return {
    pages,
    totalPages: pages.length,
    currentPage,
    setCurrentPage,
    recalculate,
  }
}
