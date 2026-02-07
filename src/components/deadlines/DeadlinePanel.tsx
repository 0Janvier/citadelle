/**
 * Panneau des échéances / délais juridiques
 * Groupement par urgence avec code couleur
 */

import { useState } from 'react'
import {
  Clock, Plus, Check, RotateCcw, Trash2, X,
  AlertTriangle, CalendarDays, CalendarClock, Calendar,
} from 'lucide-react'
import {
  useDeadlineStore,
  DEADLINE_TYPE_LABELS,
  type DeadlineType,
  type UrgencyGroup,
} from '../../store/useDeadlineStore'

interface DeadlinePanelProps {
  documentId: string
  onClose: () => void
}

const URGENCY_CONFIG: Record<UrgencyGroup, { label: string; color: string; icon: typeof Clock }> = {
  overdue: { label: 'En retard', color: 'text-red-500', icon: AlertTriangle },
  thisWeek: { label: 'Cette semaine', color: 'text-orange-500', icon: CalendarDays },
  thisMonth: { label: 'Ce mois', color: 'text-yellow-600', icon: CalendarClock },
  later: { label: 'Plus tard', color: 'text-green-600', icon: Calendar },
}

const URGENCY_ORDER: UrgencyGroup[] = ['overdue', 'thisWeek', 'thisMonth', 'later']

export function DeadlinePanel({ documentId, onClose }: DeadlinePanelProps) {
  const deadlines = useDeadlineStore((s) => s.getDeadlinesForDocument(documentId))
  const grouped = useDeadlineStore((s) => s.getGroupedDeadlines(documentId))
  const addDeadline = useDeadlineStore((s) => s.addDeadline)
  const completeDeadline = useDeadlineStore((s) => s.completeDeadline)
  const reopenDeadline = useDeadlineStore((s) => s.reopenDeadline)
  const deleteDeadline = useDeadlineStore((s) => s.deleteDeadline)

  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [type, setType] = useState<DeadlineType>('procedure')
  const [description, setDescription] = useState('')
  const [alertDays, setAlertDays] = useState(3)

  const handleAdd = () => {
    if (!title.trim() || !dueDate) return
    addDeadline({
      documentId,
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      dueDate,
      alertDaysBefore: alertDays,
      status: 'pending',
    })
    setTitle('')
    setDueDate('')
    setDescription('')
    setType('procedure')
    setAlertDays(3)
    setShowForm(false)
  }

  const completedDeadlines = deadlines.filter((d) => d.status === 'done')

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getDaysUntil = (dateStr: string) => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const due = new Date(dateStr)
    due.setHours(0, 0, 0, 0)
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Echéances
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowForm(!showForm)}
            className="p-1.5 rounded hover:bg-[var(--bg-secondary)] transition-colors"
            title="Ajouter une échéance"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="p-4 border-b border-[var(--border-color)] space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de l'échéance..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as DeadlineType)}
              className="px-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              {(Object.entries(DEADLINE_TYPE_LABELS) as [DeadlineType, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optionnel)..."
            rows={2}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
          />
          <div className="flex items-center justify-between">
            <label className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
              Alerte
              <input
                type="number"
                value={alertDays}
                onChange={(e) => setAlertDays(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-14 px-2 py-1 text-sm rounded border border-[var(--border-color)] bg-[var(--bg)]"
                min={0}
                max={30}
              />
              j. avant
            </label>
            <button
              onClick={handleAdd}
              disabled={!title.trim() || !dueDate}
              className="px-4 py-1.5 text-sm bg-[var(--accent)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ajouter
            </button>
          </div>
        </div>
      )}

      {/* Grouped deadlines */}
      <div className="flex-1 overflow-y-auto p-4">
        {deadlines.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="mx-auto w-10 h-10 mb-3 opacity-50" />
            <p className="text-sm">Aucune échéance</p>
            <p className="text-xs mt-1">Ajoutez des délais pour suivre vos obligations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {URGENCY_ORDER.map((group) => {
              const items = grouped[group]
              if (!items || items.length === 0) return null
              const config = URGENCY_CONFIG[group]
              const Icon = config.icon

              return (
                <div key={group}>
                  <div className={`flex items-center gap-2 mb-2 text-sm font-medium ${config.color}`}>
                    <Icon className="w-4 h-4" />
                    {config.label} ({items.length})
                  </div>
                  <div className="space-y-2 ml-6">
                    {items.map((deadline) => {
                      const daysUntil = getDaysUntil(deadline.dueDate)
                      return (
                        <div
                          key={deadline.id}
                          className="p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{deadline.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-[var(--text-secondary)]">
                                  {formatDate(deadline.dueDate)}
                                </span>
                                <span className={`text-xs font-medium ${
                                  daysUntil < 0
                                    ? 'text-red-500'
                                    : daysUntil === 0
                                      ? 'text-orange-500'
                                      : 'text-[var(--text-secondary)]'
                                }`}>
                                  {daysUntil < 0
                                    ? `${Math.abs(daysUntil)}j en retard`
                                    : daysUntil === 0
                                      ? "Aujourd'hui"
                                      : `dans ${daysUntil}j`}
                                </span>
                                <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--bg)] text-[var(--text-secondary)]">
                                  {DEADLINE_TYPE_LABELS[deadline.type]}
                                </span>
                              </div>
                              {deadline.description && (
                                <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                                  {deadline.description}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button
                                onClick={() => completeDeadline(deadline.id)}
                                className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-green-500 transition-colors"
                                title="Marquer comme terminé"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteDeadline(deadline.id)}
                                className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Completed deadlines */}
            {completedDeadlines.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-400">
                  <Check className="w-4 h-4" />
                  Terminées ({completedDeadlines.length})
                </div>
                <div className="space-y-2 ml-6">
                  {completedDeadlines.map((deadline) => (
                    <div
                      key={deadline.id}
                      className="p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] opacity-60"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm line-through">{deadline.title}</p>
                          <span className="text-xs text-[var(--text-secondary)]">
                            {formatDate(deadline.dueDate)}
                          </span>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => reopenDeadline(deadline.id)}
                            className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                            title="Rouvrir"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteDeadline(deadline.id)}
                            className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="p-3 border-t border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
        {deadlines.filter((d) => d.status === 'pending').length} échéance(s) en cours
        {grouped.overdue.length > 0 && (
          <span className="text-red-500 font-medium ml-2">
            {grouped.overdue.length} en retard
          </span>
        )}
      </div>
    </div>
  )
}
