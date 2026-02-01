import { invoke } from '@tauri-apps/api/tauri'
import { save } from '@tauri-apps/api/dialog'
import { open as openPath } from '@tauri-apps/api/shell'
import { useDocumentStore } from '../store/useDocumentStore'
import { useFileOperations } from './useFileOperations'
import { useToast } from './useToast'

export function useExportPDF() {
  const { jsonToMarkdown } = useFileOperations()
  const toast = useToast()

  const exportToPDF = async (documentId: string) => {
    try {
      const doc = useDocumentStore.getState().getDocument(documentId)
      if (!doc) {
        toast.error('Aucun document sélectionné')
        return
      }

      // Convert to markdown first
      const markdown = jsonToMarkdown(doc.content)

      // Ask for save location
      const selected = await save({
        defaultPath: doc.title.replace(/\.(md|txt)$/, '.pdf'),
        filters: [
          {
            name: 'PDF',
            extensions: ['pdf'],
          },
        ],
      })

      if (!selected) return // User cancelled

      // Create HTML content for PDF
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      color: #1d1d1f;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }
    h1 { font-size: 2em; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.25em; }
    p { margin: 16px 0; }
    code {
      background-color: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 0.9em;
    }
    pre {
      background-color: #f5f5f5;
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
    }
    pre code {
      background: none;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid #007aff;
      margin: 16px 0;
      padding-left: 16px;
      color: #666;
    }
    ul, ol {
      margin: 16px 0;
      padding-left: 32px;
    }
    li {
      margin: 8px 0;
    }
    hr {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 24px 0;
    }
    a {
      color: #007aff;
      text-decoration: none;
    }
    strong { font-weight: 600; }
    em { font-style: italic; }
  </style>
</head>
<body>
${convertMarkdownToHTML(markdown)}
</body>
</html>
`

      // Use Tauri to print to PDF
      // For now, we'll create an HTML file and let the user print it
      const htmlPath = selected.replace('.pdf', '.html')

      // Write HTML file
      await invoke('write_file', {
        path: htmlPath,
        content: htmlContent
      })

      toast.info('Fichier HTML créé. Ouvrez-le dans votre navigateur et utilisez "Imprimer > Enregistrer au format PDF"')

      // Open the HTML file
      await openPath(htmlPath)

    } catch (error) {
      console.error('Error exporting to PDF:', error)
      toast.error(`Erreur lors de l'export PDF: ${error}`)
    }
  }

  return { exportToPDF }
}

// Simple Markdown to HTML converter
function convertMarkdownToHTML(markdown: string): string {
  let html = markdown

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Code inline
  html = html.replace(/`(.+?)`/g, '<code>$1</code>')

  // Code blocks
  html = html.replace(/```\n([\s\S]*?)\n```/g, '<pre><code>$1</code></pre>')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // Line breaks and paragraphs
  html = html.replace(/\n\n/g, '</p><p>')
  html = html.replace(/\n/g, '<br>')

  // Wrap in paragraphs
  html = '<p>' + html + '</p>'

  // Lists
  html = html.replace(/<p>- (.+?)<\/p>/g, '<ul><li>$1</li></ul>')
  html = html.replace(/<\/ul><ul>/g, '')

  // Horizontal rules
  html = html.replace(/---/g, '<hr>')

  // Blockquotes
  html = html.replace(/<p>&gt; (.+?)<\/p>/g, '<blockquote><p>$1</p></blockquote>')

  return html
}
