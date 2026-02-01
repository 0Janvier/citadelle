import { useState } from 'react'
import { useDeadlineStore, formatDeadlineDate, getDaysUntilDeadline, getDeadlineStatus } from '../../store/useDeadlineStore'
import { DELAI_PROCEDURE_LABELS, type DelaiProcedure, type DelaiType } from '../../types/editor-features'

interface DeadlinePanelProps {
  documentId?: string
  onClose?: () => void
}

export function DeadlinePanel({ documentId, onClose }: DeadlinePanelProps) {
  const {
    deadlines,
    showCompleted,
    setShowCompleted,
    addDeadline,
    toggleComplete,
    deleteDeadline,
    getUpcomingDeadlines,
    getOverdueDeadlines,
    getCPCDeadlines,
  } = useDeadlineStore()

  const [isAdding, setIsAdding] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [newDeadline, setNewDeadline] = useState({
    titre: '',
    type: 'custom' as DelaiProcedure,
    dateDebut: new Date().toISOString().split('T')[0],
    duree: 30,
    unite: 'jours_calendaires' as DelaiType,
    rappels: [7, 3, 1],
  })

  const cpcDeadlines = getCPCDeadlines()
  const overdueDeadlines = getOverdueDeadlines()
  const upcomingDeadlines = getUpcomingDeadlines(7)

  const filteredDeadlines = documentId
    ? deadlines.filter((d) => d.documentId === documentId)
    : deadlines

  const displayedDeadlines = showCompleted
    ? filteredDeadlines
    : filteredDeadlines.filter((d) => !d.complete)

  const handleAddDeadline = () => {
    addDeadline({
      ...newDeadline,
      description: '',
      documentId,
      complete: false,
    })

    setIsAdding(false)
    setNewDeadline({
      titre: '',
      type: 'custom',
      dateDebut: new Date().toISOString().split('T')[0],
      duree: 30,
      unite: 'jours_calendaires',
      rappels: [7, 3, 1],
    })
  }

  const handleUseCPCDeadline = (cpc: typeof cpcDeadlines[0]) => {
    setNewDeadline({
      ...newDeadline,
      titre: cpc.description,
      type: cpc.type,
      duree: cpc.duree,
      unite: cpc.unite,
    })
    setIsAdding(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'urgent':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* En-tête */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
        <h2 className="text-lg font-semibold">Délais de procédure</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Alertes */}
      {overdueDeadlines.length > 0 && (
        <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">{overdueDeadlines.length} délai(s) dépassé(s)</span>
          </div>
        </div>
      )}

      {upcomingDeadlines.length > 0 && overdueDeadlines.length === 0 && (
        <div className="mx-4 mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{upcomingDeadlines.length} délai(s) dans les 7 jours</span>
          </div>
        </div>
      )}

      {/* Templates CPC - Toujours visibles en premier */}
      <div className="px-4 py-3 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[var(--text-secondary)]">Délais CPC courants</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-xs text-[var(--text-secondary)]">Terminés</span>
          </label>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {cpcDeadlines.slice(0, 6).map((cpc, idx) => (
            <button
              key={idx}
              onClick={() => handleUseCPCDeadline(cpc)}
              className="px-2.5 py-1.5 text-xs bg-[var(--bg-secondary)] hover:bg-[var(--accent)] hover:text-white rounded-full transition-colors"
            >
              {cpc.description.replace('Délai d\'', '').replace('Délai de ', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Formulaire d'ajout simplifié */}
      {!isAdding ? (
        <div className="px-4 py-3">
          <button
            onClick={() => setIsAdding(true)}
            className="w-full px-4 py-2.5 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un délai personnalisé
          </button>
        </div>
      ) : (
        <div className="px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
          {/* Mode rapide : titre + date uniquement */}
          <div className="space-y-3">
            <input
              type="text"
              value={newDeadline.titre}
              onChange={(e) => setNewDeadline({ ...newDeadline, titre: e.target.value })}
              placeholder="Titre du délai (ex: Conclusions en réponse)"
              autoFocus
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Date de départ</label>
                <input
                  type="date"
                  value={newDeadline.dateDebut}
                  onChange={(e) => setNewDeadline({ ...newDeadline, dateDebut: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
              <div className="w-24">
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Durée</label>
                <div className="flex">
                  <input
                    type="number"
                    value={newDeadline.duree}
                    onChange={(e) => setNewDeadline({ ...newDeadline, duree: parseInt(e.target.value) || 0 })}
                    min={1}
                    className="w-full px-3 py-2 rounded-l-lg border border-r-0 border-[var(--border-color)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                  <span className="px-2 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-r-lg text-xs text-[var(--text-secondary)] flex items-center">j</span>
                </div>
              </div>
            </div>

            {/* Options avancées (repliées par défaut) */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
            >
              <svg className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {showAdvanced ? 'Masquer' : 'Plus d\'options'}
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border-color)]">
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">Type de procédure</label>
                  <select
                    value={newDeadline.type}
                    onChange={(e) => setNewDeadline({ ...newDeadline, type: e.target.value as DelaiProcedure })}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm"
                  >
                    {Object.entries(DELAI_PROCEDURE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">Unité de temps</label>
                  <select
                    value={newDeadline.unite}
                    onChange={(e) => setNewDeadline({ ...newDeadline, unite: e.target.value as DelaiType })}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm"
                  >
                    <option value="jours_calendaires">Jours calendaires</option>
                    <option value="jours_ouvres">Jours ouvrés</option>
                    <option value="jours_francs">Jours francs</option>
                    <option value="mois">Mois</option>
                    <option value="annees">Années</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleAddDeadline}
                disabled={!newDeadline.titre}
                className="flex-1 px-4 py-2 bg-[var(--status-success)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Ajouter
              </button>
              <button
                onClick={() => {
                  setIsAdding(false)
                  setShowAdvanced(false)
                }}
                className="px-4 py-2 bg-[var(--bg-tertiary)] rounded-lg hover:opacity-80 text-sm"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des délais */}
      <div className="flex-1 overflow-y-auto p-4">
        {displayedDeadlines.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>Aucun délai enregistré</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedDeadlines
              .sort((a, b) => new Date(a.dateEcheance).getTime() - new Date(b.dateEcheance).getTime())
              .map((deadline) => {
                const status = getDeadlineStatus(deadline.dateEcheance, deadline.complete)
                const daysUntil = getDaysUntilDeadline(deadline.dateEcheance)

                return (
                  <div
                    key={deadline.id}
                    className={`p-4 rounded-lg border ${
                      deadline.complete
                        ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                        : 'bg-[var(--bg-secondary)] border-[var(--border-color)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={deadline.complete}
                          onChange={() => toggleComplete(deadline.id)}
                          className="mt-1 w-5 h-5 rounded"
                        />
                        <div>
                          <h4 className={`font-medium ${deadline.complete ? 'line-through text-gray-400' : ''}`}>
                            {deadline.titre}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {DELAI_PROCEDURE_LABELS[deadline.type]} • Échéance : {formatDeadlineDate(deadline.dateEcheance)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                          {status === 'overdue'
                            ? `${Math.abs(daysUntil)}j de retard`
                            : status === 'completed'
                            ? 'Terminé'
                            : `${daysUntil}j`}
                        </span>
                        <button
                          onClick={() => deleteDeadline(deadline.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
