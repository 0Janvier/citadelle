/**
 * Hook pour la navigation entre pages et le suivi du scroll
 */

import { useState, useCallback, useEffect, RefObject } from 'react'
import type { ContentPageInfo } from './useContentPagination'
import type { PagesPerRow } from '../components/page/PageGrid'

interface UsePageNavigationOptions {
  pages: ContentPageInfo[]
  pagesPerRow: PagesPerRow
  pageHeight: number
  zoom: number
  containerRef: RefObject<HTMLDivElement>
}

interface UsePageNavigationResult {
  currentPage: number
  visiblePages: number[]  // Indices des pages visibles
  scrollToPage: (pageIndex: number) => void
  handleScroll: () => void
}

export function usePageNavigation({
  pages,
  pagesPerRow,
  pageHeight,
  zoom,
  containerRef,
}: UsePageNavigationOptions): UsePageNavigationResult {
  const [currentPage, setCurrentPage] = useState(0)
  const [visiblePages, setVisiblePages] = useState<number[]>([0])

  // Calculer quelles pages sont visibles
  const calculateVisiblePages = useCallback(() => {
    if (!containerRef.current || pages.length === 0) {
      return [0]
    }

    const container = containerRef.current
    const scrollTop = container.scrollTop
    const viewportHeight = container.clientHeight
    const scaledPageHeight = pageHeight * zoom
    const gap = 40
    const rowHeight = scaledPageHeight + gap
    const padding = 32

    // Calculer la première ligne visible
    const firstVisibleRow = Math.max(0, Math.floor((scrollTop - padding) / rowHeight))
    // Calculer la dernière ligne visible
    const lastVisibleRow = Math.ceil((scrollTop + viewportHeight - padding) / rowHeight)

    // Convertir en indices de pages
    const visible: number[] = []
    for (let row = firstVisibleRow; row <= lastVisibleRow; row++) {
      for (let col = 0; col < pagesPerRow; col++) {
        const pageIndex = row * pagesPerRow + col
        if (pageIndex < pages.length) {
          visible.push(pageIndex)
        }
      }
    }

    return visible.length > 0 ? visible : [0]
  }, [containerRef, pages.length, pageHeight, zoom, pagesPerRow])

  // Gestionnaire de scroll
  const handleScroll = useCallback(() => {
    const visible = calculateVisiblePages()
    setVisiblePages(visible)

    // La page courante est la première page visible
    if (visible.length > 0 && visible[0] !== currentPage) {
      setCurrentPage(visible[0])
    }
  }, [calculateVisiblePages, currentPage])

  // Naviguer vers une page spécifique
  const scrollToPage = useCallback((pageIndex: number) => {
    if (!containerRef.current || pageIndex < 0 || pageIndex >= pages.length) {
      return
    }

    const scaledPageHeight = pageHeight * zoom
    const gap = 40
    const rowHeight = scaledPageHeight + gap
    const padding = 32

    // Calculer la ligne de la page
    const targetRow = Math.floor(pageIndex / pagesPerRow)
    const targetScroll = padding + targetRow * rowHeight

    containerRef.current.scrollTo({
      top: targetScroll,
      behavior: 'smooth',
    })

    setCurrentPage(pageIndex)
  }, [containerRef, pages.length, pageHeight, zoom, pagesPerRow])

  // Écouter les changements de taille
  useEffect(() => {
    const handleResize = () => {
      handleScroll()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleScroll])

  // Calcul initial
  useEffect(() => {
    const visible = calculateVisiblePages()
    setVisiblePages(visible)
    if (visible.length > 0) {
      setCurrentPage(visible[0])
    }
  }, [calculateVisiblePages])

  return {
    currentPage,
    visiblePages,
    scrollToPage,
    handleScroll,
  }
}
