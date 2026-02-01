import { PageBreakIndicator } from './PageBreakIndicator'
import type { PageInfo } from '../../hooks/usePagination'
import type { ScrollPageBreakStyle } from '../../store/usePageStore'

interface ScrollPageBreakOverlayProps {
  pages: PageInfo[]
  documentTitle: string
  style: ScrollPageBreakStyle
}

export function ScrollPageBreakOverlay({
  pages,
  documentTitle,
  style,
}: ScrollPageBreakOverlayProps) {
  // Ne pas afficher si une seule page
  if (pages.length <= 1) {
    return null
  }

  return (
    <div className="scroll-page-break-overlay">
      {pages.slice(1).map((page, index) => (
        <PageBreakIndicator
          key={page.index}
          position={page.startOffset}
          pageNumber={index + 2}
          totalPages={pages.length}
          documentTitle={documentTitle}
          style={style}
        />
      ))}
    </div>
  )
}
