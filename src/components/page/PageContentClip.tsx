/**
 * Composant qui affiche une portion du contenu de l'éditeur
 * Utilise le clipping CSS pour montrer uniquement la zone de la page
 */

import { useEffect, useRef, memo } from 'react'
import { EditorContent, Editor } from '@tiptap/react'

interface PageContentClipProps {
  editor: Editor
  clipTop: number       // Offset pixel depuis le haut de l'éditeur
  clipHeight: number    // Hauteur visible de la page
  isEditable: boolean   // true si c'est la page avec le curseur
  contentWidth: number  // Largeur du contenu
}

export const PageContentClip = memo(function PageContentClip({
  editor,
  clipTop,
  clipHeight,
  isEditable,
  contentWidth,
}: PageContentClipProps) {
  const mirrorRef = useRef<HTMLDivElement>(null)
  const lastContentRef = useRef<string>('')

  // Mettre à jour le miroir quand le contenu change (pour les pages non-éditables)
  useEffect(() => {
    if (isEditable || !mirrorRef.current || !editor) return

    const updateMirror = () => {
      const editorDom = editor.view.dom as HTMLElement
      if (!editorDom || !mirrorRef.current) return

      // Optimisation : ne mettre à jour que si le contenu a changé
      const currentContent = editorDom.innerHTML
      if (currentContent === lastContentRef.current) return
      lastContentRef.current = currentContent

      // Cloner le contenu
      mirrorRef.current.innerHTML = currentContent

      // Appliquer les mêmes styles que l'éditeur
      const editorStyles = window.getComputedStyle(editorDom)
      mirrorRef.current.style.fontSize = editorStyles.fontSize
      mirrorRef.current.style.fontFamily = editorStyles.fontFamily
      mirrorRef.current.style.lineHeight = editorStyles.lineHeight
      mirrorRef.current.style.color = editorStyles.color

      // Copier les variables CSS
      const cssVars = ['--paragraph-indent', '--paragraph-spacing']
      cssVars.forEach(varName => {
        const value = editorStyles.getPropertyValue(varName)
        if (value) {
          mirrorRef.current!.style.setProperty(varName, value)
        }
      })
    }

    // Mise à jour initiale
    updateMirror()

    // Écouter les mises à jour de l'éditeur
    editor.on('update', updateMirror)
    editor.on('selectionUpdate', updateMirror)

    return () => {
      editor.off('update', updateMirror)
      editor.off('selectionUpdate', updateMirror)
    }
  }, [editor, isEditable])

  return (
    <div
      className="page-content-viewport"
      style={{
        height: clipHeight,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        className={`page-content-inner ${isEditable ? 'page-content-editable' : 'page-content-mirror'}`}
        style={{
          position: 'absolute',
          top: -clipTop,
          left: 0,
          width: contentWidth,
          pointerEvents: isEditable ? 'auto' : 'none',
          userSelect: isEditable ? 'auto' : 'none',
        }}
      >
        {isEditable ? (
          // Page éditable : afficher l'éditeur réel
          <EditorContent editor={editor} className="page-editor-content" />
        ) : (
          // Pages non-éditables : afficher un miroir du contenu
          <div
            ref={mirrorRef}
            className="ProseMirror page-editor-mirror"
            style={{
              minHeight: 'auto',
              padding: '2rem',
            }}
          />
        )}
      </div>
    </div>
  )
})
