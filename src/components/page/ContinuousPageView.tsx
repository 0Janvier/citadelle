/**
 * Mode de vue continu avec séparateurs de pages visuels
 *
 * Affiche le document comme un flux continu (un seul EditorContent)
 * avec des séparateurs visuels aux positions de saut de page.
 * Similaire au mode "Mise en page" de Word mais avec scroll fluide.
 */

import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { EditorContent, type Editor } from '@tiptap/react'
import { usePageStore } from '../../store/usePageStore'
import { useDocumentStore } from '../../store/useDocumentStore'
import { PageBreakSeparator } from './PageBreakSeparator'
import { PageStatusBar } from './PageStatusBar'
import { LetterheadOverlay } from '../LetterheadOverlay'

interface ContinuousPageViewProps {
  documentId: string
  editor: Editor | null
}

export function ContinuousPageView({ documentId, editor }: ContinuousPageViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorWrapperRef = useRef<HTMLDivElement>(null)

  // Document state
  const document = useDocumentStore((state) =>
    state.documents.find((doc) => doc.id === documentId)
  )

  // Page store state
  const getPageDimensions = usePageStore((state) => state.getPageDimensions)
  const getContentHeight = usePageStore((state) => state.getContentHeight)
  const margins = usePageStore((state) => state.margins)
  const pageZoom = usePageStore((state) => state.pageZoom)
  const setPageZoom = usePageStore((state) => state.setPageZoom)
  const pagesPerRow = usePageStore((state) => state.pagesPerRow)
  const setPagesPerRow = usePageStore((state) => state.setPagesPerRow)
  const setCurrentPage = usePageStore((state) => state.setCurrentPage)
  const setTotalPages = usePageStore((state) => state.setTotalPages)

  // Local state
  const [currentPageDisplay, setCurrentPageDisplay] = useState(1)
  const [editorHeight, setEditorHeight] = useState(0)

  // Calculate dimensions
  const { width: pageWidth } = getPageDimensions()
  const contentHeight = getContentHeight()
  const contentWidth = pageWidth - margins.left - margins.right

  // Calculate total pages based on editor height
  const totalPages = useMemo(() => {
    if (editorHeight <= 0 || contentHeight <= 0) return 1
    return Math.max(1, Math.ceil(editorHeight / contentHeight))
  }, [editorHeight, contentHeight])

  // Calculate page break positions
  const pageBreakPositions = useMemo(() => {
    const positions: number[] = []
    for (let i = 1; i < totalPages; i++) {
      positions.push(i * contentHeight)
    }
    return positions
  }, [totalPages, contentHeight])

  // Update store when total pages change
  useEffect(() => {
    setTotalPages(totalPages)
  }, [totalPages, setTotalPages])

  // Observer la hauteur de l'éditeur
  useEffect(() => {
    if (!editor) return

    let resizeObserver: ResizeObserver | null = null
    let rafId: number | null = null

    const updateHeight = () => {
      const editorDom = editor.view?.dom as HTMLElement
      if (editorDom) {
        const height = editorDom.scrollHeight || editorDom.offsetHeight
        if (height > 0 && height !== editorHeight) {
          setEditorHeight(height)
        }
      }
    }

    const throttledUpdate = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        updateHeight()
        rafId = null
      })
    }

    // Initial update
    if (editor.view?.dom) {
      updateHeight()
      resizeObserver = new ResizeObserver(throttledUpdate)
      resizeObserver.observe(editor.view.dom)
    }

    editor.on('update', throttledUpdate)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      editor.off('update', throttledUpdate)
      resizeObserver?.disconnect()
    }
  }, [editor, editorHeight])

  // Track current page based on scroll position
  const handleScroll = useCallback(() => {
    if (!containerRef.current || contentHeight <= 0) return

    const scrollTop = containerRef.current.scrollTop
    const currentPage = Math.floor(scrollTop / contentHeight) + 1
    const clampedPage = Math.max(1, Math.min(currentPage, totalPages))

    if (clampedPage !== currentPageDisplay) {
      setCurrentPageDisplay(clampedPage)
      setCurrentPage(clampedPage)
    }
  }, [contentHeight, totalPages, currentPageDisplay, setCurrentPage])

  // Navigate to a specific page
  const scrollToPage = useCallback((pageNumber: number) => {
    if (!containerRef.current || pageNumber < 1 || pageNumber > totalPages) return

    const targetScroll = (pageNumber - 1) * contentHeight
    containerRef.current.scrollTo({
      top: targetScroll,
      behavior: 'smooth',
    })
  }, [totalPages, contentHeight])

  if (!editor || !document) {
    return (
      <div className="flex-1 flex items-center justify-center text-[var(--text-secondary)]">
        Aucun document sélectionné
      </div>
    )
  }

  return (
    <div
      className="continuous-page-view flex-1 flex flex-col overflow-hidden"
      style={{ background: 'var(--bg-secondary, #f5f5f5)' }}
    >
      {/* Zone de scroll principale */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto"
        onScroll={handleScroll}
        style={{
          scrollBehavior: 'smooth',
        }}
      >
        {/* Conteneur centré simulant une page */}
        <div
          style={{
            maxWidth: pageWidth * pageZoom,
            margin: '32px auto',
            padding: `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`,
            background: 'var(--editor-bg, white)',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
            borderRadius: '4px',
            minHeight: '100%',
            position: 'relative',
          }}
        >
          {/* Cartouche cabinet */}
          <LetterheadOverlay />

          {/* Éditeur */}
          <div
            ref={editorWrapperRef}
            style={{
              width: contentWidth * pageZoom,
              position: 'relative',
            }}
          >
            <EditorContent
              editor={editor}
              className="continuous-editor-content"
            />

            {/* Séparateurs de pages superposés */}
            {pageBreakPositions.map((position, index) => (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  left: -margins.left,
                  right: -margins.right,
                  top: position * pageZoom,
                  zIndex: 10,
                }}
              >
                <PageBreakSeparator
                  pageNumber={index + 2}
                  totalPages={totalPages}
                  documentTitle={document.title}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Barre de statut */}
      <PageStatusBar
        currentPage={currentPageDisplay}
        totalPages={totalPages}
        onNavigate={scrollToPage}
        zoom={pageZoom}
        onZoomChange={setPageZoom}
        pagesPerRow={pagesPerRow}
        onPagesPerRowChange={setPagesPerRow}
      />
    </div>
  )
}
