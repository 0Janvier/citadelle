import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Comment, CommentStatus } from '../types/editor-features'

function generateId(): string {
  return `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

interface CommentStore {
  comments: Comment[]
  showPanel: boolean

  // Actions
  addComment: (documentId: string, author: string, content: string, from: number, to: number) => string
  replyToComment: (parentId: string, author: string, content: string) => void
  resolveComment: (id: string) => void
  unresolveComment: (id: string) => void
  reopenComment: (id: string) => void
  deleteComment: (id: string) => void
  deleteResolvedComments: (documentId: string) => void
  updateCommentStatus: (id: string, status: CommentStatus) => void

  // Queries
  getCommentsForDocument: (documentId: string) => Comment[]
  getActiveComments: (documentId: string) => Comment[]
  getResolvedComments: (documentId: string) => Comment[]

  // Panel
  setShowPanel: (show: boolean) => void
  togglePanel: () => void
}

export const useCommentStore = create<CommentStore>()(
  persist(
    (set, get) => ({
      comments: [],
      showPanel: false,

      addComment: (documentId, author, content, from, to) => {
        const id = generateId()
        const now = new Date().toISOString()
        const comment: Comment = {
          id,
          documentId,
          author,
          content,
          position: { from, to },
          status: 'open',
          resolved: false,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          comments: [...state.comments, comment],
        }))
        return id
      },

      replyToComment: (parentId, author, content) => {
        const parent = get().comments.find((c) => c.id === parentId)
        if (!parent) return

        const now = new Date().toISOString()
        const reply: Comment = {
          id: generateId(),
          documentId: parent.documentId,
          author,
          content,
          position: parent.position,
          status: 'open',
          resolved: false,
          parentId,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          comments: [...state.comments, reply],
        }))
      },

      resolveComment: (id) => {
        set((state) => ({
          comments: state.comments.map((c) =>
            c.id === id ? { ...c, status: 'resolved' as CommentStatus, resolved: true, updatedAt: new Date().toISOString() } : c
          ),
        }))
      },

      unresolveComment: (id) => {
        set((state) => ({
          comments: state.comments.map((c) =>
            c.id === id ? { ...c, status: 'open' as CommentStatus, resolved: false, updatedAt: new Date().toISOString() } : c
          ),
        }))
      },

      reopenComment: (id) => {
        set((state) => ({
          comments: state.comments.map((c) =>
            c.id === id ? { ...c, status: 'open' as CommentStatus, resolved: false, updatedAt: new Date().toISOString() } : c
          ),
        }))
      },

      deleteComment: (id) => {
        set((state) => ({
          // Delete comment and its replies
          comments: state.comments.filter((c) => c.id !== id && c.parentId !== id),
        }))
      },

      deleteResolvedComments: (documentId) => {
        set((state) => ({
          comments: state.comments.filter((c) => {
            if (c.documentId !== documentId) return true
            // Remove resolved comments and their replies
            if (c.resolved) return false
            // Also remove replies whose parent is resolved
            if (c.parentId) {
              const parent = state.comments.find((p) => p.id === c.parentId)
              if (parent && parent.resolved) return false
            }
            return true
          }),
        }))
      },

      updateCommentStatus: (id, status) => {
        const resolved = status === 'resolved'
        set((state) => ({
          comments: state.comments.map((c) =>
            c.id === id ? { ...c, status, resolved, updatedAt: new Date().toISOString() } : c
          ),
        }))
      },

      getCommentsForDocument: (documentId) => {
        return get().comments.filter((c) => c.documentId === documentId)
      },

      getActiveComments: (documentId) => {
        return get().comments.filter((c) => c.documentId === documentId && !c.resolved)
      },

      getResolvedComments: (documentId) => {
        return get().comments.filter((c) => c.documentId === documentId && c.resolved)
      },

      setShowPanel: (show) => set({ showPanel: show }),
      togglePanel: () => set((state) => ({ showPanel: !state.showPanel })),
    }),
    {
      name: 'citadelle-comments',
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as { comments?: Comment[] }
        if (version < 2 && state.comments) {
          // Add resolved boolean field to existing comments
          state.comments = state.comments.map((c) => ({
            ...c,
            resolved: c.resolved ?? (c.status === 'resolved'),
          }))
        }
        return state as CommentStore
      },
    }
  )
)
