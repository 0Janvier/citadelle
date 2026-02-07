import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect, useRef, useMemo, useCallback } from 'react'
import { extensions } from '../editor/extensions'
import { TypewriterExtension } from '../editor/TypewriterExtension'
import { CollapsibleHeadingsExtension } from '../editor/CollapsibleHeadingsExtension'
import { useShallow } from 'zustand/react/shallow'
import { useDocumentStore } from '../store/useDocumentStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { useEditorStore } from '../store/useEditorStore'
import { usePageStore } from '../store/usePageStore'
import { useCollapsibleStore } from '../store/useCollapsibleStore'
import { useAutoSave } from '../hooks/useAutoSave'
import { usePagination } from '../hooks/usePagination'
import { PageViewSystem } from './page/PageViewSystem'
import { ContinuousPageView } from './page/ContinuousPageView'
import { ScrollPageBreakOverlay } from './page/ScrollPageBreakOverlay'
import { TableFloatingToolbar, TableContextMenu } from './table'
import '../styles/editor.css'

interface EditorProps {
  documentId: string
}

export function Editor({ documentId }: EditorProps) {
  const document = useDocumentStore((state) =>
    state.documents.find((doc) => doc.id === documentId)
  )
  const updateContent = useDocumentStore((state) => state.updateContent)
  const markAsDirty = useDocumentStore((state) => state.markAsDirty)

  const {
    fontSize, fontFamily, lineHeight,
    paragraphIndent, paragraphSpacing, wordWrap,
    typewriterMode, typewriterDimOpacity,
    typewriterHighlightStyle, typewriterScrollPosition, typewriterMarkLine,
    spellcheckEnabled,
  } = useSettingsStore(useShallow((state) => ({
    fontSize: state.fontSize,
    fontFamily: state.fontFamily,
    lineHeight: state.lineHeight,
    paragraphIndent: state.paragraphIndent,
    paragraphSpacing: state.paragraphSpacing,
    wordWrap: state.wordWrap,
    typewriterMode: state.typewriterMode,
    typewriterDimOpacity: state.typewriterDimOpacity,
    typewriterHighlightStyle: state.typewriterHighlightStyle,
    typewriterScrollPosition: state.typewriterScrollPosition,
    typewriterMarkLine: state.typewriterMarkLine,
    spellcheckEnabled: state.spellcheckEnabled,
  })))

  const setActiveEditor = useEditorStore((state) => state.setActiveEditor)

  const { viewMode, showScrollPageBreaks, scrollPageBreakStyle } = usePageStore(useShallow((state) => ({
    viewMode: state.viewMode,
    showScrollPageBreaks: state.showScrollPageBreaks,
    scrollPageBreakStyle: state.scrollPageBreakStyle,
  })))

  // Collapsible headings state
  const toggleSection = useCollapsibleStore((state) => state.toggleSection)
  const getCollapsedSections = useCollapsibleStore((state) => state.getCollapsedSections)

  // Track if update comes from editor itself to avoid cursor reset
  const isInternalUpdate = useRef(false)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  // Track if user is typing (for variable mode)
  const isTypingRef = useRef(false)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Scroll animation state for smooth scrolling
  const scrollAnimationRef = useRef<number | null>(null)
  const lastScrollTimeRef = useRef<number>(0)
  const targetScrollRef = useRef<number | null>(null)

  // Enable auto-save for this document
  useAutoSave(documentId)

  // Handle collapsible toggle
  const handleCollapsibleToggle = useCallback((headingId: string) => {
    toggleSection(documentId, headingId)
  }, [documentId, toggleSection])

  // Getter for collapsed sections (called by the plugin)
  const getCollapsedIds = useCallback(() => {
    return getCollapsedSections(documentId)
  }, [documentId, getCollapsedSections])

  // Memoize extensions with typewriter and collapsible configuration
  // Note: collapsedSections is intentionally NOT in dependencies - getCollapsedIds handles the dynamic lookup
  const editorExtensions = useMemo(() => [
    ...extensions,
    TypewriterExtension.configure({
      enabled: typewriterMode,
      dimOpacity: typewriterDimOpacity,
      highlightStyle: typewriterHighlightStyle,
      markLine: typewriterMarkLine,
    }),
    CollapsibleHeadingsExtension.configure({
      getCollapsedIds,
      onToggle: handleCollapsibleToggle,
      levels: [1, 2, 3, 4, 5, 6],
    }),
  ], [typewriterMode, typewriterDimOpacity, typewriterHighlightStyle, typewriterMarkLine, getCollapsedIds, handleCollapsibleToggle])

  const editor = useEditor({
    extensions: editorExtensions,
    content: document?.content || {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [],
      }],
    },
    editorProps: {
      attributes: {
        spellcheck: spellcheckEnabled ? 'true' : 'false',
        lang: 'fr',
        class: `prose prose-lg dark:prose-invert max-w-none focus:outline-none ${typewriterMode ? `typewriter-mode scroll-${typewriterScrollPosition}` : ''}`,
        style: `
          font-size: ${fontSize}px;
          font-family: ${fontFamily};
          line-height: ${lineHeight};
          white-space: ${wordWrap ? 'pre-wrap' : 'pre'};
          --paragraph-indent: ${paragraphIndent}cm;
          --paragraph-spacing: ${paragraphSpacing}em;
        `,
      },
    },
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true
      const json = editor.getJSON()
      updateContent(documentId, json)
      markAsDirty(documentId)

      // Mark as typing for variable scroll mode
      isTypingRef.current = true
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false
      }, 1000) // Reset after 1 second of no typing
    },
  }, [editorExtensions, typewriterScrollPosition])

  // Pagination pour la previsualisation en mode scroll et continu
  const { pages } = usePagination({
    editor,
    enabled: viewMode === 'page' || viewMode === 'continuous' || (viewMode === 'scroll' && showScrollPageBreaks),
  })

  // Share the editor instance with other components via store
  useEffect(() => {
    if (editor) {
      setActiveEditor(editor)
    }
    return () => {
      setActiveEditor(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]) // setActiveEditor is stable from Zustand

  // Update editor content when document changes from external source
  useEffect(() => {
    if (editor && document) {
      if (isInternalUpdate.current) {
        isInternalUpdate.current = false
        return
      }
      editor.commands.setContent(document.content, false)
    }
  }, [document?.content, editor])

  // Update editor styles when settings change
  useEffect(() => {
    if (editor && editor.view) {
      const editorElement = editor.view.dom as HTMLElement
      editorElement.style.fontSize = `${fontSize}px`
      editorElement.style.fontFamily = fontFamily
      editorElement.style.lineHeight = `${lineHeight}`
      editorElement.style.whiteSpace = wordWrap ? 'pre-wrap' : 'pre'
      editorElement.style.setProperty('--paragraph-indent', `${paragraphIndent}cm`)
      editorElement.style.setProperty('--paragraph-spacing', `${paragraphSpacing}em`)
    }
  }, [editor, fontSize, fontFamily, lineHeight, paragraphIndent, paragraphSpacing, wordWrap])

  // Smooth scroll animation using lerp (linear interpolation)
  const animateScroll = useCallback((container: HTMLDivElement, targetScroll: number) => {
    // Cancel any existing animation
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current)
    }

    const startScroll = container.scrollTop
    const distance = targetScroll - startScroll

    // Skip if already at target
    if (Math.abs(distance) < 1) return

    const duration = 150 // ms - shorter for more responsive feel
    const startTime = performance.now()

    const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutCubic(progress)

      container.scrollTop = startScroll + distance * easedProgress

      if (progress < 1) {
        scrollAnimationRef.current = requestAnimationFrame(animate)
      } else {
        scrollAnimationRef.current = null
        targetScrollRef.current = null
      }
    }

    scrollAnimationRef.current = requestAnimationFrame(animate)
  }, [])

  // Typewriter mode: position cursor at configured vertical position
  const scrollToCursor = useCallback((forceScroll = false) => {
    if (!editor || !typewriterMode || !editorContainerRef.current) return

    // Throttle scroll calls - minimum 16ms between calls (60fps)
    const now = performance.now()
    if (now - lastScrollTimeRef.current < 16) {
      return
    }
    lastScrollTimeRef.current = now

    try {
      const { from } = editor.state.selection
      const coords = editor.view.coordsAtPos(from)
      const container = editorContainerRef.current
      const containerRect = container.getBoundingClientRect()

      // Calculate where the cursor is relative to the container's visible area
      const cursorY = coords.top - containerRect.top
      const lineHeight = parseInt(getComputedStyle(editor.view.dom).lineHeight) || 24
      const margin = lineHeight * 2 // Keep 2 lines of margin from edges

      // Mode "none" (Sur place): Only scroll to keep cursor visible, no fixed position
      // Like Ulysses "Variable" but without fixing position when typing
      if (typewriterScrollPosition === 'none') {
        // Check if cursor is outside visible area (with margin)
        if (cursorY < margin) {
          // Cursor too close to top - scroll up just enough
          const scrollDelta = cursorY - margin
          animateScroll(container, container.scrollTop + scrollDelta)
        } else if (cursorY > containerRect.height - margin) {
          // Cursor too close to bottom - scroll down just enough
          const scrollDelta = cursorY - (containerRect.height - margin)
          animateScroll(container, container.scrollTop + scrollDelta)
        }
        return
      }

      // Variable mode: only scroll when typing, not when navigating
      // Like Ulysses: free cursor movement, but locks to center when typing
      if (typewriterScrollPosition === 'variable' && !isTypingRef.current && !forceScroll) {
        return
      }

      // Calculate target position based on scroll position setting
      let targetRatio: number
      switch (typewriterScrollPosition) {
        case 'top':
          targetRatio = 0.15 // 15% from top
          break
        case 'bottom':
          targetRatio = 0.85 // 85% from top
          break
        case 'middle':
        case 'variable':
        default:
          targetRatio = 0.5 // 50% (center)
          break
      }

      const targetY = containerRect.height * targetRatio

      // Calculate how much we need to scroll to position the cursor
      const scrollDelta = cursorY - targetY
      const newScrollTop = container.scrollTop + scrollDelta

      // Only scroll if the cursor is not already near the target (within 40px tolerance)
      // Increased tolerance to reduce micro-adjustments
      if (Math.abs(scrollDelta) > 40) {
        // Use custom smooth animation instead of native scrollTo
        // This prevents animation conflicts during rapid typing
        animateScroll(container, newScrollTop)
      }
    } catch (e) {
      // Ignore errors during scroll (can happen during rapid typing)
    }
  }, [editor, typewriterMode, typewriterScrollPosition, animateScroll])

  // Listen to selection changes and transactions for typewriter scroll
  useEffect(() => {
    if (!editor || !typewriterMode) return

    const handleSelectionUpdate = () => {
      // Selection update (navigation) - scrollToCursor will check isTypingRef for variable mode
      requestAnimationFrame(() => scrollToCursor(false))
    }

    const handleTransaction = ({ transaction }: { transaction: { docChanged: boolean } }) => {
      // If document changed, this is typing - force scroll even in variable mode
      if (transaction.docChanged) {
        requestAnimationFrame(() => scrollToCursor(true))
      }
    }

    // Listen to selection updates and content changes separately
    editor.on('selectionUpdate', handleSelectionUpdate)
    editor.on('transaction', handleTransaction)

    // Initial scroll to position cursor
    setTimeout(() => scrollToCursor(true), 100)

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate)
      editor.off('transaction', handleTransaction)
      // Cleanup typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      // Cleanup scroll animation
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current)
      }
    }
  }, [editor, typewriterMode, scrollToCursor])

  if (!document) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Aucun document sélectionné
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {viewMode === 'scroll' && (
        /* Scroll mode - original editor */
        <div
          ref={editorContainerRef}
          className={`flex-1 overflow-auto bg-[var(--editor-bg)] editor-scrollable ${typewriterMode ? 'typewriter-container' : ''}`}
          style={{ position: 'relative' }}
        >
          <EditorContent editor={editor} className="h-full" />
          {/* Overlay des sauts de page en mode scroll */}
          {showScrollPageBreaks && pages.length > 1 && (
            <ScrollPageBreakOverlay
              pages={pages}
              documentTitle={document?.title || ''}
              style={scrollPageBreakStyle}
            />
          )}
        </div>
      )}

      {viewMode === 'continuous' && (
        /* Continuous mode - Word-like scroll with page breaks */
        <ContinuousPageView documentId={documentId} editor={editor} />
      )}

      {viewMode === 'page' && (
        /* Page mode - paginated view system */
        <PageViewSystem documentId={documentId} editor={editor} />
      )}

      {/* Table management components */}
      <TableFloatingToolbar editor={editor} />
      <TableContextMenu editor={editor} />
    </div>
  )
}
