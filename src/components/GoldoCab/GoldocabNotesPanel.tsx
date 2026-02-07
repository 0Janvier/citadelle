// Panneau pour créer et gérer les notes/tâches GoldoCab
import { useState } from 'react'
import { useGoldocabNotesStore, GoldocabNote } from '../../store/useGoldocabNotesStore'
import { useDocumentStore } from '../../store/useDocumentStore'

interface GoldocabNotesPanelProps {
  onClose: () => void
}

export function GoldocabNotesPanel({ onClose: _onClose }: GoldocabNotesPanelProps) {
  const {
    notes,
    isLoading,
    error,
    addNote,
    removeNote,
    syncNote,
    syncAll,
    getUnsyncedCount,
    clearError,
    clearSynced,
  } = useGoldocabNotesStore()

  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId)
  const documents = useDocumentStore((state) => state.documents)
  const activeDocument = documents.find((d) => d.id === activeDocumentId)

  const [showNewForm, setShowNewForm] = useState<'note' | 'task' | null>(null)
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal')
  const [dueDate, setDueDate] = useState('')

  const unsyncedCount = getUnsyncedCount()

  const handleSubmit = () => {
    if (!content.trim()) return

    addNote({
      type: showNewForm!,
      content: content.trim(),
      documentId: activeDocumentId,
      documentTitle: activeDocument?.title || null,
      dossierId: null,
      dossierName: null,
      priority: showNewForm === 'task' ? priority : 'normal',
      dueDate: showNewForm === 'task' && dueDate ? dueDate : null,
    })

    // Reset form
    setContent('')
    setPriority('normal')
    setDueDate('')
    setShowNewForm(null)
  }

  const handleCancel = () => {
    setContent('')
    setPriority('normal')
    setDueDate('')
    setShowNewForm(null)
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <GoldocabLogo />
          <span className="font-semibold text-[var(--text)]">GoldoCab</span>
          {unsyncedCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-[var(--accent)] text-white rounded-full">
              {unsyncedCount}
            </span>
          )}
        </div>
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

      {/* Document actif */}
      {activeDocument && (
        <div className="mx-4 mt-3 p-2 bg-[var(--bg-secondary)] rounded-lg text-sm">
          <span className="text-[var(--text-secondary)]">Lié à : </span>
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
              <div className="font-medium text-[var(--text)]">Nouvelle tâche</div>
              <div className="text-xs text-[var(--text-secondary)]">Avec priorité et échéance</div>
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
              {showNewForm === 'task' ? 'Nouvelle tâche' : 'Nouvelle note'}
            </span>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={showNewForm === 'task' ? 'Décrire la tâche...' : 'Contenu de la note...'}
            className="w-full h-24 p-3 text-sm bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg resize-none focus:outline-none focus:border-[var(--accent)]"
            autoFocus
          />

          {showNewForm === 'task' && (
            <div className="mt-3 flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Priorité</label>
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
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Échéance</label>
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
              disabled={!content.trim()}
              className="flex-1 py-2 text-sm bg-[var(--accent)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              Ajouter
            </button>
          </div>
        </div>
      )}

      {/* Liste des notes */}
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="p-8 text-center text-[var(--text-secondary)]">
            <GoldocabLogo className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucune note ou tâche</p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onSync={() => syncNote(note.id)}
                onDelete={() => removeNote(note.id)}
                isLoading={isLoading}
              />
            ))}
          </div>
        )}
      </div>

      {/* Actions bas */}
      {notes.length > 0 && (
        <div className="p-4 border-t border-[var(--border)] space-y-2">
          {unsyncedCount > 0 && (
            <button
              onClick={syncAll}
              disabled={isLoading}
              className="w-full py-2.5 text-sm font-medium bg-[var(--accent)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <SyncIcon className="w-4 h-4" />
                  Synchroniser tout ({unsyncedCount})
                </>
              )}
            </button>
          )}
          <button
            onClick={clearSynced}
            className="w-full py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
          >
            Effacer les éléments synchronisés
          </button>
        </div>
      )}
    </div>
  )
}

// Carte pour une note/tâche
function NoteCard({
  note,
  onSync,
  onDelete,
  isLoading,
}: {
  note: GoldocabNote
  onSync: () => void
  onDelete: () => void
  isLoading: boolean
}) {
  const priorityColors = {
    low: 'text-gray-500',
    normal: 'text-blue-500',
    high: 'text-red-500',
  }

  return (
    <div
      className={`p-3 rounded-lg border transition-colors ${
        note.synced
          ? 'bg-green-500/5 border-green-500/20'
          : 'bg-[var(--bg-secondary)] border-[var(--border)]'
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5">
          {note.type === 'task' ? (
            <TaskIcon className={`w-4 h-4 ${priorityColors[note.priority]}`} />
          ) : (
            <NoteIcon className="w-4 h-4 text-amber-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[var(--text)] line-clamp-2">{note.content}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            {note.documentTitle && (
              <span className="truncate max-w-[120px]">{note.documentTitle}</span>
            )}
            {note.type === 'task' && note.dueDate && (
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                {new Date(note.dueDate).toLocaleDateString('fr-FR')}
              </span>
            )}
            {note.synced && (
              <span className="text-green-500 flex items-center gap-1">
                <CheckIcon className="w-3 h-3" />
                Sync
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!note.synced && (
            <button
              onClick={onSync}
              disabled={isLoading}
              className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors disabled:opacity-50"
              title="Synchroniser"
            >
              <SyncIcon className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-red-500 transition-colors"
            title="Supprimer"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Icônes
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

function SyncIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M21 12a9 9 0 0 1-9 9m0 0a9 9 0 0 1-6.364-2.636M12 21v-4m0 0h4M3 12a9 9 0 0 1 9-9m0 0a9 9 0 0 1 6.364 2.636M12 3v4m0 0H8" />
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

function CheckIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <polyline points="20 6 9 17 4 12" />
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

function LoadingSpinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}
