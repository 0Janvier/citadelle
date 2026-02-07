import { useState, useCallback, useEffect, useMemo } from 'react'
import { TemplateGallery } from './TemplateGallery'
import { TemplateWizard } from './TemplateWizard'
import { TemplateManager } from './TemplateManager'
import type { WizardStep } from './TemplateWizard'
import { useTemplateStore } from '../../store/useTemplateStore'
import { useLawyerProfileStore } from '../../store/useLawyerProfileStore'
import type { DocumentTemplate } from '../../types/templates'
import type { JSONContent } from '@tiptap/react'

interface NewDocumentDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreateDocument: (content: DocumentTemplate['content'], templateName: string) => void
}

// ============================================================================
// Variable extraction and wizard step generation
// ============================================================================

/** Extract all {{key}} variables from TipTap JSONContent */
function extractTemplateVariables(content: JSONContent): string[] {
  const vars = new Set<string>()
  const walk = (node: JSONContent) => {
    if (node.text) {
      const matches = node.text.matchAll(/\{\{([^}]+)\}\}/g)
      for (const m of matches) vars.add(m[1].trim())
    }
    if (Array.isArray(node.content)) {
      node.content.forEach(walk)
    }
  }
  walk(content)
  return Array.from(vars)
}

/** Human-readable labels for variable keys */
const VARIABLE_LABELS: Record<string, string> = {
  'client.nom': 'Nom du client',
  'client.adresse': 'Adresse du client',
  'adverse.nom': 'Nom de la partie adverse',
  'adverse.adresse': 'Adresse de la partie adverse',
  'dossier.reference': 'Référence dossier',
  'dossier.objet': 'Objet du dossier',
  'dossier.rg': 'Numéro RG',
  'avocat.nom': 'Nom',
  'avocat.prenom': 'Prénom',
  'avocat.cabinet': 'Cabinet',
  'avocat.barreau': 'Barreau',
  'avocat.toque': 'Toque',
  'avocat.adresse': 'Adresse',
  'avocat.code_postal': 'Code postal',
  'avocat.ville': 'Ville',
  'avocat.telephone': 'Téléphone',
  'avocat.email': 'Email',
  'juridiction.nom': 'Juridiction',
  'juridiction.ville': 'Ville de la juridiction',
  'juridiction.chambre': 'Chambre',
  'date.jour': "Date du jour",
  'date.audience': "Date d'audience",
  'date.delai': 'Délai',
}

/** Category config for grouping variables into wizard steps */
const STEP_CONFIG: { prefix: string; title: string; description: string }[] = [
  { prefix: 'client', title: 'Informations client', description: 'Renseignez les coordonnées du client' },
  { prefix: 'adverse', title: 'Partie adverse', description: 'Renseignez les informations de la partie adverse' },
  { prefix: 'dossier', title: 'Dossier', description: 'Références et objet du dossier' },
  { prefix: 'avocat', title: 'Avocat', description: 'Informations de l\'avocat (pré-remplies depuis votre profil)' },
  { prefix: 'juridiction', title: 'Juridiction', description: 'Tribunal et chambre compétente' },
  { prefix: 'date', title: 'Dates', description: 'Dates pertinentes pour le document' },
]

/** Get default values for avocat.* from LawyerProfile */
function getAvocatDefaults(): Record<string, string> {
  const profile = useLawyerProfileStore.getState()
  const defaults: Record<string, string> = {}
  const mapping: Record<string, string> = {
    'avocat.nom': profile.nom,
    'avocat.prenom': profile.prenom,
    'avocat.cabinet': profile.cabinet,
    'avocat.barreau': profile.barreau,
    'avocat.toque': profile.numeroToque,
    'avocat.adresse': profile.adresse,
    'avocat.code_postal': profile.codePostal,
    'avocat.ville': profile.ville,
    'avocat.telephone': profile.telephone,
    'avocat.email': profile.email,
  }
  for (const [key, value] of Object.entries(mapping)) {
    if (value) defaults[key] = value
  }
  return defaults
}

/** Generate wizard steps from detected variables */
function generateWizardSteps(variables: string[]): WizardStep[] {
  const avocatDefaults = getAvocatDefaults()
  const today = new Date().toLocaleDateString('fr-FR')

  const steps: WizardStep[] = []
  const used = new Set<string>()

  // Group variables by known prefixes
  for (const config of STEP_CONFIG) {
    const matching = variables.filter((v) => v.startsWith(config.prefix + '.'))
    if (matching.length === 0) continue

    matching.forEach((v) => used.add(v))

    steps.push({
      id: config.prefix,
      title: config.title,
      description: config.description,
      fields: matching.map((key) => {
        const suffix = key.split('.').slice(1).join('.')
        let defaultValue = avocatDefaults[key] || ''

        // Pre-fill date.jour with today
        if (key === 'date.jour') defaultValue = today

        return {
          key,
          label: VARIABLE_LABELS[key] || suffix.charAt(0).toUpperCase() + suffix.slice(1),
          type: key.startsWith('date.') ? 'date' as const : 'text' as const,
          required: key.startsWith('client.') || key.startsWith('adverse.'),
          placeholder: VARIABLE_LABELS[key] || suffix,
          defaultValue,
        }
      }),
    })
  }

  // Remaining variables not matched by any prefix
  const remaining = variables.filter((v) => !used.has(v))
  if (remaining.length > 0) {
    steps.push({
      id: 'other',
      title: 'Autres informations',
      description: 'Complétez les champs restants',
      fields: remaining.map((key) => ({
        key,
        label: VARIABLE_LABELS[key] || key,
        type: 'text' as const,
        placeholder: key,
      })),
    })
  }

  return steps
}

// ============================================================================
// Component
// ============================================================================

export function NewDocumentDialog({
  isOpen,
  onClose,
  onCreateDocument,
}: NewDocumentDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null)
  const [wizardTemplate, setWizardTemplate] = useState<DocumentTemplate | null>(null)
  const [showManager, setShowManager] = useState(false)
  const templates = useTemplateStore((state) => state.templates)

  // Select the first template by default when dialog opens
  useEffect(() => {
    if (isOpen && !selectedTemplate && templates.length > 0) {
      setSelectedTemplate(templates[0])
    }
  }, [isOpen, selectedTemplate, templates])

  // Reset all state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedTemplate(null)
      setWizardTemplate(null)
      setShowManager(false)
    }
  }, [isOpen])

  const handleSelect = useCallback((template: DocumentTemplate) => {
    setSelectedTemplate(template)
  }, [])

  /** Try to create from template: if it has variables, show wizard; otherwise create directly */
  const attemptCreate = useCallback((template: DocumentTemplate) => {
    const vars = extractTemplateVariables(template.content)
    if (vars.length > 0) {
      setWizardTemplate(template)
    } else {
      onCreateDocument(template.content, template.name)
      onClose()
    }
  }, [onCreateDocument, onClose])

  const handleCreate = useCallback(() => {
    if (selectedTemplate) {
      attemptCreate(selectedTemplate)
    }
  }, [selectedTemplate, attemptCreate])

  const handleDoubleClick = useCallback((template: DocumentTemplate) => {
    attemptCreate(template)
  }, [attemptCreate])

  /** Quick blank document creation */
  const handleBlankDocument = useCallback(() => {
    onCreateDocument(
      { type: 'doc', content: [{ type: 'paragraph' }] },
      'Document vide'
    )
    onClose()
  }, [onCreateDocument, onClose])

  /** Wizard completion handler */
  const handleWizardComplete = useCallback((_values: Record<string, string>, processedContent: JSONContent) => {
    if (wizardTemplate) {
      onCreateDocument(processedContent, wizardTemplate.name)
      onClose()
    }
  }, [wizardTemplate, onCreateDocument, onClose])

  /** Go back from wizard to gallery */
  const handleWizardCancel = useCallback(() => {
    setWizardTemplate(null)
  }, [])

  // Generate wizard steps when entering wizard mode
  const wizardSteps = useMemo(() => {
    if (!wizardTemplate) return []
    const vars = extractTemplateVariables(wizardTemplate.content)
    return generateWizardSteps(vars)
  }, [wizardTemplate])

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (wizardTemplate) {
          setWizardTemplate(null)
        } else {
          onClose()
        }
      } else if (e.key === 'Enter' && selectedTemplate && !wizardTemplate) {
        handleCreate()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedTemplate, wizardTemplate, handleCreate, onClose])

  if (!isOpen) return null

  // Manager mode: template management
  if (showManager) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col mx-4">
          <TemplateManager
            onBack={() => setShowManager(false)}
            onClose={onClose}
          />
        </div>
      </div>
    )
  }

  // Wizard mode: show the multi-step form
  if (wizardTemplate && wizardSteps.length > 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setWizardTemplate(null)}
        />
        <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col mx-4">
          <TemplateWizard
            template={wizardTemplate}
            steps={wizardSteps}
            onComplete={handleWizardComplete}
            onCancel={handleWizardCancel}
          />
        </div>
      </div>
    )
  }

  // Gallery mode: template selection
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Nouveau document
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-6">
          <TemplateGallery
            onSelect={handleSelect}
            onDoubleClick={handleDoubleClick}
            selectedTemplateId={selectedTemplate?.id}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowManager(true)}
              className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors"
            >
              Gérer les modèles
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {selectedTemplate ? (
                <>
                  Sélectionné : <strong className="text-gray-700 dark:text-gray-300">{selectedTemplate.name}</strong>
                </>
              ) : (
                'Sélectionnez un template'
              )}
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleBlankDocument}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
            >
              Document vide
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleCreate}
              disabled={!selectedTemplate}
              className={`
                px-4 py-2 text-sm font-medium rounded-lg transition-colors
                ${selectedTemplate
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Créer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
