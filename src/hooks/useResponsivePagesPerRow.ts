/**
 * Hook pour calculer le nombre de pages à afficher par ligne
 * en fonction de la taille de l'écran et des paramètres utilisateur
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { usePageStore } from '../store/usePageStore'

interface UseResponsivePagesPerRowOptions {
  pageWidth: number
  pageZoom: number
  containerPadding?: number
  pageGap?: number
}

interface UseResponsivePagesPerRowResult {
  effectivePagesPerRow: 1 | 2 | 3
  containerWidth: number
}

// Breakpoints pour le mode auto
const BREAKPOINT_TWO_PAGES = 1400
const BREAKPOINT_THREE_PAGES = 2000

export function useResponsivePagesPerRow({
  pageWidth,
  pageZoom,
  containerPadding = 64, // py-8 * 2
  pageGap = 40, // gap-10
}: UseResponsivePagesPerRowOptions): UseResponsivePagesPerRowResult {
  const pagesPerRow = usePageStore((state) => state.pagesPerRow)
  const [containerWidth, setContainerWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  )

  // Écouter les changements de taille de fenêtre
  useEffect(() => {
    const handleResize = () => {
      setContainerWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Calculer le nombre de pages en mode auto
  const calculateAutoPagesPerRow = useCallback((): 1 | 2 | 3 => {
    const scaledPageWidth = pageWidth * pageZoom
    const availableWidth = containerWidth - containerPadding

    // Vérifier si les pages peuvent tenir physiquement
    const canFitTwo = availableWidth >= scaledPageWidth * 2 + pageGap
    const canFitThree = availableWidth >= scaledPageWidth * 3 + pageGap * 2

    // Appliquer les breakpoints, avec vérification de la place disponible
    if (containerWidth >= BREAKPOINT_THREE_PAGES && canFitThree) {
      return 3
    }
    if (containerWidth >= BREAKPOINT_TWO_PAGES && canFitTwo) {
      return 2
    }
    return 1
  }, [containerWidth, pageWidth, pageZoom, containerPadding, pageGap])

  // Déterminer le nombre effectif de pages par ligne
  const effectivePagesPerRow = useMemo((): 1 | 2 | 3 => {
    if (pagesPerRow === 'auto') {
      return calculateAutoPagesPerRow()
    }

    // En mode manuel, vérifier si les pages peuvent tenir
    const scaledPageWidth = pageWidth * pageZoom
    const availableWidth = containerWidth - containerPadding

    if (pagesPerRow === 3) {
      const canFitThree = availableWidth >= scaledPageWidth * 3 + pageGap * 2
      if (!canFitThree) {
        const canFitTwo = availableWidth >= scaledPageWidth * 2 + pageGap
        return canFitTwo ? 2 : 1
      }
    }

    if (pagesPerRow === 2) {
      const canFitTwo = availableWidth >= scaledPageWidth * 2 + pageGap
      if (!canFitTwo) {
        return 1
      }
    }

    return pagesPerRow
  }, [pagesPerRow, calculateAutoPagesPerRow, pageWidth, pageZoom, containerWidth, containerPadding, pageGap])

  return { effectivePagesPerRow, containerWidth }
}
