import { usePageStore, replacePageVariables } from '../../store/usePageStore'
import type { ScrollPageBreakStyle } from '../../store/usePageStore'

interface PageBreakIndicatorProps {
  position: number
  pageNumber: number
  totalPages: number
  documentTitle: string
  style: ScrollPageBreakStyle
}

export function PageBreakIndicator({
  position,
  pageNumber,
  totalPages,
  documentTitle,
  style,
}: PageBreakIndicatorProps) {
  const headerEnabled = usePageStore((state) => state.headerEnabled)
  const footerEnabled = usePageStore((state) => state.footerEnabled)
  const headerContent = usePageStore((state) => state.headerContent)
  const footerContent = usePageStore((state) => state.footerContent)

  const processContent = (text: string, page: number) => {
    return replacePageVariables(text, page, totalPages, documentTitle)
  }

  // Mode ligne simple
  if (style === 'line') {
    return (
      <div
        className="scroll-page-break-line"
        style={{ top: position }}
      >
        <span className="scroll-page-break-label">Page {pageNumber}</span>
      </div>
    )
  }

  // Mode compact ou full
  const isCompact = style === 'compact'
  const footerHeight = isCompact ? 24 : 40
  const headerHeight = isCompact ? 24 : 50

  return (
    <div
      className="scroll-page-break-block"
      style={{ top: position - (footerEnabled ? footerHeight / 2 : 0) - 20 }}
    >
      {/* Footer de la page precedente */}
      {footerEnabled && (
        <div className={`scroll-page-break-footer ${style}`}>
          <div
            className="scroll-page-break-footer-content"
            style={{ height: footerHeight }}
          >
            <span className="scroll-page-break-zone left">
              {processContent(footerContent.left, pageNumber - 1)}
            </span>
            <span className="scroll-page-break-zone center">
              {processContent(footerContent.center, pageNumber - 1)}
            </span>
            <span className="scroll-page-break-zone right">
              {processContent(footerContent.right, pageNumber - 1)}
            </span>
          </div>
        </div>
      )}

      {/* Separateur */}
      <div className="scroll-page-break-separator">
        <span className="scroll-page-break-page-label">Page {pageNumber}</span>
      </div>

      {/* Header de la page suivante */}
      {headerEnabled && (
        <div className={`scroll-page-break-header ${style}`}>
          <div
            className="scroll-page-break-header-content"
            style={{ height: headerHeight }}
          >
            <span className="scroll-page-break-zone left">
              {processContent(headerContent.left, pageNumber)}
            </span>
            <span className="scroll-page-break-zone center">
              {processContent(headerContent.center, pageNumber)}
            </span>
            <span className="scroll-page-break-zone right">
              {processContent(headerContent.right, pageNumber)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
