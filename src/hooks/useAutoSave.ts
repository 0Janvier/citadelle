import { useEffect, useRef } from 'react'
import { useDocumentStore } from '../store/useDocumentStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { useFileOperations } from './useFileOperations'

export function useAutoSave(documentId: string) {
  const document = useDocumentStore((state) =>
    state.documents.find((doc) => doc.id === documentId)
  )
  const autoSaveEnabled = useSettingsStore((state) => state.autoSave)
  const autoSaveInterval = useSettingsStore((state) => state.autoSaveInterval)
  const { saveFile } = useFileOperations()

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
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
      timeoutRef.current = setTimeout(() => {
        saveFile(documentId).catch((error) => {
          console.error('Auto-save failed:', error)
        })
        lastVersionRef.current = currentVersion
      }, autoSaveInterval)
    }

    // Cleanup on unmount or dependency change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [document?.version, document?.isDirty, document?.filePath, autoSaveEnabled, autoSaveInterval, documentId, saveFile])

  return {
    isAutoSaving: !!timeoutRef.current,
  }
}
