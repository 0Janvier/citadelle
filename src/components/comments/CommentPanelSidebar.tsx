// Comment panel sidebar (right-side panel, separate from CompactSidebar overlay)
import { useCommentStore } from '../../store/useCommentStore'
import { useEditorStore } from '../../store/useEditorStore'
import { useLawyerProfileStore } from '../../store/useLawyerProfileStore'
import { CommentPanel } from './CommentPanel'

export function CommentPanelSidebar({ documentId }: { documentId: string | null }) {
  const showPanel = useCommentStore((s) => s.showPanel)
  const setShowPanel = useCommentStore((s) => s.setShowPanel)
  const comments = useCommentStore((s) => s.comments)
  const addComment = useCommentStore((s) => s.addComment)
  const resolveComment = useCommentStore((s) => s.resolveComment)
  const deleteComment = useCommentStore((s) => s.deleteComment)
  const replyToComment = useCommentStore((s) => s.replyToComment)

  const activeEditor = useEditorStore((s) => s.activeEditor)

  if (!showPanel || !documentId) return null

  const docComments = comments.filter((c) => c.documentId === documentId)
  const selection = activeEditor
    ? { from: activeEditor.state.selection.from, to: activeEditor.state.selection.to }
    : null
  const hasSelection = selection && selection.from !== selection.to

  return (
    <div className="w-80 border-l border-[var(--border)] bg-[var(--bg)] shrink-0 overflow-hidden">
      <CommentPanel
        comments={docComments}
        onAddComment={(content, from, to) => {
          const profile = useLawyerProfileStore.getState()
          const author = [profile.prenom, profile.nom].filter(Boolean).join(' ') || 'Auteur'
          const commentId = addComment(documentId, author, content, from, to)
          if (activeEditor) {
            activeEditor.chain().focus().setComment(commentId).run()
          }
        }}
        onResolveComment={resolveComment}
        onDeleteComment={deleteComment}
        onReplyComment={(parentId, content) => {
          const profile = useLawyerProfileStore.getState()
          const author = [profile.prenom, profile.nom].filter(Boolean).join(' ') || 'Auteur'
          replyToComment(parentId, author, content)
        }}
        selectedRange={hasSelection ? selection : null}
        onClose={() => setShowPanel(false)}
      />
    </div>
  )
}
