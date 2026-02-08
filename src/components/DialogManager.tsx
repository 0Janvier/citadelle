// DialogManager - Orchestrates all modal dialogs and their event triggers
import { useEffect, useState, useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { CommandPalette } from './CommandPalette'
import { Settings } from './Settings'
import { NewDocumentDialog } from './templates'
import { SaveAsTemplateDialog } from './templates/SaveAsTemplateDialog'
import { GlobalSearch } from './search/GlobalSearch'
import { ProjectSearch } from './search/ProjectSearch'
import { PdfExportSettingsDialog } from './PdfExportSettingsDialog'
import { KeyboardShortcutsDialog } from './KeyboardShortcutsDialog'
import { FootnoteEditor } from './footnotes/FootnoteEditor'
import { RecoveryDialog } from './recovery/RecoveryDialog'
import { ExportProgressOverlay } from './ExportProgressOverlay'
import { QuickFileSwitcher } from './QuickFileSwitcher'
import { DossierPicker, ClientPicker, QuickTaskPopover } from './GoldoCab'
import { useEditorStore } from '../store/useEditorStore'
import { useDocumentStore } from '../store/useDocumentStore'
import { usePanelStore } from '../store/usePanelStore'
import type { JSONContent } from '@tiptap/react'

export function DialogManager() {
  const addDocument = useDocumentStore((s) => s.addDocument)

  const {
    settingsOpen, setSettingsOpen,
    projectSearchOpen, setProjectSearchOpen,
    pdfExportSettingsOpen, setPdfExportSettingsOpen,
    shortcutsDialogOpen, setShortcutsDialogOpen,
  } = useEditorStore(useShallow((s) => ({
    settingsOpen: s.settingsOpen,
    setSettingsOpen: s.setSettingsOpen,
    projectSearchOpen: s.projectSearchOpen,
    setProjectSearchOpen: s.setProjectSearchOpen,
    pdfExportSettingsOpen: s.pdfExportSettingsOpen,
    setPdfExportSettingsOpen: s.setPdfExportSettingsOpen,
    shortcutsDialogOpen: s.shortcutsDialogOpen,
    setShortcutsDialogOpen: s.setShortcutsDialogOpen,
  })))

  const activePanel = usePanelStore((s) => s.activePanel)
  const closePanel = usePanelStore((s) => s.closePanel)

  // Local dialog states
  const [showNewDocDialog, setShowNewDocDialog] = useState(false)
  const [showSaveAsTemplate, setShowSaveAsTemplate] = useState(false)
  const [showDossierPicker, setShowDossierPicker] = useState(false)
  const [showClientPicker, setShowClientPicker] = useState<'client' | 'adverse' | null>(null)
  const [showQuickTask, setShowQuickTask] = useState(false)

  // Event listeners for dialogs
  useEffect(() => {
    const showNewDoc = () => setShowNewDocDialog(true)
    const showSaveTemplate = () => setShowSaveAsTemplate(true)
    const showDossier = () => setShowDossierPicker(true)
    const showClient = () => setShowClientPicker('client')
    const showAdverse = () => setShowClientPicker('adverse')
    const showTask = () => setShowQuickTask(true)
    window.addEventListener('show-new-doc-dialog', showNewDoc)
    window.addEventListener('show-save-as-template', showSaveTemplate)
    window.addEventListener('goldocab-dossier-picker', showDossier)
    window.addEventListener('goldocab-client-picker', showClient)
    window.addEventListener('goldocab-adverse-picker', showAdverse)
    window.addEventListener('goldocab-quick-task', showTask)
    return () => {
      window.removeEventListener('show-new-doc-dialog', showNewDoc)
      window.removeEventListener('show-save-as-template', showSaveTemplate)
      window.removeEventListener('goldocab-dossier-picker', showDossier)
      window.removeEventListener('goldocab-client-picker', showClient)
      window.removeEventListener('goldocab-adverse-picker', showAdverse)
      window.removeEventListener('goldocab-quick-task', showTask)
    }
  }, [])

  const handleCreateFromTemplate = useCallback((content: JSONContent, templateName: string) => {
    addDocument({ title: `Nouveau ${templateName}`, content })
  }, [addDocument])

  return (
    <>
      <CommandPalette />
      <QuickFileSwitcher />
      <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <NewDocumentDialog
        isOpen={showNewDocDialog}
        onClose={() => setShowNewDocDialog(false)}
        onCreateDocument={handleCreateFromTemplate}
      />
      <SaveAsTemplateDialog
        isOpen={showSaveAsTemplate}
        onClose={() => setShowSaveAsTemplate(false)}
      />
      <GlobalSearch
        isOpen={activePanel === 'search'}
        onClose={closePanel}
      />
      <ProjectSearch
        isOpen={projectSearchOpen}
        onClose={() => setProjectSearchOpen(false)}
      />
      <PdfExportSettingsDialog
        isOpen={pdfExportSettingsOpen}
        onClose={() => setPdfExportSettingsOpen(false)}
      />
      <KeyboardShortcutsDialog
        open={shortcutsDialogOpen}
        onClose={() => setShortcutsDialogOpen(false)}
      />
      <FootnoteEditor />
      <RecoveryDialog />
      <ExportProgressOverlay />
      <DossierPicker
        isOpen={showDossierPicker}
        onClose={() => setShowDossierPicker(false)}
      />
      <ClientPicker
        isOpen={showClientPicker !== null}
        onClose={() => setShowClientPicker(null)}
        target={showClientPicker || 'client'}
      />
      <QuickTaskPopover
        isOpen={showQuickTask}
        onClose={() => setShowQuickTask(false)}
      />
    </>
  )
}
