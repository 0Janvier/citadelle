/**
 * Templates juridiques pour Citadelle
 *
 * Collection de modèles de documents conformes aux exigences
 * du Code de procédure civile français.
 */

import { BORDEREAU_TEMPLATE } from './bordereau'
import { CONCLUSIONS_TEMPLATE } from './conclusions'
import { ASSIGNATION_TEMPLATE } from './assignation'
import { REQUETE_TEMPLATE } from './requete'

import type { DocumentTemplate } from '../../../types/templates'

// Export individuel des templates
export { BORDEREAU_TEMPLATE } from './bordereau'
export { CONCLUSIONS_TEMPLATE } from './conclusions'
export { ASSIGNATION_TEMPLATE } from './assignation'
export { REQUETE_TEMPLATE } from './requete'

/**
 * Tous les templates juridiques intégrés (builtin)
 */
export const LEGAL_TEMPLATES: DocumentTemplate[] = [
  BORDEREAU_TEMPLATE,
  CONCLUSIONS_TEMPLATE,
  ASSIGNATION_TEMPLATE,
  REQUETE_TEMPLATE,
]

/**
 * Métadonnées des templates pour l'affichage dans l'UI
 */
export const LEGAL_TEMPLATES_METADATA = LEGAL_TEMPLATES.map((template) => ({
  id: template.id,
  name: template.name,
  description: template.description,
  category: template.category,
  icon: template.icon,
  isBuiltin: template.isBuiltin,
  isCustom: template.isCustom,
  updatedAt: template.updatedAt,
}))

export default LEGAL_TEMPLATES
