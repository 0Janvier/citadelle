// Application lifecycle: initialization, session management, window events
import { useEffect, useState } from 'react'
import { useDocumentStore } from '../store/useDocumentStore'
import { useGoldocabDataStore } from '../store/useGoldocabDataStore'
import { useFolderStore } from '../store/useFolderStore'
import { useTemplateStore } from '../store/useTemplateStore'
import { useStyleStore } from '../store/useStyleStore'
import { useThemeStore } from '../store/useThemeStore'
import { useToast } from './useToast'
import { initUserDataDir } from '../lib/templateStorage'
import { appWindow } from '@tauri-apps/api/window'
import { confirm } from '@tauri-apps/api/dialog'

export function useAppLifecycle() {
  const [isRestoring, setIsRestoring] = useState(true)

  const addDocument = useDocumentStore((s) => s.addDocument)
  const restoreSession = useDocumentStore((s) => s.restoreSession)
  const saveSession = useDocumentStore((s) => s.saveSession)
  const loadTemplates = useTemplateStore((s) => s.loadTemplates)
  const loadStyles = useStyleStore((s) => s.loadStyles)
  const loadThemes = useThemeStore((s) => s.loadThemes)
  const refreshFolder = useFolderStore((s) => s.refreshFolder)
  const toast = useToast()

  // Initialize template system on mount
  useEffect(() => {
    const initTemplateSystem = async () => {
      try {
        await initUserDataDir()
        await Promise.all([
          loadTemplates(),
          loadStyles(),
          loadThemes(),
        ])
      } catch (err) {
        console.error('Failed to initialize template system:', err)
        toast.error('Erreur lors de l\'initialisation des modeles')
      }
    }
    initTemplateSystem()
  }, [loadTemplates, loadStyles, loadThemes])

  // Check GoldoCab availability on mount
  useEffect(() => {
    useGoldocabDataStore.getState().checkStatus()
  }, [])

  // Refresh linked dossier data on window focus
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const docId = useDocumentStore.getState().activeDocumentId
        if (docId) {
          useGoldocabDataStore.getState().refreshLinkedDossierIfStale(docId)
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // Confirm before closing window with unsaved documents
  useEffect(() => {
    const unlisten = appWindow.onCloseRequested(async (event) => {
      const docs = useDocumentStore.getState().documents
      const hasUnsaved = docs.some(d => d.isDirty)
      if (hasUnsaved) {
        const confirmed = await confirm(
          'Des documents non sauvegardes seront perdus. Quitter ?',
          { title: 'Citadelle', type: 'warning' }
        )
        if (!confirmed) {
          event.preventDefault()
          return
        }
      }
      await useDocumentStore.getState().saveSession()
    })
    return () => { unlisten.then(fn => fn()) }
  }, [])

  // Restore session on mount
  useEffect(() => {
    const settingsData = localStorage.getItem('citadelle-settings')
    let shouldRestore = true

    if (settingsData) {
      try {
        const { state } = JSON.parse(settingsData)
        shouldRestore = state.restoreSession !== false
      } catch (e) {
        shouldRestore = true
      }
    }

    if (shouldRestore) {
      restoreSession().then(() => {
        const currentDocs = useDocumentStore.getState().documents
        if (currentDocs.length === 0) {
          addDocument()
        }
      }).finally(() => {
        setIsRestoring(false)
      })
    } else {
      addDocument()
      setIsRestoring(false)
    }

    // Restore folder sidebar if a root path was persisted
    const folderData = localStorage.getItem('citadelle-folders')
    if (folderData) {
      try {
        const { state } = JSON.parse(folderData)
        if (state.rootPath) {
          refreshFolder(state.rootPath)
        }
      } catch (e) {
        console.error('Failed to restore folder:', e)
        toast.error('Impossible de restaurer le dossier')
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save session every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveSession()
    }, 10000)

    return () => {
      clearInterval(interval)
      saveSession()
    }
  }, [saveSession])

  return { isRestoring }
}
