/**
 * Séparateur visuel entre les pages en mode scroll continu
 * Style Word-like avec ligne pointillée et numéro de page
 */

import { replacePageVariables } from '../../store/usePageStore'

interface PageBreakSeparatorProps {
  pageNumber: number
  totalPages: number
  documentTitle?: string
  showPageNumber?: boolean
}

export function PageBreakSeparator({
  pageNumber,
  totalPages,
  documentTitle = '',
  showPageNumber = true,
}: PageBreakSeparatorProps) {
  const pageLabel = replacePageVariables(
    'Page {{page.current}} / {{page.total}}',
    pageNumber,
    totalPages,
    documentTitle
  )

  return (
    <div
      className="page-break-separator"
      style={{
        position: 'relative',
        width: '100%',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '16px 0',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      {/* Ligne pointillée gauche */}
      <div
        style={{
          flex: 1,
          height: '1px',
          background: 'repeating-linear-gradient(90deg, var(--border) 0px, var(--border) 4px, transparent 4px, transparent 8px)',
          opacity: 0.6,
        }}
      />

      {/* Badge numéro de page */}
      {showPageNumber && (
        <div
          style={{
            padding: '4px 16px',
            margin: '0 16px',
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--text-secondary, #666)',
            background: 'var(--bg-secondary, #f5f5f5)',
            borderRadius: '12px',
            border: '1px solid var(--border, #ddd)',
            whiteSpace: 'nowrap',
          }}
        >
          {pageLabel}
        </div>
      )}

      {/* Ligne pointillée droite */}
      <div
        style={{
          flex: 1,
          height: '1px',
          background: 'repeating-linear-gradient(90deg, var(--border) 0px, var(--border) 4px, transparent 4px, transparent 8px)',
          opacity: 0.6,
        }}
      />
    </div>
  )
}
