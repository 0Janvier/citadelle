/**
 * Panneau de métadonnées du document
 * Propriétés juridiques : numéro de dossier, RG, juridiction, parties, type
 */

import { useState, useEffect } from 'react'
import { X, FileText } from 'lucide-react'
import { useDocumentStore } from '../../store/useDocumentStore'
import type { DocumentMetadata, DocumentType } from '../../store/useDocumentStore'

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'conclusions', label: 'Conclusions' },
  { value: 'assignation', label: 'Assignation' },
  { value: 'requete', label: 'Requête' },
  { value: 'contrat', label: 'Contrat' },
  { value: 'courrier', label: 'Courrier' },
  { value: 'autre', label: 'Autre' },
]

interface DocumentMetadataPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function DocumentMetadataPanel({ isOpen, onClose }: DocumentMetadataPanelProps) {
  const activeDocumentId = useDocumentStore((s) => s.activeDocumentId)
  const documents = useDocumentStore((s) => s.documents)
  const updateDocument = useDocumentStore((s) => s.updateDocument)

  const doc = documents.find((d) => d.id === activeDocumentId)

  const [metadata, setMetadata] = useState<DocumentMetadata>({
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  })

  useEffect(() => {
    if (doc?.metadata) {
      setMetadata(doc.metadata)
    } else {
      setMetadata({
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      })
    }
  }, [doc?.id, doc?.metadata])

  if (!isOpen || !doc) return null

  const handleSave = () => {
    const updated: DocumentMetadata = {
      ...metadata,
      modifiedAt: new Date().toISOString(),
    }
    updateDocument(doc.id, { metadata: updated })
    onClose()
  }

  const updateField = <K extends keyof DocumentMetadata>(key: K, value: DocumentMetadata[K]) => {
    setMetadata((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-[var(--bg)] rounded-xl shadow-2xl w-[480px] max-h-[90vh] overflow-y-auto border border-[var(--border)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="text-lg font-semibold">Propriétés du document</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Type de document */}
          <div>
            <label className="block text-sm font-medium mb-1">Type de document</label>
            <select
              value={metadata.documentType || ''}
              onChange={(e) => updateField('documentType', (e.target.value || undefined) as DocumentType | undefined)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="">Non défini</option>
              {DOCUMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Auteur */}
          <div>
            <label className="block text-sm font-medium mb-1">Auteur</label>
            <input
              type="text"
              value={metadata.author || ''}
              onChange={(e) => updateField('author', e.target.value || undefined)}
              placeholder="Nom de l'auteur"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          {/* Numéro de dossier */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">N° dossier</label>
              <input
                type="text"
                value={metadata.caseNumber || ''}
                onChange={(e) => updateField('caseNumber', e.target.value || undefined)}
                placeholder="2024/001"
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">N° RG</label>
              <input
                type="text"
                value={metadata.rgNumber || ''}
                onChange={(e) => updateField('rgNumber', e.target.value || undefined)}
                placeholder="24/12345"
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
          </div>

          {/* Juridiction */}
          <div>
            <label className="block text-sm font-medium mb-1">Juridiction</label>
            <input
              type="text"
              value={metadata.jurisdiction || ''}
              onChange={(e) => updateField('jurisdiction', e.target.value || undefined)}
              placeholder="Tribunal judiciaire de Paris"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          {/* Parties */}
          <fieldset className="border border-[var(--border)] rounded-lg p-3">
            <legend className="text-sm font-medium px-2">Parties</legend>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Demandeur</label>
                <input
                  type="text"
                  value={metadata.parties?.demandeur || ''}
                  onChange={(e) => updateField('parties', {
                    ...metadata.parties,
                    demandeur: e.target.value || undefined,
                  })}
                  placeholder="Nom du demandeur"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Défendeur</label>
                <input
                  type="text"
                  value={metadata.parties?.defendeur || ''}
                  onChange={(e) => updateField('parties', {
                    ...metadata.parties,
                    defendeur: e.target.value || undefined,
                  })}
                  placeholder="Nom du défendeur"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
            </div>
          </fieldset>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1">Tags (séparés par virgule)</label>
            <input
              type="text"
              value={(metadata.tags || []).join(', ')}
              onChange={(e) => updateField('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))}
              placeholder="urgent, référé, appel"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          {/* Dates (read-only) */}
          <div className="grid grid-cols-2 gap-3 text-xs text-[var(--text-secondary)]">
            <div>
              <span className="font-medium">Créé :</span>{' '}
              {new Date(metadata.createdAt).toLocaleString('fr-FR')}
            </div>
            <div>
              <span className="font-medium">Modifié :</span>{' '}
              {new Date(metadata.modifiedAt).toLocaleString('fr-FR')}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-[var(--border)]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}
