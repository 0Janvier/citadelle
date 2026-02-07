/**
 * Onglet Révision du Ribbon
 * Commentaires, annotations et suivi des modifications
 */

import type { Editor } from '@tiptap/react'
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
} from 'lucide-react'
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
      // Sync author name and enable tracking in the extension
      editor.storage.trackChanges.authorName = author
      editor.commands.enableTracking()
    } else {
      editor.commands.disableTracking()
    }
  }

  const hasSelection = editor ? editor.state.selection.from !== editor.state.selection.to : false

  return (
    <div className="ribbon-tab">
      {/* Commentaires */}
      <div className="ribbon-group">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleAddComment}
            disabled={!hasSelection}
            className={`flex flex-col items-center justify-center px-3 py-1 rounded text-xs transition-colors min-w-[56px]
              ${hasSelection
                ? 'hover:bg-[var(--bg-hover)] text-[var(--text)]'
                : 'text-[var(--text-secondary)] opacity-50 cursor-not-allowed'
              }`}
            title="Ajouter un commentaire (Cmd+Alt+C)"
          >
            <MessageSquarePlus className="w-5 h-5 mb-0.5" />
            <span>Commenter</span>
          </button>

          <button
            type="button"
            onClick={togglePanel}
            className={`flex flex-col items-center justify-center px-3 py-1 rounded text-xs transition-colors min-w-[56px]
              ${showPanel
                ? 'bg-[var(--accent-light)] text-[var(--accent)]'
                : 'hover:bg-[var(--bg-hover)] text-[var(--text)]'
              }`}
            title="Panneau commentaires"
          >
            <MessageSquare className="w-5 h-5 mb-0.5" />
            <span>Panneau</span>
          </button>
        </div>
        <div className="ribbon-group-label">Commentaires</div>
      </div>

      {/* Suivi des modifications */}
      <div className="ribbon-group">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleToggleTracking}
            className={`flex flex-col items-center justify-center px-3 py-1 rounded text-xs transition-colors min-w-[56px]
              ${isTracking
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                : 'hover:bg-[var(--bg-hover)] text-[var(--text)]'
              }`}
            title="Activer/désactiver le suivi des modifications"
          >
            <GitCommitHorizontal className="w-5 h-5 mb-0.5" />
            <span>{isTracking ? 'Actif' : 'Suivi'}</span>
          </button>

          <button
            type="button"
            onClick={() => editor?.commands.acceptChangeAtPos()}
            disabled={!editor}
            className="flex flex-col items-center justify-center px-3 py-1 rounded text-xs hover:bg-[var(--bg-hover)] text-[var(--text)] transition-colors min-w-[48px] disabled:opacity-50"
            title="Accepter la modification"
          >
            <Check className="w-5 h-5 mb-0.5 text-green-600" />
            <span>Accepter</span>
          </button>

          <button
            type="button"
            onClick={() => editor?.commands.rejectChangeAtPos()}
            disabled={!editor}
            className="flex flex-col items-center justify-center px-3 py-1 rounded text-xs hover:bg-[var(--bg-hover)] text-[var(--text)] transition-colors min-w-[48px] disabled:opacity-50"
            title="Rejeter la modification"
          >
            <X className="w-5 h-5 mb-0.5 text-red-600" />
            <span>Rejeter</span>
          </button>
        </div>
        <div className="ribbon-group-label">Suivi</div>
      </div>

      {/* Tout accepter / rejeter */}
      <div className="ribbon-group">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor?.commands.acceptAllChanges()}
            disabled={!editor}
            className="flex flex-col items-center justify-center px-3 py-1 rounded text-xs hover:bg-[var(--bg-hover)] text-[var(--text)] transition-colors min-w-[48px] disabled:opacity-50"
            title="Accepter toutes les modifications"
          >
            <CheckCheck className="w-5 h-5 mb-0.5 text-green-600" />
            <span>Tout OK</span>
          </button>

          <button
            type="button"
            onClick={() => editor?.commands.rejectAllChanges()}
            disabled={!editor}
            className="flex flex-col items-center justify-center px-3 py-1 rounded text-xs hover:bg-[var(--bg-hover)] text-[var(--text)] transition-colors min-w-[48px] disabled:opacity-50"
            title="Rejeter toutes les modifications"
          >
            <XCircle className="w-5 h-5 mb-0.5 text-red-600" />
            <span>Tout X</span>
          </button>
        </div>
        <div className="ribbon-group-label">Global</div>
      </div>

      {/* Affichage */}
      <div className="ribbon-group">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              document.body.classList.toggle('hide-comments')
            }}
            className="flex flex-col items-center justify-center px-3 py-1 rounded text-xs hover:bg-[var(--bg-hover)] text-[var(--text)] transition-colors min-w-[56px]"
            title="Afficher/masquer les commentaires"
          >
            {document.body.classList.contains('hide-comments') ? (
              <EyeOff className="w-5 h-5 mb-0.5" />
            ) : (
              <Eye className="w-5 h-5 mb-0.5" />
            )}
            <span>Afficher</span>
          </button>
        </div>
        <div className="ribbon-group-label">Affichage</div>
      </div>
    </div>
  )
}
