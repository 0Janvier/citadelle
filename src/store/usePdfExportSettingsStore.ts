/**
 * Store pour les paramètres d'export PDF
 *
 * Gère les préférences de numérotation, typographie, mise en page
 * et en-têtes/pieds de page pour l'export PDF.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { NumberingStyle } from '../lib/headingNumbering'

// Couleurs professionnelles pour les titres
export const LEGAL_HEADING_COLORS = {
  darkBlue: '#1e3a5f',
  mediumBlue: '#2c5282',
  darkGray: '#2d3748',
  mediumGray: '#4a5568',
  black: '#000000',
}

export interface HeadingNumberingSettings {
  enabled: boolean
  style: NumberingStyle
  startLevel: number
  maxLevel: number
}

export interface TypographySettings {
  fontFamily: 'Garamond' | 'Roboto'
  baseFontSize: number
  lineHeight: number
  headingColors: {
    h1: string
    h2: string
    h3: string
    h4: string
  }
}

export interface PageLayoutSettings {
  format: 'A4' | 'Letter' | 'Legal'
  orientation: 'portrait' | 'landscape'
  margins: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

export interface HeaderFooterContent {
  left: string
  center: string
  right: string
}

export interface HeaderFooterSettings {
  headerEnabled: boolean
  headerContent: HeaderFooterContent
  footerEnabled: boolean
  footerContent: HeaderFooterContent
  firstPageDifferent: boolean
  firstPageHeaderEnabled: boolean
  firstPageFooterEnabled: boolean
  // Logo du cabinet
  includeLogo: boolean
  logoPosition: 'left' | 'center' | 'right'
  logoMaxHeight: number // en points (72 points = 1 pouce)
}

export interface PdfExportSettings {
  headingNumbering: HeadingNumberingSettings
  typography: TypographySettings
  pageLayout: PageLayoutSettings
  headerFooter: HeaderFooterSettings
  includeTOC: boolean
}

interface PdfExportSettingsStore extends PdfExportSettings {
  // Actions pour la numérotation
  setNumberingEnabled: (enabled: boolean) => void
  setNumberingStyle: (style: NumberingStyle) => void
  setNumberingStartLevel: (level: number) => void
  setNumberingMaxLevel: (level: number) => void

  // Actions pour la typographie
  setFontFamily: (font: 'Garamond' | 'Roboto') => void
  setBaseFontSize: (size: number) => void
  setLineHeight: (height: number) => void
  setHeadingColor: (level: 'h1' | 'h2' | 'h3' | 'h4', color: string) => void

  // Actions pour la mise en page
  setPageFormat: (format: 'A4' | 'Letter' | 'Legal') => void
  setOrientation: (orientation: 'portrait' | 'landscape') => void
  setMargin: (side: 'top' | 'bottom' | 'left' | 'right', value: number) => void

  // Table des matières
  setIncludeTOC: (include: boolean) => void

  // Actions pour les en-têtes/pieds de page
  setHeaderEnabled: (enabled: boolean) => void
  setHeaderContent: (content: HeaderFooterContent) => void
  setFooterEnabled: (enabled: boolean) => void
  setFooterContent: (content: HeaderFooterContent) => void
  setFirstPageDifferent: (different: boolean) => void
  setFirstPageHeaderEnabled: (enabled: boolean) => void
  setFirstPageFooterEnabled: (enabled: boolean) => void
  // Actions pour le logo
  setIncludeLogo: (include: boolean) => void
  setLogoPosition: (position: 'left' | 'center' | 'right') => void
  setLogoMaxHeight: (height: number) => void

  // Actions générales
  resetToDefaults: () => void
  getSettings: () => PdfExportSettings
}

const defaultSettings: PdfExportSettings = {
  headingNumbering: {
    enabled: true,
    style: 'juridique',
    startLevel: 1,
    maxLevel: 4,
  },
  typography: {
    fontFamily: 'Garamond',
    baseFontSize: 12,
    lineHeight: 1.2,
    headingColors: {
      h1: LEGAL_HEADING_COLORS.darkBlue,
      h2: LEGAL_HEADING_COLORS.darkBlue,
      h3: LEGAL_HEADING_COLORS.mediumBlue,
      h4: LEGAL_HEADING_COLORS.darkGray,
    },
  },
  pageLayout: {
    format: 'A4',
    orientation: 'portrait',
    margins: {
      top: 2.5,
      bottom: 2.5,
      left: 2.5,
      right: 2.5,
    },
  },
  headerFooter: {
    headerEnabled: false,
    headerContent: {
      left: '',
      center: '{{document.title}}',
      right: '',
    },
    footerEnabled: true,
    footerContent: {
      left: '',
      center: 'Page {{page.current}} / {{page.total}}',
      right: '',
    },
    firstPageDifferent: false,
    firstPageHeaderEnabled: false,
    firstPageFooterEnabled: true,
    includeLogo: false,
    logoPosition: 'left',
    logoMaxHeight: 50,
  },
  includeTOC: false,
}

export const usePdfExportSettingsStore = create<PdfExportSettingsStore>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      // Table des matières
      setIncludeTOC: (include) => set({ includeTOC: include }),

      // Numérotation
      setNumberingEnabled: (enabled) =>
        set((state) => ({
          headingNumbering: { ...state.headingNumbering, enabled },
        })),

      setNumberingStyle: (style) =>
        set((state) => ({
          headingNumbering: { ...state.headingNumbering, style },
        })),

      setNumberingStartLevel: (startLevel) =>
        set((state) => ({
          headingNumbering: {
            ...state.headingNumbering,
            startLevel: Math.max(1, Math.min(6, startLevel)),
          },
        })),

      setNumberingMaxLevel: (maxLevel) =>
        set((state) => ({
          headingNumbering: {
            ...state.headingNumbering,
            maxLevel: Math.max(1, Math.min(6, maxLevel)),
          },
        })),

      // Typographie
      setFontFamily: (fontFamily) =>
        set((state) => ({
          typography: { ...state.typography, fontFamily },
        })),

      setBaseFontSize: (baseFontSize) =>
        set((state) => ({
          typography: {
            ...state.typography,
            baseFontSize: Math.max(8, Math.min(16, baseFontSize)),
          },
        })),

      setLineHeight: (lineHeight) =>
        set((state) => ({
          typography: {
            ...state.typography,
            lineHeight: Math.max(1.0, Math.min(2.5, lineHeight)),
          },
        })),

      setHeadingColor: (level, color) =>
        set((state) => ({
          typography: {
            ...state.typography,
            headingColors: {
              ...state.typography.headingColors,
              [level]: color,
            },
          },
        })),

      // Mise en page
      setPageFormat: (format) =>
        set((state) => ({
          pageLayout: { ...state.pageLayout, format },
        })),

      setOrientation: (orientation) =>
        set((state) => ({
          pageLayout: { ...state.pageLayout, orientation },
        })),

      setMargin: (side, value) =>
        set((state) => ({
          pageLayout: {
            ...state.pageLayout,
            margins: {
              ...state.pageLayout.margins,
              [side]: Math.max(0.5, Math.min(5, value)),
            },
          },
        })),

      // En-têtes/pieds de page
      setHeaderEnabled: (headerEnabled) =>
        set((state) => ({
          headerFooter: { ...state.headerFooter, headerEnabled },
        })),

      setHeaderContent: (headerContent) =>
        set((state) => ({
          headerFooter: { ...state.headerFooter, headerContent },
        })),

      setFooterEnabled: (footerEnabled) =>
        set((state) => ({
          headerFooter: { ...state.headerFooter, footerEnabled },
        })),

      setFooterContent: (footerContent) =>
        set((state) => ({
          headerFooter: { ...state.headerFooter, footerContent },
        })),

      setFirstPageDifferent: (firstPageDifferent) =>
        set((state) => ({
          headerFooter: { ...state.headerFooter, firstPageDifferent },
        })),

      setFirstPageHeaderEnabled: (firstPageHeaderEnabled) =>
        set((state) => ({
          headerFooter: { ...state.headerFooter, firstPageHeaderEnabled },
        })),

      setFirstPageFooterEnabled: (firstPageFooterEnabled) =>
        set((state) => ({
          headerFooter: { ...state.headerFooter, firstPageFooterEnabled },
        })),

      // Logo
      setIncludeLogo: (includeLogo) =>
        set((state) => ({
          headerFooter: { ...state.headerFooter, includeLogo },
        })),

      setLogoPosition: (logoPosition) =>
        set((state) => ({
          headerFooter: { ...state.headerFooter, logoPosition },
        })),

      setLogoMaxHeight: (logoMaxHeight) =>
        set((state) => ({
          headerFooter: {
            ...state.headerFooter,
            logoMaxHeight: Math.max(20, Math.min(100, logoMaxHeight)),
          },
        })),

      // Général
      resetToDefaults: () => set(defaultSettings),

      getSettings: () => {
        const state = get()
        return {
          headingNumbering: state.headingNumbering,
          typography: state.typography,
          pageLayout: state.pageLayout,
          headerFooter: state.headerFooter,
          includeTOC: state.includeTOC,
        }
      },
    }),
    {
      name: 'citadelle-pdf-export-settings',
    }
  )
)
