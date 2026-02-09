import { useState, useEffect, useRef, useCallback } from 'react'
import { useGoldocabNotesFilesStore } from '../../store/useGoldocabNotesFilesStore'
import { useGoldocabDataStore } from '../../store/useGoldocabDataStore'
import { useDocumentStore } from '../../store/useDocumentStore'
import { useEditorStore } from '../../store/useEditorStore'
import { useToastStore } from '../../store/useToastStore'

interface QuickTaskPopoverProps {
  isOpen: boolean
  onClose: () => void
}

export function QuickTaskPopover({ isOpen, onClose }: QuickTaskPopoverProps) {
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal')
  const [dueDate, setDueDate] = useState('')
  const [isSending, setIsSending] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const createNote = useGoldocabNotesFilesStore((s) => s.createNote)
  const activeDocumentId = useDocumentStore((s) => s.activeDocumentId)
  const linkedDossier = useGoldocabDataStore((s) =>
    activeDocumentId ? s.getLinkedDossier(activeDocumentId) : null
  )

  // Pre-fill from editor selection
  useEffect(() => {
    if (!isOpen) return
    setContent('')
    setPriority('normal')
    setDueDate('')

    const editor = useEditorStore.getState().activeEditor
    if (editor) {
      const { from, to } = editor.state.selection
      if (from !== to) {
        const selectedText = editor.state.doc.textBetween(from, to, ' ')
        setContent(selectedText)
      }
    }

    setTimeout(() => inputRef.current?.focus(), 50)
  }, [isOpen])

  const handleCreate = useCallback(async () => {
    if (!content.trim()) return

    setIsSending(true)

    // Build tags with task metadata
    const tags: string[] = ['tache']
    if (priority !== 'normal') tags.push(`priorite:${priority === 'high' ? 'haute' : 'basse'}`)
    if (dueDate) tags.push(`echeance:${dueDate}`)

    // Build content with metadata header
    let body = content.trim()
    if (dueDate || priority === 'high') {
      const meta: string[] = []
      if (priority === 'high') meta.push('**Priorite:** Haute')
      if (priority === 'low') meta.push('**Priorite:** Basse')
      if (dueDate) meta.push(`**Echeance:** ${new Date(dueDate).toLocaleDateString('fr-FR')}`)
      body = meta.join(' | ') + '\n\n' + body
    }

    // Extract title from first line
    const firstLine = content.trim().split('\n')[0].slice(0, 80)
    const title = firstLine || 'Tache sans titre'

    const path = await createNote({
      title,
      content: body,
      dossierId: linkedDossier ? String(linkedDossier.dossierId) : undefined,
      tags,
    })

    if (path) {
      useToastStore.getState().addToast({
        type: 'success',
        message: 'Tache envoyee a GoldoCab',
      })
    } else {
      useToastStore.getState().addToast({
        type: 'error',
        message: 'Erreur lors de la creation de la tache',
      })
    }

    setIsSending(false)
    onClose()
  }, [content, priority, dueDate, linkedDossier, createNote, onClose])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleCreate()
    }
  }, [onClose, handleCreate])

  if (!isOpen) return null

  const priorities = [
    { value: 'low' as const, label: 'Basse', color: '#9ca3af' },
    { value: 'normal' as const, label: 'Normale', color: '#3b82f6' },
    { value: 'high' as const, label: 'Haute', color: '#ef4444' },
  ]

  return (
    <div
      className="fixed inset-0 z-[999] flex items-start justify-center pt-[20vh]"
      style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
      onClick={onClose}
    >
      <div
        className="w-[420px] rounded-xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="text-xs font-medium opacity-60">Nouvelle tache GoldoCab</span>
          {linkedDossier && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--accent)', color: 'white', opacity: 0.8 }}
            >
              {linkedDossier.dossierName}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Task description */}
          <textarea
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Description de la tache..."
            rows={3}
            className="w-full bg-transparent outline-none text-sm resize-none rounded-lg p-2"
            style={{ color: 'var(--text)', border: '1px solid var(--border)' }}
          />

          {/* Priority */}
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-50 w-16">Priorite</span>
            <div className="flex gap-1">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  className="text-xs px-2.5 py-1 rounded-md transition-all cursor-pointer"
                  style={{
                    backgroundColor: priority === p.value ? p.color : 'transparent',
                    color: priority === p.value ? 'white' : 'var(--text)',
                    border: `1px solid ${priority === p.value ? p.color : 'var(--border)'}`,
                    opacity: priority === p.value ? 1 : 0.6,
                  }}
                  onClick={() => setPriority(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-50 w-16">Echeance</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="text-xs bg-transparent outline-none rounded-md px-2 py-1"
              style={{ color: 'var(--text)', border: '1px solid var(--border)' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
          <span className="text-[10px] opacity-40">Cmd+Enter pour creer</span>
          <div className="flex gap-2">
            <button
              className="text-xs px-3 py-1.5 rounded-md cursor-pointer"
              style={{ color: 'var(--text)', opacity: 0.6 }}
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              className="text-xs px-3 py-1.5 rounded-md font-medium cursor-pointer"
              style={{
                backgroundColor: content.trim() ? 'var(--accent)' : 'var(--border)',
                color: content.trim() ? 'white' : 'var(--text)',
                opacity: content.trim() ? 1 : 0.5,
              }}
              onClick={handleCreate}
              disabled={!content.trim() || isSending}
            >
              {isSending ? 'Envoi...' : 'Creer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
