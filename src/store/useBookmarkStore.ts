/**
 * Store pour les signets dans les documents.
 * Persisted par document, permettant de marquer des positions importantes.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Bookmark {
  id: string
  documentId: string
  label: string
  pos: number
  createdAt: number
}

interface BookmarkStore {
  bookmarks: Bookmark[]
  addBookmark: (documentId: string, pos: number, label?: string) => string
  removeBookmark: (id: string) => void
  updateLabel: (id: string, label: string) => void
  getBookmarks: (documentId: string) => Bookmark[]
  toggleBookmarkAtPos: (documentId: string, pos: number) => void
}

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set, get) => ({
      bookmarks: [],

      addBookmark: (documentId, pos, label) => {
        const id = `bm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const bookmark: Bookmark = {
          id,
          documentId,
          label: label || `Signet ${get().bookmarks.filter((b) => b.documentId === documentId).length + 1}`,
          pos,
          createdAt: Date.now(),
        }
        set((state) => ({ bookmarks: [...state.bookmarks, bookmark] }))
        return id
      },

      removeBookmark: (id) => {
        set((state) => ({ bookmarks: state.bookmarks.filter((b) => b.id !== id) }))
      },

      updateLabel: (id, label) => {
        set((state) => ({
          bookmarks: state.bookmarks.map((b) =>
            b.id === id ? { ...b, label } : b
          ),
        }))
      },

      getBookmarks: (documentId) => {
        return get().bookmarks
          .filter((b) => b.documentId === documentId)
          .sort((a, b) => a.pos - b.pos)
      },

      toggleBookmarkAtPos: (documentId, pos) => {
        const existing = get().bookmarks.find(
          (b) => b.documentId === documentId && Math.abs(b.pos - pos) < 5
        )
        if (existing) {
          get().removeBookmark(existing.id)
        } else {
          get().addBookmark(documentId, pos)
        }
      },
    }),
    {
      name: 'citadelle-bookmarks',
    }
  )
)
