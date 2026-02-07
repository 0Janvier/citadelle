import { useState, useEffect, useRef, useCallback } from 'react'
import { useGoldocabDataStore } from '../../store/useGoldocabDataStore'
import { useDocumentStore } from '../../store/useDocumentStore'
import { useVariableStore } from '../../store/useVariableStore'
import { useToastStore } from '../../store/useToastStore'
import type { GoldocabDossier } from '../../types/goldocab'
import { getDossierDisplayName } from '../../types/goldocab'

interface DossierPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect?: (dossier: GoldocabDossier) => void
}

export function DossierPicker({ isOpen, onClose, onSelect }: DossierPickerProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const { searchDossiers, dossierResults, isSearching, isAvailable, getClient,
          linkDossierToDocument, clearSearchResults } = useGoldocabDataStore()
  const activeDocumentId = useDocumentStore((s) => s.activeDocumentId)

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      clearSearchResults()
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen, clearSearchResults])

  // Debounced search
  useEffect(() => {
    if (!isOpen) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (query.trim()) {
        searchDossiers(query)
      }
    }, 250)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, isOpen, searchDossiers])

  const handleSelect = useCallback(async (dossier: GoldocabDossier) => {
    if (!activeDocumentId) return

    // Fetch full client data if available
    let client = null
    if (dossier.client_id) {
      client = await getClient(dossier.client_id)
    }

    // Link dossier to document
    linkDossierToDocument(activeDocumentId, dossier, client ?? undefined)

    // Auto-populate document metadata
    const doc = useDocumentStore.getState().getActiveDocument()
    if (doc) {
      useDocumentStore.getState().updateDocument(activeDocumentId, {
        metadata: {
          ...doc.metadata,
          caseNumber: dossier.nom || doc.metadata?.caseNumber,
          rgNumber: dossier.numero_rg || doc.metadata?.rgNumber,
          jurisdiction: dossier.juridiction || doc.metadata?.jurisdiction,
          parties: {
            ...doc.metadata?.parties,
            demandeur: dossier.client_name || doc.metadata?.parties?.demandeur,
          },
          createdAt: doc.metadata?.createdAt || new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
        },
      })
    }

    // Auto-populate variables
    const vs = useVariableStore.getState()
    if (client) {
      vs.setDocumentValue(activeDocumentId, 'client.nom', client.nom || client.denomination || '')
      vs.setDocumentValue(activeDocumentId, 'client.prenom', client.prenom || '')
      vs.setDocumentValue(activeDocumentId, 'client.civilite', client.civilite || '')
      vs.setDocumentValue(activeDocumentId, 'client.email', client.email || '')
      vs.setDocumentValue(activeDocumentId, 'client.telephone', client.telephone || '')
      vs.setDocumentValue(activeDocumentId, 'client.ville', client.ville || '')
      vs.setDocumentValue(activeDocumentId, 'client.code_postal', client.code_postal || '')
    }
    if (dossier.numero_rg) vs.setDocumentValue(activeDocumentId, 'dossier.rg', dossier.numero_rg)
    if (dossier.nom) vs.setDocumentValue(activeDocumentId, 'dossier.reference', dossier.nom)
    if (dossier.juridiction) vs.setDocumentValue(activeDocumentId, 'juridiction.nom', dossier.juridiction)
    if (dossier.date_audience) vs.setDocumentValue(activeDocumentId, 'date.audience', dossier.date_audience)

    useToastStore.getState().addToast({
      type: 'success',
      message: `Dossier "${getDossierDisplayName(dossier)}" lie`,
    })

    onSelect?.(dossier)
    onClose()
  }, [activeDocumentId, getClient, linkDossierToDocument, onSelect, onClose])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, dossierResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && dossierResults[selectedIndex]) {
      e.preventDefault()
      handleSelect(dossierResults[selectedIndex])
    }
  }, [dossierResults, selectedIndex, handleSelect, onClose])

  if (!isOpen) return null

  const statusLabel = (d: GoldocabDossier) => {
    const labels: Record<string, string> = {
      enCours: 'En cours',
      termine: 'Termine',
      enStandby: 'En standby',
      prospect: 'Prospect',
    }
    return labels[d.statut_gestion || ''] || d.statut_gestion || ''
  }

  return (
    <div
      className="fixed inset-0 z-[999] flex items-start justify-center pt-[15vh]"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="w-[520px] rounded-xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <svg className="w-4 h-4 opacity-40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0) }}
            placeholder="Rechercher un dossier (nom, RG, client, juridiction)..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text)' }}
          />
          {isSearching && (
            <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          )}
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-1">
          {!isAvailable && (
            <div className="px-4 py-8 text-center text-sm opacity-50">
              Base GoldoCab non disponible
            </div>
          )}

          {isAvailable && !query && (
            <div className="px-4 py-8 text-center text-sm opacity-50">
              Tapez pour rechercher dans les dossiers GoldoCab
            </div>
          )}

          {isAvailable && query && !isSearching && dossierResults.length === 0 && (
            <div className="px-4 py-8 text-center text-sm opacity-50">
              Aucun dossier trouve
            </div>
          )}

          {dossierResults.map((dossier, i) => (
            <button
              key={dossier.id}
              className="w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer"
              style={{
                backgroundColor: i === selectedIndex ? 'var(--accent)' : 'transparent',
                color: i === selectedIndex ? 'white' : 'var(--text)',
              }}
              onClick={() => handleSelect(dossier)}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              {/* Favori */}
              {dossier.est_favori && (
                <span className="text-yellow-500 text-xs">&#9733;</span>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {dossier.nom || `Dossier #${dossier.id}`}
                </div>
                <div className="flex items-center gap-2 text-xs mt-0.5" style={{ opacity: i === selectedIndex ? 0.8 : 0.5 }}>
                  {dossier.client_name && <span>{dossier.client_name}</span>}
                  {dossier.numero_rg && <span>RG: {dossier.numero_rg}</span>}
                  {dossier.juridiction && <span>{dossier.juridiction}</span>}
                </div>
              </div>

              {/* Status badge */}
              {dossier.statut_gestion && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: i === selectedIndex ? 'rgba(255,255,255,0.2)' : 'var(--border)',
                    color: i === selectedIndex ? 'white' : 'var(--text)',
                    opacity: 0.7,
                  }}
                >
                  {statusLabel(dossier)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 text-[10px] opacity-40 flex gap-3" style={{ borderTop: '1px solid var(--border)' }}>
          <span>&#8593;&#8595; Naviguer</span>
          <span>&#9166; Selectionner</span>
          <span>Esc Fermer</span>
        </div>
      </div>
    </div>
  )
}
