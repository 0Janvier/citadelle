import { useRef, useEffect, useCallback, useState, useMemo } from 'react'
import { Editor, EditorContent } from '@tiptap/react'
import { usePageStore } from '../store/usePageStore'
import { useDocumentStore } from '../store/useDocumentStore'
import { usePagination } from '../hooks/usePagination'
import { useVirtualPages } from '../hooks/useVirtualPages'
import { useResponsivePagesPerRow } from '../hooks/useResponsivePagesPerRow'
import { PageHeader } from './page/PageHeader'
import { PageFooter } from './page/PageFooter'
import { StaticEditorContent } from './page/StaticEditorContent'
import { PageStatusBar } from './page/PageStatusBar'

interface PageViewEditorProps {
  documentId: string
  editor: Editor | null
}

export function PageViewEditor({ documentId, editor }: PageViewEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentMeasureRef = useRef<HTMLDivElement>(null)
  const [, setContentHeight] = useState(0)

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
  const firstPage = usePageStore((state) => state.firstPage)
  const pageZoom = usePageStore((state) => state.pageZoom)
  const setPageZoom = usePageStore((state) => state.setPageZoom)
  const pagesPerRow = usePageStore((state) => state.pagesPerRow)
  const setPagesPerRow = usePageStore((state) => state.setPagesPerRow)
  const scrollSnapEnabled = usePageStore((state) => state.scrollSnapEnabled)

  // Pagination - calculate pages based on content height
  const { pages, totalPages, currentPage, setCurrentPage, recalculate } = usePagination({
    editor,
    enabled: true,
  })

  // Ensure at least one page exists
  const displayPages = pages.length > 0 ? pages : [{ index: 0, startOffset: 0, endOffset: 0, hasManualBreak: false }]
  const displayTotalPages = Math.max(1, totalPages)

  // Get page dimensions
  const { width: pageWidth, height: pageHeight } = getPageDimensions()
  const pageContentHeight = getStoreContentHeight()

  // Calculate effective pages per row based on screen size
  const { effectivePagesPerRow } = useResponsivePagesPerRow({
    pageWidth,
    pageZoom,
  })

  // Virtual pages - only render visible pages
  const { isPageVisible, observeElement } = useVirtualPages({
    pages: displayPages,
    containerRef,
    overscan: 1,
  })

  // Memoize editor content for static rendering
  const editorContent = useMemo(() => {
    if (!editor) return null
    return editor.getJSON()
  }, [editor?.state.doc])

  // Measure actual content height
  useEffect(() => {
    if (!contentMeasureRef.current || !editor) return

    const measureContent = () => {
      const editorDom = editor.view.dom as HTMLElement
      if (editorDom) {
        setContentHeight(editorDom.scrollHeight)
      }
    }

    measureContent()

    // Re-measure on content changes
    const observer = new ResizeObserver(measureContent)
    const editorDom = editor.view.dom as HTMLElement
    if (editorDom) {
      observer.observe(editorDom)
    }

    return () => observer.disconnect()
  }, [editor])

  // Recalculate on mount and resize
  useEffect(() => {
    // Force recalculation after a short delay to ensure DOM is ready
    const initialTimeout = setTimeout(() => {
      recalculate()
    }, 200)

    const handleResize = () => {
      recalculate()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(initialTimeout)
    }
  }, [recalculate])

  // Recalculate when editor content changes
  useEffect(() => {
    if (!editor) return

    const handleUpdate = () => {
      setTimeout(() => recalculate(), 100)
    }

    editor.on('update', handleUpdate)
    return () => {
      editor.off('update', handleUpdate)
    }
  }, [editor, recalculate])

  // Calculate actual page element height including gap
  const getPageElementHeight = useCallback(() => {
    // The visual height is pageHeight * pageZoom (scale transform)
    // Gap between pages is defined in the CSS as gap-10 (40px/2.5rem)
    return (pageHeight * pageZoom) + 40
  }, [pageHeight, pageZoom])

  // Handle scroll to track current page (accounting for multi-row layout)
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return

    const scrollTop = containerRef.current.scrollTop
    const pageHeightWithGap = getPageElementHeight()
    const paddingTop = 32 // py-8 = 2rem = 32px

    // Calculate which row is visible
    const visibleRow = Math.floor((scrollTop + paddingTop) / pageHeightWithGap)
    // First page of the visible row
    const firstPageOfRow = visibleRow * effectivePagesPerRow + 1
    const clampedPage = Math.max(1, Math.min(firstPageOfRow, displayTotalPages))

    if (clampedPage !== currentPage) {
      setCurrentPage(clampedPage)
    }
  }, [getPageElementHeight, currentPage, displayTotalPages, setCurrentPage, effectivePagesPerRow])

  // Scroll to page (accounting for multi-row layout)
  const scrollToPage = useCallback((page: number) => {
    if (!containerRef.current) return
    if (page < 1 || page > displayTotalPages) return

    const pageHeightWithGap = getPageElementHeight()
    const paddingTop = 32 // py-8 = 2rem = 32px
    // Calculate which row this page is in
    const targetRow = Math.floor((page - 1) / effectivePagesPerRow)
    const targetScroll = paddingTop + targetRow * pageHeightWithGap

    containerRef.current.scrollTo({
      top: targetScroll,
      behavior: 'smooth',
    })

    setCurrentPage(page)
  }, [getPageElementHeight, displayTotalPages, setCurrentPage, effectivePagesPerRow])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if no input is focused
      const activeElement = window.document.activeElement
      const isInputFocused = activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.getAttribute('contenteditable') === 'true'

      if (isInputFocused) return

      if (e.key === 'PageDown' || (e.key === 'ArrowDown' && e.metaKey)) {
        e.preventDefault()
        scrollToPage(Math.min(displayTotalPages, currentPage + effectivePagesPerRow))
      } else if (e.key === 'PageUp' || (e.key === 'ArrowUp' && e.metaKey)) {
        e.preventDefault()
        scrollToPage(Math.max(1, currentPage - effectivePagesPerRow))
      } else if (e.key === 'Home' && e.metaKey) {
        e.preventDefault()
        scrollToPage(1)
      } else if (e.key === 'End' && e.metaKey) {
        e.preventDefault()
        scrollToPage(displayTotalPages)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPage, displayTotalPages, scrollToPage, effectivePagesPerRow])

  if (!editor || !document) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Aucun document selectionne
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-secondary)]">
      {/* Page container */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-auto page-view-container ${scrollSnapEnabled ? 'snap-enabled' : ''}`}
        onScroll={handleScroll}
      >
        <div
          className={`page-view-grid pages-${effectivePagesPerRow}`}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${effectivePagesPerRow}, max-content)`,
            gap: '40px',
            justifyContent: 'center',
            padding: '32px 0',
          }}
        >
          {displayPages.map((page, index) => (
            <div
              key={index}
              ref={(el) => observeElement(el, index)}
              data-page-index={index}
              className="page-view-page-wrapper"
              style={{
                width: pageWidth * pageZoom,
                height: pageHeight * pageZoom,
              }}
              data-page={index + 1}
            >
              {isPageVisible(index) ? (
                <div
                  className="page-view-page"
                  style={{
                    width: pageWidth,
                    height: pageHeight,
                    transform: `scale(${pageZoom})`,
                    transformOrigin: 'top left',
                  }}
                >
                  {/* Page content wrapper */}
                  <div
                    className="page-view-page-inner"
                    style={{
                      width: pageWidth,
                      height: pageHeight,
                      padding: `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`,
                    }}
                  >
                    {/* Header */}
                    {(() => {
                      const isFirstPage = index === 0
                      const showHeader = isFirstPage && firstPage.differentFirstPage
                        ? firstPage.headerEnabled
                        : headerEnabled
                      const content = isFirstPage && firstPage.differentFirstPage
                        ? firstPage.headerContent
                        : headerContent

                      return showHeader && (
                        <PageHeader
                          content={content}
                          pageNumber={index + 1}
                          totalPages={displayTotalPages}
                          documentTitle={document.title}
                          height={headerHeight}
                          margins={{ left: 0, right: 0 }}
                        />
                      )
                    })()}

                    {/* Content area */}
                    <div
                      className="page-view-content"
                      style={{
                        height: pageContentHeight,
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {/* Content container with offset */}
                      <div
                        ref={index === 0 ? contentMeasureRef : undefined}
                        style={{
                          position: 'absolute',
                          top: -page.startOffset,
                          left: 0,
                          right: 0,
                          pointerEvents: index === 0 ? 'auto' : 'none',
                        }}
                      >
                        {index === 0 ? (
                          <EditorContent editor={editor} className="page-view-editor-content" />
                        ) : (
                          // Pages 2+: Use memoized static content
                          editorContent && (
                            <StaticEditorContent
                              content={editorContent}
                              className="page-view-editor-content-clone"
                            />
                          )
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    {(() => {
                      const isFirstPage = index === 0
                      const showFooter = isFirstPage && firstPage.differentFirstPage
                        ? firstPage.footerEnabled
                        : footerEnabled
                      const content = isFirstPage && firstPage.differentFirstPage
                        ? firstPage.footerContent
                        : footerContent

                      return showFooter && (
                        <PageFooter
                          content={content}
                          pageNumber={index + 1}
                          totalPages={displayTotalPages}
                          documentTitle={document.title}
                          height={footerHeight}
                          margins={{ left: 0, right: 0 }}
                        />
                      )
                    })()}
                  </div>
                </div>
              ) : (
                // Placeholder for non-visible pages
                <div className="page-placeholder" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Barre de statut unifiée */}
      <PageStatusBar
        currentPage={currentPage - 1}
        totalPages={displayTotalPages}
        onNavigate={(page) => scrollToPage(page + 1)}
        zoom={pageZoom}
        onZoomChange={setPageZoom}
        pagesPerRow={pagesPerRow}
        onPagesPerRowChange={setPagesPerRow}
      />
    </div>
  )
}
