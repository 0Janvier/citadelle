import { replacePageVariables } from '../../store/usePageStore'

interface PageHeaderProps {
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

export function PageHeader({
  content,
  pageNumber,
  totalPages,
  documentTitle,
  height,
  margins,
}: PageHeaderProps) {
  const processContent = (text: string) => {
    return replacePageVariables(text, pageNumber, totalPages, documentTitle)
  }

  return (
    <div
      className="page-view-header"
      style={{
        height,
        paddingLeft: margins.left,
        paddingRight: margins.right,
      }}
    >
      <div className="page-header-left">
        {processContent(content.left)}
      </div>
      <div className="page-header-center">
        {processContent(content.center)}
      </div>
      <div className="page-header-right">
        {processContent(content.right)}
      </div>
    </div>
  )
}
