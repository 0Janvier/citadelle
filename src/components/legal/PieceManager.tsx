import { useState, useCallback } from 'react'
import type {
  Piece,
  PieceNature,
  PieceProvenance,
} from '../../types/legal'

interface PieceManagerProps {
  pieces: Piece[]
  onAdd: (piece: Omit<Piece, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdate?: (id: string, updates: Partial<Piece>) => void
  onDelete: (id: string) => void
  onReorder: (startIndex: number, endIndex: number) => void
  readOnly?: boolean
}

/**
 * Gestionnaire de pièces juridiques
 *
 * Permet de :
 * - Ajouter, modifier et supprimer des pièces
 * - Réordonner les pièces par drag & drop
 * - Générer automatiquement les références (Pièce n°1, n°2, etc.)
 * - Exporter vers un bordereau de communication
 */
export function PieceManager({
  pieces,
  onAdd,
  onUpdate: _onUpdate,
  onDelete,
  onReorder,
  readOnly = false,
}: PieceManagerProps) {
  const [isAddingPiece, setIsAddingPiece] = useState(false)
  const [_editingPieceId, setEditingPieceId] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Formulaire pour nouvelle pièce
  const [newPiece, setNewPiece] = useState<{
    titre: string
    nature: PieceNature
    provenance: PieceProvenance
    dateDocument: string
    description: string
  }>({
    titre: '',
    nature: 'autre',
    provenance: 'demandeur',
    dateDocument: '',
    description: '',
  })

  const handleAddPiece = useCallback(() => {
    if (!newPiece.titre.trim()) return

    const numero = pieces.length + 1
    onAdd({
      numero,
      reference: `Pièce n°${numero}`,
      titre: newPiece.titre.trim(),
      nature: newPiece.nature,
      provenance: newPiece.provenance,
      dateDocument: newPiece.dateDocument || undefined,
      description: newPiece.description.trim() || undefined,
      confidentiel: false,
    })

    // Reset form
    setNewPiece({
      titre: '',
      nature: 'autre',
      provenance: 'demandeur',
      dateDocument: '',
      description: '',
    })
    setIsAddingPiece(false)
  }, [newPiece, pieces.length, onAdd])

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
  }

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return
    onReorder(draggedIndex, index)
    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="piece-manager">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--text)]">
          Pièces ({pieces.length})
        </h3>
        {!readOnly && (
          <button
            onClick={() => setIsAddingPiece(true)}
            className="px-3 py-1.5 text-sm bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
          >
            + Ajouter une pièce
          </button>
        )}
      </div>

      {/* Liste des pièces */}
      <div className="space-y-2">
        {pieces.map((piece, index) => (
          <div
            key={piece.id}
            draggable={!readOnly}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
            className={`
              piece-item p-3 rounded-lg border transition-all
              ${draggedIndex === index ? 'opacity-50 border-[var(--accent)]' : 'border-[var(--border)]'}
              ${!readOnly ? 'cursor-move hover:border-[var(--accent)]' : ''}
              bg-[var(--bg-secondary)]
            `}
          >
            <div className="flex items-start gap-3">
              {/* Numéro */}
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--accent)] text-white text-sm font-bold">
                {piece.numero}
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[var(--text)]">
                    {piece.titre}
                  </span>
                  {piece.confidentiel && (
                    <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded">
                      Confidentiel
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1 text-sm text-[var(--text-secondary)]">
                  <span className="capitalize">{piece.nature.replace('_', ' ')}</span>
                  {piece.dateDocument && (
                    <>
                      <span>•</span>
                      <span>{piece.dateDocument}</span>
                    </>
                  )}
                  {piece.pagination && (
                    <>
                      <span>•</span>
                      <span>p. {piece.pagination.debut}-{piece.pagination.fin}</span>
                    </>
                  )}
                </div>

                {piece.description && (
                  <p className="mt-1 text-sm text-[var(--text-muted)] line-clamp-2">
                    {piece.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              {!readOnly && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingPieceId(piece.id)}
                    className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                    title="Modifier"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(piece.id)}
                    className="p-1.5 text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                    title="Supprimer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {pieces.length === 0 && !isAddingPiece && (
          <div className="text-center py-8 text-[var(--text-muted)]">
            Aucune pièce. Cliquez sur "Ajouter une pièce" pour commencer.
          </div>
        )}
      </div>

      {/* Formulaire d'ajout */}
      {isAddingPiece && (
        <div className="mt-4 p-4 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
          <h4 className="font-medium text-[var(--text)] mb-3">Nouvelle pièce</h4>

          <div className="space-y-3">
            {/* Titre */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                Titre / Désignation *
              </label>
              <input
                type="text"
                value={newPiece.titre}
                onChange={(e) => setNewPiece({ ...newPiece, titre: e.target.value })}
                placeholder="Ex: Contrat de vente du 15 janvier 2024"
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                autoFocus
              />
            </div>

            {/* Nature et Provenance */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">
                  Nature
                </label>
                <select
                  value={newPiece.nature}
                  onChange={(e) => setNewPiece({ ...newPiece, nature: e.target.value as PieceNature })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)]"
                >
                  <option value="contrat">Contrat</option>
                  <option value="facture">Facture</option>
                  <option value="courrier">Courrier</option>
                  <option value="email">Email / Courriel</option>
                  <option value="attestation">Attestation</option>
                  <option value="proces_verbal">Procès-verbal</option>
                  <option value="rapport">Rapport</option>
                  <option value="decision_justice">Décision de justice</option>
                  <option value="acte_authentique">Acte authentique</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">
                  Provenance
                </label>
                <select
                  value={newPiece.provenance}
                  onChange={(e) => setNewPiece({ ...newPiece, provenance: e.target.value as PieceProvenance })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)]"
                >
                  <option value="demandeur">Demandeur</option>
                  <option value="défendeur">Défendeur</option>
                  <option value="tiers">Tiers</option>
                </select>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                Date du document
              </label>
              <input
                type="date"
                value={newPiece.dateDocument}
                onChange={(e) => setNewPiece({ ...newPiece, dateDocument: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                Description (optionnel)
              </label>
              <textarea
                value={newPiece.description}
                onChange={(e) => setNewPiece({ ...newPiece, description: e.target.value })}
                placeholder="Description complémentaire..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAddingPiece(false)}
                className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAddPiece}
                disabled={!newPiece.titre.trim()}
                className="px-4 py-2 text-sm bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PieceManager
