import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface LawyerProfile {
  // Identité
  civilite: 'Maitre' | 'Me' | ''
  nom: string
  prenom: string

  // Cabinet
  cabinet: string
  specialites: string[]

  // Barreau
  barreau: string
  numeroToque: string

  // Coordonnées
  adresse: string
  codePostal: string
  ville: string
  telephone: string
  telecopie: string
  email: string
  siteWeb: string

  // Visuels (stockés en base64 ou chemin)
  logo: string | null
  signature: string | null

  // Options d'export
  afficherLogoEntete: boolean
  afficherMentionsLegales: boolean
  mentionsLegales: string
  afficherSignature: boolean
  paginationFormat: 'Page X sur Y' | 'Page X/Y' | 'X/Y' | ''
}

interface LawyerProfileStore extends LawyerProfile {
  // Actions
  setField: <K extends keyof LawyerProfile>(field: K, value: LawyerProfile[K]) => void
  setProfile: (profile: Partial<LawyerProfile>) => void
  resetProfile: () => void

  // Logo/Signature
  setLogo: (base64: string | null) => void
  setSignature: (base64: string | null) => void

  // Helpers
  getFullName: () => string
  getFullAddress: () => string
  getFormattedHeader: () => string
}

const defaultProfile: LawyerProfile = {
  civilite: 'Maitre',
  nom: '',
  prenom: '',
  cabinet: '',
  specialites: [],
  barreau: '',
  numeroToque: '',
  adresse: '',
  codePostal: '',
  ville: '',
  telephone: '',
  telecopie: '',
  email: '',
  siteWeb: '',
  logo: null,
  signature: null,
  afficherLogoEntete: true,
  afficherMentionsLegales: true,
  mentionsLegales: 'Avocat inscrit au Barreau de [Ville] - SELARL au capital de [X] euros - RCS [Ville] [N°] - TVA FR [N°]',
  afficherSignature: true,
  paginationFormat: 'Page X sur Y',
}

export const useLawyerProfileStore = create<LawyerProfileStore>()(
  persist(
    (set, get) => ({
      ...defaultProfile,

      setField: (field, value) => set({ [field]: value }),

      setProfile: (profile) => set(profile),

      resetProfile: () => set(defaultProfile),

      setLogo: (base64) => set({ logo: base64 }),

      setSignature: (base64) => set({ signature: base64 }),

      getFullName: () => {
        const { civilite, prenom, nom } = get()
        const parts = [civilite, prenom, nom].filter(Boolean)
        return parts.join(' ')
      },

      getFullAddress: () => {
        const { adresse, codePostal, ville } = get()
        const parts = [adresse, `${codePostal} ${ville}`.trim()].filter(Boolean)
        return parts.join(', ')
      },

      getFormattedHeader: () => {
        const state = get()
        const lines: string[] = []

        // Cabinet ou nom
        if (state.cabinet) {
          lines.push(state.cabinet)
        }

        // Avocat
        const fullName = state.getFullName()
        if (fullName) {
          lines.push(fullName)
        }

        // Spécialités
        if (state.specialites.length > 0) {
          lines.push(state.specialites.join(' - '))
        }

        // Barreau et toque
        if (state.barreau || state.numeroToque) {
          const barreauLine = [
            state.barreau ? `Barreau de ${state.barreau}` : '',
            state.numeroToque ? `Toque ${state.numeroToque}` : '',
          ].filter(Boolean).join(' - ')
          if (barreauLine) lines.push(barreauLine)
        }

        return lines.join('\n')
      },
    }),
    {
      name: 'citadelle-lawyer-profile',
    }
  )
)
