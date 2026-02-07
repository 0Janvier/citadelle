import { useState, useEffect, useRef, useCallback } from 'react'
import { useGoldocabDataStore } from '../../store/useGoldocabDataStore'
import { useDocumentStore } from '../../store/useDocumentStore'
import { useVariableStore } from '../../store/useVariableStore'
import { useToastStore } from '../../store/useToastStore'
import type { GoldocabClient } from '../../types/goldocab'
import { getClientDisplayName } from '../../types/goldocab'

interface ClientPickerProps {
  isOpen: boolean
  onClose: () => void
  target: 'client' | 'adverse'
}

export function ClientPicker({ isOpen, onClose, target }: ClientPickerProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const { searchClients, clientResults, isSearching, isAvailable, clearSearchResults } = useGoldocabDataStore()
  const activeDocumentId = useDocumentStore((s) => s.activeDocumentId)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      clearSearchResults()
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen, clearSearchResults])

  useEffect(() => {
    if (!isOpen) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (query.trim()) searchClients(query)
    }, 250)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, isOpen, searchClients])

  const handleSelect = useCallback((client: GoldocabClient) => {
    if (!activeDocumentId) return

    const vs = useVariableStore.getState()
    const prefix = target // 'client' ou 'adverse'

    // Remplir les variables selon le type de personne
    if (client.type_client === 'PersonneMorale') {
      vs.setDocumentValue(activeDocumentId, `${prefix}.nom`, client.denomination || '')
      vs.setDocumentValue(activeDocumentId, `${prefix}.prenom`, '')
      vs.setDocumentValue(activeDocumentId, `${prefix}.civilite`, '')
    } else {
      vs.setDocumentValue(activeDocumentId, `${prefix}.nom`, client.nom || '')
      vs.setDocumentValue(activeDocumentId, `${prefix}.prenom`, client.prenom || '')
      vs.setDocumentValue(activeDocumentId, `${prefix}.civilite`, client.civilite || '')
    }
    vs.setDocumentValue(activeDocumentId, `${prefix}.email`, client.email || '')
    vs.setDocumentValue(activeDocumentId, `${prefix}.telephone`, client.telephone || '')
    vs.setDocumentValue(activeDocumentId, `${prefix}.ville`, client.ville || '')
    vs.setDocumentValue(activeDocumentId, `${prefix}.code_postal`, client.code_postal || '')

    // Mettre a jour les parties dans metadata si pertinent
    if (target === 'client') {
      const doc = useDocumentStore.getState().getActiveDocument()
      if (doc) {
        useDocumentStore.getState().updateDocument(activeDocumentId, {
          metadata: {
            ...doc.metadata,
            parties: {
              ...doc.metadata?.parties,
              demandeur: getClientDisplayName(client),
            },
            createdAt: doc.metadata?.createdAt || new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
          },
        })
      }
    } else if (target === 'adverse') {
      const doc = useDocumentStore.getState().getActiveDocument()
      if (doc) {
        useDocumentStore.getState().updateDocument(activeDocumentId, {
          metadata: {
            ...doc.metadata,
            parties: {
              ...doc.metadata?.parties,
              defendeur: getClientDisplayName(client),
            },
            createdAt: doc.metadata?.createdAt || new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
          },
        })
      }
    }

    const label = target === 'client' ? 'Client' : 'Partie adverse'
    useToastStore.getState().addToast({
      type: 'success',
      message: `${label} "${getClientDisplayName(client)}" importe`,
    })

    onClose()
  }, [activeDocumentId, target, onClose])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, clientResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && clientResults[selectedIndex]) {
      e.preventDefault()
      handleSelect(clientResults[selectedIndex])
    }
  }, [clientResults, selectedIndex, handleSelect, onClose])

  if (!isOpen) return null

  const title = target === 'client' ? 'Rechercher un client' : 'Rechercher la partie adverse'

  return (
    <div
      className="fixed inset-0 z-[999] flex items-start justify-center pt-[15vh]"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="w-[480px] rounded-xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="px-4 py-2 text-xs font-medium opacity-50" style={{ borderBottom: '1px solid var(--border)' }}>
          {title}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <svg className="w-4 h-4 opacity-40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0) }}
            placeholder="Nom, prenom, societe, email..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text)' }}
          />
          {isSearching && (
            <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          )}
        </div>

        {/* Results */}
        <div className="max-h-[350px] overflow-y-auto p-1">
          {!isAvailable && (
            <div className="px-4 py-8 text-center text-sm opacity-50">
              Base GoldoCab non disponible
            </div>
          )}

          {isAvailable && !query && (
            <div className="px-4 py-8 text-center text-sm opacity-50">
              Tapez pour rechercher dans les clients GoldoCab
            </div>
          )}

          {isAvailable && query && !isSearching && clientResults.length === 0 && (
            <div className="px-4 py-8 text-center text-sm opacity-50">
              Aucun client trouve
            </div>
          )}

          {clientResults.map((client, i) => (
            <button
              key={client.id}
              className="w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer"
              style={{
                backgroundColor: i === selectedIndex ? 'var(--accent)' : 'transparent',
                color: i === selectedIndex ? 'white' : 'var(--text)',
              }}
              onClick={() => handleSelect(client)}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              {/* Type badge */}
              <span
                className="text-[10px] px-1.5 py-0.5 rounded shrink-0 font-medium"
                style={{
                  backgroundColor: i === selectedIndex ? 'rgba(255,255,255,0.2)' : 'var(--border)',
                }}
              >
                {client.type_client === 'PersonneMorale' ? 'PM' : 'PP'}
              </span>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {getClientDisplayName(client)}
                </div>
                <div className="flex items-center gap-2 text-xs mt-0.5" style={{ opacity: i === selectedIndex ? 0.8 : 0.5 }}>
                  {client.email && <span>{client.email}</span>}
                  {client.ville && <span>{client.ville}</span>}
                  {client.profession && <span>{client.profession}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 text-[10px] opacity-40 flex gap-3" style={{ borderTop: '1px solid var(--border)' }}>
          <span>&#8593;&#8595; Naviguer</span>
          <span>&#9166; Selectionner</span>
          <span>Esc Fermer</span>
        </div>
      </div>
    </div>
  )
}
