/**
 * Système d'affichage de pages inspiré de Word
 *
 * Architecture: UN SEUL éditeur toujours monté, positionné sur la page active.
 * La page active change automatiquement selon:
 * - La position du curseur (selectionUpdate)
 * - Le scroll (page la plus centrale après arrêt du scroll)
 * - Le clic sur une page inactive
 */

import { useRef, useMemo, useState, useEffect, useCallback, forwardRef } from 'react'
import { EditorContent, type Editor } from '@tiptap/react'
import { usePageStore } from '../../store/usePageStore'
import { useDocumentStore } from '../../store/useDocumentStore'
import { PageHeader } from './PageHeader'
import { PageFooter } from './PageFooter'
import { PageStatusBar } from './PageStatusBar'
import { LetterheadOverlay } from '../LetterheadOverlay'

interface PageViewSystemProps {
  documentId: string
  editor: Editor | null
}

export type PagesPerRow = 1 | 2 | 3 | 'auto'

const BREAKPOINT_TWO_PAGES = 1400
const BREAKPOINT_THREE_PAGES = 2000

export function PageViewSystem({ documentId, editor }: PageViewSystemProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorWrapperRef = useRef<HTMLDivElement>(null)
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const scrollIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isAutoScrollingRef = useRef(false)
  const currentEditPageRef = useRef(0)

  const [containerWidth, setContainerWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  )
  const [editorHeight, setEditorHeight] = useState(0)
  const [currentEditPage, setCurrentEditPage] = useState(0)
  const [contentHtml, setContentHtml] = useState('')

  // Keep ref in sync with state
  useEffect(() => { currentEditPageRef.current = currentEditPage }, [currentEditPage])

  // Document
  const document = useDocumentStore((state) =>
    state.documents.find((doc) => doc.id === documentId)
  )

  // Page store state
  const getPageDimensions = usePageStore((state) => state.getPageDimensions)
  const getStoreContentHeight = usePageStore((state) => state.getContentHeight)
  const margins = usePageStore((state) => state.margins)
  const headerEnabled = usePageStore((state) => state.headerEnabled)
  const headerHeight = usePageStore((state) => state.headerHeight)
  const headerContent = usePageStore((state) => state.headerContent)
  const footerEnabled = usePageStore((state) => state.footerEnabled)
  const footerHeight = usePageStore((state) => state.footerHeight)
  const footerContent = usePageStore((state) => state.footerContent)
  const pageZoom = usePageStore((state) => state.pageZoom)
  const setPageZoom = usePageStore((state) => state.setPageZoom)
  const pagesPerRowSetting = usePageStore((state) => state.pagesPerRow)
  const setPagesPerRow = usePageStore((state) => state.setPagesPerRow)

  // Dimensions
  const { width: pageWidth, height: pageHeight } = getPageDimensions()
  const pageContentHeight = getStoreContentHeight()
  const contentWidth = pageWidth - margins.left - margins.right
  const effectiveHeaderHeight = headerEnabled ? headerHeight : 0
  const effectiveFooterHeight = footerEnabled ? footerHeight : 0
  const availableContentHeight = pageContentHeight - effectiveHeaderHeight - effectiveFooterHeight

  // Nombre de pages
  const totalPages = useMemo(() => {
    if (editorHeight <= 0 || availableContentHeight <= 0) return 1
    return Math.max(1, Math.ceil(editorHeight / availableContentHeight))
  }, [editorHeight, availableContentHeight])

  // Observer la hauteur de l'éditeur et synchroniser le contenu miroir
  useEffect(() => {
    if (!editor) return

    let resizeObserver: ResizeObserver | null = null
    let rafId: number | null = null

    const updateState = () => {
      const editorDom = editor.view?.dom as HTMLElement
      if (editorDom) {
        const height = editorDom.scrollHeight || editorDom.offsetHeight
        if (height > 0) {
          setEditorHeight(height)
        }
        const html = editorDom.innerHTML
        if (html) {
          setContentHtml(html)
        }
      }
    }

    // Mise à jour throttlée via requestAnimationFrame
    const throttledUpdate = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        updateState()
        rafId = null
      })
    }

    // Mise à jour initiale dès que l'éditeur est prêt
    const initObserver = () => {
      const editorDom = editor.view?.dom as HTMLElement
      if (editorDom) {
        updateState()
        resizeObserver = new ResizeObserver(throttledUpdate)
        resizeObserver.observe(editorDom)
      }
    }

    if (editor.view?.dom) {
      initObserver()
    } else {
      rafId = requestAnimationFrame(initObserver)
    }

    editor.on('update', throttledUpdate)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      editor.off('update', throttledUpdate)
      resizeObserver?.disconnect()
    }
  }, [editor])

  // Pages par ligne
  const effectivePagesPerRow = useMemo((): 1 | 2 | 3 => {
    const scaledPageWidth = pageWidth * pageZoom
    const availableWidth = containerWidth - 64
    const gap = 40

    if (pagesPerRowSetting !== 'auto') {
      if (pagesPerRowSetting === 3) {
        const canFitThree = availableWidth >= scaledPageWidth * 3 + gap * 2
        if (!canFitThree) {
          const canFitTwo = availableWidth >= scaledPageWidth * 2 + gap
          return canFitTwo ? 2 : 1
        }
      }
      if (pagesPerRowSetting === 2) {
        const canFitTwo = availableWidth >= scaledPageWidth * 2 + gap
        if (!canFitTwo) return 1
      }
      return pagesPerRowSetting as 1 | 2 | 3
    }

    const canFitTwo = availableWidth >= scaledPageWidth * 2 + gap
    const canFitThree = availableWidth >= scaledPageWidth * 3 + gap * 2

    if (containerWidth >= BREAKPOINT_THREE_PAGES && canFitThree) return 3
    if (containerWidth >= BREAKPOINT_TWO_PAGES && canFitTwo) return 2
    return 1
  }, [pagesPerRowSetting, pageWidth, pageZoom, containerWidth])

  const [currentPage, setCurrentPage] = useState(0)

  // Resize observer
  useEffect(() => {
    const handleResize = () => setContainerWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Calculated row height for scroll calculations
  const scaledPageHeight = pageHeight * pageZoom
  const rowHeight = scaledPageHeight + 40

  // Scroll handler with debounced auto-switch
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    const scrollTop = containerRef.current.scrollTop
    const row = Math.floor((scrollTop + 32) / rowHeight)
    const pageIndex = row * effectivePagesPerRow

    if (pageIndex !== currentPage && pageIndex >= 0 && pageIndex < totalPages) {
      setCurrentPage(pageIndex)
    }

    // Skip auto-switch during programmatic scrolling (to avoid feedback loop)
    if (isAutoScrollingRef.current) return

    // Debounced: after scroll stops, activate the most-centered page
    if (scrollIdleTimerRef.current) clearTimeout(scrollIdleTimerRef.current)
    scrollIdleTimerRef.current = setTimeout(() => {
      if (!containerRef.current || isAutoScrollingRef.current) return
      const st = containerRef.current.scrollTop
      const vh = containerRef.current.clientHeight
      const centerY = st + vh / 2
      const centerRow = Math.floor(centerY / rowHeight)
      const centerPage = Math.min(
        Math.max(0, centerRow * effectivePagesPerRow),
        totalPages - 1
      )

      if (centerPage !== currentEditPageRef.current) {
        setCurrentEditPage(centerPage)
      }
    }, 200)
  }, [rowHeight, effectivePagesPerRow, currentPage, totalPages])

  // Navigate to a specific page (smooth scroll)
  const scrollToPage = useCallback((pageIndex: number) => {
    if (!containerRef.current || pageIndex < 0 || pageIndex >= totalPages) return

    isAutoScrollingRef.current = true

    const targetRow = Math.floor(pageIndex / effectivePagesPerRow)
    containerRef.current.scrollTo({
      top: 32 + targetRow * rowHeight,
      behavior: 'smooth',
    })

    setCurrentPage(pageIndex)

    // Reset auto-scroll flag after animation
    setTimeout(() => {
      isAutoScrollingRef.current = false
    }, 500)
  }, [totalPages, rowHeight, effectivePagesPerRow])

  // ========================================================================
  // Auto-switch page based on cursor position (typing across page boundaries)
  // ========================================================================
  useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      if (!editorWrapperRef.current) return

      try {
        const { head } = editor.state.selection
        const coords = editor.view.coordsAtPos(head)
        const wrapperRect = editorWrapperRef.current.getBoundingClientRect()

        // Cursor position within the editor wrapper (viewport-relative)
        const cursorInWrapper = coords.top - wrapperRect.top
        // Convert to absolute position in the full editor content
        const cursorInContent = cursorInWrapper + currentEditPageRef.current * availableContentHeight

        const targetPage = Math.max(0, Math.min(
          Math.floor(cursorInContent / availableContentHeight),
          totalPages - 1
        ))

        if (targetPage !== currentEditPageRef.current) {
          setCurrentEditPage(targetPage)
          scrollToPage(targetPage)
        }
      } catch {
        // coordsAtPos can throw for some edge cases
      }
    }

    editor.on('selectionUpdate', handleSelectionUpdate)
    return () => { editor.off('selectionUpdate', handleSelectionUpdate) }
  }, [editor, availableContentHeight, totalPages, scrollToPage])

  // ========================================================================
  // Click on a non-active page: activate + position cursor at click point
  // ========================================================================
  const handlePageClick = useCallback((pageIndex: number, event: React.MouseEvent) => {
    if (pageIndex === currentEditPageRef.current) return

    const clickX = event.clientX
    const clickY = event.clientY

    setCurrentEditPage(pageIndex)

    // After React re-renders the editor on the new page, position cursor
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (!editor) return
        try {
          const pos = editor.view.posAtCoords({ left: clickX, top: clickY })
          if (pos) {
            editor.commands.setTextSelection(pos.pos)
          }
        } catch {
          // Fallback: just focus
        }
        editor.commands.focus()
      }, 30)
    })
  }, [editor])

  // Cleanup
  useEffect(() => {
    return () => {
      if (scrollIdleTimerRef.current) clearTimeout(scrollIdleTimerRef.current)
    }
  }, [])

  // Enregistrer les refs des pages
  const setPageRef = useCallback((pageIndex: number, el: HTMLDivElement | null) => {
    if (el) {
      pageRefs.current.set(pageIndex, el)
    } else {
      pageRefs.current.delete(pageIndex)
    }
  }, [])

  // Indices des pages
  const pageIndices = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i)
  }, [totalPages])

  // Calcul de la position de l'éditeur (clip)
  const clipTop = currentEditPage * availableContentHeight

  if (!editor || !document) {
    return (
      <div className="flex-1 flex items-center justify-center text-[var(--text-secondary)]">
        Aucun document sélectionné
      </div>
    )
  }

  return (
    <div className="page-view-system flex-1 flex flex-col overflow-hidden bg-[var(--bg-secondary)]" style={{ position: 'relative' }}>
      {/* Conteneur scrollable */}
      <div
        ref={containerRef}
        className="page-view-container"
        onScroll={handleScroll}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 32,
          overflow: 'auto',
        }}
      >
        <div
          className="page-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${effectivePagesPerRow}, ${pageWidth * pageZoom}px)`,
            gap: '40px',
            justifyContent: 'center',
            padding: '32px',
            paddingBottom: '64px',
          }}
        >
          {pageIndices.map((pageIndex) => (
            <PageFrame
              key={pageIndex}
              ref={(el) => setPageRef(pageIndex, el)}
              pageIndex={pageIndex}
              pageWidth={pageWidth}
              pageHeight={pageHeight}
              contentWidth={contentWidth}
              availableContentHeight={availableContentHeight}
              margins={margins}
              zoom={pageZoom}
              isActive={pageIndex === currentEditPage}
              headerEnabled={headerEnabled}
              headerHeight={effectiveHeaderHeight}
              headerContent={headerContent}
              footerEnabled={footerEnabled}
              footerHeight={effectiveFooterHeight}
              footerContent={footerContent}
              documentTitle={document.title}
              totalPages={totalPages}
              contentHtml={contentHtml}
              onClick={(e) => handlePageClick(pageIndex, e)}
            >
              {/* L'éditeur réel est rendu uniquement dans la page active */}
              {pageIndex === currentEditPage && (
                <div
                  ref={editorWrapperRef}
                  style={{
                    position: 'absolute',
                    top: -clipTop,
                    left: 0,
                    width: contentWidth,
                  }}
                >
                  <EditorContent
                    editor={editor}
                    className="page-editor-content"
                  />
                </div>
              )}
            </PageFrame>
          ))}
        </div>
      </div>

      {/* Barre de statut style Word */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <PageStatusBar
          currentPage={currentPage}
          totalPages={totalPages}
          onNavigate={scrollToPage}
          zoom={pageZoom}
          onZoomChange={setPageZoom}
          pagesPerRow={pagesPerRowSetting}
          onPagesPerRowChange={setPagesPerRow}
        />
      </div>
    </div>
  )
}

/**
 * Cadre de page - affiche le contenu miroir et peut contenir l'éditeur
 */
interface PageFrameProps {
  pageIndex: number
  pageWidth: number
  pageHeight: number
  contentWidth: number
  availableContentHeight: number
  margins: { top: number; right: number; bottom: number; left: number }
  zoom: number
  isActive: boolean
  headerEnabled: boolean
  headerHeight: number
  headerContent: { left: string; center: string; right: string }
  footerEnabled: boolean
  footerHeight: number
  footerContent: { left: string; center: string; right: string }
  documentTitle: string
  totalPages: number
  contentHtml: string
  onClick: (event: React.MouseEvent) => void
  children?: React.ReactNode
}

const PageFrame = forwardRef<HTMLDivElement, PageFrameProps>(function PageFrame({
  pageIndex,
  pageWidth,
  pageHeight,
  contentWidth,
  availableContentHeight,
  margins,
  zoom,
  isActive,
  headerEnabled,
  headerHeight,
  headerContent,
  footerEnabled,
  footerHeight,
  footerContent,
  documentTitle,
  totalPages,
  contentHtml,
  onClick,
  children,
}, ref) {
  const clipTop = pageIndex * availableContentHeight

  return (
    <div
      ref={ref}
      className={`page-window ${isActive ? 'page-window-active' : ''}`}
      style={{
        width: pageWidth * zoom,
        height: pageHeight * zoom,
        flexShrink: 0,
        cursor: isActive ? 'text' : 'pointer',
      }}
      onClick={!isActive ? onClick : undefined}
    >
      <div
        className="page-window-inner"
        style={{
          width: pageWidth,
          height: pageHeight,
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          background: 'var(--editor-bg, white)',
          boxShadow: isActive
            ? '0 0 0 2px var(--accent), 0 4px 20px rgba(0, 0, 0, 0.2)'
            : '0 2px 12px rgba(0, 0, 0, 0.15)',
          borderRadius: '2px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'box-shadow 0.15s ease',
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`,
            overflow: 'hidden',
          }}
        >
          {headerEnabled && (
            <PageHeader
              content={headerContent}
              pageNumber={pageIndex + 1}
              totalPages={totalPages}
              documentTitle={documentTitle}
              height={headerHeight}
              margins={{ left: 0, right: 0 }}
            />
          )}

          {/* Cartouche cabinet sur la première page uniquement */}
          {pageIndex === 0 && <LetterheadOverlay />}

          <div
            data-content-viewport
            style={{
              flex: 1,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Contenu miroir (affiché quand la page n'est pas active) */}
            <div
              className="ProseMirror page-content-mirror"
              style={{
                position: 'absolute',
                top: -clipTop,
                left: 0,
                width: contentWidth,
                pointerEvents: 'none',
                userSelect: 'none',
                visibility: isActive ? 'hidden' : 'visible',
              }}
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
            {/* Éditeur réel (injecté par le parent quand actif) */}
            {children}
          </div>

          {footerEnabled && (
            <PageFooter
              content={footerContent}
              pageNumber={pageIndex + 1}
              totalPages={totalPages}
              documentTitle={documentTitle}
              height={footerHeight}
              margins={{ left: 0, right: 0 }}
            />
          )}
        </div>
      </div>
    </div>
  )
})
