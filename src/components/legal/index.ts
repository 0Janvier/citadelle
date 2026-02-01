/**
 * Composants UI pour le domaine juridique
 *
 * Ces composants permettent de gérer :
 * - Les pièces justificatives (bordereau)
 * - Les références de jurisprudence
 * - La mise en page des documents juridiques
 */

export { PieceManager } from './PieceManager'
export { JurisprudenceSelector } from './JurisprudenceSelector'
export { LegalPageSettings } from './LegalPageSettings'

// Re-export des types pour faciliter l'import
export type {
  Piece,
  Jurisprudence,
  BordereauPieces,
  PieceNature,
  PieceProvenance,
  JuridictionType,
  SolutionType,
} from '../../types/legal'
