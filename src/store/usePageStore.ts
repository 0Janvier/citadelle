import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================================================
// Types
// ============================================================================

export type PageFormat = 'A4' | 'A5' | 'Letter' | 'Legal' | 'custom'
export type PageOrientation = 'portrait' | 'landscape'
export type ViewMode = 'scroll' | 'page' | 'continuous'
export type ScrollPageBreakStyle = 'line' | 'compact' | 'full'
export type PagesPerRow = 1 | 2 | 3 | 'auto'

export interface PageMargins {
  top: number    // en pixels (72px = 1 inch = 2.54cm)
  right: number
  bottom: number
  left: number
}

export interface HeaderFooterContent {
  left: string
  center: string
  right: string
}

export interface FirstPageSettings {
  differentFirstPage: boolean
  headerEnabled: boolean
  headerContent: HeaderFooterContent
  footerEnabled: boolean
  footerContent: HeaderFooterContent
}

// Dimensions des formats de page en pixels (à 96 DPI)
export const PAGE_DIMENSIONS: Record<PageFormat, { width: number; height: number; label: string }> = {
  A4: { width: 794, height: 1123, label: 'A4 (210 × 297 mm)' },
  A5: { width: 559, height: 794, label: 'A5 (148 × 210 mm)' },
  Letter: { width: 816, height: 1056, label: 'Letter (8.5 × 11 in)' },
  Legal: { width: 816, height: 1344, label: 'Legal (8.5 × 14 in)' },
  custom: { width: 794, height: 1123, label: 'Personnalisé' },
}

// Présets de marges
export const MARGIN_PRESETS = {
  etroit: { top: 57, right: 57, bottom: 57, left: 57, label: 'Étroit (1.5 cm)' },
  normal: { top: 95, right: 95, bottom: 95, left: 95, label: 'Normal (2.5 cm)' },
  large: { top: 133, right: 133, bottom: 133, left: 133, label: 'Large (3.5 cm)' },
  juridique: { top: 95, right: 76, bottom: 95, left: 114, label: 'Juridique (gauche élargie)' },
}

// ============================================================================
// Store Interface
// ============================================================================

interface PageStore {
  // Mode d'affichage
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  toggleViewMode: () => void

  // Format de page
  pageFormat: PageFormat
  orientation: PageOrientation
  customSize: { width: number; height: number }
  setPageFormat: (format: PageFormat) => void
  setOrientation: (orientation: PageOrientation) => void
  setCustomSize: (width: number, height: number) => void

  // Marges
  margins: PageMargins
  setMargins: (margins: Partial<PageMargins>) => void
  applyMarginPreset: (preset: keyof typeof MARGIN_PRESETS) => void

  // Pagination
  currentPage: number
  totalPages: number
  setCurrentPage: (page: number) => void
  setTotalPages: (total: number) => void

  // En-tête
  headerEnabled: boolean
  headerHeight: number
  headerContent: HeaderFooterContent
  setHeaderEnabled: (enabled: boolean) => void
  setHeaderHeight: (height: number) => void
  setHeaderContent: (content: Partial<HeaderFooterContent>) => void

  // Pied de page
  footerEnabled: boolean
  footerHeight: number
  footerContent: HeaderFooterContent
  setFooterEnabled: (enabled: boolean) => void
  setFooterHeight: (height: number) => void
  setFooterContent: (content: Partial<HeaderFooterContent>) => void

  // Première page différente
  firstPage: FirstPageSettings
  setDifferentFirstPage: (enabled: boolean) => void
  setFirstPageHeaderEnabled: (enabled: boolean) => void
  setFirstPageHeaderContent: (content: Partial<HeaderFooterContent>) => void
  setFirstPageFooterEnabled: (enabled: boolean) => void
  setFirstPageFooterContent: (content: Partial<HeaderFooterContent>) => void

  // Affichage des sauts de page
  showPageBreaks: boolean
  setShowPageBreaks: (show: boolean) => void

  // Zoom du mode page
  pageZoom: number
  setPageZoom: (zoom: number) => void

  // Prévisualisation des sauts de page en mode scroll
  showScrollPageBreaks: boolean
  scrollPageBreakStyle: ScrollPageBreakStyle
  setShowScrollPageBreaks: (show: boolean) => void
  setScrollPageBreakStyle: (style: ScrollPageBreakStyle) => void

  // Scroll snap (accrochage aux pages)
  scrollSnapEnabled: boolean
  setScrollSnapEnabled: (enabled: boolean) => void

  // Affichage multi-pages (grands écrans)
  pagesPerRow: PagesPerRow
  setPagesPerRow: (pagesPerRow: PagesPerRow) => void

  // Utilitaires
  getPageDimensions: () => { width: number; height: number }
  getContentHeight: () => number
  resetToDefaults: () => void
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_MARGINS: PageMargins = { top: 95, right: 95, bottom: 95, left: 95 }
const DEFAULT_HEADER_CONTENT: HeaderFooterContent = { left: '', center: '', right: '' }
const DEFAULT_FOOTER_CONTENT: HeaderFooterContent = {
  left: '',
  center: 'Page {{page.current}} / {{page.total}}',
  right: ''
}
const DEFAULT_FIRST_PAGE: FirstPageSettings = {
  differentFirstPage: false,
  headerEnabled: false,
  headerContent: { left: '', center: '', right: '' },
  footerEnabled: false,
  footerContent: { left: '', center: '', right: '' },
}

// ============================================================================
// Store
// ============================================================================

export const usePageStore = create<PageStore>()(
  persist(
    (set, get) => ({
      // Mode d'affichage
      viewMode: 'scroll',
      setViewMode: (mode) => set({ viewMode: mode }),
      toggleViewMode: () => set((state) => ({
        viewMode: state.viewMode === 'scroll' ? 'continuous' : state.viewMode === 'continuous' ? 'page' : 'scroll'
      })),

      // Format de page
      pageFormat: 'A4',
      orientation: 'portrait',
      customSize: { width: 794, height: 1123 },
      setPageFormat: (format) => set({ pageFormat: format }),
      setOrientation: (orientation) => set({ orientation: orientation }),
      setCustomSize: (width, height) => set({ customSize: { width, height } }),

      // Marges
      margins: { ...DEFAULT_MARGINS },
      setMargins: (margins) => set((state) => ({
        margins: { ...state.margins, ...margins }
      })),
      applyMarginPreset: (preset) => {
        const presetMargins = MARGIN_PRESETS[preset]
        set({
          margins: {
            top: presetMargins.top,
            right: presetMargins.right,
            bottom: presetMargins.bottom,
            left: presetMargins.left
          }
        })
      },

      // Pagination
      currentPage: 1,
      totalPages: 1,
      setCurrentPage: (page) => set({ currentPage: Math.max(1, page) }),
      setTotalPages: (total) => set({ totalPages: Math.max(1, total) }),

      // En-tête
      headerEnabled: false,
      headerHeight: 50,
      headerContent: { ...DEFAULT_HEADER_CONTENT },
      setHeaderEnabled: (enabled) => set({ headerEnabled: enabled }),
      setHeaderHeight: (height) => set({ headerHeight: Math.max(20, Math.min(150, height)) }),
      setHeaderContent: (content) => set((state) => ({
        headerContent: { ...state.headerContent, ...content }
      })),

      // Pied de page
      footerEnabled: true,
      footerHeight: 40,
      footerContent: { ...DEFAULT_FOOTER_CONTENT },
      setFooterEnabled: (enabled) => set({ footerEnabled: enabled }),
      setFooterHeight: (height) => set({ footerHeight: Math.max(20, Math.min(150, height)) }),
      setFooterContent: (content) => set((state) => ({
        footerContent: { ...state.footerContent, ...content }
      })),

      // Première page différente
      firstPage: { ...DEFAULT_FIRST_PAGE },
      setDifferentFirstPage: (enabled) => set((state) => ({
        firstPage: { ...state.firstPage, differentFirstPage: enabled }
      })),
      setFirstPageHeaderEnabled: (enabled) => set((state) => ({
        firstPage: { ...state.firstPage, headerEnabled: enabled }
      })),
      setFirstPageHeaderContent: (content) => set((state) => ({
        firstPage: {
          ...state.firstPage,
          headerContent: { ...state.firstPage.headerContent, ...content }
        }
      })),
      setFirstPageFooterEnabled: (enabled) => set((state) => ({
        firstPage: { ...state.firstPage, footerEnabled: enabled }
      })),
      setFirstPageFooterContent: (content) => set((state) => ({
        firstPage: {
          ...state.firstPage,
          footerContent: { ...state.firstPage.footerContent, ...content }
        }
      })),

      // Affichage des sauts de page
      showPageBreaks: true,
      setShowPageBreaks: (show) => set({ showPageBreaks: show }),

      // Zoom du mode page
      pageZoom: 1,
      setPageZoom: (zoom) => set({ pageZoom: Math.max(0.5, Math.min(2, zoom)) }),

      // Prévisualisation des sauts de page en mode scroll
      showScrollPageBreaks: false,
      scrollPageBreakStyle: 'compact',
      setShowScrollPageBreaks: (show) => set({ showScrollPageBreaks: show }),
      setScrollPageBreakStyle: (style) => set({ scrollPageBreakStyle: style }),

      // Scroll snap
      scrollSnapEnabled: false,
      setScrollSnapEnabled: (enabled) => set({ scrollSnapEnabled: enabled }),

      // Affichage multi-pages
      pagesPerRow: 1,
      setPagesPerRow: (pagesPerRow) => set({ pagesPerRow }),

      // Utilitaires
      getPageDimensions: () => {
        const state = get()
        const format = state.pageFormat

        let width: number
        let height: number

        if (format === 'custom') {
          width = state.customSize.width
          height = state.customSize.height
        } else {
          width = PAGE_DIMENSIONS[format].width
          height = PAGE_DIMENSIONS[format].height
        }

        // Inverser si orientation paysage
        if (state.orientation === 'landscape') {
          return { width: height, height: width }
        }

        return { width, height }
      },

      getContentHeight: () => {
        const state = get()
        const { height } = state.getPageDimensions()
        const headerSpace = state.headerEnabled ? state.headerHeight : 0
        const footerSpace = state.footerEnabled ? state.footerHeight : 0

        return height - state.margins.top - state.margins.bottom - headerSpace - footerSpace
      },

      resetToDefaults: () => set({
        viewMode: 'scroll',
        pageFormat: 'A4',
        orientation: 'portrait',
        customSize: { width: 794, height: 1123 },
        margins: { ...DEFAULT_MARGINS },
        currentPage: 1,
        totalPages: 1,
        headerEnabled: false,
        headerHeight: 50,
        headerContent: { ...DEFAULT_HEADER_CONTENT },
        footerEnabled: true,
        footerHeight: 40,
        footerContent: { ...DEFAULT_FOOTER_CONTENT },
        firstPage: { ...DEFAULT_FIRST_PAGE },
        showPageBreaks: true,
        pageZoom: 1,
        showScrollPageBreaks: false,
        scrollPageBreakStyle: 'compact',
        scrollSnapEnabled: false,
        pagesPerRow: 1,
      }),
    }),
    {
      name: 'citadelle-page-settings',
    }
  )
)

// ============================================================================
// Utilitaires de formatage pour les variables
// ============================================================================

/**
 * Remplace les variables dans le contenu header/footer
 */
export function replacePageVariables(
  content: string,
  currentPage: number,
  totalPages: number,
  documentTitle?: string,
  documentNumber?: string
): string {
  return content
    .replace(/\{\{page\.current\}\}/g, String(currentPage))
    .replace(/\{\{page\.total\}\}/g, String(totalPages))
    .replace(/\{\{document\.title\}\}/g, documentTitle || '')
    .replace(/\{\{document\.numero\}\}/g, documentNumber || '')
    .replace(/\{\{date\.format\("([^"]+)"\)\}\}/g, (_, format) => {
      return formatDate(new Date(), format)
    })
}

/**
 * Formatte une date selon le format spécifié
 */
function formatDate(date: Date, format: string): string {
  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ]
  const monthsShort = [
    'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
    'juill.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'
  ]

  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()

  return format
    .replace('DD', String(day).padStart(2, '0'))
    .replace('D', String(day))
    .replace('MMMM', months[month])
    .replace('MMM', monthsShort[month])
    .replace('MM', String(month + 1).padStart(2, '0'))
    .replace('YYYY', String(year))
    .replace('YY', String(year).slice(-2))
}
