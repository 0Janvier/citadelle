// Adaptateur pour la compatibilité entre le nouveau store unifié et les anciens composants

import type { Snippet } from '../types/editor-features'
import type { LibraryItem } from '../types/library'
import { useLibraryStore } from '../store/useLibraryStore'

/**
 * Convertit un LibraryItem de type snippet en Snippet legacy
 */
export function libraryItemToSnippet(item: LibraryItem): Snippet {
  return {
    id: item.id,
    nom: item.title,
    description: item.description,
    raccourci: item.shortcut || '',
    contenu: typeof item.content === 'string' ? item.content : item.searchText,
    category: (item.legacySnippetCategory || 'custom') as Snippet['category'],
    variables: item.variables,
    isBuiltin: item.source === 'builtin',
    usageCount: item.usageCount,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

/**
 * Obtient les suggestions de snippets depuis le store unifié
 * Compatible avec l'interface de l'ancien useSnippetStore
 */
export function getLibrarySuggestions(query: string): Snippet[] {
  const store = useLibraryStore.getState()

  // S'assurer que le store est initialisé
  if (!store.isInitialized) {
    return []
  }

  const items = store.getSuggestions(query)
  return items.map(libraryItemToSnippet)
}

/**
 * Incrémente le compteur d'utilisation via le store unifié
 */
export function incrementLibraryUsage(id: string): void {
  const store = useLibraryStore.getState()
  store.incrementUsage(id)
}

/**
 * Trouve un snippet par raccourci via le store unifié
 */
export function findLibraryByRaccourci(raccourci: string): Snippet | undefined {
  const store = useLibraryStore.getState()
  const item = store.findByShortcut(raccourci)
  return item ? libraryItemToSnippet(item) : undefined
}

/**
 * Obtient tous les raccourcis via le store unifié
 */
export function getAllLibraryRaccourcis(): string[] {
  const store = useLibraryStore.getState()
  return store.getAllShortcuts()
}

/**
 * Hook de configuration pour SlashCommandExtension
 * Utilise le nouveau store si initialisé, sinon fallback sur l'ancien
 */
export function createLibrarySlashCommandConfig() {
  return {
    getSuggestions: (query: string): Snippet[] => {
      const libraryStore = useLibraryStore.getState()

      // Si le store unifié est initialisé, l'utiliser
      if (libraryStore.isInitialized) {
        return getLibrarySuggestions(query)
      }

      // Sinon, retourner un tableau vide (l'ancien store sera utilisé par défaut)
      return []
    },
    onSelect: (item: Snippet) => {
      const libraryStore = useLibraryStore.getState()

      if (libraryStore.isInitialized) {
        incrementLibraryUsage(item.id)
      }
    },
  }
}
