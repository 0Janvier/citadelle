// Index des formules juridiques

export { FORMULES_CONTENTIEUX } from './contentieux'
export { FORMULES_CONTRACTUEL } from './contractuel'
export { FORMULES_COURRIER } from './courrier'

import { FORMULES_CONTENTIEUX } from './contentieux'
import { FORMULES_CONTRACTUEL } from './contractuel'
import { FORMULES_COURRIER } from './courrier'
import type { Snippet } from '../../types/editor-features'

// Toutes les formules combinées
export const ALL_FORMULES: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>[] = [
  ...FORMULES_CONTENTIEUX,
  ...FORMULES_CONTRACTUEL,
  ...FORMULES_COURRIER,
]

// Recherche par raccourci
export function findFormuleByRaccourci(raccourci: string): Omit<Snippet, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'> | undefined {
  return ALL_FORMULES.find(f => f.raccourci === raccourci)
}

// Recherche par catégorie
export function getFormulesByCategory(category: string): Omit<Snippet, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>[] {
  return ALL_FORMULES.filter(f => f.category === category)
}
