/**
 * Onglet Accueil du Ribbon
 * Contient : Police, Paragraphe, Styles
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import type { Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  Superscript,
  Subscript,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  ListChecks,
  Indent,
  Outdent,
} from 'lucide-react'
import { RibbonButton } from '../RibbonButton'
import { RibbonGroup, RibbonSeparator, RibbonDivider } from '../RibbonGroup'
import { RibbonTab } from '../RibbonTab'
import { FontFamilyPicker } from '../controls/FontFamilyPicker'
import { FontSizePicker } from '../controls/FontSizePicker'
import { LineHeightPicker } from '../controls/LineHeightPicker'
import { HIGHLIGHT_COLORS, type HighlightColor } from '../../../store/useSettingsStore'

interface HomeTabProps {
  editor: Editor | null
}

const TEXT_COLORS = [
  { name: 'Automatique', value: '' },
  { name: 'Noir', value: '#000000' },
  { name: 'Bleu foncé', value: '#1e3a5f' },
  { name: 'Rouge', value: '#dc2626' },
  { name: 'Vert foncé', value: '#166534' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Violet', value: '#7c3aed' },
  { name: 'Gris', value: '#6b7280' },
]

export function HomeTab({ editor }: HomeTabProps) {
  const [showHighlightColors, setShowHighlightColors] = useState(false)
  const [showTextColors, setShowTextColors] = useState(false)
  // Force le re-render quand la sélection change pour mettre à jour les pickers
  const [, setSelectionUpdate] = useState(0)

  // Écouter les changements de sélection pour mettre à jour les contrôles de police
  useEffect(() => {
    if (!editor) return

    const updateSelection = () => {
      setSelectionUpdate((prev) => prev + 1)
    }

    editor.on('selectionUpdate', updateSelection)
    editor.on('transaction', updateSelection)

    return () => {
      editor.off('selectionUpdate', updateSelection)
      editor.off('transaction', updateSelection)
    }
  }, [editor])

  if (!editor) return null

  // Police - obtenir les styles de la sélection actuelle
  const currentTextStyle = useMemo(() => {
    if (!editor) return { fontFamily: '', fontSize: '' }
    const attrs = editor.getAttributes('textStyle')
    return {
      fontFamily: attrs.fontFamily || '',
      fontSize: attrs.fontSize || '',
    }
  }, [editor?.state.selection])

  // Extraire la taille de police en nombre (ex: "14px" -> 14)
  const currentFontSize = useMemo(() => {
    const sizeStr = currentTextStyle.fontSize
    if (!sizeStr) return 14 // Valeur par défaut
    const match = sizeStr.match(/(\d+)/)
    return match ? parseInt(match[1], 10) : 14
  }, [currentTextStyle.fontSize])

  // Extraire le nom de la police (premier élément avant la virgule)
  const currentFontFamily = useMemo(() => {
    const family = currentTextStyle.fontFamily
    if (!family) return 'Garamond' // Valeur par défaut
    // Nettoyer les quotes et prendre le premier nom
    return family.replace(/['"]/g, '').split(',')[0].trim()
  }, [currentTextStyle.fontFamily])

  // Appliquer une police à la sélection
  const handleFontFamilyChange = useCallback((font: string) => {
    editor?.chain().focus().setFontFamily(font).run()
  }, [editor])

  // Appliquer une taille de police à la sélection
  const handleFontSizeChange = useCallback((size: number) => {
    editor?.chain().focus().setMark('textStyle', { fontSize: `${size}px` }).run()
  }, [editor])

  // Surlignage - utilise la couleur light par défaut
  const handleHighlight = (color: HighlightColor) => {
    const colorData = HIGHLIGHT_COLORS[color]
    editor.chain().focus().toggleHighlight({ color: colorData.light }).run()
    setShowHighlightColors(false)
  }

  return (
    <RibbonTab>
      {/* Police */}
      <RibbonGroup label="Police">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <FontFamilyPicker
              value={currentFontFamily}
              onChange={handleFontFamilyChange}
            />
            <FontSizePicker
              value={currentFontSize}
              onChange={handleFontSizeChange}
            />
          </div>
          <div className="flex items-center gap-0.5">
            <RibbonButton
              variant="icon"
              isActive={editor.isActive('bold')}
              onClick={() => editor.chain().focus().toggleBold().run()}
              tooltip="Gras (Cmd+B)"
            >
              <Bold size={16} />
            </RibbonButton>
            <RibbonButton
              variant="icon"
              isActive={editor.isActive('italic')}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              tooltip="Italique (Cmd+I)"
            >
              <Italic size={16} />
            </RibbonButton>
            <RibbonButton
              variant="icon"
              isActive={editor.isActive('underline')}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              tooltip="Souligné (Cmd+U)"
            >
              <Underline size={16} />
            </RibbonButton>
            <RibbonButton
              variant="icon"
              isActive={editor.isActive('strike')}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              tooltip="Barré (Cmd+Shift+X)"
            >
              <Strikethrough size={16} />
            </RibbonButton>
            <RibbonSeparator />
            <div className="relative">
              <RibbonButton
                variant="icon"
                isActive={editor.isActive('highlight')}
                onClick={() => setShowHighlightColors(!showHighlightColors)}
                tooltip="Surligner (Cmd+Shift+H)"
              >
                <Highlighter size={16} />
              </RibbonButton>
              {showHighlightColors && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowHighlightColors(false)} />
                  <div className="absolute top-full left-0 mt-1 p-2 bg-[var(--bg)] border border-[var(--border)]
                    rounded-lg shadow-lg z-dropdown grid grid-cols-4 gap-1 animate-scaleIn">
                    {(Object.keys(HIGHLIGHT_COLORS) as HighlightColor[]).map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleHighlight(color)}
                        className="w-6 h-6 rounded border border-[var(--border)] hover:scale-110 transition-transform"
                        style={{ backgroundColor: HIGHLIGHT_COLORS[color].light }}
                        title={HIGHLIGHT_COLORS[color].name}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="relative">
              <RibbonButton
                variant="icon"
                onClick={() => setShowTextColors(!showTextColors)}
                tooltip="Couleur du texte"
              >
                <Palette size={16} />
              </RibbonButton>
              {showTextColors && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowTextColors(false)} />
                  <div className="absolute top-full left-0 mt-1 p-2 bg-[var(--bg)] border border-[var(--border)]
                    rounded-lg shadow-lg z-dropdown grid grid-cols-4 gap-1 animate-scaleIn">
                    {TEXT_COLORS.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => {
                          if (color.value) {
                            editor.chain().focus().setColor(color.value).run()
                          } else {
                            editor.chain().focus().unsetColor().run()
                          }
                          setShowTextColors(false)
                        }}
                        className="w-6 h-6 rounded border border-[var(--border)] hover:scale-110 transition-transform"
                        style={{ backgroundColor: color.value || 'var(--text)' }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            <RibbonSeparator />
            <RibbonButton
              variant="icon"
              isActive={editor.isActive('superscript')}
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              tooltip="Exposant"
            >
              <Superscript size={16} />
            </RibbonButton>
            <RibbonButton
              variant="icon"
              isActive={editor.isActive('subscript')}
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              tooltip="Indice"
            >
              <Subscript size={16} />
            </RibbonButton>
          </div>
        </div>
      </RibbonGroup>

      <RibbonDivider />

      {/* Paragraphe */}
      <RibbonGroup label="Paragraphe">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-0.5">
            <RibbonButton
              variant="icon"
              isActive={editor.isActive({ textAlign: 'left' })}
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              tooltip="Aligner à gauche"
            >
              <AlignLeft size={16} />
            </RibbonButton>
            <RibbonButton
              variant="icon"
              isActive={editor.isActive({ textAlign: 'center' })}
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              tooltip="Centrer"
            >
              <AlignCenter size={16} />
            </RibbonButton>
            <RibbonButton
              variant="icon"
              isActive={editor.isActive({ textAlign: 'right' })}
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              tooltip="Aligner à droite"
            >
              <AlignRight size={16} />
            </RibbonButton>
            <RibbonButton
              variant="icon"
              isActive={editor.isActive({ textAlign: 'justify' })}
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              tooltip="Justifier"
            >
              <AlignJustify size={16} />
            </RibbonButton>
            <LineHeightPicker
              value={1.5}
              onChange={(lh) => {
                // TODO: Implémenter changement interligne
                console.log('Line height:', lh)
              }}
            />
          </div>
          <div className="flex items-center gap-0.5">
            <RibbonButton
              variant="icon"
              isActive={editor.isActive('bulletList')}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              tooltip="Liste à puces"
            >
              <List size={16} />
            </RibbonButton>
            <RibbonButton
              variant="icon"
              isActive={editor.isActive('orderedList')}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              tooltip="Liste numérotée"
            >
              <ListOrdered size={16} />
            </RibbonButton>
            <RibbonButton
              variant="icon"
              isActive={editor.isActive('taskList')}
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              tooltip="Liste de tâches"
            >
              <ListChecks size={16} />
            </RibbonButton>
            <RibbonSeparator />
            <RibbonButton
              variant="icon"
              onClick={() => {
                if (editor.isActive('listItem')) {
                  editor.chain().focus().liftListItem('listItem').run()
                }
              }}
              tooltip="Diminuer le retrait"
            >
              <Outdent size={16} />
            </RibbonButton>
            <RibbonButton
              variant="icon"
              onClick={() => {
                if (editor.isActive('listItem')) {
                  editor.chain().focus().sinkListItem('listItem').run()
                }
              }}
              tooltip="Augmenter le retrait"
            >
              <Indent size={16} />
            </RibbonButton>
          </div>
        </div>
      </RibbonGroup>

      <RibbonDivider />

      {/* Styles avec aperçu typographique */}
      <RibbonGroup label="Styles">
        <div className="flex items-center gap-1">
          <RibbonButton
            variant="default"
            isActive={editor.isActive('heading', { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            tooltip="Titre du document (Cmd+1)"
            className="!text-[10px] !font-extrabold !uppercase !tracking-wide"
          >
            Titre
          </RibbonButton>
          <RibbonButton
            variant="default"
            isActive={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            tooltip="Titre 1 (Cmd+2)"
            className="!text-base !font-bold"
          >
            H1
          </RibbonButton>
          <RibbonButton
            variant="default"
            isActive={editor.isActive('heading', { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            tooltip="Titre 2 (Cmd+3)"
            className="!text-sm !font-bold"
          >
            H2
          </RibbonButton>
          <RibbonButton
            variant="default"
            isActive={editor.isActive('heading', { level: 4 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            tooltip="Titre 3 (Cmd+4)"
            className="!text-xs !font-semibold"
          >
            H3
          </RibbonButton>
          <RibbonButton
            variant="default"
            isActive={editor.isActive('paragraph')}
            onClick={() => editor.chain().focus().setParagraph().run()}
            tooltip="Paragraphe"
            className="!text-xs"
          >
            P
          </RibbonButton>
        </div>
      </RibbonGroup>
    </RibbonTab>
  )
}
