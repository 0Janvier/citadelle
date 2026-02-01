/**
 * Composant représentant une page complète avec header, contenu et footer
 */

import { memo } from 'react'
import type { Editor } from '@tiptap/react'
import { PageHeader } from './PageHeader'
import { PageFooter } from './PageFooter'
import { PageContentClip } from './PageContentClip'
import type { ContentPageInfo } from '../../hooks/useContentPagination'
import type { PageMargins, HeaderFooterContent } from '../../store/usePageStore'

interface PageWindowProps {
  pageInfo: ContentPageInfo
  editor: Editor
  pageWidth: number
  pageHeight: number
  margins: PageMargins
  zoom: number
  isEditable: boolean
  // Header config
  headerEnabled: boolean
  headerHeight: number
  headerContent: HeaderFooterContent
  // Footer config
  footerEnabled: boolean
  footerHeight: number
  footerContent: HeaderFooterContent
  // Document info
  documentTitle: string
  totalPages: number
}

export const PageWindow = memo(function PageWindow({
  pageInfo,
  editor,
  pageWidth,
  pageHeight,
  margins,
  zoom,
  isEditable,
  headerEnabled,
  headerHeight,
  headerContent,
  footerEnabled,
  footerHeight,
  footerContent,
  documentTitle,
  totalPages,
}: PageWindowProps) {
  // Calculer la hauteur du contenu disponible
  const effectiveHeaderHeight = headerEnabled ? headerHeight : 0
  const effectiveFooterHeight = footerEnabled ? footerHeight : 0
  const contentHeight = pageHeight - margins.top - margins.bottom - effectiveHeaderHeight - effectiveFooterHeight
  const contentWidth = pageWidth - margins.left - margins.right

  return (
    <div
      className="page-window"
      style={{
        width: pageWidth * zoom,
        height: pageHeight * zoom,
        flexShrink: 0,
      }}
      data-page={pageInfo.pageIndex + 1}
      data-editable={isEditable}
    >
      <div
        className="page-window-inner"
        style={{
          width: pageWidth,
          height: pageHeight,
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          background: 'white',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
          borderRadius: '2px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Zone avec marges */}
        <div
          className="page-window-content"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`,
          }}
        >
          {/* Header */}
          {headerEnabled && (
            <PageHeader
              content={headerContent}
              pageNumber={pageInfo.pageIndex + 1}
              totalPages={totalPages}
              documentTitle={documentTitle}
              height={headerHeight}
              margins={{ left: 0, right: 0 }}
            />
          )}

          {/* Contenu de la page */}
          <PageContentClip
            editor={editor}
            clipTop={pageInfo.startPixel}
            clipHeight={contentHeight}
            isEditable={isEditable}
            contentWidth={contentWidth}
          />

          {/* Footer */}
          {footerEnabled && (
            <PageFooter
              content={footerContent}
              pageNumber={pageInfo.pageIndex + 1}
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
