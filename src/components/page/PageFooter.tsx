import { replacePageVariables } from '../../store/usePageStore'

interface PageFooterProps {
  content: {
    left: string
    center: string
    right: string
  }
  pageNumber: number
  totalPages: number
  documentTitle: string
  height: number
  margins: {
    left: number
    right: number
  }
}

export function PageFooter({
  content,
  pageNumber,
  totalPages,
  documentTitle,
  height,
  margins,
}: PageFooterProps) {
  const processContent = (text: string) => {
    return replacePageVariables(text, pageNumber, totalPages, documentTitle)
  }

  return (
    <div
      className="page-view-footer"
      style={{
        height,
        paddingLeft: margins.left,
        paddingRight: margins.right,
      }}
    >
      <div className="page-footer-left">
        {processContent(content.left)}
      </div>
      <div className="page-footer-center">
        {processContent(content.center)}
      </div>
      <div className="page-footer-right">
        {processContent(content.right)}
      </div>
    </div>
  )
}
