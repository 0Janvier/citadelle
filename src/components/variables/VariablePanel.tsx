import { useState } from 'react'
import { useVariableStore } from '../../store/useVariableStore'
import { useLawyerProfileStore } from '../../store/useLawyerProfileStore'
import { VARIABLE_CATEGORY_LABELS, type VariableCategory } from '../../types/editor-features'

interface VariablePanelProps {
  documentId?: string
  onClose?: () => void
}

export function VariablePanel({ documentId, onClose }: VariablePanelProps) {
  const {
    selectedCategory,
    setSelectedCategory,
    getDefinitionsByCategory,
    getValue,
    setGlobalValue,
    setDocumentValue,
    syncFromLawyerProfile,
  } = useVariableStore()

  const lawyerProfile = useLawyerProfileStore()
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const definitionsByCategory = getDefinitionsByCategory()

  const handleEdit = (key: string) => {
    setEditingKey(key)
    setEditValue(getValue(key, documentId))
  }

  const handleSave = () => {
    if (!editingKey) return

    if (documentId) {
      setDocumentValue(documentId, editingKey, editValue)
    } else {
      setGlobalValue(editingKey, editValue)
    }

    setEditingKey(null)
    setEditValue('')
  }

  const handleSyncFromProfile = () => {
    syncFromLawyerProfile(lawyerProfile as unknown as Record<string, unknown>)
  }

  const handleInsertVariable = (key: string) => {
    // Copier la variable dans le presse-papier
    navigator.clipboard.writeText(`{{${key}}}`)
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* En-tête */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
        <h2 className="text-lg font-semibold">Variables</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncFromProfile}
            className="px-3 py-1.5 text-sm bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-colors"
            title="Synchroniser depuis le profil avocat"
          >
            Sync profil
          </button>
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
      </div>

      {/* Filtres par catégorie */}
      <div className="p-4 border-b border-[var(--border-color)]">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-secondary)] hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Toutes
          </button>
          {Object.entries(VARIABLE_CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key as VariableCategory)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                selectedCategory === key
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg-secondary)] hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des variables */}
      <div className="flex-1 overflow-y-auto p-4">
        {Object.entries(definitionsByCategory).map(([category, definitions]) => (
          <div key={category} className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {VARIABLE_CATEGORY_LABELS[category as VariableCategory] || category}
            </h3>

            <div className="space-y-2">
              {definitions.map((def) => {
                const value = getValue(def.key, documentId)
                const isEditing = editingKey === def.key

                return (
                  <div
                    key={def.key}
                    className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{def.label}</span>
                        <code className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                          {`{{${def.key}}}`}
                        </code>
                      </div>

                      {isEditing ? (
                        <div className="mt-2 flex gap-2">
                          {def.type === 'select' && def.options ? (
                            <select
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="flex-1 px-3 py-1.5 text-sm rounded border border-[var(--border-color)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                            >
                              <option value="">-- Sélectionner --</option>
                              {def.options.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : def.type === 'date' ? (
                            <input
                              type="date"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="flex-1 px-3 py-1.5 text-sm rounded border border-[var(--border-color)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                            />
                          ) : def.type === 'number' ? (
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              placeholder={def.placeholder}
                              className="flex-1 px-3 py-1.5 text-sm rounded border border-[var(--border-color)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                            />
                          ) : (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              placeholder={def.placeholder}
                              className="flex-1 px-3 py-1.5 text-sm rounded border border-[var(--border-color)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                            />
                          )}
                          <button
                            onClick={handleSave}
                            className="px-3 py-1.5 bg-[var(--status-success)] text-white text-sm rounded hover:opacity-90"
                          >
                            OK
                          </button>
                          <button
                            onClick={() => setEditingKey(null)}
                            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-sm rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {value || (
                            <span className="italic text-gray-400">Non définie</span>
                          )}
                        </div>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => handleInsertVariable(def.key)}
                          className="p-1.5 rounded hover:bg-[var(--bg-primary)] transition-colors"
                          title="Copier la variable"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEdit(def.key)}
                          className="p-1.5 rounded hover:bg-[var(--bg-primary)] transition-colors"
                          title="Modifier la valeur"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Aide */}
      <div className="p-4 border-t border-[var(--border-color)] text-sm text-gray-500">
        <p>
          Utilisez <code className="px-1 bg-gray-100 dark:bg-gray-700 rounded">{`{{variable}}`}</code> dans
          vos documents pour insérer des variables dynamiques.
        </p>
      </div>
    </div>
  )
}
