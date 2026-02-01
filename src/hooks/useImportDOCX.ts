/**
 * Hook pour l'import de documents Word (.docx)
 * Utilise mammoth.js pour convertir DOCX → HTML → TipTap JSON
 */

import { useCallback } from 'react'
import mammoth from 'mammoth'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Highlight from '@tiptap/extension-highlight'
import { useToast } from './useToast'
import type { JSONContent } from '@tiptap/react'

// Extensions TipTap pour le parsing HTML
const getParsingExtensions = () => [
  StarterKit,
  Underline,
  Link.configure({ openOnClick: false }),
  Image,
  Table.configure({ resizable: false }),
  TableRow,
  TableCell,
  TableHeader,
  TaskList,
  TaskItem.configure({ nested: true }),
  Highlight,
]

/**
 * Convertit du HTML en JSONContent TipTap en utilisant un éditeur temporaire
 */
function htmlToJson(html: string): JSONContent {
  // Créer un éditeur temporaire pour parser le HTML
  const editor = new Editor({
    extensions: getParsingExtensions(),
    content: html,
  })

  const json = editor.getJSON()
  editor.destroy()

  return json
}

export function useImportDOCX() {
  const toast = useToast()

  /**
   * Importe un fichier DOCX et le convertit en JSONContent TipTap
   */
  const importDocx = useCallback(async (
    arrayBuffer: ArrayBuffer
  ): Promise<JSONContent | null> => {
    try {
      // Valider que c'est un vrai fichier DOCX (commence par PK = signature ZIP)
      const view = new Uint8Array(arrayBuffer)
      if (view[0] !== 0x50 || view[1] !== 0x4B) {
        throw new Error('Le fichier n\'est pas un document Word valide')
      }

      // Convertir DOCX → HTML avec mammoth
      const result = await mammoth.convertToHtml(
        { arrayBuffer },
        {
          // Gérer les images en les convertissant en base64
          convertImage: mammoth.images.imgElement((image) => {
            return image.readAsBase64String().then((base64) => ({
              src: `data:${image.contentType};base64,${base64}`,
            }))
          }),
          // Mapper les styles Word (français et anglais) vers HTML
          styleMap: [
            // Styles anglais
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "p[style-name='Heading 3'] => h3:fresh",
            "p[style-name='Heading 4'] => h4:fresh",
            "p[style-name='Heading 5'] => h5:fresh",
            "p[style-name='Heading 6'] => h6:fresh",
            // Styles français
            "p[style-name='Titre 1'] => h1:fresh",
            "p[style-name='Titre 2'] => h2:fresh",
            "p[style-name='Titre 3'] => h3:fresh",
            "p[style-name='Titre 4'] => h4:fresh",
            "p[style-name='Titre 5'] => h5:fresh",
            "p[style-name='Titre 6'] => h6:fresh",
            // Citations
            "p[style-name='Quote'] => blockquote:fresh",
            "p[style-name='Citation'] => blockquote:fresh",
            "p[style-name='Block Quote'] => blockquote:fresh",
            // Code
            "p[style-name='Code'] => pre:fresh",
          ],
        }
      )

      // Vérifier qu'on a du contenu
      if (!result.value || result.value.trim() === '') {
        throw new Error('Le document est vide')
      }

      // Convertir HTML → TipTap JSONContent via un éditeur temporaire
      const jsonContent = htmlToJson(result.value)

      // Valider le contenu généré
      if (!jsonContent || !jsonContent.content || jsonContent.content.length === 0) {
        throw new Error('Le document n\'a pas pu être converti')
      }

      // Feedback utilisateur selon le résultat
      const warnings = result.messages.filter((m) => m.type === 'warning')
      const errors = result.messages.filter((m) => m.type === 'error')

      // Logger les messages pour le débogage
      if (result.messages.length > 0) {
        console.log('DOCX import messages:', result.messages)
      }

      if (errors.length > 0) {
        toast.warning(`Document importé avec ${errors.length} erreur(s) de conversion`)
      } else if (warnings.length > 0) {
        toast.success(`Document Word importé (${warnings.length} avertissement(s))`)
      } else {
        toast.success('Document Word importé avec succès')
      }

      return jsonContent
    } catch (error) {
      console.error('DOCX import error:', error)
      const message = error instanceof Error ? error.message : 'Erreur inconnue'
      toast.error(`Erreur lors de l'importation: ${message}`)
      return null
    }
  }, [toast])

  return { importDocx }
}
