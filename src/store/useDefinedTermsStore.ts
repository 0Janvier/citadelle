// Store pour gérer les termes définis du projet
import { create } from 'zustand'

// ============================================================================
// Types
// ============================================================================

export interface DefinedTerm {
  id: string
  term: string                    // Le terme tel qu'il apparaît ("le Vendeur")
  normalizedTerm: string          // Version normalisée pour comparaison ("vendeur")
  definition: string              // Le texte de la définition
  definitionContext: string       // Contexte autour de la définition (pour preview)
  sourceDocumentId: string        // ID du document source
  sourceDocumentPath?: string     // Chemin du fichier source
  sourceDocumentName?: string     // Nom du fichier source
  position: {
    from: number
    to: number
  }
  createdAt: string
}

export interface TermUsage {
  id: string
  termId: string                  // Référence au DefinedTerm
  documentId: string
  documentPath?: string
  documentName?: string
  position: {
    from: number
    to: number
  }
}

export interface TermConflict {
  term: string
  normalizedTerm: string
  definitions: DefinedTerm[]      // Plusieurs définitions pour le même terme
}

interface DefinedTermsStore {
  // État
  terms: DefinedTerm[]
  usages: TermUsage[]
  isExtracting: boolean

  // Actions CRUD
  addTerm: (term: Omit<DefinedTerm, 'id' | 'createdAt'>) => string
  removeTerm: (termId: string) => void
  updateTerm: (termId: string, updates: Partial<DefinedTerm>) => void
  clearTerms: () => void
  clearTermsForDocument: (documentId: string) => void

  // Usages
  addUsage: (usage: Omit<TermUsage, 'id'>) => string
  removeUsage: (usageId: string) => void
  clearUsagesForDocument: (documentId: string) => void

  // Recherche
  getTermByNormalized: (normalizedTerm: string) => DefinedTerm | undefined
  getTermById: (termId: string) => DefinedTerm | undefined
  getUsagesForTerm: (termId: string) => TermUsage[]
  getTermsForDocument: (documentId: string) => DefinedTerm[]

  // Analyse
  getConflicts: () => TermConflict[]
  getUndefinedUsages: () => TermUsage[]  // Usages sans définition correspondante

  // Extraction
  setIsExtracting: (value: boolean) => void
  extractTermsFromText: (text: string, documentId: string, documentName?: string) => DefinedTerm[]
}

// ============================================================================
// Patterns de détection des termes définis
// ============================================================================

// Patterns pour détecter les définitions de termes
// Note: Seuls les guillemets français « » sont utilisés (Typography convertit " → « »)
const DEFINITION_PATTERNS = [
  // « le Vendeur » - guillemets français (pattern principal)
  /«\s*([^»]+)\s*»/g,
  // (ci-après « le Vendeur ») - définition explicite
  /\(ci-après\s*«\s*([^»]+)\s*»\s*\)/gi,
  // (ci-après dénommé « le Vendeur ») - définition explicite longue
  /\(ci-après\s+dénommé[e]?\s*«\s*([^»]+)\s*»\s*\)/gi,
  // (le « Vendeur ») ou (la « Société »)
  /\(l[ea]\s*«\s*([^»]+)\s*»\s*\)/gi,
  // désigné ci-après « le Vendeur »
  /désigné[e]?\s+ci-après\s*«\s*([^»]+)\s*»/gi,
]

// ============================================================================
// Helpers
// ============================================================================

function generateId(): string {
  return `term-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function normalizeTerm(term: string): string {
  return term
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/^(le|la|les|l'|un|une|des|du|de la|de l')\s+/i, '') // Enlever les articles
    .replace(/\s+/g, ' ')
    .trim()
}

function extractContext(text: string, position: number, contextLength: number = 50): string {
  const start = Math.max(0, position - contextLength)
  const end = Math.min(text.length, position + contextLength)

  let context = text.slice(start, end)
  if (start > 0) context = '...' + context
  if (end < text.length) context = context + '...'

  return context.replace(/\n/g, ' ').trim()
}

// ============================================================================
// Store
// ============================================================================

export const useDefinedTermsStore = create<DefinedTermsStore>((set, get) => ({
  terms: [],
  usages: [],
  isExtracting: false,

  addTerm: (termData) => {
    const id = generateId()
    const term: DefinedTerm = {
      ...termData,
      id,
      createdAt: new Date().toISOString(),
    }

    set((state) => ({
      terms: [...state.terms, term],
    }))

    return id
  },

  removeTerm: (termId) => {
    set((state) => ({
      terms: state.terms.filter((t) => t.id !== termId),
      usages: state.usages.filter((u) => u.termId !== termId),
    }))
  },

  updateTerm: (termId, updates) => {
    set((state) => ({
      terms: state.terms.map((t) =>
        t.id === termId ? { ...t, ...updates } : t
      ),
    }))
  },

  clearTerms: () => {
    set({ terms: [], usages: [] })
  },

  clearTermsForDocument: (documentId) => {
    set((state) => ({
      terms: state.terms.filter((t) => t.sourceDocumentId !== documentId),
      usages: state.usages.filter((u) => u.documentId !== documentId),
    }))
  },

  addUsage: (usageData) => {
    const id = `usage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const usage: TermUsage = { ...usageData, id }

    set((state) => ({
      usages: [...state.usages, usage],
    }))

    return id
  },

  removeUsage: (usageId) => {
    set((state) => ({
      usages: state.usages.filter((u) => u.id !== usageId),
    }))
  },

  clearUsagesForDocument: (documentId) => {
    set((state) => ({
      usages: state.usages.filter((u) => u.documentId !== documentId),
    }))
  },

  getTermByNormalized: (normalizedTerm) => {
    return get().terms.find((t) => t.normalizedTerm === normalizedTerm)
  },

  getTermById: (termId) => {
    return get().terms.find((t) => t.id === termId)
  },

  getUsagesForTerm: (termId) => {
    return get().usages.filter((u) => u.termId === termId)
  },

  getTermsForDocument: (documentId) => {
    return get().terms.filter((t) => t.sourceDocumentId === documentId)
  },

  getConflicts: () => {
    const termsByNormalized = new Map<string, DefinedTerm[]>()

    for (const term of get().terms) {
      const existing = termsByNormalized.get(term.normalizedTerm) || []
      existing.push(term)
      termsByNormalized.set(term.normalizedTerm, existing)
    }

    const conflicts: TermConflict[] = []
    for (const [normalizedTerm, definitions] of termsByNormalized) {
      if (definitions.length > 1) {
        conflicts.push({
          term: definitions[0].term,
          normalizedTerm,
          definitions,
        })
      }
    }

    return conflicts
  },

  getUndefinedUsages: () => {
    const definedNormalizedTerms = new Set(
      get().terms.map((t) => t.normalizedTerm)
    )

    return get().usages.filter((usage) => {
      const term = get().terms.find((t) => t.id === usage.termId)
      return term && !definedNormalizedTerms.has(term.normalizedTerm)
    })
  },

  setIsExtracting: (value) => {
    set({ isExtracting: value })
  },

  extractTermsFromText: (text, documentId, documentName) => {
    const extractedTerms: DefinedTerm[] = []
    const seenTerms = new Set<string>()

    for (const pattern of DEFINITION_PATTERNS) {
      // Reset lastIndex pour chaque pattern
      pattern.lastIndex = 0

      let match
      while ((match = pattern.exec(text)) !== null) {
        const term = match[1].trim()
        const normalized = normalizeTerm(term)

        // Éviter les doublons
        if (seenTerms.has(normalized)) continue
        seenTerms.add(normalized)

        // Trouver le contexte de la définition
        const position = match.index
        const definitionContext = extractContext(text, position, 100)

        // Extraire la définition (texte après le terme jusqu'à la ponctuation)
        const afterTerm = text.slice(position + match[0].length, position + match[0].length + 200)
        const definitionMatch = afterTerm.match(/^[^.;!?]*/)
        const definition = definitionMatch ? definitionMatch[0].trim() : ''

        const termData: DefinedTerm = {
          id: generateId(),
          term,
          normalizedTerm: normalized,
          definition: definition || `Terme défini : ${term}`,
          definitionContext,
          sourceDocumentId: documentId,
          sourceDocumentName: documentName,
          position: {
            from: position,
            to: position + match[0].length,
          },
          createdAt: new Date().toISOString(),
        }

        extractedTerms.push(termData)
      }
    }

    // Ajouter les termes extraits au store
    if (extractedTerms.length > 0) {
      set((state) => ({
        terms: [
          ...state.terms.filter((t) => t.sourceDocumentId !== documentId),
          ...extractedTerms,
        ],
      }))
    }

    return extractedTerms
  },
}))

// Export helpers
export { normalizeTerm, extractContext }
