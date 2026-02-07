/**
 * Dialogue de generation du bordereau de communication de pieces
 * Phase 4 : formulaire avec auto-population depuis DocumentMetadata
 */

import { useEffect, useRef, useState } from 'react'
import { usePiecesStore, extractPieceNumber, type FileItem } from '../../store/usePiecesStore'
import { useDocumentStore, type DocumentMetadata } from '../../store/useDocumentStore'
import { useEditorStore } from '../../store/useEditorStore'
import { useToastStore } from '../../store/useToastStore'
import { generateSimpleBordereau } from '../../lib/bordereauGenerator'
import { PIECE_NATURE_LABELS } from '../../types/legal'
import type { PieceNature } from '../../types/legal'

interface BordereauDialogProps {
  docId: string
  onClose: () => void
}

export function BordereauDialog({ docId, onClose }: BordereauDialogProps) {
  const getDocumentState = usePiecesStore((s) => s.getDocumentState)
  const setBordereauInfo = usePiecesStore((s) => s.setBordereauInfo)
  const buildPiecesForBordereau = usePiecesStore((s) => s.buildPiecesForBordereau)
  const files = usePiecesStore((s) => s.files)

  const documents = useDocumentStore((s) => s.documents)
  const editor = useEditorStore((s) => s.activeEditor)

  const dialogRef = useRef<HTMLDivElement>(null)

  // Get stored bordereau info or auto-populate from document metadata
  const docState = getDocumentState(docId)
  const activeDoc = documents.find((d) => d.id === docId)
  const docMeta: DocumentMetadata | undefined = activeDoc?.metadata

  const [demandeur, setDemandeur] = useState(
    docState.bordereauInfo?.demandeur || docMeta?.parties?.demandeur || ''
  )
  const [defendeur, setDefendeur] = useState(
    docState.bordereauInfo?.defendeur || docMeta?.parties?.defendeur || ''
  )
  const [juridiction, setJuridiction] = useState(
    docState.bordereauInfo?.juridiction || docMeta?.jurisdiction || ''
  )
  const [numeroRG, setNumeroRG] = useState(
    docState.bordereauInfo?.numeroRG || docMeta?.rgNumber || ''
  )

  // Get classified pieces for preview
  const classifiedFiles = files
    .filter((f) => /^P(\d+)\s+/.test(f.name))
    .sort((a, b) => (extractPieceNumber(a.name) || 0) - (extractPieceNumber(b.name) || 0))

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleInsert = () => {
    if (!editor) return

    // Save bordereau info for reuse
    setBordereauInfo(docId, { demandeur, defendeur, juridiction, numeroRG })

    // Build pieces array from store
    const pieces = buildPiecesForBordereau(docId)

    if (pieces.length === 0) {
      useToastStore.getState().addToast({ type: 'error', message: 'Aucune piece classee' })
      return
    }

    // Generate TipTap nodes
    const nodes = generateSimpleBordereau(pieces, {
      demandeur: demandeur || '[Demandeur]',
      defendeur: defendeur || '[Defendeur]',
      juridiction: juridiction || undefined,
      numeroRG: numeroRG || undefined,
    })

    // Insert into editor
    editor.chain().focus().insertContent(nodes).run()

    useToastStore.getState().addToast({
      type: 'success',
      message: `Bordereau insere avec ${pieces.length} piece${pieces.length > 1 ? 's' : ''}`,
    })

    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl shadow-2xl w-[520px] max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold text-[var(--text)]">
            Bordereau de communication de pieces
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Dossier info form */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide">
              Informations du dossier
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">
                  Demandeur
                </label>
                <input
                  type="text"
                  value={demandeur}
                  onChange={(e) => setDemandeur(e.target.value)}
                  placeholder="Nom du demandeur"
                  className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">
                  Defendeur
                </label>
                <input
                  type="text"
                  value={defendeur}
                  onChange={(e) => setDefendeur(e.target.value)}
                  placeholder="Nom du defendeur"
                  className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">
                  Juridiction
                </label>
                <input
                  type="text"
                  value={juridiction}
                  onChange={(e) => setJuridiction(e.target.value)}
                  placeholder="ex: Tribunal judiciaire de Paris"
                  className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">
                  N° RG
                </label>
                <input
                  type="text"
                  value={numeroRG}
                  onChange={(e) => setNumeroRG(e.target.value)}
                  placeholder="ex: 24/12345"
                  className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
            </div>
          </div>

          {/* Pieces preview */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide">
              Pieces ({classifiedFiles.length})
            </h3>

            {classifiedFiles.length === 0 ? (
              <div className="text-sm text-[var(--text-secondary)] italic py-4 text-center">
                Aucune piece classee
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto border border-[var(--border)] rounded-lg">
                {classifiedFiles.map((file) => (
                  <PiecePreviewRow
                    key={file.path}
                    file={file}
                    docId={docId}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)]">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleInsert}
            disabled={classifiedFiles.length === 0}
            className="px-4 py-2 text-sm font-medium bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Inserer dans le document
          </button>
        </div>
      </div>
    </div>
  )
}

// Preview row for a classified piece in the bordereau dialog
function PiecePreviewRow({ file, docId }: { file: FileItem; docId: string }) {
  const getEffectiveTitle = usePiecesStore((s) => s.getEffectiveTitle)
  const getDocumentState = usePiecesStore((s) => s.getDocumentState)

  const pieceNum = extractPieceNumber(file.name)
  const title = getEffectiveTitle(file.name, docId)
  const meta = getDocumentState(docId).pieceMetadata[file.name]
  const nature: PieceNature = meta?.nature || 'autre'

  return (
    <div className="flex items-center gap-3 px-3 py-2 border-b border-[var(--border)] last:border-b-0 text-sm">
      <span className="w-6 text-center font-bold text-[var(--accent)] flex-shrink-0">
        {pieceNum}
      </span>
      <span className="flex-1 truncate text-[var(--text)]">
        {title}
      </span>
      <span className="text-xs text-[var(--text-secondary)] flex-shrink-0 bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded">
        {PIECE_NATURE_LABELS[nature]}
      </span>
    </div>
  )
}
