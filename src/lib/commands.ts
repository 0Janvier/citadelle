/**
 * Command definitions for the CommandPalette.
 * Extracted to keep CommandPalette.tsx focused on UI.
 */

import { useDocumentStore, type Document } from '../store/useDocumentStore'
import { useEditorStore } from '../store/useEditorStore'
import { usePanelStore } from '../store/usePanelStore'
import { useTocStore } from '../store/useTocStore'
import { useVersionStore } from '../store/useVersionStore'
import { useTemplateStore } from '../store/useTemplateStore'
import { useClosedTabsStore } from '../store/useClosedTabsStore'
import { useBookmarkStore } from '../store/useBookmarkStore'
import { useGoldocabDataStore } from '../store/useGoldocabDataStore'
import { type Theme } from '../store/useSettingsStore'
import { insertTableOfContents } from '../lib/tocGenerator'
import { open as shellOpen } from '@tauri-apps/api/shell'

export interface CommandItem {
  id: string
  label: string
  shortcut?: string
  category: string
  action: () => void
}

export interface CommandDeps {
  addDocument: (doc?: Partial<Document>) => string
  activeDocumentId: string | null
  openFile: () => void
  saveFile: (id: string) => void
  saveFileAs: (id: string) => void
  exportToPDF: (id: string) => void
  toggleDistractionFree: () => void
  setFindDialogOpen: (v: boolean) => void
  toggleTheme: () => void
  setTheme: (t: Theme) => void
  increaseZoom: () => void
  decreaseZoom: () => void
  resetZoom: () => void
  setPdfExportSettingsOpen: (v: boolean) => void
  setSettingsOpen: (v: boolean) => void
  setShortcutsDialogOpen: (v: boolean) => void
  toast: { success: (msg: string) => void; error: (msg: string) => void }
}

export function buildCommands(deps: CommandDeps): CommandItem[] {
  const {
    addDocument, activeDocumentId, openFile, saveFile, saveFileAs,
    exportToPDF, toggleDistractionFree, setFindDialogOpen,
    toggleTheme, setTheme, increaseZoom, decreaseZoom, resetZoom,
    setPdfExportSettingsOpen, setSettingsOpen, setShortcutsDialogOpen, toast,
  } = deps

  const commands: CommandItem[] = [
    // --- Fichier ---
    { id: 'new-file', label: 'Nouveau fichier', shortcut: 'Cmd+N', category: 'Fichier', action: () => addDocument() },
    { id: 'open-file', label: 'Ouvrir fichier', shortcut: 'Cmd+O', category: 'Fichier', action: openFile },
    { id: 'save-file', label: 'Sauvegarder', shortcut: 'Cmd+S', category: 'Fichier', action: () => activeDocumentId && saveFile(activeDocumentId) },
    { id: 'save-file-as', label: 'Sauvegarder sous', shortcut: 'Cmd+Shift+S', category: 'Fichier', action: () => activeDocumentId && saveFileAs(activeDocumentId) },

    // --- Edition ---
    { id: 'find', label: 'Rechercher', shortcut: 'Cmd+F', category: 'Édition', action: () => setFindDialogOpen(true) },
    {
      id: 'find-replace', label: 'Rechercher et remplacer', shortcut: 'Cmd+H', category: 'Édition',
      action: () => { setFindDialogOpen(true); useEditorStore.getState().setShowReplace(true) },
    },
    { id: 'toggle-pieces-panel', label: 'Pieces justificatives', shortcut: 'Cmd+Shift+P', category: 'Édition', action: () => usePanelStore.getState().togglePanel('pieces') },
    { id: 'toggle-toc-panel', label: 'Table des matieres', shortcut: 'Cmd+Shift+M', category: 'Édition', action: () => useTocStore.getState().togglePanel() },

    // --- Vue ---
    { id: 'toggle-distraction-free', label: 'Mode sans distraction', shortcut: 'Cmd+Shift+D', category: 'Vue', action: toggleDistractionFree },
    { id: 'toggle-theme', label: 'Basculer le thème', shortcut: 'Cmd+T', category: 'Vue', action: toggleTheme },
    { id: 'theme-light', label: 'Thème clair', category: 'Vue', action: () => setTheme('light') },
    { id: 'theme-dark', label: 'Thème sombre', category: 'Vue', action: () => setTheme('dark') },
    { id: 'theme-sepia', label: 'Thème sepia', category: 'Vue', action: () => setTheme('sepia') },
    { id: 'theme-midnight', label: 'Thème bleu nuit', category: 'Vue', action: () => setTheme('midnight') },
    { id: 'theme-auto', label: 'Thème automatique', category: 'Vue', action: () => setTheme('auto') },
    { id: 'zoom-in', label: 'Agrandir', shortcut: 'Cmd++', category: 'Vue', action: increaseZoom },
    { id: 'zoom-out', label: 'Réduire', shortcut: 'Cmd+-', category: 'Vue', action: decreaseZoom },
    { id: 'zoom-reset', label: 'Réinitialiser le zoom', shortcut: 'Cmd+0', category: 'Vue', action: resetZoom },

    // --- Export ---
    { id: 'export-pdf', label: 'Exporter en PDF', shortcut: 'Cmd+E', category: 'Export', action: () => activeDocumentId && exportToPDF(activeDocumentId) },
    { id: 'pdf-export-settings', label: "Paramètres d'export PDF", category: 'Export', action: () => setPdfExportSettingsOpen(true) },

    // --- Application ---
    { id: 'open-settings', label: 'Ouvrir les paramètres', shortcut: 'Cmd+,', category: 'Application', action: () => setSettingsOpen(true) },
    { id: 'keyboard-shortcuts', label: 'Raccourcis clavier', shortcut: 'Cmd+/', category: 'Application', action: () => setShortcutsDialogOpen(true) },

    // --- Panneaux ---
    { id: 'versions-panel', label: 'Historique des versions', shortcut: 'Cmd+Shift+H', category: 'Panneaux', action: () => usePanelStore.getState().togglePanel('versions') },
    { id: 'deadlines-panel', label: 'Echeances et delais', shortcut: 'Cmd+Shift+E', category: 'Panneaux', action: () => usePanelStore.getState().togglePanel('deadlines') },
    { id: 'variables-panel', label: 'Variables du document', shortcut: 'Cmd+Shift+V', category: 'Panneaux', action: () => usePanelStore.getState().togglePanel('variables') },
    { id: 'comments-panel', label: 'Commentaires', shortcut: 'Cmd+Shift+M', category: 'Panneaux', action: () => usePanelStore.getState().togglePanel('comments') },
    { id: 'terms-panel', label: 'Glossaire des termes', shortcut: 'Cmd+Shift+G', category: 'Panneaux', action: () => usePanelStore.getState().togglePanel('terms') },
    { id: 'document-map-panel', label: 'Plan du document', category: 'Panneaux', action: () => usePanelStore.getState().togglePanel('document-map') },
    { id: 'characters-panel', label: 'Caracteres speciaux', category: 'Panneaux', action: () => usePanelStore.getState().togglePanel('characters') },
    { id: 'bookmarks-panel', label: 'Signets', shortcut: 'Cmd+Shift+B', category: 'Panneaux', action: () => usePanelStore.getState().togglePanel('bookmarks') },

    // --- Document ---
    {
      id: 'save-as-template', label: 'Sauvegarder comme modèle', category: 'Document',
      action: () => {
        const doc = useDocumentStore.getState().getActiveDocument()
        if (doc) {
          const name = window.prompt('Nom du modèle :', doc.title)
          if (name) {
            useTemplateStore.getState().createTemplate({
              name, description: `Modèle créé depuis "${doc.title}"`,
              category: 'custom', content: doc.content,
              metadata: { defaultStyles: [], tags: ['custom'] },
            }).then(() => toast.success(`Modèle "${name}" créé`))
              .catch((err: Error) => toast.error(`Erreur : ${err.message}`))
          }
        }
      },
    },
    {
      id: 'create-snapshot', label: 'Créer un snapshot', category: 'Document',
      action: () => {
        const doc = useDocumentStore.getState().getActiveDocument()
        if (doc) {
          useVersionStore.getState().createVersion(doc.id, `Snapshot ${new Date().toLocaleString('fr-FR')}`, doc.content, false)
          toast.success('Snapshot créé')
        }
      },
    },
    {
      id: 'duplicate-document', label: 'Dupliquer le document', category: 'Document',
      action: () => { if (activeDocumentId) useDocumentStore.getState().duplicateDocument(activeDocumentId) },
    },
    {
      id: 'reopen-closed-tab', label: 'Rouvrir le dernier onglet ferme', shortcut: 'Cmd+Shift+R', category: 'Document',
      action: () => {
        const tab = useClosedTabsStore.getState().popClosedTab()
        if (tab) addDocument({ title: tab.title, content: tab.content, filePath: tab.filePath, isDirty: true })
      },
    },
    {
      id: 'add-bookmark', label: 'Ajouter un signet a la position du curseur', category: 'Document',
      action: () => {
        const editor = useEditorStore.getState().activeEditor
        const docId = useDocumentStore.getState().activeDocumentId
        if (editor && docId) {
          const pos = editor.state.selection.from
          const $pos = editor.state.doc.resolve(pos)
          const label = $pos.parent.textContent.trim().slice(0, 40) || undefined
          useBookmarkStore.getState().addBookmark(docId, pos, label)
          toast.success('Signet ajoute')
        }
      },
    },
    {
      id: 'insert-toc', label: 'Inserer une table des matieres', category: 'Document',
      action: () => {
        const editor = useEditorStore.getState().activeEditor
        if (editor) insertTableOfContents(editor)
      },
    },
  ]

  // GoldoCab commands (conditional)
  if (useGoldocabDataStore.getState().isAvailable) {
    commands.push(
      { id: 'goldocab-link-dossier', label: 'Lier un dossier GoldoCab', category: 'GoldoCab', action: () => window.dispatchEvent(new Event('goldocab-dossier-picker')) },
      { id: 'goldocab-fill-client', label: 'Remplir client depuis GoldoCab', category: 'GoldoCab', action: () => window.dispatchEvent(new Event('goldocab-client-picker')) },
      { id: 'goldocab-fill-adverse', label: 'Remplir partie adverse depuis GoldoCab', category: 'GoldoCab', action: () => window.dispatchEvent(new Event('goldocab-adverse-picker')) },
      { id: 'goldocab-quick-task', label: 'Creer une tache GoldoCab', category: 'GoldoCab', action: () => window.dispatchEvent(new Event('goldocab-quick-task')) },
      {
        id: 'goldocab-open-dossier', label: 'Ouvrir le dossier dans GoldoCab', category: 'GoldoCab',
        action: () => {
          const docId = useDocumentStore.getState().activeDocumentId
          if (docId) {
            const linked = useGoldocabDataStore.getState().getLinkedDossier(docId)
            if (linked) shellOpen(`goldocab://dossier/${linked.dossierId}`)
            else toast.error('Aucun dossier lie a ce document')
          }
        },
      },
    )
  }

  return commands
}
