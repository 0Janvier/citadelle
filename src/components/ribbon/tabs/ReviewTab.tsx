/**
 * Onglet Révision du Ribbon
 * Commentaires, annotations et suivi des modifications
 */

import type { Editor } from '@tiptap/react'
import { useState } from 'react'
import {
  MessageSquare,
  MessageSquarePlus,
  Eye,
  EyeOff,
  GitCommitHorizontal,
  Check,
  X,
  CheckCheck,
  XCircle,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import { RibbonButton } from '../RibbonButton'
import { RibbonGroup, RibbonDivider } from '../RibbonGroup'
import { RibbonTab } from '../RibbonTab'
import { useCommentStore } from '../../../store/useCommentStore'
import { useTrackChangesStore } from '../../../store/useTrackChangesStore'
import { useDocumentStore } from '../../../store/useDocumentStore'
import { useLawyerProfileStore } from '../../../store/useLawyerProfileStore'

interface ReviewTabProps {
  editor: Editor | null
}

export function ReviewTab({ editor }: ReviewTabProps) {
  const showPanel = useCommentStore((s) => s.showPanel)
  const togglePanel = useCommentStore((s) => s.togglePanel)
  const addComment = useCommentStore((s) => s.addComment)
  const activeDocumentId = useDocumentStore((s) => s.activeDocumentId)

  const isTracking = useTrackChangesStore((s) => s.isTracking)
  const toggleTracking = useTrackChangesStore((s) => s.toggleTracking)
  const showChanges = useTrackChangesStore((s) => s.showChanges)
  const toggleShowChanges = useTrackChangesStore((s) => s.toggleShowChanges)

  // Change count from editor storage
  const [changeCount, setChangeCount] = useState(0)
  if (editor?.storage.trackChanges) {
    const count = editor.storage.trackChanges.changeCount ?? 0
    if (count !== changeCount) setChangeCount(count)
  }

  const handleAddComment = () => {
    if (!editor || !activeDocumentId) return
    const { from, to } = editor.state.selection
    if (from === to) return

    const profile = useLawyerProfileStore.getState()
    const author = [profile.prenom, profile.nom].filter(Boolean).join(' ') || 'Auteur'

    const commentId = addComment(activeDocumentId, author, '', from, to)
    editor.chain().focus().setComment(commentId).run()

    if (!showPanel) togglePanel()

    window.dispatchEvent(
      new CustomEvent('comment-click', {
        detail: { commentId, isNew: true },
      })
    )
  }

  const handleToggleTracking = () => {
    if (!editor) return
    toggleTracking()
    const newState = !isTracking
    if (newState) {
      const profile = useLawyerProfileStore.getState()
      const author = [profile.prenom, profile.nom].filter(Boolean).join(' ') || 'Auteur'
      editor.storage.trackChanges.authorName = author
      editor.commands.enableTracking()
    } else {
      editor.commands.disableTracking()
    }
  }

  const hasSelection = editor ? editor.state.selection.from !== editor.state.selection.to : false

  return (
    <RibbonTab>
      {/* Commentaires */}
      <RibbonGroup label="Commentaires">
        <RibbonButton
          variant="large"
          onClick={handleAddComment}
          disabled={!hasSelection}
          tooltip="Ajouter un commentaire (Cmd+Alt+C)"
        >
          <MessageSquarePlus size={20} />
          <span>Commenter</span>
        </RibbonButton>
        <RibbonButton
          variant="large"
          isActive={showPanel}
          onClick={togglePanel}
          tooltip="Panneau commentaires"
        >
          <MessageSquare size={20} />
          <span>Panneau</span>
        </RibbonButton>
      </RibbonGroup>

      <RibbonDivider />

      {/* Suivi des modifications */}
      <RibbonGroup label="Suivi">
        <div className="relative">
          <RibbonButton
            variant="large"
            isActive={isTracking}
            onClick={handleToggleTracking}
            tooltip="Activer/désactiver le suivi des modifications"
            className={isTracking ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : ''}
          >
            <GitCommitHorizontal size={20} />
            <span>{isTracking ? 'Actif' : 'Suivi'}</span>
          </RibbonButton>
          {changeCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
              {changeCount}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <RibbonButton
            variant="icon"
            onClick={() => editor?.commands.goToPreviousChange()}
            disabled={!editor || changeCount === 0}
            tooltip="Modification précédente"
          >
            <ChevronUp size={16} />
          </RibbonButton>
          <RibbonButton
            variant="icon"
            onClick={() => editor?.commands.goToNextChange()}
            disabled={!editor || changeCount === 0}
            tooltip="Modification suivante"
          >
            <ChevronDown size={16} />
          </RibbonButton>
        </div>
        <RibbonButton
          variant="large"
          onClick={() => editor?.commands.acceptChangeAtPos()}
          disabled={!editor}
          tooltip="Accepter la modification"
        >
          <Check size={20} className="text-green-600" />
          <span>Accepter</span>
        </RibbonButton>
        <RibbonButton
          variant="large"
          onClick={() => editor?.commands.rejectChangeAtPos()}
          disabled={!editor}
          tooltip="Rejeter la modification"
        >
          <X size={20} className="text-red-600" />
          <span>Rejeter</span>
        </RibbonButton>
      </RibbonGroup>

      <RibbonDivider />

      {/* Tout accepter / rejeter */}
      <RibbonGroup label="Global">
        <RibbonButton
          variant="large"
          onClick={() => editor?.commands.acceptAllChanges()}
          disabled={!editor}
          tooltip="Accepter toutes les modifications"
        >
          <CheckCheck size={20} className="text-green-600" />
          <span>Tout OK</span>
        </RibbonButton>
        <RibbonButton
          variant="large"
          onClick={() => editor?.commands.rejectAllChanges()}
          disabled={!editor}
          tooltip="Rejeter toutes les modifications"
        >
          <XCircle size={20} className="text-red-600" />
          <span>Tout X</span>
        </RibbonButton>
      </RibbonGroup>

      <RibbonDivider />

      {/* Affichage */}
      <RibbonGroup label="Affichage">
        <RibbonButton
          variant="large"
          onClick={() => document.body.classList.toggle('hide-comments')}
          tooltip="Afficher/masquer les commentaires"
        >
          {document.body.classList.contains('hide-comments') ? <EyeOff size={20} /> : <Eye size={20} />}
          <span>Coms</span>
        </RibbonButton>
        <RibbonButton
          variant="large"
          isActive={showChanges}
          onClick={() => {
            toggleShowChanges()
            document.body.classList.toggle('hide-track-changes')
          }}
          tooltip="Afficher/masquer les modifications"
        >
          {showChanges ? <Eye size={20} /> : <EyeOff size={20} />}
          <span>Modifs</span>
        </RibbonButton>
      </RibbonGroup>
    </RibbonTab>
  )
}
