import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TrackChangesStore {
  isTracking: boolean
  authorName: string
  showChanges: boolean

  setIsTracking: (tracking: boolean) => void
  toggleTracking: () => void
  setAuthorName: (name: string) => void
  setShowChanges: (show: boolean) => void
  toggleShowChanges: () => void
}

export const useTrackChangesStore = create<TrackChangesStore>()(
  persist(
    (set) => ({
      isTracking: false,
      authorName: 'Auteur',
      showChanges: true,

      setIsTracking: (tracking) => set({ isTracking: tracking }),
      toggleTracking: () => set((s) => ({ isTracking: !s.isTracking })),
      setAuthorName: (name) => set({ authorName: name }),
      setShowChanges: (show) => set({ showChanges: show }),
      toggleShowChanges: () => set((s) => ({ showChanges: !s.showChanges })),
    }),
    {
      name: 'citadelle-track-changes',
      version: 1,
    }
  )
)
