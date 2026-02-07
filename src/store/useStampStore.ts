/**
 * Store de configuration des tampons PDF
 * Persiste les preferences de tampon entre sessions
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { invoke } from '@tauri-apps/api/tauri'
import { stampPdf, DEFAULT_STAMP_CONFIG } from '../lib/pdfStamper'
import type { StampConfig, StampStyle, StampPosition, StampFont } from '../lib/pdfStamper'
import { extractPieceNumber, getDisplayName } from './usePiecesStore'
import type { FileItem } from './usePiecesStore'

interface StampStore {
  // Configuration du tampon
  config: StampConfig

  // Cabinets recents
  recentCabinets: string[]

  // Etat
  isStamping: boolean
  stampProgress: { current: number; total: number } | null
  lastOutputFolder: string | null

  // Dialog
  configDialogOpen: boolean
  setConfigDialogOpen: (open: boolean) => void

  // Actions de configuration
  setStyle: (style: StampStyle) => void
  setPosition: (position: StampPosition) => void
  setPrefix: (prefix: string) => void
  setCabinetName: (name: string) => void
  setFontSize: (size: number) => void
  setSizeScale: (scale: number) => void
  setAllPages: (allPages: boolean) => void
  setFontFamily: (font: StampFont) => void
  setCustomTextColor: (color: string | undefined) => void
  setCustomBgColor: (color: string | undefined) => void
  setCustomBorderColor: (color: string | undefined) => void
  setOpacity: (opacity: number) => void
  setMargin: (margin: number) => void
  setAdditionalLine: (line: string) => void
  resetConfig: () => void

  // Actions de tamponnage
  stampAndCopyPiece: (file: FileItem, outputFolder: string) => Promise<string | null>
  stampAndCopyAll: (files: FileItem[], outputFolder: string) => Promise<string[]>
}

export const useStampStore = create<StampStore>()(
  persist(
    (set, get) => ({
      config: { ...DEFAULT_STAMP_CONFIG },
      recentCabinets: [],
      isStamping: false,
      stampProgress: null,
      lastOutputFolder: null,

      configDialogOpen: false,
      setConfigDialogOpen: (open) => set({ configDialogOpen: open }),

      setStyle: (style) =>
        set((state) => ({ config: { ...state.config, style } })),
      setPosition: (position) =>
        set((state) => ({ config: { ...state.config, position } })),
      setPrefix: (prefix) =>
        set((state) => ({ config: { ...state.config, prefix } })),
      setCabinetName: (name) => {
        set((state) => {
          const recentCabinets = [name, ...state.recentCabinets.filter((c) => c !== name)].slice(0, 5)
          return { config: { ...state.config, cabinetName: name }, recentCabinets }
        })
      },
      setFontSize: (fontSize) =>
        set((state) => ({ config: { ...state.config, fontSize } })),
      setSizeScale: (sizeScale) =>
        set((state) => ({ config: { ...state.config, sizeScale } })),
      setAllPages: (allPages) =>
        set((state) => ({ config: { ...state.config, allPages } })),
      setFontFamily: (fontFamily) =>
        set((state) => ({ config: { ...state.config, fontFamily } })),
      setCustomTextColor: (customTextColor) =>
        set((state) => ({ config: { ...state.config, customTextColor } })),
      setCustomBgColor: (customBgColor) =>
        set((state) => ({ config: { ...state.config, customBgColor } })),
      setCustomBorderColor: (customBorderColor) =>
        set((state) => ({ config: { ...state.config, customBorderColor } })),
      setOpacity: (opacity) =>
        set((state) => ({ config: { ...state.config, opacity } })),
      setMargin: (margin) =>
        set((state) => ({ config: { ...state.config, margin } })),
      setAdditionalLine: (additionalLine) =>
        set((state) => ({ config: { ...state.config, additionalLine } })),
      resetConfig: () => set({ config: { ...DEFAULT_STAMP_CONFIG } }),

      /**
       * Tamponne un seul PDF et le copie au format PT[N] Nom.pdf
       */
      stampAndCopyPiece: async (file: FileItem, outputFolder: string) => {
        const pieceNumber = extractPieceNumber(file.name)
        if (!pieceNumber) return null

        // Only stamp PDFs
        const ext = file.name.split('.').pop()?.toLowerCase()
        if (ext !== 'pdf') {
          // For non-PDFs, just copy with PT prefix
          const displayName = getDisplayName(file.name)
          const outputName = `PT${pieceNumber} ${displayName}.${ext}`
          const outputPath = outputFolder + '/' + outputName

          try {
            await invoke('copy_file', { source: file.path, destination: outputPath })
            return outputPath
          } catch (error) {
            console.error('Failed to copy file:', error)
            return null
          }
        }

        const { config } = get()

        set({ isStamping: true })

        try {
          // Read PDF bytes from disk
          const pdfBytes = await invoke<number[]>('read_binary_file', { path: file.path })
          const uint8Array = new Uint8Array(pdfBytes)

          // Apply stamp
          const stampedBytes = await stampPdf(uint8Array, pieceNumber, config)

          // Build output path: PT[N] Nom.pdf
          const displayName = getDisplayName(file.name)
          const outputName = `PT${pieceNumber} ${displayName}.pdf`
          const outputPath = outputFolder + '/' + outputName

          // Write stamped PDF
          await invoke('write_binary_file', {
            path: outputPath,
            content: Array.from(stampedBytes),
          })

          set({ lastOutputFolder: outputFolder })
          return outputPath
        } catch (error) {
          console.error('Failed to stamp PDF:', error)
          return null
        } finally {
          set({ isStamping: false })
        }
      },

      /**
       * Tamponne tous les PDFs classes et les copie au format PT[N]
       */
      stampAndCopyAll: async (files: FileItem[], outputFolder: string) => {
        set({ isStamping: true, stampProgress: { current: 0, total: files.length } })

        // Ensure output folder exists
        try {
          await invoke('create_folder', { path: outputFolder })
        } catch {
          // Folder may already exist
        }

        const results: string[] = []

        for (let i = 0; i < files.length; i++) {
          set({ stampProgress: { current: i, total: files.length } })

          const result = await get().stampAndCopyPiece(files[i], outputFolder)
          if (result) {
            results.push(result)
          }
        }

        set({
          isStamping: false,
          stampProgress: null,
          lastOutputFolder: outputFolder,
        })

        return results
      },
    }),
    {
      name: 'citadelle-stamp-config',
      partialize: (state) => ({
        config: state.config,
        recentCabinets: state.recentCabinets,
        lastOutputFolder: state.lastOutputFolder,
      }),
    }
  )
)
