import { useState, useEffect, useRef, useCallback } from 'react'
import { PageInfo } from './usePagination'

interface UseVirtualPagesOptions {
  pages: PageInfo[]
  containerRef: React.RefObject<HTMLDivElement>
  overscan?: number // Nombre de pages adjacentes à rendre
}

interface UseVirtualPagesResult {
  visibleIndices: Set<number>
  isPageVisible: (index: number) => boolean
  observeElement: (element: HTMLDivElement | null, index: number) => void
}

/**
 * Hook de virtualisation pour le rendu des pages.
 * Utilise IntersectionObserver pour détecter les pages visibles
 * et permet un rendu conditionnel des pages (visible + overscan).
 */
export function useVirtualPages({
  pages,
  containerRef,
  overscan = 1,
}: UseVirtualPagesOptions): UseVirtualPagesResult {
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set([0]))
  const observerRef = useRef<IntersectionObserver | null>(null)
  const observedElements = useRef<Map<number, HTMLDivElement>>(new Map())

  // Créer l'observer une seule fois
  useEffect(() => {
    if (!containerRef.current) return

    // Nettoyer l'ancien observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        setVisibleIndices((prev) => {
          const newVisible = new Set(prev)
          let hasChanges = false

          entries.forEach((entry) => {
            const pageIndexAttr = entry.target.getAttribute('data-page-index')
            if (pageIndexAttr === null) return

            const pageIndex = parseInt(pageIndexAttr, 10)

            if (entry.isIntersecting) {
              // Ajouter la page visible et les pages adjacentes (overscan)
              for (
                let i = Math.max(0, pageIndex - overscan);
                i <= Math.min(pages.length - 1, pageIndex + overscan);
                i++
              ) {
                if (!newVisible.has(i)) {
                  newVisible.add(i)
                  hasChanges = true
                }
              }
            } else {
              // Vérifier si cette page peut être retirée
              // Ne retirer que si aucune page adjacente visible ne la référence
              const shouldKeep = Array.from(newVisible).some((visibleIdx) => {
                if (visibleIdx === pageIndex) return false
                return Math.abs(visibleIdx - pageIndex) <= overscan
              })

              if (!shouldKeep && newVisible.has(pageIndex)) {
                newVisible.delete(pageIndex)
                hasChanges = true
              }
            }
          })

          return hasChanges ? newVisible : prev
        })
      },
      {
        root: containerRef.current,
        rootMargin: '200px 0px', // Précharger les pages proches du viewport
        threshold: [0, 0.1, 0.5], // Détecter différents niveaux de visibilité
      }
    )

    // Observer tous les éléments déjà enregistrés
    observedElements.current.forEach((element) => {
      observerRef.current?.observe(element)
    })

    return () => {
      observerRef.current?.disconnect()
      observerRef.current = null
    }
  }, [containerRef, pages.length, overscan])

  // Fonction pour observer un élément de page
  const observeElement = useCallback((element: HTMLDivElement | null, index: number) => {
    // Si l'élément est null, nettoyer l'ancien
    if (!element) {
      const oldElement = observedElements.current.get(index)
      if (oldElement && observerRef.current) {
        observerRef.current.unobserve(oldElement)
      }
      observedElements.current.delete(index)
      return
    }

    // Si c'est un nouvel élément, l'observer
    const oldElement = observedElements.current.get(index)
    if (oldElement !== element) {
      if (oldElement && observerRef.current) {
        observerRef.current.unobserve(oldElement)
      }
      observedElements.current.set(index, element)
      if (observerRef.current) {
        observerRef.current.observe(element)
      }
    }
  }, [])

  // Vérifier si une page est visible (ou dans l'overscan)
  const isPageVisible = useCallback(
    (index: number) => visibleIndices.has(index),
    [visibleIndices]
  )

  return {
    visibleIndices,
    isPageVisible,
    observeElement,
  }
}
