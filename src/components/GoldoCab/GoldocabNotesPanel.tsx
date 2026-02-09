// Panneau pour creer et gerer les notes/taches GoldoCab
// Consolidation: tout passe par le systeme fichiers (~/Documents/Cabinet/Notes/)
import { useState, useEffect } from 'react'
import { useGoldocabNotesFilesStore, NoteFileEntry } from '../../store/useGoldocabNotesFilesStore'
import { useGoldocabDataStore } from '../../store/useGoldocabDataStore'
import { useDocumentStore } from '../../store/useDocumentStore'
import { useFileOperations } from '../../hooks/useFileOperations'
import { useToastStore } from '../../store/useToastStore'
import { open } from '@tauri-apps/api/shell'
import type { GoldocabItem } from '../../types/goldocab'

interface GoldocabNotesPanelProps {
  onClose: () => void
  onOpenDossierPicker?: () => void
}

export function GoldocabNotesPanel({ onClose: _onClose, onOpenDossierPicker }: GoldocabNotesPanelProps) {
  const fileNotes = useGoldocabNotesFilesStore((s) => s.notes)
  const isLoading = useGoldocabNotesFilesStore((s) => s.isLoading)
  const error = useGoldocabNotesFilesStore((s) => s.error)
  const loadNotes = useGoldocabNotesFilesStore((s) => s.loadNotes)
  const createNote = useGoldocabNotesFilesStore((s) => s.createNote)
  const deleteNote = useGoldocabNotesFilesStore((s) => s.deleteNote)
  const clearError = useGoldocabNotesFilesStore((s) => s.clearError)

  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId)
  const documents = useDocumentStore((state) => state.documents)
  const activeDocument = documents.find((d) => d.id === activeDocumentId)
  const { openFileFromPath } = useFileOperations()

  const linkedDossier = useGoldocabDataStore((s) =>
    activeDocumentId ? s.getLinkedDossier(activeDocumentId) : null
  )
  const isAvailable = useGoldocabDataStore((s) => s.isAvailable)
  const getDossierItems = useGoldocabDataStore((s) => s.getDossierItems)

  const [dossierItems, setDossierItems] = useState<GoldocabItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)

  // Charger les notes au montage
  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  // Fetch dossier items when linked dossier changes
  useEffect(() => {
    if (linkedDossier?.dossierId) {
      setLoadingItems(true)
      getDossierItems(linkedDossier.dossierId).then((items) => {
        setDossierItems(items)
        setLoadingItems(false)
      })
    } else {
      setDossierItems([])
    }
  }, [linkedDossier?.dossierId, getDossierItems])

  const refreshDossierItems = () => {
    if (!linkedDossier?.dossierId) return
    setLoadingItems(true)
    useGoldocabDataStore.getState().clearCache()
    getDossierItems(linkedDossier.dossierId).then((items) => {
      setDossierItems(items)
      setLoadingItems(false)
    })
  }

  const [showNewForm, setShowNewForm] = useState<'note' | 'task' | null>(null)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal')
  const [dueDate, setDueDate] = useState('')

  const handleSubmit = async () => {
    if (!content.trim()) return

    // Build tags
    const tags: string[] = []
    if (showNewForm === 'task') {
      tags.push('tache')
      if (priority !== 'normal') tags.push(`priorite:${priority === 'high' ? 'haute' : 'basse'}`)
      if (dueDate) tags.push(`echeance:${dueDate}`)
    }

    // Build content with task metadata
    let body = content.trim()
    if (showNewForm === 'task' && (dueDate || priority !== 'normal')) {
      const meta: string[] = []
      if (priority === 'high') meta.push('**Priorite:** Haute')
      if (priority === 'low') meta.push('**Priorite:** Basse')
      if (dueDate) meta.push(`**Echeance:** ${new Date(dueDate).toLocaleDateString('fr-FR')}`)
      body = meta.join(' | ') + '\n\n' + body
    }

    const noteTitle = title.trim() || content.trim().split('\n')[0].slice(0, 80) || 'Sans titre'

    const path = await createNote({
      title: noteTitle,
      content: body,
      dossierId: linkedDossier ? String(linkedDossier.dossierId) : undefined,
      tags,
    })

    if (path) {
      useToastStore.getState().addToast({
        type: 'success',
        message: showNewForm === 'task' ? 'Tache creee' : 'Note creee',
      })
    }

    // Reset form
    setContent('')
    setTitle('')
    setPriority('normal')
    setDueDate('')
    setShowNewForm(null)
  }

  const handleCancel = () => {
    setContent('')
    setTitle('')
    setPriority('normal')
    setDueDate('')
    setShowNewForm(null)
  }

  const handleDeleteNote = async (path: string) => {
    const ok = await deleteNote(path)
    if (ok) {
      useToastStore.getState().addToast({ type: 'success', message: 'Note supprimee' })
    }
  }

  // Separate tasks from notes based on tags
  const taskNotes = fileNotes.filter((n) => n.tags.includes('tache'))
  const regularNotes = fileNotes.filter((n) => !n.tags.includes('tache'))

  return (
    <div className="flex flex-col h-full bg-[var(--bg)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <GoldocabLogo />
          <span className="font-semibold text-[var(--text)]">GoldoCab</span>
          {fileNotes.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-full">
              {fileNotes.length}
            </span>
          )}
        </div>
        <button
          onClick={() => loadNotes()}
          className="text-[10px] px-2 py-1 rounded hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors"
          disabled={isLoading}
        >
          {isLoading ? '...' : 'Rafraichir'}
        </button>
      </div>

      {/* Erreur */}
      {error && (
        <div className="mx-4 mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-500 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-500 hover:text-red-400">
            <XIcon />
          </button>
        </div>
      )}

      {/* Section Dossier lie */}
      {isAvailable && (
        <div className="mx-4 mt-3 p-3 rounded-lg border border-[var(--border)]">
          {linkedDossier ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium uppercase tracking-wide opacity-40">Dossier</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => open(`goldocab://dossier/${linkedDossier.dossierId}`)}
                    className="text-[10px] px-1.5 py-0.5 rounded hover:bg-[var(--bg-secondary)] text-[var(--accent)] transition-colors"
                    title="Ouvrir dans GoldoCab"
                  >
                    Ouvrir
                  </button>
                  {onOpenDossierPicker && (
                    <button
                      onClick={onOpenDossierPicker}
                      className="text-[10px] px-1.5 py-0.5 rounded hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors"
                    >
                      Changer
                    </button>
                  )}
                </div>
              </div>
              <div className="text-sm font-medium text-[var(--text)]">{linkedDossier.dossierName}</div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-0.5">
                {linkedDossier.clientName && <span>{linkedDossier.clientName}</span>}
                {linkedDossier.numeroRg && <span>RG: {linkedDossier.numeroRg}</span>}
                {linkedDossier.juridiction && <span>{linkedDossier.juridiction}</span>}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xs text-[var(--text-secondary)] mb-2">Aucun dossier lie</p>
              {onOpenDossierPicker && (
                <button
                  onClick={onOpenDossierPicker}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
                >
                  Lier un dossier
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Taches du dossier (lecture depuis GoldoCab) */}
      {linkedDossier && dossierItems.length > 0 && (
        <div className="mx-4 mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium uppercase tracking-wide opacity-40">Taches du dossier</span>
            <button
              onClick={refreshDossierItems}
              className="text-[10px] px-1.5 py-0.5 rounded hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors"
              disabled={loadingItems}
            >
              {loadingItems ? '...' : 'Rafraichir'}
            </button>
          </div>
          <div className="space-y-1 max-h-[150px] overflow-y-auto">
            {dossierItems.filter(i => i.est_tache).slice(0, 10).map((item) => (
              <div key={item.id} className="flex items-center gap-2 px-2 py-1.5 rounded text-xs bg-[var(--bg-secondary)]">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      item.en_cours ? '#3b82f6' :
                      (item.urgence ?? 0) >= 3 ? '#ef4444' :
                      (item.urgence ?? 0) >= 2 ? '#f59e0b' : '#9ca3af'
                  }}
                />
                <span className="flex-1 truncate text-[var(--text)]">{item.titre || 'Sans titre'}</span>
                {item.date_echeance && (
                  <span className="text-[var(--text-secondary)] shrink-0">
                    {new Date(item.date_echeance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document actif */}
      {activeDocument && (
        <div className="mx-4 mt-3 p-2 bg-[var(--bg-secondary)] rounded-lg text-sm">
          <span className="text-[var(--text-secondary)]">Lie a : </span>
          <span className="text-[var(--text)] font-medium">{activeDocument.title}</span>
        </div>
      )}

      {/* Boutons nouveau */}
      {!showNewForm && (
        <div className="p-4 space-y-2">
          <button
            onClick={() => setShowNewForm('task')}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <TaskIcon className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-left">
              <div className="font-medium text-[var(--text)]">Nouvelle tache</div>
              <div className="text-xs text-[var(--text-secondary)]">Avec priorite et echeance</div>
            </div>
          </button>

          <button
            onClick={() => setShowNewForm('note')}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
              <NoteIcon className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-left">
              <div className="font-medium text-[var(--text)]">Nouvelle note</div>
              <div className="text-xs text-[var(--text-secondary)]">Information libre</div>
            </div>
          </button>
        </div>
      )}

      {/* Formulaire nouveau */}
      {showNewForm && (
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 mb-3">
            {showNewForm === 'task' ? (
              <TaskIcon className="w-4 h-4 text-blue-500" />
            ) : (
              <NoteIcon className="w-4 h-4 text-amber-500" />
            )}
            <span className="font-medium text-[var(--text)]">
              {showNewForm === 'task' ? 'Nouvelle tache' : 'Nouvelle note'}
            </span>
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre..."
            className="w-full p-2 mb-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)]"
            autoFocus
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={showNewForm === 'task' ? 'Decrire la tache...' : 'Contenu de la note...'}
            className="w-full h-24 p-3 text-sm bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg resize-none focus:outline-none focus:border-[var(--accent)]"
          />

          {showNewForm === 'task' && (
            <div className="mt-3 flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Priorite</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'normal' | 'high')}
                  className="w-full p-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="low">Basse</option>
                  <option value="normal">Normale</option>
                  <option value="high">Haute</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Echeance</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <button
              onClick={handleCancel}
              className="flex-1 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isLoading}
              className="flex-1 py-2 text-sm bg-[var(--accent)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isLoading ? 'Creation...' : 'Creer'}
            </button>
          </div>
        </div>
      )}

      {/* Liste des notes et taches */}
      <div className="flex-1 overflow-y-auto">
        {fileNotes.length === 0 && !isLoading ? (
          <div className="p-8 text-center text-[var(--text-secondary)]">
            <GoldocabLogo className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucune note ou tache</p>
            <p className="text-xs mt-1 opacity-60">Les notes sont stockees dans ~/Documents/Cabinet/Notes/</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {/* Taches */}
            {taskNotes.length > 0 && (
              <div>
                <span className="text-[10px] font-medium uppercase tracking-wide opacity-40">
                  Taches ({taskNotes.length})
                </span>
                <div className="mt-1 space-y-1">
                  {taskNotes.map((note) => (
                    <NoteFileCard
                      key={note.path}
                      note={note}
                      isTask
                      onOpen={() => openFileFromPath(note.path)}
                      onDelete={() => handleDeleteNote(note.path)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {regularNotes.length > 0 && (
              <div>
                <span className="text-[10px] font-medium uppercase tracking-wide opacity-40">
                  Notes ({regularNotes.length})
                </span>
                <div className="mt-1 space-y-1">
                  {regularNotes.map((note) => (
                    <NoteFileCard
                      key={note.path}
                      note={note}
                      onOpen={() => openFileFromPath(note.path)}
                      onDelete={() => handleDeleteNote(note.path)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Carte pour une note fichier
function NoteFileCard({
  note,
  isTask,
  onOpen,
  onDelete,
}: {
  note: NoteFileEntry
  isTask?: boolean
  onOpen: () => void
  onDelete: () => void
}) {
  const priorityTag = note.tags.find((t) => t.startsWith('priorite:'))
  const dueDateTag = note.tags.find((t) => t.startsWith('echeance:'))
  const isHigh = priorityTag === 'priorite:haute'

  return (
    <div
      className="flex items-start gap-2 px-2 py-2 rounded text-xs bg-[var(--bg-secondary)] hover:bg-[var(--border)] transition-colors group"
    >
      <button onClick={onOpen} className="flex items-start gap-2 flex-1 min-w-0 text-left">
        {isTask ? (
          <TaskIcon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isHigh ? 'text-red-500' : 'text-blue-500'}`} />
        ) : (
          <NoteIcon className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-[var(--text)] truncate">{note.title || 'Sans titre'}</div>
          <div className="text-[var(--text-secondary)] truncate">{note.preview}</div>
          <div className="flex items-center gap-2 mt-0.5 text-[var(--text-secondary)]">
            {note.folder && <span>{note.folder}</span>}
            {dueDateTag && (
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                {new Date(dueDateTag.replace('echeance:', '')).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </span>
            )}
            {note.updated_at && (
              <span>{new Date(note.updated_at).toLocaleDateString('fr-FR')}</span>
            )}
          </div>
        </div>
      </button>
      {note.is_pinned && (
        <span className="text-amber-500 shrink-0 text-[10px]">pin</span>
      )}
      <button
        onClick={onDelete}
        className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
        title="Supprimer"
      >
        <TrashIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// Icones
function GoldocabLogo({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
      <circle cx="12" cy="10" r="3" fill="currentColor" strokeWidth={0} />
    </svg>
  )
}

function TaskIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function NoteIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="12" y2="17" />
    </svg>
  )
}

function TrashIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

function CalendarIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function XIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
