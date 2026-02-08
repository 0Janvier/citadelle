/**
 * Vue continue style Word (Print Layout)
 *
 * Affiche le document comme des feuilles A4 empilées verticalement
 * avec un fond gris entre les pages, exactement comme le mode
 * « Mise en page » de Microsoft Word.
 *
 * Architecture : UN SEUL éditeur monté sur la page active.
 * Les autres pages affichent un contenu miroir (innerHTML).
 * La page active suit automatiquement le curseur et le scroll.
 */

import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { EditorContent, type Editor } from '@tiptap/react'
import { usePageStore } from '../../store/usePageStore'
import { useDocumentStore } from '../../store/useDocumentStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { PageHeader } from './PageHeader'
import { PageFooter } from './PageFooter'
import { PageStatusBar } from './PageStatusBar'
import { LetterheadOverlay } from '../LetterheadOverlay'

/** Espace gris entre les pages (px) — similaire à Word */
const PAGE_GAP = 8

interface ContinuousPageViewProps {
  documentId: string
  editor: Editor | null
}

export function ContinuousPageView({ documentId, editor }: ContinuousPageViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorWrapperRef = useRef<HTMLDivElement>(null)
  const activePageRef = useRef(0)
  const isAutoScrollingRef = useRef(false)
  const scrollIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [editorHeight, setEditorHeight] = useState(0)
  const [activePageIndex, setActivePageIndex] = useState(0)
  const [contentHtml, setContentHtml] = useState('')
  const [currentPageDisplay, setCurrentPageDisplay] = useState(1)

  // Keep ref in sync with state
  useEffect(() => { activePageRef.current = activePageIndex }, [activePageIndex])

  // Document
  const document = useDocumentStore((state) =>
    state.documents.find((doc) => doc.id === documentId)
  )

  // Settings for mirror content styling consistency
  const fontSize = useSettingsStore((state) => state.fontSize)
  const fontFamily = useSettingsStore((state) => state.fontFamily)
  const lineHeight = useSettingsStore((state) => state.lineHeight)
  const paragraphIndent = useSettingsStore((state) => state.paragraphIndent)
  const paragraphSpacing = useSettingsStore((state) => state.paragraphSpacing)

  // Page store
  const getPageDimensions = usePageStore((state) => state.getPageDimensions)
  const getContentHeight = usePageStore((state) => state.getContentHeight)
  const margins = usePageStore((state) => state.margins)
  const pageZoom = usePageStore((state) => state.pageZoom)
  const setPageZoom = usePageStore((state) => state.setPageZoom)
  const pagesPerRow = usePageStore((state) => state.pagesPerRow)
  const setPagesPerRow = usePageStore((state) => state.setPagesPerRow)
  const setCurrentPage = usePageStore((state) => state.setCurrentPage)
  const setTotalPages = usePageStore((state) => state.setTotalPages)
  const headerEnabled = usePageStore((state) => state.headerEnabled)
  const headerHeight = usePageStore((state) => state.headerHeight)
  const headerContent = usePageStore((state) => state.headerContent)
  const footerEnabled = usePageStore((state) => state.footerEnabled)
  const footerHeight = usePageStore((state) => state.footerHeight)
  const footerContent = usePageStore((state) => state.footerContent)

  // Dimensions
  const { width: pageWidth, height: pageHeight } = getPageDimensions()
  const pageContentHeight = getContentHeight()
  const contentWidth = pageWidth - margins.left - margins.right
  const effectiveHeaderHeight = headerEnabled ? headerHeight : 0
  const effectiveFooterHeight = footerEnabled ? footerHeight : 0
  const availableContentHeight = pageContentHeight - effectiveHeaderHeight - effectiveFooterHeight

  // Total pages
  const totalPages = useMemo(() => {
    if (editorHeight <= 0 || availableContentHeight <= 0) return 1
    return Math.max(1, Math.ceil(editorHeight / availableContentHeight))
  }, [editorHeight, availableContentHeight])

  // Sync total pages to store
  useEffect(() => {
    setTotalPages(totalPages)
  }, [totalPages, setTotalPages])

  // ========================================================================
  // Observe editor height + mirror content snapshot
  // ========================================================================
  useEffect(() => {
    if (!editor) return

    let resizeObserver: ResizeObserver | null = null
    let rafId: number | null = null

    const updateState = () => {
      const editorDom = editor.view?.dom as HTMLElement
      if (editorDom) {
        const height = editorDom.scrollHeight || editorDom.offsetHeight
        if (height > 0) setEditorHeight(height)
        const html = editorDom.innerHTML
        if (html) setContentHtml(html)
      }
    }

    const throttledUpdate = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        updateState()
        rafId = null
      })
    }

    const initObserver = () => {
      const editorDom = editor.view?.dom as HTMLElement
      if (editorDom) {
        updateState()
        resizeObserver = new ResizeObserver(throttledUpdate)
        resizeObserver.observe(editorDom)
      }
    }

    if (editor.view?.dom) initObserver()
    else rafId = requestAnimationFrame(initObserver)

    editor.on('update', throttledUpdate)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      editor.off('update', throttledUpdate)
      resizeObserver?.disconnect()
    }
  }, [editor])

  // ========================================================================
  // Scroll tracking + debounced active-page switch
  // ========================================================================
  const scaledPageHeight = pageHeight * pageZoom
  const rowHeight = scaledPageHeight + PAGE_GAP

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return

    const scrollTop = containerRef.current.scrollTop
    const adjustedScroll = Math.max(0, scrollTop - 24)
    const pageIndex = Math.floor(adjustedScroll / rowHeight)
    const clampedPage = Math.max(0, Math.min(pageIndex, totalPages - 1))

    if (clampedPage + 1 !== currentPageDisplay) {
      setCurrentPageDisplay(clampedPage + 1)
      setCurrentPage(clampedPage + 1)
    }

    // Skip auto-switch during programmatic scroll
    if (isAutoScrollingRef.current) return

    // After scroll stops, activate the page closest to viewport center
    if (scrollIdleTimerRef.current) clearTimeout(scrollIdleTimerRef.current)
    scrollIdleTimerRef.current = setTimeout(() => {
      if (!containerRef.current || isAutoScrollingRef.current) return
      const st = containerRef.current.scrollTop
      const vh = containerRef.current.clientHeight
      const centerY = st + vh / 2
      const centerPage = Math.max(0, Math.min(
        Math.floor((centerY - 24) / rowHeight),
        totalPages - 1
      ))

      if (centerPage !== activePageRef.current) {
        setActivePageIndex(centerPage)
      }
    }, 200)
  }, [rowHeight, totalPages, currentPageDisplay, setCurrentPage])

  // ========================================================================
  // Navigate to a specific page (smooth scroll)
  // ========================================================================
  const scrollToPage = useCallback((pageNumber: number) => {
    if (!containerRef.current || pageNumber < 1 || pageNumber > totalPages) return

    isAutoScrollingRef.current = true
    const targetScroll = 24 + (pageNumber - 1) * rowHeight
    containerRef.current.scrollTo({ top: targetScroll, behavior: 'smooth' })

    setCurrentPageDisplay(pageNumber)
    setCurrentPage(pageNumber)

    setTimeout(() => { isAutoScrollingRef.current = false }, 500)
  }, [totalPages, rowHeight, setCurrentPage])

  // ========================================================================
  // Auto-switch active page based on cursor position (typing across pages)
  // ========================================================================
  useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      if (!editorWrapperRef.current) return
      try {
        const { head } = editor.state.selection
        const coords = editor.view.coordsAtPos(head)
        const wrapperRect = editorWrapperRef.current.getBoundingClientRect()
        const cursorInWrapper = coords.top - wrapperRect.top
        const cursorInContent = cursorInWrapper + activePageRef.current * availableContentHeight
        const targetPage = Math.max(0, Math.min(
          Math.floor(cursorInContent / availableContentHeight),
          totalPages - 1
        ))

        if (targetPage !== activePageRef.current) {
          setActivePageIndex(targetPage)
          scrollToPage(targetPage + 1)
        }
      } catch {
        // coordsAtPos can throw for some edge cases
      }
    }

    editor.on('selectionUpdate', handleSelectionUpdate)
    return () => { editor.off('selectionUpdate', handleSelectionUpdate) }
  }, [editor, availableContentHeight, totalPages, scrollToPage])

  // ========================================================================
  // Click on non-active page → activate + position cursor
  // ========================================================================
  const handlePageClick = useCallback((pageIndex: number, event: React.MouseEvent) => {
    if (pageIndex === activePageRef.current) return

    const clickX = event.clientX
    const clickY = event.clientY

    setActivePageIndex(pageIndex)

    requestAnimationFrame(() => {
      setTimeout(() => {
        if (!editor) return
        try {
          const pos = editor.view.posAtCoords({ left: clickX, top: clickY })
          if (pos) editor.commands.setTextSelection(pos.pos)
        } catch { /* fallback: focus only */ }
        editor.commands.focus()
      }, 30)
    })
  }, [editor])

  // ========================================================================
  // Cleanup
  // ========================================================================
  useEffect(() => {
    return () => {
      if (scrollIdleTimerRef.current) clearTimeout(scrollIdleTimerRef.current)
    }
  }, [])

  // ========================================================================
  // Derived data
  // ========================================================================
  const pageIndices = useMemo(() =>
    Array.from({ length: totalPages }, (_, i) => i),
    [totalPages]
  )

  // Inline styles for mirror content to match editor appearance
  const mirrorStyle = useMemo(() => ({
    fontSize: `${fontSize}px`,
    fontFamily,
    lineHeight: String(lineHeight),
    '--paragraph-indent': `${paragraphIndent}cm`,
    '--paragraph-spacing': `${paragraphSpacing}em`,
  } as React.CSSProperties), [fontSize, fontFamily, lineHeight, paragraphIndent, paragraphSpacing])

  // ========================================================================
  // Render
  // ========================================================================
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
      style={{ position: 'relative' }}
    >
      {/* Zone de scroll principale */}
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
        {/* Pile verticale de pages centrées */}
        <div
          className="continuous-page-stack"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '24px 24px 64px',
            gap: `${PAGE_GAP}px`,
            minHeight: '100%',
          }}
        >
          {pageIndices.map((pageIndex) => {
            const isActive = pageIndex === activePageIndex
            const clipTop = pageIndex * availableContentHeight

            return (
              <div
                key={pageIndex}
                className="continuous-page-sheet"
                style={{
                  width: pageWidth * pageZoom,
                  height: pageHeight * pageZoom,
                  flexShrink: 0,
                  cursor: isActive ? 'text' : 'pointer',
                }}
                onClick={!isActive ? (e) => handlePageClick(pageIndex, e) : undefined}
              >
                {/* Feuille de papier (dimensions réelles, zoom via transform) */}
                <div
                  className="continuous-page-paper"
                  style={{
                    width: pageWidth,
                    height: pageHeight,
                    transform: pageZoom !== 1 ? `scale(${pageZoom})` : undefined,
                    transformOrigin: 'top left',
                    background: 'var(--editor-bg, white)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  {/* Zone de contenu avec marges */}
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      padding: `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`,
                      overflow: 'hidden',
                    }}
                  >
                    {/* En-tête */}
                    {headerEnabled && (
                      <PageHeader
                        content={headerContent}
                        pageNumber={pageIndex + 1}
                        totalPages={totalPages}
                        documentTitle={document.title}
                        height={effectiveHeaderHeight}
                        margins={{ left: 0, right: 0 }}
                      />
                    )}

                    {/* Cartouche cabinet (première page uniquement) */}
                    {pageIndex === 0 && <LetterheadOverlay />}

                    {/* Viewport de contenu (clippé) */}
                    <div
                      data-content-viewport
                      style={{
                        flex: 1,
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {/* Contenu miroir (affiché quand la page n'est PAS active) */}
                      <div
                        className="ProseMirror prose prose-lg dark:prose-invert max-w-none continuous-page-mirror"
                        style={{
                          position: 'absolute',
                          top: -clipTop,
                          left: 0,
                          width: contentWidth,
                          pointerEvents: 'none',
                          userSelect: 'none',
                          visibility: isActive ? 'hidden' : 'visible',
                          minHeight: 'auto',
                          padding: 0,
                          ...mirrorStyle,
                        }}
                        dangerouslySetInnerHTML={{ __html: contentHtml }}
                      />

                      {/* Éditeur réel (uniquement sur la page active) */}
                      {isActive && (
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
                    </div>

                    {/* Pied de page */}
                    {footerEnabled && (
                      <PageFooter
                        content={footerContent}
                        pageNumber={pageIndex + 1}
                        totalPages={totalPages}
                        documentTitle={document.title}
                        height={effectiveFooterHeight}
                        margins={{ left: 0, right: 0 }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Barre de statut */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
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
    </div>
  )
}
