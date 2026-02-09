/**
 * useGoldocabIntegration.ts
 *
 * Hook React pour l'intégration bidirectionnelle avec GoldoCab.
 * Gère les sessions d'édition, l'export vers GoldoCab, et les deep links.
 */

import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { open } from '@tauri-apps/api/shell';
import { useDocumentStore } from '../store/useDocumentStore';
import { useFileOperations } from './useFileOperations';
import { handleError } from '../lib/errorHandler';

// ============================================================================
// Types
// ============================================================================

export interface GoldocabEditSession {
  session_id: string;
  original_path: string;
  working_path: string;
  dossier_id: string | null;
  dossier_name: string | null;
  created_at: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface GoldocabSessionResult {
  session_id: string;
  final_path: string;
  was_modified: boolean;
}

export interface GoldocabExportOptions {
  fileName: string;
  dossierId?: string;
  documentType?: string;
}

// ============================================================================
// Hook
// ============================================================================

export function useGoldocabIntegration() {
  // State
  const [currentSession, setCurrentSession] = useState<GoldocabEditSession | null>(null);
  const [activeSessions, setActiveSessions] = useState<GoldocabEditSession[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Document store
  const getActiveDocument = useDocumentStore((state) => state.getActiveDocument);
  const getDocument = useDocumentStore((state) => state.getDocument);
  const activeDocument = getActiveDocument();

  // ============================================================================
  // Session Management
  // ============================================================================

  /**
   * Start a new GoldoCab edit session
   */
  const startEditSession = useCallback(async (
    filePath: string,
    dossierId?: string,
    dossierName?: string
  ): Promise<GoldocabEditSession | null> => {
    try {
      setError(null);
      const session = await invoke<GoldocabEditSession>('start_goldocab_edit_session', {
        filePath,
        dossierId: dossierId || null,
        dossierName: dossierName || null,
      });
      setCurrentSession(session);
      return session;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      handleError(err, 'GoldoCab', { silent: true });
      return null;
    }
  }, []);

  /**
   * Complete the current edit session
   */
  const completeEditSession = useCallback(async (
    finalPath?: string
  ): Promise<GoldocabSessionResult | null> => {
    if (!currentSession) {
      setError('No active session to complete');
      return null;
    }

    try {
      setError(null);
      const result = await invoke<GoldocabSessionResult>('complete_goldocab_edit_session', {
        sessionId: currentSession.session_id,
        finalPath: finalPath || null,
      });
      setCurrentSession(null);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      handleError(err, 'GoldoCab', { silent: true });
      return null;
    }
  }, [currentSession]);

  /**
   * Cancel the current edit session
   */
  const cancelEditSession = useCallback(async (): Promise<boolean> => {
    if (!currentSession) {
      return true;
    }

    try {
      setError(null);
      await invoke('cancel_goldocab_edit_session', {
        sessionId: currentSession.session_id,
      });
      setCurrentSession(null);
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      handleError(err, 'GoldoCab', { silent: true });
      return false;
    }
  }, [currentSession]);

  /**
   * Refresh the list of active sessions
   */
  const refreshSessions = useCallback(async (): Promise<void> => {
    try {
      const sessions = await invoke<GoldocabEditSession[]>('list_goldocab_sessions');
      setActiveSessions(sessions);
    } catch (err) {
      handleError(err, 'GoldoCab', { silent: true });
    }
  }, []);

  // ============================================================================
  // Export to GoldoCab
  // ============================================================================

  /**
   * Export the current document to GoldoCab
   */
  const exportToGoldocab = useCallback(async (
    options: GoldocabExportOptions
  ): Promise<string | null> => {
    if (!activeDocument) {
      setError('No active document to export');
      return null;
    }

    try {
      setError(null);
      setIsExporting(true);

      // Get document content (convert to markdown if needed)
      const doc = getDocument(activeDocument.id);
      const content = doc?.content;

      if (!content) {
        throw new Error('Could not get document content');
      }

      const exportPath = await invoke<string>('export_to_goldocab', {
        content: JSON.stringify(content),
        fileName: options.fileName,
        dossierId: options.dossierId || null,
        documentType: options.documentType || null,
      });

      return exportPath;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      handleError(err, 'GoldoCab', { silent: true });
      return null;
    } finally {
      setIsExporting(false);
    }
  }, [activeDocument, getDocument]);

  /**
   * Export current document and complete session in one operation
   */
  const saveAndReturn = useCallback(async (): Promise<boolean> => {
    if (!currentSession || !activeDocument) {
      return false;
    }

    try {
      // Save the document first
      const doc = getDocument(activeDocument.id);
      const content = doc?.content;
      if (content) {
        await invoke('write_file', {
          path: currentSession.working_path,
          content: JSON.stringify(content),
        });
      }

      // Complete the session
      const result = await completeEditSession(currentSession.working_path);
      return result !== null;
    } catch (err) {
      handleError(err, 'GoldoCab');
      return false;
    }
  }, [currentSession, activeDocument, getDocument, completeEditSession]);

  // ============================================================================
  // Deep Link Handling
  // ============================================================================

  useEffect(() => {
    let unlisten: UnlistenFn | null = null;

    const setupDeepLinkListener = async () => {
      // Listen for deep link events from Tauri
      unlisten = await listen<string>('goldocab-open', async (event) => {
        console.log('[GoldoCab] Deep link received:', event.payload);

        try {
          // Parse the deep link URL
          const url = new URL(event.payload);
          const params = new URLSearchParams(url.search);

          const filePath = params.get('path');
          const dossierId = params.get('dossierId');
          const dossierName = params.get('dossierName');
          const mode = params.get('mode');

          if (filePath) {
            if (mode === 'note') {
              // Mode note: ouvrir directement le fichier .md dans l'editeur
              console.log('[GoldoCab] Opening note file:', filePath);
              const { openFileFromPath } = useFileOperations();
              await openFileFromPath(filePath);
            } else {
              // Mode document: session d'edition classique
              await startEditSession(filePath, dossierId || undefined, dossierName || undefined);
              const content = await invoke<string>('read_file', { path: filePath });
              console.log('[GoldoCab] File loaded, content length:', content.length);
            }
          }
        } catch (err) {
          handleError(err, 'GoldoCab');
        }
      });
    };

    setupDeepLinkListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [startEditSession]);

  // Refresh sessions on mount
  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  // ============================================================================
  // Return
  // ============================================================================

  return {
    // State
    currentSession,
    activeSessions,
    isExporting,
    error,
    hasActiveSession: currentSession !== null,
    isGoldocabSession: currentSession !== null,

    // Session management
    startEditSession,
    completeEditSession,
    cancelEditSession,
    refreshSessions,

    // Export
    exportToGoldocab,
    saveAndReturn,

    // Utilities
    clearError: () => setError(null),
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if we're in a GoldoCab edit context
 */
export function isGoldocabContext(): boolean {
  // Check URL parameters or session storage
  const params = new URLSearchParams(window.location.search);
  return params.has('goldocab') || params.has('session');
}

/**
 * Open GoldoCab with a specific dossier
 */
export async function openGoldocabDossier(dossierId: string): Promise<void> {
  const url = `goldocab://dossier/${dossierId}`;

  try {
    await open(url);
  } catch (err) {
    // Fallback: try window.open
    window.open(url, '_blank');
  }
}

/**
 * Notify GoldoCab that a document was modified
 */
export async function notifyGoldocabDocumentModified(filePath: string): Promise<void> {
  const url = `goldocab://document/modified?path=${encodeURIComponent(filePath)}`;

  try {
    // Use Tauri shell to open URL scheme
    await open(url);
  } catch (err) {
    handleError(err, 'GoldoCab', { silent: true });
  }
}

/**
 * Notify GoldoCab that a note was modified
 */
export async function notifyGoldocabNoteModified(filePath: string, noteId: string): Promise<void> {
  const url = `goldocab://note/modified?path=${encodeURIComponent(filePath)}&noteID=${noteId}`;

  try {
    await open(url);
  } catch (err) {
    handleError(err, 'GoldoCab', { silent: true });
  }
}

export default useGoldocabIntegration;
