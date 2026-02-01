import { useMemo } from 'react'
import type { JSONContent } from '@tiptap/react'

interface StaticEditorContentProps {
  content: JSONContent
  className?: string
}

/**
 * Rendu statique du contenu de l'éditeur.
 * Utilisé pour afficher les pages 2+ sans clonage HTML direct.
 * Le contenu est généré une seule fois et mémoïsé.
 */
export function StaticEditorContent({
  content,
  className = ''
}: StaticEditorContentProps) {
  // Générer le HTML à partir du contenu JSON
  // Note: generateHTML n'est pas disponible dans notre version de TipTap
  // On utilise donc une approche alternative avec un rendu récursif
  const html = useMemo(() => {
    return renderContentToHTML(content)
  }, [content])

  return (
    <div
      className={`static-editor-content ProseMirror ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/**
 * Convertit le contenu JSONContent en HTML.
 * Version simplifiée qui gère les types de nœuds courants.
 */
function renderContentToHTML(content: JSONContent): string {
  if (!content) return ''

  const renderNode = (node: JSONContent): string => {
    if (!node.type) return ''

    // Texte simple
    if (node.type === 'text') {
      let text = escapeHTML(node.text || '')

      // Appliquer les marks
      if (node.marks) {
        for (const mark of node.marks) {
          switch (mark.type) {
            case 'bold':
              text = `<strong>${text}</strong>`
              break
            case 'italic':
              text = `<em>${text}</em>`
              break
            case 'underline':
              text = `<u>${text}</u>`
              break
            case 'strike':
              text = `<s>${text}</s>`
              break
            case 'code':
              text = `<code>${text}</code>`
              break
            case 'link':
              const href = escapeHTML(mark.attrs?.href || '')
              text = `<a href="${href}">${text}</a>`
              break
            case 'highlight':
              const color = mark.attrs?.color || 'yellow'
              text = `<mark data-color="${color}">${text}</mark>`
              break
          }
        }
      }
      return text
    }

    // Contenu enfant
    const children = node.content?.map(renderNode).join('') || ''

    // Types de nœuds
    switch (node.type) {
      case 'doc':
        return children

      case 'paragraph':
        const pAttrs = getAlignmentStyle(node.attrs)
        return `<p${pAttrs}>${children || '<br>'}</p>`

      case 'heading':
        const level = node.attrs?.level || 1
        const hAttrs = getAlignmentStyle(node.attrs)
        return `<h${level}${hAttrs}>${children}</h${level}>`

      case 'bulletList':
        return `<ul>${children}</ul>`

      case 'orderedList':
        const start = node.attrs?.start || 1
        return `<ol start="${start}">${children}</ol>`

      case 'listItem':
        return `<li>${children}</li>`

      case 'taskList':
        return `<ul data-type="taskList">${children}</ul>`

      case 'taskItem':
        const checked = node.attrs?.checked ? 'checked' : ''
        return `<li data-type="taskItem"><input type="checkbox" ${checked} disabled />${children}</li>`

      case 'blockquote':
        return `<blockquote>${children}</blockquote>`

      case 'codeBlock':
        const lang = node.attrs?.language || ''
        return `<pre><code class="language-${lang}">${children}</code></pre>`

      case 'horizontalRule':
        return '<hr />'

      case 'hardBreak':
        return '<br />'

      case 'image':
        const src = escapeHTML(node.attrs?.src || '')
        const alt = escapeHTML(node.attrs?.alt || '')
        const title = node.attrs?.title ? ` title="${escapeHTML(node.attrs.title)}"` : ''
        return `<img src="${src}" alt="${alt}"${title} />`

      case 'table':
        return `<table>${children}</table>`

      case 'tableRow':
        return `<tr>${children}</tr>`

      case 'tableCell':
        return `<td>${children}</td>`

      case 'tableHeader':
        return `<th>${children}</th>`

      case 'pageBreak':
        return '<div class="page-break" data-page-break="true"><span class="page-break-line"></span><span class="page-break-label">Saut de page</span></div>'

      default:
        // Type inconnu - rendre les enfants
        return children
    }
  }

  return renderNode(content)
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getAlignmentStyle(attrs?: Record<string, unknown>): string {
  if (!attrs?.textAlign) return ''
  const align = attrs.textAlign as string
  if (align === 'left') return '' // Default, no style needed
  return ` style="text-align: ${align}"`
}
