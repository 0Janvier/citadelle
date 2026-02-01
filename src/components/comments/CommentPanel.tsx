import { useState } from 'react'
import type { Comment, CommentStatus } from '../../types/editor-features'

interface CommentPanelProps {
  comments: Comment[]
  onAddComment: (content: string, from: number, to: number) => void
  onResolveComment: (id: string) => void
  onDeleteComment: (id: string) => void
  onReplyComment: (parentId: string, content: string) => void
  selectedRange?: { from: number; to: number } | null
  onClose?: () => void
}

export function CommentPanel({
  comments,
  onAddComment,
  onResolveComment,
  onDeleteComment,
  onReplyComment,
  selectedRange,
  onClose,
}: CommentPanelProps) {
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [filter, setFilter] = useState<CommentStatus | 'all'>('open')

  const filteredComments = filter === 'all'
    ? comments
    : comments.filter((c) => c.status === filter)

  // Grouper les commentaires par parent
  const rootComments = filteredComments.filter((c) => !c.parentId)
  const repliesMap = new Map<string, Comment[]>()

  filteredComments
    .filter((c) => c.parentId)
    .forEach((c) => {
      const replies = repliesMap.get(c.parentId!) || []
      replies.push(c)
      repliesMap.set(c.parentId!, replies)
    })

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedRange) return

    onAddComment(newComment, selectedRange.from, selectedRange.to)
    setNewComment('')
  }

  const handleReply = (parentId: string) => {
    if (!replyContent.trim()) return

    onReplyComment(parentId, replyContent)
    setReplyingTo(null)
    setReplyContent('')
  }

  const getStatusIcon = (status: CommentStatus) => {
    switch (status) {
      case 'open':
        return (
          <span className="w-2 h-2 rounded-full bg-yellow-500" title="Ouvert" />
        )
      case 'resolved':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'rejected':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* En-tête */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
        <h2 className="text-lg font-semibold">Commentaires</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="p-4 border-b border-[var(--border-color)]">
        <div className="flex gap-2">
          {(['all', 'open', 'resolved'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-[var(--bg-secondary)] hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {status === 'all' ? 'Tous' : status === 'open' ? 'Ouverts' : 'Résolus'}
            </button>
          ))}
        </div>
      </div>

      {/* Nouveau commentaire */}
      {selectedRange && (
        <div className="p-4 border-b border-[var(--border-color)] bg-blue-50 dark:bg-blue-900/20">
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
            Texte sélectionné (caractères {selectedRange.from} à {selectedRange.to})
          </p>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire..."
            className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ajouter
            </button>
          </div>
        </div>
      )}

      {/* Liste des commentaires */}
      <div className="flex-1 overflow-y-auto p-4">
        {rootComments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>Aucun commentaire</p>
            <p className="text-sm mt-1">Sélectionnez du texte pour ajouter un commentaire</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rootComments.map((comment) => {
              const replies = repliesMap.get(comment.id) || []

              return (
                <div
                  key={comment.id}
                  className={`rounded-lg border ${
                    comment.status === 'resolved'
                      ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                      : 'bg-[var(--bg-secondary)] border-[var(--border-color)]'
                  }`}
                >
                  {/* Commentaire principal */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(comment.status)}
                        <span className="font-medium text-sm">{comment.author}</span>
                        <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {comment.status === 'open' && (
                          <button
                            onClick={() => onResolveComment(comment.id)}
                            className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                            title="Marquer comme résolu"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteComment(comment.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className={`mt-2 text-sm ${comment.status === 'resolved' ? 'text-gray-400' : ''}`}>
                      {comment.content}
                    </p>

                    {/* Bouton répondre */}
                    {comment.status === 'open' && (
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        Répondre
                      </button>
                    )}
                  </div>

                  {/* Réponses */}
                  {replies.length > 0 && (
                    <div className="border-t border-[var(--border-color)] bg-[var(--bg-primary)] rounded-b-lg">
                      {replies.map((reply) => (
                        <div key={reply.id} className="p-4 pl-8 border-b last:border-b-0 border-[var(--border-color)]">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">{reply.author}</span>
                            <span className="text-xs text-gray-400">{formatDate(reply.createdAt)}</span>
                          </div>
                          <p className="mt-1 text-sm">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Formulaire de réponse */}
                  {replyingTo === comment.id && (
                    <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-primary)]">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Votre réponse..."
                        className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                        rows={2}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => {
                            setReplyingTo(null)
                            setReplyContent('')
                          }}
                          className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => handleReply(comment.id)}
                          disabled={!replyContent.trim()}
                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          Répondre
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="p-4 border-t border-[var(--border-color)] text-sm text-gray-500">
        {comments.filter((c) => c.status === 'open').length} commentaire(s) ouvert(s)
      </div>
    </div>
  )
}
