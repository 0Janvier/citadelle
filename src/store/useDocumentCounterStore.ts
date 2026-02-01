import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================================================
// Types
// ============================================================================

interface DocumentCounterState {
  currentPeriod: string      // Format: "YYYY-MM"
  counter: number            // Numéro séquentiel dans la période
  lastGeneratedNumber: string | null
}

interface DocumentCounterStore extends DocumentCounterState {
  /** Génère le prochain numéro et incrémente le compteur */
  getNextNumber: () => string
  /** Prévisualise le prochain numéro sans incrémenter */
  peekNextNumber: () => string
  /** Réinitialise le compteur (optionnel, pour admin) */
  resetCounter: (value?: number) => void
}

// ============================================================================
// Helpers
// ============================================================================

/** Retourne la période actuelle au format "YYYY-MM" */
function getCurrentPeriod(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/** Formate le numéro de document complet: "2026-01-00001" */
function formatDocumentNumber(period: string, counter: number): string {
  return `${period}-${String(counter).padStart(5, '0')}`
}

// ============================================================================
// Store
// ============================================================================

export const useDocumentCounterStore = create<DocumentCounterStore>()(
  persist(
    (set, get) => ({
      currentPeriod: getCurrentPeriod(),
      counter: 0,
      lastGeneratedNumber: null,

      getNextNumber: () => {
        const state = get()
        const newPeriod = getCurrentPeriod()

        let newCounter: number

        // Vérifier si on change de mois → réinitialiser
        if (newPeriod !== state.currentPeriod) {
          newCounter = 1
        } else {
          newCounter = state.counter + 1
        }

        const numero = formatDocumentNumber(newPeriod, newCounter)

        set({
          currentPeriod: newPeriod,
          counter: newCounter,
          lastGeneratedNumber: numero,
        })

        return numero
      },

      peekNextNumber: () => {
        const state = get()
        const currentPeriod = getCurrentPeriod()

        // Si on change de mois, le prochain sera 1
        if (currentPeriod !== state.currentPeriod) {
          return formatDocumentNumber(currentPeriod, 1)
        }

        // Sinon, ce sera le suivant
        return formatDocumentNumber(currentPeriod, state.counter + 1)
      },

      resetCounter: (value = 0) => {
        set({
          currentPeriod: getCurrentPeriod(),
          counter: value,
          lastGeneratedNumber: null,
        })
      },
    }),
    {
      name: 'citadelle-document-counter',
    }
  )
)
