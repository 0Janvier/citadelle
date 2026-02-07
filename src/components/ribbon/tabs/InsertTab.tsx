/**
 * Onglet Insertion du Ribbon
 * Contient : Éléments (Table, Image, Lien), Juridique (Variables, Termes)
 */

import { useState, useRef, useEffect } from 'react'
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
  TableOfContents,
} from 'lucide-react'
import { insertTableOfContents } from '../../../lib/tocGenerator'
import { RibbonButton } from '../RibbonButton'
import { RibbonGroup, RibbonDivider } from '../RibbonGroup'
import { RibbonTab } from '../RibbonTab'

interface InsertTabProps {
  editor: Editor | null
}

export function InsertTab({ editor }: InsertTabProps) {
  const [showTablePicker, setShowTablePicker] = useState(false)
  const [showLinkPopover, setShowLinkPopover] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const linkInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showLinkPopover && linkInputRef.current) {
      linkInputRef.current.focus()
      linkInputRef.current.select()
    }
  }, [showLinkPopover])

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
  const handleOpenLinkPopover = () => {
    const previousUrl = editor.getAttributes('link').href || ''
    setLinkUrl(previousUrl || 'https://')
    setShowLinkPopover(true)
  }

  const handleInsertLink = () => {
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    }
    setShowLinkPopover(false)
  }

  const handleRemoveLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    setShowLinkPopover(false)
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
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowTablePicker(false)} />
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
            </>
          )}
        </div>
        <RibbonButton variant="large" onClick={handleInsertImage} tooltip="Insérer une image">
          <Image size={20} />
          <span>Image</span>
        </RibbonButton>
        <div className="relative">
          <RibbonButton variant="large" onClick={handleOpenLinkPopover} tooltip="Insérer un lien (Cmd+K)">
            <Link size={20} />
            <span>Lien</span>
          </RibbonButton>
          {showLinkPopover && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowLinkPopover(false)} />
              <div className="absolute top-full left-0 mt-1 p-3 bg-[var(--bg)] border border-[var(--border)]
                rounded-lg shadow-lg z-dropdown animate-scaleIn w-64">
                <div className="text-xs text-[var(--text-secondary)] mb-2">Adresse du lien</div>
                <input
                  ref={linkInputRef}
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleInsertLink()
                    if (e.key === 'Escape') setShowLinkPopover(false)
                  }}
                  placeholder="https://..."
                  className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border)]
                    bg-[var(--editor-bg)] text-[var(--text)] placeholder:text-[var(--text-secondary)]
                    focus:outline-none focus:border-[var(--accent)]"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleInsertLink}
                    className="flex-1 px-2.5 py-1 text-xs font-medium rounded-md
                      bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
                  >
                    Appliquer
                  </button>
                  {editor.isActive('link') && (
                    <button
                      onClick={handleRemoveLink}
                      className="px-2.5 py-1 text-xs font-medium rounded-md
                        text-[var(--status-error)] hover:bg-[var(--status-error)]/10 transition-colors"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
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
          <RibbonButton
            variant="default"
            onClick={() => insertTableOfContents(editor)}
            tooltip="Inserer une table des matieres"
          >
            <TableOfContents size={16} />
            <span>Sommaire</span>
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
