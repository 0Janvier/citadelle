import { useMemo } from 'react'
import type { ExportTemplate } from '../../types/templates'

interface ExportPreviewProps {
  content: string
  template: ExportTemplate
  zoom?: number
}

export function ExportPreview({
  content,
  template,
  zoom = 0.5,
}: ExportPreviewProps) {
  const { pageLayout, header, footer, typography, styles } = template

  // Generate preview HTML with styles
  const previewHtml = useMemo(() => {
    // Base dimensions for A4 in pixels (at 96 DPI)
    const pageWidth = pageLayout.orientation === 'portrait' ? 595 : 842
    const pageHeight = pageLayout.orientation === 'portrait' ? 842 : 595

    const marginTop = parseMargin(pageLayout.margins.top)
    const marginBottom = parseMargin(pageLayout.margins.bottom)
    const marginLeft = parseMargin(pageLayout.margins.left)
    const marginRight = parseMargin(pageLayout.margins.right)

    const headerHeight = header.enabled ? parseMargin(header.height) : 0
    const footerHeight = footer.enabled ? parseMargin(footer.height) : 0

    const contentHeight = pageHeight - marginTop - marginBottom - headerHeight - footerHeight

    return `
      <div class="page" style="
        width: ${pageWidth}px;
        min-height: ${pageHeight}px;
        padding: ${marginTop}px ${marginRight}px ${marginBottom}px ${marginLeft}px;
        background: white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        font-family: ${typography.baseFontSize.includes('pt') ? 'Georgia, serif' : 'system-ui, sans-serif'};
        font-size: ${typography.baseFontSize};
        line-height: ${typography.lineHeight};
        color: #1a1a1a;
        box-sizing: border-box;
      ">
        ${header.enabled ? `
          <div class="header" style="
            height: ${headerHeight}px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: ${header.style.borderBottom || 'none'};
            padding-bottom: ${header.style.paddingBottom || '8px'};
            margin-bottom: 16px;
            font-size: ${header.style.fontSize || '10pt'};
            color: ${header.style.color || '#666'};
          ">
            <span>${header.content.left || ''}</span>
            <span>${header.content.center || ''}</span>
            <span>${header.content.right || ''}</span>
          </div>
        ` : ''}

        <div class="content" style="min-height: ${contentHeight}px;">
          ${content}
        </div>

        ${footer.enabled ? `
          <div class="footer" style="
            height: ${footerHeight}px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: ${footer.style.borderTop || 'none'};
            padding-top: ${footer.style.paddingTop || '8px'};
            margin-top: 16px;
            font-size: ${footer.style.fontSize || '9pt'};
            color: ${footer.style.color || '#999'};
          ">
            <span>${footer.content.left || ''}</span>
            <span>${footer.content.center || ''}</span>
            <span>${footer.content.right || ''}</span>
          </div>
        ` : ''}
      </div>

      <style>
        .page h1 { ${styleToCSS(styles.h1)} }
        .page h2 { ${styleToCSS(styles.h2)} }
        .page h3 { ${styleToCSS(styles.h3)} }
        .page p { ${styleToCSS(styles.p)}; margin-bottom: ${typography.paragraphSpacing}; }
        .page blockquote { ${styleToCSS(styles.blockquote)} }
        .page ul, .page ol { margin: 0 0 1em 1.5em; }
        .page li { margin-bottom: 0.25em; }
        .page code { background: #f4f4f4; padding: 0.1em 0.3em; border-radius: 3px; font-size: 0.9em; }
        .page pre { background: #f4f4f4; padding: 1em; border-radius: 4px; overflow-x: auto; }
        .page hr { border: none; border-top: 1px solid #e5e5e5; margin: 1.5em 0; }
        .page table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        .page th, .page td { border: 1px solid #ddd; padding: 0.5em; text-align: left; }
        .page th { background: #f9f9f9; font-weight: 600; }
      </style>
    `
  }, [content, template])

  return (
    <div className="bg-gray-200 dark:bg-gray-800 rounded-lg p-4 overflow-auto">
      <div
        className="mx-auto origin-top-left"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
        dangerouslySetInnerHTML={{ __html: previewHtml }}
      />
    </div>
  )
}

// Helper to parse margin values to pixels
function parseMargin(value: string): number {
  const num = parseFloat(value)
  if (value.includes('cm')) return num * 37.8 // 1cm = 37.8px at 96 DPI
  if (value.includes('mm')) return num * 3.78
  if (value.includes('in')) return num * 96
  if (value.includes('pt')) return num * 1.33
  return num // assume px
}

// Convert style object to CSS string
function styleToCSS(style?: Record<string, string>): string {
  if (!style) return ''
  return Object.entries(style)
    .map(([key, value]) => `${toKebabCase(key)}: ${value}`)
    .join('; ')
}

function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}
