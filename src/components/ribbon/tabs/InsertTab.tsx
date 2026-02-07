/**
 * Onglet Insertion du Ribbon
 * Contient : Éléments (Table, Image, Lien), Juridique (Variables, Termes)
 */

import { useState } from 'react'
import type { Editor } from '@tiptap/react'
import {
  Table,
  Image,
  Link,
  FileDown,
  Quote,
  Code,
  Minus,
  Variable,
  BookMarked,
  ListTree,
  Footprints,
} from 'lucide-react'
import { RibbonButton } from '../RibbonButton'
import { RibbonGroup, RibbonDivider } from '../RibbonGroup'
import { RibbonTab } from '../RibbonTab'

interface InsertTabProps {
  editor: Editor | null
}

export function InsertTab({ editor }: InsertTabProps) {
  const [showTablePicker, setShowTablePicker] = useState(false)

  if (!editor) return null

  // Insertion de table avec grille
  const handleInsertTable = (rows: number, cols: number) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
    setShowTablePicker(false)
  }

  // Insertion d'image
  const handleInsertImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = () => {
          editor.chain().focus().setImage({ src: reader.result as string }).run()
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  // Insertion de lien
  const handleInsertLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL:', previousUrl || 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }

  return (
    <RibbonTab>
      {/* Éléments */}
      <RibbonGroup label="Éléments">
        <div className="relative">
          <RibbonButton
            variant="large"
            onClick={() => setShowTablePicker(!showTablePicker)}
            tooltip="Insérer un tableau"
          >
            <Table size={20} />
            <span>Tableau</span>
          </RibbonButton>
          {showTablePicker && (
            <div className="absolute top-full left-0 mt-1 p-3 bg-[var(--bg)] border border-[var(--border)]
              rounded-lg shadow-lg z-dropdown animate-scaleIn">
              <div className="text-xs text-[var(--text-secondary)] mb-2">Sélectionner la taille</div>
              <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
                {Array.from({ length: 36 }, (_, i) => {
                  const row = Math.floor(i / 6) + 1
                  const col = (i % 6) + 1
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleInsertTable(row, col)}
                      className="w-5 h-5 border border-[var(--border)] hover:bg-[var(--accent)] hover:border-[var(--accent)] transition-colors rounded-sm"
                      title={`${row} × ${col}`}
                    />
                  )
                })}
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-2 text-center">
                6 × 6
              </div>
            </div>
          )}
        </div>
        <RibbonButton variant="large" onClick={handleInsertImage} tooltip="Insérer une image">
          <Image size={20} />
          <span>Image</span>
        </RibbonButton>
        <RibbonButton variant="large" onClick={handleInsertLink} tooltip="Insérer un lien (Cmd+K)">
          <Link size={20} />
          <span>Lien</span>
        </RibbonButton>
      </RibbonGroup>

      <RibbonDivider />

      {/* Blocs */}
      <RibbonGroup label="Blocs">
        <div className="flex flex-col gap-0.5">
          <RibbonButton
            variant="default"
            isActive={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            tooltip="Citation"
          >
            <Quote size={16} />
            <span>Citation</span>
          </RibbonButton>
          <RibbonButton
            variant="default"
            isActive={editor.isActive('codeBlock')}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            tooltip="Bloc de code"
          >
            <Code size={16} />
            <span>Code</span>
          </RibbonButton>
          <RibbonButton
            variant="default"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            tooltip="Ligne horizontale"
          >
            <Minus size={16} />
            <span>Ligne</span>
          </RibbonButton>
        </div>
      </RibbonGroup>

      <RibbonDivider />

      {/* Sauts */}
      <RibbonGroup label="Sauts">
        <RibbonButton
          variant="large"
          onClick={() => editor.chain().focus().setPageBreak().run()}
          tooltip="Saut de page (Cmd+Entrée)"
        >
          <FileDown size={20} />
          <span>Page</span>
        </RibbonButton>
      </RibbonGroup>

      <RibbonDivider />

      {/* Juridique */}
      <RibbonGroup label="Juridique">
        <RibbonButton
          variant="large"
          onClick={() => editor.commands.insertFootnote()}
          tooltip="Note de bas de page (Cmd+Shift+N)"
        >
          <Footprints size={20} />
          <span>Note</span>
        </RibbonButton>
        <RibbonButton
          variant="large"
          onClick={() => {
            // Ouvrir le panneau des variables
            const event = new CustomEvent('open-panel', { detail: { panel: 'variables' } })
            window.dispatchEvent(event)
          }}
          tooltip="Insérer une variable"
        >
          <Variable size={20} />
          <span>Variable</span>
        </RibbonButton>
        <RibbonButton
          variant="large"
          onClick={() => {
            // Ouvrir le panneau des termes définis
            const event = new CustomEvent('open-panel', { detail: { panel: 'terms' } })
            window.dispatchEvent(event)
          }}
          tooltip="Termes définis"
        >
          <BookMarked size={20} />
          <span>Termes</span>
        </RibbonButton>
        <RibbonButton
          variant="large"
          onClick={() => {
            // Ouvrir le panneau de numérotation juridique
            const event = new CustomEvent('open-panel', { detail: { panel: 'legal-numbering' } })
            window.dispatchEvent(event)
          }}
          tooltip="Numérotation juridique"
        >
          <ListTree size={20} />
          <span>Numéros</span>
        </RibbonButton>
      </RibbonGroup>
    </RibbonTab>
  )
}
