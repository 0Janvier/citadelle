/**
 * Backup Manager - IndexedDB periodic snapshots for crash recovery
 *
 * Creates automatic backups every 5 minutes and allows manual snapshots.
 * Stores content in IndexedDB for persistence across sessions.
 */

import type { JSONContent } from '@tiptap/core'

const DB_NAME = 'citadelle-backups'
const DB_VERSION = 1
const STORE_NAME = 'backups'
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export interface Backup {
  id: string
  documentId: string
  title: string
  content: JSONContent
  timestamp: number
  filePath?: string
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('documentId', 'documentId', { unique: false })
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const BackupManager = {
  async createBackup(documentId: string, title: string, content: JSONContent, filePath?: string): Promise<void> {
    try {
      const db = await openDB()
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)

      const backup: Backup = {
        id: `backup-${documentId}-${Date.now()}`,
        documentId,
        title,
        content,
        timestamp: Date.now(),
        filePath,
      }

      store.put(backup)
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })
      db.close()
    } catch (error) {
      console.error('BackupManager: Failed to create backup', error)
    }
  },

  async listBackups(documentId: string): Promise<Backup[]> {
    try {
      const db = await openDB()
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const index = store.index('documentId')
      const request = index.getAll(documentId)

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          db.close()
          const results = (request.result as Backup[]).sort((a, b) => b.timestamp - a.timestamp)
          resolve(results)
        }
        request.onerror = () => {
          db.close()
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('BackupManager: Failed to list backups', error)
      return []
    }
  },

  async restoreBackup(backupId: string): Promise<Backup | null> {
    try {
      const db = await openDB()
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.get(backupId)

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          db.close()
          resolve(request.result as Backup || null)
        }
        request.onerror = () => {
          db.close()
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('BackupManager: Failed to restore backup', error)
      return null
    }
  },

  async cleanOldBackups(maxAgeMs: number = MAX_AGE_MS): Promise<number> {
    try {
      const db = await openDB()
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const cutoff = Date.now() - maxAgeMs

      return new Promise((resolve, reject) => {
        const request = store.openCursor()
        let deleted = 0

        request.onsuccess = () => {
          const cursor = request.result
          if (cursor) {
            const backup = cursor.value as Backup
            if (backup.timestamp < cutoff) {
              cursor.delete()
              deleted++
            }
            cursor.continue()
          } else {
            db.close()
            resolve(deleted)
          }
        }
        request.onerror = () => {
          db.close()
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('BackupManager: Failed to clean old backups', error)
      return 0
    }
  },

  async getLatestBackup(documentId: string): Promise<Backup | null> {
    const backups = await this.listBackups(documentId)
    return backups[0] || null
  },

  async deleteBackup(backupId: string): Promise<void> {
    try {
      const db = await openDB()
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).delete(backupId)
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })
      db.close()
    } catch (error) {
      console.error('BackupManager: Failed to delete backup', error)
    }
  },
}
