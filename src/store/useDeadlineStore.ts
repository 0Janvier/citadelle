import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Deadline, DelaiType, DelaiProcedure } from '../types/editor-features'

interface DeadlineStore {
  // État
  deadlines: Deadline[]
  isLoading: boolean
  showCompleted: boolean

  // Actions CRUD
  addDeadline: (deadline: Omit<Deadline, 'id' | 'createdAt' | 'updatedAt' | 'dateEcheance'>) => void
  updateDeadline: (id: string, updates: Partial<Deadline>) => void
  deleteDeadline: (id: string) => void
  toggleComplete: (id: string) => void

  // Calcul des délais
  calculateEcheance: (dateDebut: string, duree: number, unite: DelaiType) => string
  getDeadlinesByDocument: (documentId: string) => Deadline[]
  getUpcomingDeadlines: (days?: number) => Deadline[]
  getOverdueDeadlines: () => Deadline[]

  // Rappels
  getDeadlinesWithReminders: () => Array<Deadline & { reminderDays: number }>

  // UI
  setShowCompleted: (show: boolean) => void

  // Délais CPC prédéfinis
  getCPCDeadlines: () => Array<{ type: DelaiProcedure; duree: number; unite: DelaiType; description: string }>
}

// Générer un ID unique
function generateId(): string {
  return `deadline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Ajouter des jours calendaires
function addCalendarDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// Ajouter des jours ouvrés (lundi-vendredi)
function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date)
  let remaining = days

  while (remaining > 0) {
    result.setDate(result.getDate() + 1)
    const dayOfWeek = result.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      remaining--
    }
  }

  return result
}

// Ajouter des jours francs (le dies a quo ne compte pas, le dies ad quem non plus)
function addFrancDays(date: Date, days: number): Date {
  const result = new Date(date)
  // Ajouter les jours + 1 (car le jour de départ ne compte pas)
  result.setDate(result.getDate() + days + 1)

  // Si le jour tombe un samedi, reporter au lundi
  if (result.getDay() === 6) {
    result.setDate(result.getDate() + 2)
  }
  // Si le jour tombe un dimanche, reporter au lundi
  else if (result.getDay() === 0) {
    result.setDate(result.getDate() + 1)
  }

  return result
}

// Ajouter des mois
function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

// Ajouter des années
function addYears(date: Date, years: number): Date {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() + years)
  return result
}

// Délais CPC prédéfinis
const CPC_DEADLINES = [
  { type: 'appel' as DelaiProcedure, duree: 1, unite: 'mois' as DelaiType, description: 'Délai d\'appel (matière civile)' },
  { type: 'appel' as DelaiProcedure, duree: 15, unite: 'jours_calendaires' as DelaiType, description: 'Délai d\'appel (référé)' },
  { type: 'pourvoi' as DelaiProcedure, duree: 2, unite: 'mois' as DelaiType, description: 'Délai de pourvoi en cassation' },
  { type: 'opposition' as DelaiProcedure, duree: 1, unite: 'mois' as DelaiType, description: 'Délai d\'opposition' },
  { type: 'conclusions' as DelaiProcedure, duree: 15, unite: 'jours_calendaires' as DelaiType, description: 'Délai de conclusions (circuit court)' },
  { type: 'conclusions' as DelaiProcedure, duree: 1, unite: 'mois' as DelaiType, description: 'Délai de conclusions (circuit moyen)' },
  { type: 'conclusions' as DelaiProcedure, duree: 2, unite: 'mois' as DelaiType, description: 'Délai de conclusions (circuit long)' },
  { type: 'signification' as DelaiProcedure, duree: 15, unite: 'jours_calendaires' as DelaiType, description: 'Délai de signification des conclusions' },
  { type: 'recours_gracieux' as DelaiProcedure, duree: 2, unite: 'mois' as DelaiType, description: 'Délai de recours gracieux (administratif)' },
  { type: 'recours_contentieux' as DelaiProcedure, duree: 2, unite: 'mois' as DelaiType, description: 'Délai de recours contentieux (administratif)' },
]

export const useDeadlineStore = create<DeadlineStore>()(
  persist(
    (set, get) => ({
      deadlines: [],
      isLoading: false,
      showCompleted: false,

      addDeadline: (deadline) => {
        const now = new Date().toISOString()
        const dateEcheance = get().calculateEcheance(
          deadline.dateDebut,
          deadline.duree,
          deadline.unite
        )

        const newDeadline: Deadline = {
          ...deadline,
          id: generateId(),
          dateEcheance,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          deadlines: [...state.deadlines, newDeadline],
        }))
      },

      updateDeadline: (id, updates) => {
        set((state) => ({
          deadlines: state.deadlines.map((d) => {
            if (d.id !== id) return d

            const updated = { ...d, ...updates, updatedAt: new Date().toISOString() }

            // Recalculer l'échéance si les paramètres de délai ont changé
            if (updates.dateDebut || updates.duree || updates.unite) {
              updated.dateEcheance = get().calculateEcheance(
                updated.dateDebut,
                updated.duree,
                updated.unite
              )
            }

            return updated
          }),
        }))
      },

      deleteDeadline: (id) => {
        set((state) => ({
          deadlines: state.deadlines.filter((d) => d.id !== id),
        }))
      },

      toggleComplete: (id) => {
        set((state) => ({
          deadlines: state.deadlines.map((d) =>
            d.id === id ? { ...d, complete: !d.complete, updatedAt: new Date().toISOString() } : d
          ),
        }))
      },

      calculateEcheance: (dateDebut, duree, unite) => {
        const start = new Date(dateDebut)
        let result: Date

        switch (unite) {
          case 'jours_calendaires':
            result = addCalendarDays(start, duree)
            break
          case 'jours_ouvres':
            result = addBusinessDays(start, duree)
            break
          case 'jours_francs':
            result = addFrancDays(start, duree)
            break
          case 'mois':
            result = addMonths(start, duree)
            break
          case 'annees':
            result = addYears(start, duree)
            break
          default:
            result = addCalendarDays(start, duree)
        }

        return result.toISOString().split('T')[0]
      },

      getDeadlinesByDocument: (documentId) => {
        return get().deadlines.filter((d) => d.documentId === documentId)
      },

      getUpcomingDeadlines: (days = 7) => {
        const today = new Date()
        const futureDate = addCalendarDays(today, days)

        return get()
          .deadlines.filter((d) => {
            if (d.complete) return false
            const echeance = new Date(d.dateEcheance)
            return echeance >= today && echeance <= futureDate
          })
          .sort((a, b) => new Date(a.dateEcheance).getTime() - new Date(b.dateEcheance).getTime())
      },

      getOverdueDeadlines: () => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        return get()
          .deadlines.filter((d) => {
            if (d.complete) return false
            const echeance = new Date(d.dateEcheance)
            echeance.setHours(0, 0, 0, 0)
            return echeance < today
          })
          .sort((a, b) => new Date(a.dateEcheance).getTime() - new Date(b.dateEcheance).getTime())
      },

      getDeadlinesWithReminders: () => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        return get()
          .deadlines.filter((d) => !d.complete && d.rappels.length > 0)
          .map((d) => {
            const echeance = new Date(d.dateEcheance)
            echeance.setHours(0, 0, 0, 0)

            const daysUntil = Math.ceil(
              (echeance.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            )

            // Trouver le rappel actif
            const activeReminder = d.rappels.find((r) => daysUntil === r)

            if (activeReminder !== undefined) {
              return { ...d, reminderDays: activeReminder }
            }
            return null
          })
          .filter((d): d is Deadline & { reminderDays: number } => d !== null)
      },

      setShowCompleted: (show) => set({ showCompleted: show }),

      getCPCDeadlines: () => CPC_DEADLINES,
    }),
    {
      name: 'citadelle-deadlines',
    }
  )
)

// Fonctions utilitaires exportées
export function formatDeadlineDate(dateISO: string): string {
  const mois = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ]

  const date = new Date(dateISO)
  return `${date.getDate()} ${mois[date.getMonth()]} ${date.getFullYear()}`
}

export function getDaysUntilDeadline(dateEcheance: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const echeance = new Date(dateEcheance)
  echeance.setHours(0, 0, 0, 0)

  return Math.ceil((echeance.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function getDeadlineStatus(dateEcheance: string, complete: boolean): 'completed' | 'overdue' | 'urgent' | 'upcoming' | 'normal' {
  if (complete) return 'completed'

  const days = getDaysUntilDeadline(dateEcheance)

  if (days < 0) return 'overdue'
  if (days <= 3) return 'urgent'
  if (days <= 7) return 'upcoming'
  return 'normal'
}
