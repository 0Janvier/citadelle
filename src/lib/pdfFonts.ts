/**
 * Configuration des polices pour pdfmake
 *
 * Ce module charge les polices EB Garamond pré-encodées et Roboto pour l'export PDF.
 * Garamond est utilisé comme police par défaut pour un rendu professionnel.
 *
 * Les polices Garamond sont pré-encodées en base64 via le script build:fonts
 * pour éviter les problèmes d'encodage avec btoa() dans le navigateur.
 */

import { garamondVfs, garamondFonts } from './garamond-vfs'

/**
 * Configuration des polices disponibles pour pdfmake
 */
export const pdfFontsConfig = {
  ...garamondFonts,
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf',
  },
}

/**
 * Charge les polices Garamond et les enregistre dans pdfmake
 */
export async function loadGaramondFonts(pdfMake: any): Promise<void> {

  try {
    // Enregistrer le VFS Garamond dans pdfmake
    if (typeof pdfMake.addVirtualFileSystem === 'function') {
      pdfMake.addVirtualFileSystem(garamondVfs)
    } else if (pdfMake.vfs) {
      Object.assign(pdfMake.vfs, garamondVfs)
    }

    // Ajouter la configuration de police Garamond
    pdfMake.fonts = {
      ...pdfMake.fonts,
      ...garamondFonts,
    }


    // Vérifier que les fonts sont bien enregistrées
    if (pdfMake.virtualfs && typeof pdfMake.virtualfs.readFileSync === 'function') {
      try {
        pdfMake.virtualfs.readFileSync('EBGaramond-Regular.ttf')
      } catch (e) {
        console.warn('Garamond font verification failed:', e)
      }
    }
  } catch (error) {
    console.error('Failed to load Garamond fonts:', error)
    throw error
  }
}

/**
 * Vérifie si les polices Garamond sont disponibles dans pdfmake
 */
export function isGaramondAvailable(pdfMake: any): boolean {
  if (!pdfMake?.fonts?.Garamond) {
    return false
  }

  // Vérifier si le VFS contient les fichiers de police
  if (pdfMake.virtualfs && typeof pdfMake.virtualfs.readFileSync === 'function') {
    try {
      const testRead = pdfMake.virtualfs.readFileSync('EBGaramond-Regular.ttf')
      return !!testRead
    } catch {
      return false
    }
  }

  // Fallback: vérifier le vfs directement
  if (pdfMake.vfs) {
    return !!pdfMake.vfs['EBGaramond-Regular.ttf']
  }

  return false
}

/**
 * Retourne la police disponible (Garamond si chargé, sinon Roboto)
 */
export function getAvailableFont(pdfMake: any): string {
  if (isGaramondAvailable(pdfMake)) {
    return 'Garamond'
  }
  return 'Roboto'
}

/**
 * Police par défaut pour les exports PDF
 */
export const DEFAULT_PDF_FONT = 'Garamond'
