import { useEffect, useRef } from 'react'
import { useDocumentStore } from '../store/useDocumentStore'
import { useEditorStore } from '../store/useEditorStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { useFileOperations } from './useFileOperations'
import { BackupManager } from '../lib/backupManager'
import { handleError } from '../lib/errorHandler'

export function useAutoSave(documentId: string) {
  const document = useDocumentStore((state) =>
    state.documents.find((doc) => doc.id === documentId)
  )
  const autoSaveEnabled = useSettingsStore((state) => state.autoSave)
  const autoSaveInterval = useSettingsStore((state) => state.autoSaveInterval)
  const { saveFile } = useFileOperations()

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const backupIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isSavingRef = useRef(false)
  // Use version counter instead of JSON.stringify for efficient change detection
  const lastVersionRef = useRef<number>(document?.version ?? 0)

  useEffect(() => {
    if (!autoSaveEnabled || !document || !document.filePath) {
      return
    }

    // Only trigger auto-save if version changed (much faster than JSON.stringify)
    const currentVersion = document.version ?? 0
    if (document.isDirty && currentVersion !== lastVersionRef.current) {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set new timeout
      timeoutRef.current = setTimeout(async () => {
        if (isSavingRef.current) return
        isSavingRef.current = true
        const { setSaveStatus } = useEditorStore.getState()
        setSaveStatus('saving')
        try {
          await saveFile(documentId)
          setSaveStatus('saved')
          // Read version at execution time, not at setTimeout creation time
          const latestDoc = useDocumentStore.getState().documents.find((d) => d.id === documentId)
          lastVersionRef.current = latestDoc?.version ?? 0
        } catch (error) {
          setSaveStatus('error', String(error))
          handleError(error, 'Sauvegarde automatique')
        } finally {
          isSavingRef.current = false
        }
      }, autoSaveInterval)
    }

    // Cleanup on unmount or dependency change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [document?.version, document?.isDirty, document?.filePath, autoSaveEnabled, autoSaveInterval, documentId, saveFile])

  // Periodic backup to IndexedDB (every 5 minutes)
  useEffect(() => {
    if (!document) return

    const createBackupNow = () => {
      if (isSavingRef.current) return
      const doc = useDocumentStore.getState().documents.find((d) => d.id === documentId)
      if (doc && doc.isDirty) {
        BackupManager.createBackup(doc.id, doc.title, doc.content, doc.filePath)
          .then(() => {
            useEditorStore.getState().setLastBackupTime(Date.now())
          })
          .catch((err) => {
            handleError(err, 'Sauvegarde de secours', { toastType: 'warning' })
          })
      }
    }

    backupIntervalRef.current = setInterval(createBackupNow, 5 * 60 * 1000) // 5 minutes

    // Also backup when window loses focus
    window.addEventListener('blur', createBackupNow)

    return () => {
      if (backupIntervalRef.current) {
        clearInterval(backupIntervalRef.current)
      }
      window.removeEventListener('blur', createBackupNow)
    }
  }, [documentId, document?.id])

  return {
    isAutoSaving: !!timeoutRef.current,
  }
}
