/**
 * GoldocabToolbar.tsx
 *
 * Toolbar component for GoldoCab integration.
 * Shows when editing a document from GoldoCab and provides save/return actions.
 */

import { useState } from 'react';
import {
  ArrowLeft,
  X,
  FolderOpen,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useGoldocabIntegration } from '../../hooks/useGoldocabIntegration';

// ============================================================================
// Types
// ============================================================================

interface GoldocabToolbarProps {
  className?: string;
  onClose?: () => void;
}

// ============================================================================
// Main Component
// ============================================================================

export function GoldocabToolbar({ className = '', onClose }: GoldocabToolbarProps) {
  const {
    currentSession,
    hasActiveSession,
    isExporting,
    error,
    saveAndReturn,
    cancelEditSession,
    clearError,
  } = useGoldocabIntegration();

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Don't render if no active session
  if (!hasActiveSession || !currentSession) {
    return null;
  }

  const handleSaveAndReturn = async () => {
    setIsSaving(true);
    clearError();

    try {
      const success = await saveAndReturn();
      if (success) {
        setShowSuccess(true);
        setTimeout(() => {
          onClose?.();
        }, 1500);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    await cancelEditSession();
    onClose?.();
  };

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-2
        bg-blue-50 dark:bg-blue-950/30
        border-b border-blue-200 dark:border-blue-800
        ${className}
      `}
    >
      {/* GoldoCab indicator */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
          Édition GoldoCab
        </span>
      </div>

      {/* Dossier info */}
      {currentSession.dossier_name && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/50">
          <FolderOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="text-xs text-blue-700 dark:text-blue-300">
            {currentSession.dossier_name}
          </span>
        </div>
      )}

      {/* File path */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
        <FileText className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="truncate" title={currentSession.original_path}>
          {currentSession.original_path.split('/').pop()}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Success message */}
      {showSuccess && (
        <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Sauvegardé !</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Cancel button */}
        <button
          onClick={handleCancel}
          className="
            flex items-center gap-1.5 px-3 py-1.5
            text-xs font-medium
            text-gray-600 dark:text-gray-400
            hover:text-gray-800 dark:hover:text-gray-200
            hover:bg-gray-100 dark:hover:bg-gray-800
            rounded transition-colors
          "
          title="Annuler et fermer"
        >
          <X className="w-3.5 h-3.5" />
          <span>Annuler</span>
        </button>

        {/* Save and return button */}
        <button
          onClick={handleSaveAndReturn}
          disabled={isSaving || isExporting}
          className="
            flex items-center gap-1.5 px-3 py-1.5
            text-xs font-medium
            text-white
            bg-blue-600 hover:bg-blue-700
            disabled:bg-blue-400
            rounded transition-colors
          "
          title="Sauvegarder et retourner à GoldoCab"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ArrowLeft className="w-3.5 h-3.5" />
          )}
          <span>{isSaving ? 'Sauvegarde...' : 'Sauvegarder et retourner'}</span>
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Export Dialog Component
// ============================================================================

interface ExportToGoldocabDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: { fileName: string; dossierId?: string }) => void;
}

export function ExportToGoldocabDialog({
  isOpen,
  onClose,
  onExport,
}: ExportToGoldocabDialogProps) {
  const [fileName, setFileName] = useState('');
  const [dossierId, setDossierId] = useState('');

  const handleExport = () => {
    if (!fileName.trim()) return;

    onExport({
      fileName: fileName.endsWith('.md') ? fileName : `${fileName}.md`,
      dossierId: dossierId || undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-800">
          <h2 className="text-lg font-semibold">Exporter vers GoldoCab</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nom du fichier
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="document.md"
              className="
                w-full px-3 py-2
                border dark:border-gray-700
                rounded-lg
                bg-white dark:bg-gray-800
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              ID du dossier (optionnel)
            </label>
            <input
              type="text"
              value={dossierId}
              onChange={(e) => setDossierId(e.target.value)}
              placeholder="UUID du dossier GoldoCab"
              className="
                w-full px-3 py-2
                border dark:border-gray-700
                rounded-lg
                bg-white dark:bg-gray-800
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />
            <p className="mt-1 text-xs text-gray-500">
              Si spécifié, le document sera automatiquement associé au dossier.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t dark:border-gray-800">
          <button
            onClick={onClose}
            className="
              px-4 py-2 text-sm font-medium
              text-gray-700 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-800
              rounded-lg transition-colors
            "
          >
            Annuler
          </button>
          <button
            onClick={handleExport}
            disabled={!fileName.trim()}
            className="
              px-4 py-2 text-sm font-medium
              text-white bg-blue-600 hover:bg-blue-700
              disabled:bg-blue-400 disabled:cursor-not-allowed
              rounded-lg transition-colors
            "
          >
            Exporter
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Status Badge Component
// ============================================================================

export function GoldocabStatusBadge() {
  const { hasActiveSession, currentSession } = useGoldocabIntegration();

  if (!hasActiveSession) return null;

  return (
    <div
      className="
        inline-flex items-center gap-1.5 px-2 py-1
        text-xs font-medium
        text-blue-700 dark:text-blue-300
        bg-blue-100 dark:bg-blue-900/50
        rounded-full
      "
      title={`Session GoldoCab: ${currentSession?.dossier_name || 'Sans dossier'}`}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
      <span>GoldoCab</span>
    </div>
  );
}

export default GoldocabToolbar;
