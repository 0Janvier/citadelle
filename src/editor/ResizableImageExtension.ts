import Image from '@tiptap/extension-image'

export type ImageAlignment = 'left' | 'center' | 'right'

/** Minimum image width in pixels */
const MIN_WIDTH = 50

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resizableImage: {
      setImageAlignment: (alignment: ImageAlignment) => ReturnType
      setImageSize: (width: number) => ReturnType
    }
  }
}

export const ResizableImage = Image.extend({
  name: 'image',

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute('width') || el.style.width || null,
        renderHTML: (attrs: { width?: string | number | null }) => {
          if (!attrs.width) return {}
          return { width: typeof attrs.width === 'number' ? `${attrs.width}px` : attrs.width }
        },
      },
      height: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute('height') || el.style.height || null,
        renderHTML: (attrs: { height?: string | number | null }) => {
          if (!attrs.height) return {}
          return { height: typeof attrs.height === 'number' ? `${attrs.height}px` : attrs.height }
        },
      },
      alignment: {
        default: 'center',
        parseHTML: (el: HTMLElement) => el.getAttribute('data-alignment') || 'center',
        renderHTML: (attrs: { alignment?: string }) => ({
          'data-alignment': attrs.alignment || 'center',
        }),
      },
      keepAspectRatio: {
        default: true,
        parseHTML: (el: HTMLElement) => {
          const val = el.getAttribute('data-keep-aspect-ratio')
          return val === null ? true : val !== 'false'
        },
        renderHTML: (attrs: { keepAspectRatio?: boolean }) => ({
          'data-keep-aspect-ratio': attrs.keepAspectRatio !== false ? 'true' : 'false',
        }),
      },
    }
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setImageAlignment:
        (alignment: ImageAlignment) =>
        ({ commands }) => {
          return commands.updateAttributes('image', { alignment })
        },
      setImageSize:
        (width: number) =>
        ({ commands }) => {
          return commands.updateAttributes('image', { width, height: null })
        },
    }
  },

  renderHTML({ HTMLAttributes }) {
    const alignment = HTMLAttributes['data-alignment'] || 'center'

    const figureStyle =
      alignment === 'left'
        ? 'text-align: left;'
        : alignment === 'right'
        ? 'text-align: right;'
        : 'text-align: center;'

    const imgAttrs = { ...HTMLAttributes }
    delete imgAttrs['data-alignment']
    delete imgAttrs['data-keep-aspect-ratio']

    // Set max-width, min-width, and object-fit on all images
    const baseStyle = `max-width: 100%; min-width: ${MIN_WIDTH}px; object-fit: contain;`
    if (imgAttrs.width) {
      imgAttrs.style = `width: ${imgAttrs.width}; ${baseStyle} height: auto;`
    } else {
      imgAttrs.style = `${baseStyle} height: auto;`
    }
    imgAttrs.class = 'resizable-image'
    imgAttrs.draggable = 'false'

    return [
      'figure',
      {
        class: `image-figure image-align-${alignment}`,
        style: figureStyle,
        'data-alignment': alignment,
      },
      ['img', imgAttrs],
    ]
  },

  parseHTML() {
    return [
      {
        tag: 'figure.image-figure',
        getAttrs: (dom: HTMLElement) => {
          const img = dom.querySelector('img')
          if (!img) return false
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
            width: img.getAttribute('width') || img.style.width || null,
            height: img.getAttribute('height') || null,
            alignment: dom.getAttribute('data-alignment') || 'center',
          }
        },
      },
      {
        tag: 'img[src]',
      },
    ]
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      // --- DOM creation (all elements created once and cached) ---
      const dom = document.createElement('figure')
      dom.className = `image-figure image-align-${node.attrs.alignment || 'center'}`
      dom.setAttribute('data-alignment', node.attrs.alignment || 'center')

      const img = document.createElement('img')
      img.src = node.attrs.src
      if (node.attrs.alt) img.alt = node.attrs.alt
      if (node.attrs.title) img.title = node.attrs.title
      img.className = 'resizable-image'
      img.draggable = false
      img.style.maxWidth = '100%'
      img.style.minWidth = `${MIN_WIDTH}px`
      img.style.objectFit = 'contain'
      if (node.attrs.width) {
        img.style.width = typeof node.attrs.width === 'number' ? `${node.attrs.width}px` : node.attrs.width
      }
      img.style.height = 'auto'

      // --- Natural dimension caching for aspect ratio ---
      let naturalWidth = 0
      let naturalHeight = 0
      let aspectRatio = 0

      const cacheNaturalDimensions = () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          naturalWidth = img.naturalWidth
          naturalHeight = img.naturalHeight
          aspectRatio = naturalWidth / naturalHeight
        }
      }

      // Cache dimensions once the image has loaded
      if (img.complete && img.naturalWidth > 0) {
        cacheNaturalDimensions()
      } else {
        img.addEventListener('load', cacheNaturalDimensions, { once: true })
      }

      // Resize handle (cached, created once)
      const handle = document.createElement('div')
      handle.className = 'image-resize-handle'

      // Toolbar for alignment (cached, created once)
      const toolbar = document.createElement('div')
      toolbar.className = 'image-toolbar'
      toolbar.contentEditable = 'false'

      const alignments: ImageAlignment[] = ['left', 'center', 'right']
      // Cache button references for fast update without querySelectorAll
      const toolbarButtons: HTMLButtonElement[] = []

      for (const align of alignments) {
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = `image-toolbar-btn${node.attrs.alignment === align ? ' active' : ''}`
        btn.title = align === 'left' ? 'Gauche' : align === 'center' ? 'Centre' : 'Droite'
        btn.innerHTML = align === 'left' ? '&#9664;' : align === 'center' ? '&#9632;' : '&#9654;'
        btn.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          const pos = typeof getPos === 'function' ? getPos() : null
          if (pos !== null && pos !== undefined) {
            editor.chain().focus().setNodeSelection(pos).updateAttributes('image', { alignment: align }).run()
          }
        })
        toolbar.appendChild(btn)
        toolbarButtons.push(btn)
      }

      dom.appendChild(toolbar)
      dom.appendChild(img)
      dom.appendChild(handle)

      // --- Resize on drag with aspect ratio lock and bounds ---
      let startX = 0
      let startWidth = 0
      let keepAspectRatio = node.attrs.keepAspectRatio !== false

      /** Clamp width to [MIN_WIDTH, container width] */
      const clampWidth = (w: number): number => {
        const containerWidth = dom.parentElement?.clientWidth || Infinity
        return Math.min(Math.max(MIN_WIDTH, w), containerWidth)
      }

      const onMouseDown = (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        startX = e.clientX
        startWidth = img.offsetWidth
        // Re-read keepAspectRatio from the current node state
        const pos = typeof getPos === 'function' ? getPos() : null
        if (pos !== null && pos !== undefined) {
          const currentNode = editor.state.doc.nodeAt(pos)
          if (currentNode) {
            keepAspectRatio = currentNode.attrs.keepAspectRatio !== false
          }
        }
        // Ensure natural dimensions are cached before resize
        cacheNaturalDimensions()
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
        dom.classList.add('resizing')
      }

      const onMouseMove = (e: MouseEvent) => {
        const diff = e.clientX - startX
        const newWidth = clampWidth(startWidth + diff)
        img.style.width = `${newWidth}px`
        // Lock aspect ratio: compute height from width
        if (keepAspectRatio && aspectRatio > 0) {
          img.style.height = `${Math.round(newWidth / aspectRatio)}px`
        }
      }

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        dom.classList.remove('resizing')
        const pos = typeof getPos === 'function' ? getPos() : null
        if (pos !== null && pos !== undefined) {
          const newWidth = clampWidth(img.offsetWidth)
          const attrs: Record<string, unknown> = { width: newWidth }
          if (keepAspectRatio && aspectRatio > 0) {
            attrs.height = Math.round(newWidth / aspectRatio)
          } else {
            attrs.height = null
          }
          editor.chain().focus().setNodeSelection(pos).updateAttributes('image', attrs).run()
        }
        // Reset height to auto after committing, so CSS max-width continues to work
        img.style.height = 'auto'
      }

      handle.addEventListener('mousedown', onMouseDown)

      return {
        dom,
        update(updatedNode) {
          if (updatedNode.type.name !== 'image') return false
          img.src = updatedNode.attrs.src
          if (updatedNode.attrs.alt) img.alt = updatedNode.attrs.alt
          if (updatedNode.attrs.width) {
            img.style.width = typeof updatedNode.attrs.width === 'number'
              ? `${updatedNode.attrs.width}px`
              : updatedNode.attrs.width
          }
          // Always ensure constraints are applied
          img.style.maxWidth = '100%'
          img.style.minWidth = `${MIN_WIDTH}px`
          img.style.objectFit = 'contain'
          img.style.height = 'auto'

          const align = updatedNode.attrs.alignment || 'center'
          dom.className = `image-figure image-align-${align}`
          dom.setAttribute('data-alignment', align)
          // Update cached toolbar buttons directly (no querySelectorAll)
          for (let i = 0; i < toolbarButtons.length; i++) {
            toolbarButtons[i].classList.toggle('active', alignments[i] === align)
          }
          // Update local keepAspectRatio from node attrs
          keepAspectRatio = updatedNode.attrs.keepAspectRatio !== false
          return true
        },
        destroy() {
          handle.removeEventListener('mousedown', onMouseDown)
        },
      }
    }
  },
})
