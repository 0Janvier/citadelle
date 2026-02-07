/**
 * Store pour la gestion des échéances/délais juridiques
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DeadlineType = 'procedure' | 'contractuel' | 'legal' | 'autre'

export const DEADLINE_TYPE_LABELS: Record<DeadlineType, string> = {
  procedure: 'Procédural',
  contractuel: 'Contractuel',
  legal: 'Légal',
  autre: 'Autre',
}

export type DeadlineStatus = 'pending' | 'done' | 'cancelled'

export interface Deadline {
  id: string
  documentId: string
  title: string
  description?: string
  type: DeadlineType
  dueDate: string // ISO date
  alertDaysBefore: number // jours avant pour alerte
  status: DeadlineStatus
  createdAt: string
  completedAt?: string
}

export type UrgencyGroup = 'overdue' | 'thisWeek' | 'thisMonth' | 'later'

interface DeadlineStore {
  deadlines: Deadline[]
  panelOpen: boolean

  // Actions
  addDeadline: (deadline: Omit<Deadline, 'id' | 'createdAt'>) => string
  updateDeadline: (id: string, updates: Partial<Omit<Deadline, 'id' | 'createdAt'>>) => void
  deleteDeadline: (id: string) => void
  completeDeadline: (id: string) => void
  reopenDeadline: (id: string) => void

  // Panel
  togglePanel: () => void
  setPanelOpen: (open: boolean) => void

  // Queries
  getDeadlinesForDocument: (docId: string) => Deadline[]
  getPendingDeadlines: () => Deadline[]
  getGroupedDeadlines: (docId?: string) => Record<UrgencyGroup, Deadline[]>
  getOverdueCount: () => number
}

function generateId(): string {
  return `dl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function getUrgencyGroup(dueDate: string): UrgencyGroup {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  if (due < now) return 'overdue'

  const diffMs = due.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  // Calculer jours restants dans la semaine
  const dayOfWeek = now.getDay() // 0=dim, 1=lun...
  const daysUntilEndOfWeek = 7 - dayOfWeek

  if (diffDays <= daysUntilEndOfWeek) return 'thisWeek'

  // Même mois et année
  if (due.getMonth() === now.getMonth() && due.getFullYear() === now.getFullYear()) return 'thisMonth'

  return 'later'
}

export const useDeadlineStore = create<DeadlineStore>()(
  persist(
    (set, get) => ({
      deadlines: [],
      panelOpen: false,

      addDeadline: (deadline) => {
        const id = generateId()
        const newDeadline: Deadline = {
          ...deadline,
          id,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          deadlines: [...state.deadlines, newDeadline],
        }))
        return id
      },

      updateDeadline: (id, updates) =>
        set((state) => ({
          deadlines: state.deadlines.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
        })),

      deleteDeadline: (id) =>
        set((state) => ({
          deadlines: state.deadlines.filter((d) => d.id !== id),
        })),

      completeDeadline: (id) =>
        set((state) => ({
          deadlines: state.deadlines.map((d) =>
            d.id === id
              ? { ...d, status: 'done' as const, completedAt: new Date().toISOString() }
              : d
          ),
        })),

      reopenDeadline: (id) =>
        set((state) => ({
          deadlines: state.deadlines.map((d) =>
            d.id === id
              ? { ...d, status: 'pending' as const, completedAt: undefined }
              : d
          ),
        })),

      togglePanel: () => set((state) => ({ panelOpen: !state.panelOpen })),
      setPanelOpen: (open) => set({ panelOpen: open }),

      getDeadlinesForDocument: (docId) => {
        return get()
          .deadlines.filter((d) => d.documentId === docId && d.status !== 'cancelled')
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      },

      getPendingDeadlines: () => {
        return get()
          .deadlines.filter((d) => d.status === 'pending')
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      },

      getGroupedDeadlines: (docId) => {
        const deadlines = docId
          ? get().getDeadlinesForDocument(docId)
          : get().getPendingDeadlines()

        const groups: Record<UrgencyGroup, Deadline[]> = {
          overdue: [],
          thisWeek: [],
          thisMonth: [],
          later: [],
        }

        for (const d of deadlines) {
          if (d.status !== 'pending') continue
          const group = getUrgencyGroup(d.dueDate)
          groups[group].push(d)
        }

        return groups
      },

      getOverdueCount: () => {
        const now = new Date()
        now.setHours(0, 0, 0, 0)
        return get().deadlines.filter(
          (d) => d.status === 'pending' && new Date(d.dueDate) < now
        ).length
      },
    }),
    {
      name: 'citadelle-deadlines',
    }
  )
)
