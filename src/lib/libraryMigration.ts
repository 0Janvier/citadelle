// Migration des données localStorage vers le nouveau système de bibliothèque unifié

import type { LibraryItem, MigrationResult } from '../types/library'
import {
  generateLibraryItemId,
  extractVariables,
  jsonContentToSearchText,
  LEGACY_DOMAINE_TO_CATEGORY,
  LEGACY_SNIPPET_CATEGORY_TO_CATEGORY,
} from '../types/library'
import * as storage from './libraryStorage'
import { ALL_FORMULES } from '../data/formules'

// ============================================================================
// Types pour les anciennes données
// ============================================================================

interface LegacyClause {
  id: string
  titre: string
  description?: string
  contenu: unknown // JSONContent
  texteRecherche: string
  domaine: string
  type: string
  tags: string[]
  favoris: boolean
  usageCount: number
  isBuiltin: boolean
  createdAt: string
  updatedAt: string
}

interface LegacySnippet {
  id: string
  nom: string
  description?: string
  raccourci: string
  contenu: string
  category: string
  variables: string[]
  isBuiltin: boolean
  usageCount: number
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Fonctions de migration
// ============================================================================

/**
 * Vérifie si une migration est nécessaire
 */
export async function checkMigrationNeeded(): Promise<boolean> {
  // Vérifier si le localStorage contient des données anciennes
  const hasOldClauses = localStorage.getItem('citadelle-clauses') !== null
  const hasOldSnippets = localStorage.getItem('citadelle-snippets') !== null

  if (!hasOldClauses && !hasOldSnippets) {
    return false
  }

  // Vérifier si la bibliothèque est déjà migrée
  const metadata = await storage.loadMetadata()
  return metadata.migratedFrom === undefined
}

/**
 * Récupère les clauses depuis le localStorage
 */
function getOldClauses(): LegacyClause[] {
  const data = localStorage.getItem('citadelle-clauses')
  if (!data) return []

  try {
    const parsed = JSON.parse(data)
    return parsed.state?.clauses || []
  } catch {
    return []
  }
}

/**
 * Récupère les snippets depuis le localStorage
 */
function getOldSnippets(): LegacySnippet[] {
  const data = localStorage.getItem('citadelle-snippets')
  if (!data) return []

  try {
    const parsed = JSON.parse(data)
    return parsed.state?.snippets || []
  } catch {
    return []
  }
}

/**
 * Convertit une clause legacy en LibraryItem
 */
function convertClause(clause: LegacyClause): LibraryItem {
  const now = new Date().toISOString()
  const categoryId = LEGACY_DOMAINE_TO_CATEGORY[clause.domaine] || 'cat-clause-autre'

  return {
    id: generateLibraryItemId('clause'),
    type: 'clause',
    version: 1,
    title: clause.titre,
    description: clause.description,
    content: clause.contenu as string | import('@tiptap/react').JSONContent,
    contentFormat: 'richtext',
    searchText: clause.texteRecherche || jsonContentToSearchText(clause.contenu as import('@tiptap/react').JSONContent),
    categoryId,
    tags: clause.tags || [],
    variables: [],
    legacyDomaine: clause.domaine,
    legacyClauseType: clause.type,
    source: clause.isBuiltin ? 'builtin' : 'custom',
    isFavorite: clause.favoris || false,
    usageCount: clause.usageCount || 0,
    createdAt: clause.createdAt || now,
    updatedAt: clause.updatedAt || now,
  }
}

/**
 * Convertit un snippet legacy en LibraryItem
 */
function convertSnippet(snippet: LegacySnippet): LibraryItem {
  const now = new Date().toISOString()
  const categoryId = LEGACY_SNIPPET_CATEGORY_TO_CATEGORY[snippet.category] || 'cat-custom'

  const variables = snippet.variables || extractVariables(snippet.contenu)

  return {
    id: generateLibraryItemId('snippet'),
    type: 'snippet',
    version: 1,
    title: snippet.nom,
    description: snippet.description,
    content: snippet.contenu,
    contentFormat: 'plaintext',
    searchText: `${snippet.nom} ${snippet.description || ''} ${snippet.contenu} ${snippet.raccourci}`.toLowerCase(),
    categoryId,
    tags: [],
    shortcut: snippet.raccourci,
    variables,
    legacySnippetCategory: snippet.category,
    source: snippet.isBuiltin ? 'builtin' : 'custom',
    isFavorite: false,
    usageCount: snippet.usageCount || 0,
    createdAt: snippet.createdAt || now,
    updatedAt: snippet.updatedAt || now,
  }
}

/**
 * Génère les clauses built-in par défaut
 */
function getDefaultBuiltinClauses(): Omit<LibraryItem, 'id' | 'createdAt' | 'updatedAt'>[] {
  return [
    {
      type: 'clause',
      version: 1,
      title: 'Clause de confidentialité standard',
      description: 'Clause de confidentialité pour contrats commerciaux',
      content: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'ARTICLE X – CONFIDENTIALITÉ' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: "Chaque Partie s'engage à considérer comme strictement confidentielles toutes les informations de quelque nature qu'elles soient, écrites ou orales, relatives à l'autre Partie, dont elle aura eu connaissance à l'occasion de la négociation, de la conclusion ou de l'exécution du présent contrat.",
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: "Les Parties s'interdisent de divulguer ces informations à des tiers, sauf accord préalable et écrit de l'autre Partie.",
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Cette obligation de confidentialité perdurera pendant une durée de [DURÉE] à compter de la fin du présent contrat, pour quelque cause que ce soit.',
              },
            ],
          },
        ],
      },
      contentFormat: 'richtext',
      searchText: '',
      categoryId: 'cat-contrats',
      tags: ['NDA', 'secret', 'commercial'],
      variables: [],
      source: 'builtin',
      isFavorite: true,
      usageCount: 0,
    },
    {
      type: 'clause',
      version: 1,
      title: 'Clause de force majeure',
      description: "Clause de force majeure conforme à l'article 1218 du Code civil",
      content: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'ARTICLE X – FORCE MAJEURE' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: "Aucune des Parties ne sera tenue pour responsable d'un manquement à l'une quelconque de ses obligations si ce manquement est provoqué par un événement de force majeure au sens de l'article 1218 du Code civil.",
              },
            ],
          },
        ],
      },
      contentFormat: 'richtext',
      searchText: '',
      categoryId: 'cat-contrats',
      tags: ['force majeure', 'exonération', 'responsabilité'],
      variables: [],
      source: 'builtin',
      isFavorite: true,
      usageCount: 0,
    },
    {
      type: 'clause',
      version: 1,
      title: 'Clause résolutoire bail',
      description: 'Clause résolutoire pour défaut de paiement du loyer',
      content: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'ARTICLE X – CLAUSE RÉSOLUTOIRE' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: "À défaut de paiement à son échéance d'un seul terme de loyer ou de charges, ou à défaut d'exécution de l'une quelconque des conditions du présent bail, celui-ci sera résilié de plein droit, si bon semble au Bailleur, un mois après un commandement de payer demeuré infructueux.",
              },
            ],
          },
        ],
      },
      contentFormat: 'richtext',
      searchText: '',
      categoryId: 'cat-baux',
      tags: ['bail', 'résiliation', 'loyer', 'impayé'],
      variables: [],
      source: 'builtin',
      isFavorite: true,
      usageCount: 0,
    },
    {
      type: 'clause',
      version: 1,
      title: 'Clause attributive de juridiction',
      description: "Clause d'attribution de compétence territoriale",
      content: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'ARTICLE X – ATTRIBUTION DE JURIDICTION' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: "TOUT LITIGE RELATIF À LA VALIDITÉ, L'INTERPRÉTATION, L'EXÉCUTION OU LA RÉSILIATION DU PRÉSENT CONTRAT SERA SOUMIS À LA COMPÉTENCE EXCLUSIVE DES TRIBUNAUX DE [VILLE].",
              },
            ],
          },
        ],
      },
      contentFormat: 'richtext',
      searchText: '',
      categoryId: 'cat-contrats',
      tags: ['juridiction', 'compétence', 'tribunal'],
      variables: [],
      source: 'builtin',
      isFavorite: true,
      usageCount: 0,
    },
  ]
}

/**
 * Génère les snippets built-in à partir des formules existantes
 */
function getDefaultBuiltinSnippets(): Omit<LibraryItem, 'id' | 'createdAt' | 'updatedAt'>[] {
  return ALL_FORMULES.map((formule) => {
    const categoryId = LEGACY_SNIPPET_CATEGORY_TO_CATEGORY[formule.category] || 'cat-custom'

    return {
      type: 'snippet' as const,
      version: 1,
      title: formule.nom,
      description: formule.description,
      content: formule.contenu,
      contentFormat: 'plaintext' as const,
      searchText: `${formule.nom} ${formule.description || ''} ${typeof formule.contenu === 'string' ? formule.contenu : ''} ${formule.raccourci}`.toLowerCase(),
      categoryId,
      tags: [],
      shortcut: formule.raccourci,
      variables: formule.variables || extractVariables(typeof formule.contenu === 'string' ? formule.contenu : ''),
      legacySnippetCategory: formule.category,
      source: 'builtin' as const,
      isFavorite: false,
      usageCount: 0,
    }
  })
}

/**
 * Effectue la migration complète
 */
export async function performMigration(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    clausesMigrated: 0,
    snippetsMigrated: 0,
    categoriesCreated: 0,
    errors: [],
  }

  try {
    // Initialiser le répertoire de la bibliothèque
    await storage.initLibraryDirectory()

    // Créer un backup
    result.backupPath = await storage.createBackup()

    const now = new Date().toISOString()

    // Récupérer les anciennes données
    const oldClauses = getOldClauses()
    const oldSnippets = getOldSnippets()

    // Si pas de données locales, générer les built-ins par défaut
    if (oldClauses.length === 0) {
      const defaultClauses = getDefaultBuiltinClauses()
      for (const clause of defaultClauses) {
        try {
          const item: LibraryItem = {
            ...clause,
            id: generateLibraryItemId('clause'),
            searchText: jsonContentToSearchText(clause.content as Record<string, unknown>),
            createdAt: now,
            updatedAt: now,
          }
          await storage.saveItem(item)
          result.clausesMigrated++
        } catch (error) {
          result.errors.push(`Erreur clause par défaut "${clause.title}": ${error}`)
        }
      }
    } else {
      // Migrer les clauses existantes
      for (const clause of oldClauses) {
        try {
          const item = convertClause(clause)
          await storage.saveItem(item)
          result.clausesMigrated++
        } catch (error) {
          result.errors.push(`Erreur clause "${clause.titre}": ${error}`)
        }
      }
    }

    // Si pas de snippets locaux, générer les built-ins par défaut
    if (oldSnippets.length === 0) {
      const defaultSnippets = getDefaultBuiltinSnippets()
      for (const snippet of defaultSnippets) {
        try {
          const item: LibraryItem = {
            ...snippet,
            id: generateLibraryItemId('snippet'),
            createdAt: now,
            updatedAt: now,
          }
          await storage.saveItem(item)
          result.snippetsMigrated++
        } catch (error) {
          result.errors.push(`Erreur snippet par défaut "${snippet.title}": ${error}`)
        }
      }
    } else {
      // Migrer les snippets existants
      for (const snippet of oldSnippets) {
        try {
          const item = convertSnippet(snippet)
          await storage.saveItem(item)
          result.snippetsMigrated++
        } catch (error) {
          result.errors.push(`Erreur snippet "${snippet.nom}": ${error}`)
        }
      }
    }

    // Marquer la migration comme effectuée
    const metadata = await storage.loadMetadata()
    metadata.migratedFrom = 'localStorage'
    metadata.itemCount = result.clausesMigrated + result.snippetsMigrated
    await storage.saveMetadata(metadata)

    result.success = result.errors.length === 0

    return result
  } catch (error) {
    result.errors.push(`Erreur générale: ${error}`)
    return result
  }
}

/**
 * Réinitialise la bibliothèque avec les built-ins par défaut
 */
export async function resetToDefaults(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    clausesMigrated: 0,
    snippetsMigrated: 0,
    categoriesCreated: 0,
    errors: [],
  }

  try {
    // Créer un backup avant reset
    result.backupPath = await storage.createBackup()

    // Supprimer tous les items existants
    const existingItems = await storage.loadAllItems()
    for (const item of existingItems) {
      await storage.deleteItem(item.id)
    }

    const now = new Date().toISOString()

    // Recréer les clauses par défaut
    const defaultClauses = getDefaultBuiltinClauses()
    for (const clause of defaultClauses) {
      try {
        const item: LibraryItem = {
          ...clause,
          id: generateLibraryItemId('clause'),
          searchText: jsonContentToSearchText(clause.content as Record<string, unknown>),
          createdAt: now,
          updatedAt: now,
        }
        await storage.saveItem(item)
        result.clausesMigrated++
      } catch (error) {
        result.errors.push(`Erreur clause "${clause.title}": ${error}`)
      }
    }

    // Recréer les snippets par défaut
    const defaultSnippets = getDefaultBuiltinSnippets()
    for (const snippet of defaultSnippets) {
      try {
        const item: LibraryItem = {
          ...snippet,
          id: generateLibraryItemId('snippet'),
          createdAt: now,
          updatedAt: now,
        }
        await storage.saveItem(item)
        result.snippetsMigrated++
      } catch (error) {
        result.errors.push(`Erreur snippet "${snippet.title}": ${error}`)
      }
    }

    // Réinitialiser les catégories
    await storage.saveCategories(
      (await storage.loadCategories()).filter((c) => c.isBuiltin)
    )

    result.success = result.errors.length === 0
    return result
  } catch (error) {
    result.errors.push(`Erreur générale: ${error}`)
    return result
  }
}
