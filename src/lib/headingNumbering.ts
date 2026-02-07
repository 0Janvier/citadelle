/**
 * Logique de numérotation des titres pour l'export PDF
 *
 * Supporte deux styles :
 * - juridique : I., A., 1., a., i., α (style français traditionnel)
 * - numeric : 1., 1.1., 1.1.1. (style hiérarchique moderne)
 */

export type NumberingStyle = 'juridique' | 'numeric'

export interface NumberingConfig {
  enabled: boolean
  style: NumberingStyle
  startLevel: number // 1-6, niveau de départ
  maxLevel: number // 1-6, nombre de niveaux à numéroter
}

/**
 * Classe pour gérer la numérotation des titres
 */
export class HeadingNumberer {
  private counters: number[] = [0, 0, 0, 0, 0, 0]
  private config: NumberingConfig

  constructor(config: NumberingConfig) {
    this.config = config
  }

  /**
   * Réinitialise tous les compteurs
   */
  reset(): void {
    this.counters = [0, 0, 0, 0, 0, 0]
  }

  /**
   * Incrémente le compteur pour un niveau donné et retourne le numéro formaté
   * @param level Niveau du titre (1-6)
   * @returns Le numéro formaté ou null si non applicable
   */
  increment(level: number): string | null {
    if (!this.config.enabled) return null
    if (level < this.config.startLevel) return null
    if (level > this.config.startLevel + this.config.maxLevel - 1) return null

    const idx = level - 1
    this.counters[idx]++

    // Reset tous les niveaux inférieurs
    for (let i = idx + 1; i < 6; i++) {
      this.counters[i] = 0
    }

    return this.format(level)
  }

  /**
   * Formate le numéro selon le style configuré
   */
  private format(level: number): string {
    if (this.config.style === 'juridique') {
      return this.formatJuridique(level)
    }
    return this.formatNumeric(level)
  }

  /**
   * Format juridique français : I., A., 1., a., i., α
   */
  private formatJuridique(level: number): string {
    const adjustedLevel = level - this.config.startLevel + 1
    const idx = level - 1
    const value = this.counters[idx]

    switch (adjustedLevel) {
      case 1:
        return this.toRoman(value) + '.'
      case 2:
        return String.fromCharCode(64 + value) + '.' // A, B, C...
      case 3:
        return value + '.'
      case 4:
        return String.fromCharCode(96 + value) + '.' // a, b, c...
      case 5:
        return this.toRomanLower(value) + '.'
      case 6:
        return this.toGreek(value) + '.'
      default:
        return value + '.'
    }
  }

  /**
   * Format numérique hiérarchique : 1., 1.1., 1.1.1.
   */
  private formatNumeric(level: number): string {
    const parts: number[] = []
    for (let i = this.config.startLevel - 1; i < level; i++) {
      if (this.counters[i] > 0) {
        parts.push(this.counters[i])
      }
    }
    return parts.join('.') + '.'
  }

  /**
   * Convertit un nombre en chiffres romains majuscules
   */
  private toRoman(n: number): string {
    if (n <= 0 || n > 3999) return n.toString()

    const romanNumerals: [number, string][] = [
      [1000, 'M'],
      [900, 'CM'],
      [500, 'D'],
      [400, 'CD'],
      [100, 'C'],
      [90, 'XC'],
      [50, 'L'],
      [40, 'XL'],
      [10, 'X'],
      [9, 'IX'],
      [5, 'V'],
      [4, 'IV'],
      [1, 'I'],
    ]

    let result = ''
    let remaining = n

    for (const [value, numeral] of romanNumerals) {
      while (remaining >= value) {
        result += numeral
        remaining -= value
      }
    }

    return result
  }

  /**
   * Convertit un nombre en chiffres romains minuscules
   */
  private toRomanLower(n: number): string {
    return this.toRoman(n).toLowerCase()
  }

  /**
   * Convertit un nombre en lettres grecques minuscules
   */
  private toGreek(n: number): string {
    const greeks = [
      '',
      '\u03B1', // α
      '\u03B2', // β
      '\u03B3', // γ
      '\u03B4', // δ
      '\u03B5', // ε
      '\u03B6', // ζ
      '\u03B7', // η
      '\u03B8', // θ
      '\u03B9', // ι
      '\u03BA', // κ
      '\u03BB', // λ
      '\u03BC', // μ
      '\u03BD', // ν
      '\u03BE', // ξ
      '\u03BF', // ο
      '\u03C0', // π
      '\u03C1', // ρ
      '\u03C3', // σ
      '\u03C4', // τ
      '\u03C5', // υ
      '\u03C6', // φ
      '\u03C7', // χ
      '\u03C8', // ψ
      '\u03C9', // ω
    ]
    return greeks[n] || n.toString()
  }
}

/**
 * Génère un aperçu de la numérotation pour affichage dans l'interface
 */
export function generateNumberingPreview(config: NumberingConfig): string[] {
  const numberer = new HeadingNumberer(config)
  const preview: string[] = []

  // Simuler une structure de document typique
  const structure = [
    { level: 1, text: 'Premier titre' },
    { level: 2, text: 'Sous-titre' },
    { level: 2, text: 'Autre sous-titre' },
    { level: 3, text: 'Détail' },
    { level: 3, text: 'Autre détail' },
    { level: 1, text: 'Deuxième titre' },
    { level: 2, text: 'Sous-titre' },
  ]

  for (const item of structure) {
    const number = numberer.increment(item.level)
    if (number) {
      const indent = '  '.repeat(item.level - config.startLevel)
      preview.push(`${indent}${number} ${item.text}`)
    }
  }

  return preview
}

/**
 * Configuration par défaut pour le style juridique
 */
export const defaultNumberingConfig: NumberingConfig = {
  enabled: true,
  style: 'juridique',
  startLevel: 1,
  maxLevel: 4,
}
