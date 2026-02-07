import { create } from 'zustand'
import { invoke } from '@tauri-apps/api/tauri'
import { JSONContent } from '@tiptap/core'
import { documentStorage } from '../lib/documentStorage'
import { markdownToJson } from '../lib/markdownParser'
import { useClosedTabsStore } from './useClosedTabsStore'

export type DocumentType = 'conclusions' | 'assignation' | 'requete' | 'contrat' | 'courrier' | 'autre'

export interface DocumentMetadata {
  author?: string
  caseNumber?: string
  rgNumber?: string
  jurisdiction?: string
  parties?: {
    demandeur?: string
    defendeur?: string
  }
  documentType?: DocumentType
  templateId?: string
  createdAt: string
  modifiedAt: string
  tags?: string[]
}

export interface Document {
  id: string
  title: string
  content: JSONContent
  filePath?: string
  isDirty: boolean
  lastSaved: Date | null
  /** Version counter for efficient change detection (avoids JSON.stringify) */
  version: number
  metadata?: DocumentMetadata
}

interface Session {
  documents: Array<{
    id: string
    filePath?: string
    title: string
    isDirty: boolean
  }>
  activeDocumentId: string | null
  timestamp: Date
}

interface DocumentStore {
  documents: Document[]
  activeDocumentId: string | null
  maxTabs: number

  // Document management
  addDocument: (doc?: Partial<Document>) => string
  removeDocument: (id: string) => void
  updateDocument: (id: string, updates: Partial<Document>) => void
  setActiveDocument: (id: string) => void

  // Content management
  updateContent: (id: string, content: JSONContent) => void
  markAsSaved: (id: string) => void
  markAsDirty: (id: string) => void

  // File path management
  setFilePath: (id: string, path: string) => void

  // Get active document
  getActiveDocument: () => Document | undefined

  // Get document by ID
  getDocument: (id: string) => Document | undefined

  // Duplicate document
  duplicateDocument: (id: string) => string | null

  // Reorder documents (drag & drop tabs)
  reorderDocuments: (fromIndex: number, toIndex: number) => void

  // Session management
  saveSession: () => Promise<void>
  restoreSession: () => Promise<void>
  clearSession: () => void
}

let nextId = 1

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],
  activeDocumentId: null,
  maxTabs: 20,

  addDocument: (doc = {}) => {
    const id = `doc-${nextId++}`
    const newDoc: Document = {
      id,
      title: doc.title || `Sans titre ${nextId - 1}`,
      content: doc.content || {
        type: 'doc',
        content: [{
          type: 'paragraph',
          content: [],
        }],
      },
      filePath: doc.filePath,
      isDirty: false,
      lastSaved: null,
      version: 0,
      ...doc,
    }

    set((state) => {
      // Check max tabs limit
      if (state.documents.length >= state.maxTabs) {
        console.warn(`Maximum of ${state.maxTabs} tabs reached`)
        return state
      }

      return {
        documents: [...state.documents, newDoc],
        activeDocumentId: id,
      }
    })

    return id
  },

  removeDocument: (id) => {
    // Save to closed tabs before removing
    const doc = get().documents.find((d) => d.id === id)
    if (doc) {
      useClosedTabsStore.getState().pushClosedTab({
        title: doc.title,
        content: doc.content,
        filePath: doc.filePath,
        closedAt: Date.now(),
      })
    }

    set((state) => {
      const newDocs = state.documents.filter((doc) => doc.id !== id)
      let newActiveId = state.activeDocumentId

      // If removing active document, switch to another
      if (state.activeDocumentId === id) {
        const removedIndex = state.documents.findIndex((doc) => doc.id === id)
        if (newDocs.length > 0) {
          // Try to activate the next tab, or previous if last
          const newIndex = Math.min(removedIndex, newDocs.length - 1)
          newActiveId = newDocs[newIndex]?.id || null
        } else {
          newActiveId = null
        }
      }

      return {
        documents: newDocs,
        activeDocumentId: newActiveId,
      }
    })
  },

  updateDocument: (id, updates) => {
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? { ...doc, ...updates } : doc
      ),
    }))
  },

  setActiveDocument: (id) => {
    set({ activeDocumentId: id })
  },

  duplicateDocument: (id) => {
    const { documents, addDocument: add } = get()
    const doc = documents.find((d) => d.id === id)
    if (!doc) return null

    // Deep clone content to avoid shared references
    const clonedContent = JSON.parse(JSON.stringify(doc.content))
    return add({
      title: `${doc.title} (copie)`,
      content: clonedContent,
      isDirty: true,
      metadata: doc.metadata ? { ...doc.metadata } : undefined,
    })
  },

  updateContent: (id, content) => {
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id
          ? { ...doc, content, isDirty: true, version: (doc.version || 0) + 1 }
          : doc
      ),
    }))
  },

  markAsSaved: (id) => {
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id
          ? { ...doc, isDirty: false, lastSaved: new Date() }
          : doc
      ),
    }))
  },

  markAsDirty: (id) => {
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? { ...doc, isDirty: true } : doc
      ),
    }))
  },

  setFilePath: (id, path) => {
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id
          ? {
              ...doc,
              filePath: path,
              title: path.split('/').pop() || doc.title,
            }
          : doc
      ),
    }))
  },

  getActiveDocument: () => {
    const state = get()
    return state.documents.find((doc) => doc.id === state.activeDocumentId)
  },

  getDocument: (id) => {
    const state = get()
    return state.documents.find((doc) => doc.id === id)
  },

  reorderDocuments: (fromIndex, toIndex) => {
    set((state) => {
      const docs = [...state.documents]
      const [moved] = docs.splice(fromIndex, 1)
      docs.splice(toIndex, 0, moved)
      return { documents: docs }
    })
  },

  saveSession: async () => {
    const state = get()

    // Save untitled documents to IndexedDB
    for (const doc of state.documents) {
      if (!doc.filePath) {
        await documentStorage.save(doc.id, doc.content)
      }
    }

    // Save session metadata to localStorage
    const session: Session = {
      documents: state.documents.map((doc) => ({
        id: doc.id,
        filePath: doc.filePath,
        title: doc.title,
        isDirty: doc.isDirty,
      })),
      activeDocumentId: state.activeDocumentId,
      timestamp: new Date(),
    }

    localStorage.setItem('citadelle-session', JSON.stringify(session))
  },

  restoreSession: async () => {
    try {
      const sessionData = localStorage.getItem('citadelle-session')
      if (!sessionData) return

      const session: Session = JSON.parse(sessionData)

      // Initialize documentStorage
      await documentStorage.init()

      // Restore documents
      const restoredDocs: Document[] = []

      for (const docMeta of session.documents) {
        try {
          let content: JSONContent | null = null

          if (docMeta.filePath) {
            // Try to read file from disk
            try {
              const fileContent = await invoke<string>('read_file', {
                path: docMeta.filePath,
              })

              // Convert markdown to TipTap JSON using proper parser
              content = markdownToJson(fileContent)
            } catch (error) {
              console.warn(`Could not restore file: ${docMeta.filePath}`, error)
              continue // Skip this file if it no longer exists
            }
          } else {
            // Load from IndexedDB
            content = await documentStorage.load(docMeta.id)
          }

          if (content) {
            restoredDocs.push({
              id: docMeta.id,
              title: docMeta.title,
              content,
              filePath: docMeta.filePath,
              isDirty: docMeta.isDirty,
              lastSaved: null,
              version: 0,
            })
          }
        } catch (error) {
          console.error(`Failed to restore document ${docMeta.id}:`, error)
        }
      }

      // Set restored state
      if (restoredDocs.length > 0) {
        set({
          documents: restoredDocs,
          activeDocumentId: session.activeDocumentId,
        })
      }

      // Cleanup old IndexedDB entries
      await documentStorage.cleanup()
    } catch (error) {
      console.error('Failed to restore session:', error)
    }
  },

  clearSession: () => {
    localStorage.removeItem('citadelle-session')
  },
}))
