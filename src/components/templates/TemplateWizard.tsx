import { useState } from 'react'
import type { JSONContent } from '@tiptap/react'

interface WizardStep {
  id: string
  title: string
  description?: string
  fields: WizardField[]
}

interface WizardField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'radio'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  defaultValue?: string
  helpText?: string
}

interface TemplateWizardProps {
  template: {
    id: string
    name: string
    description: string
    content: JSONContent
  }
  steps: WizardStep[]
  onComplete: (values: Record<string, string>, processedContent: JSONContent) => void
  onCancel: () => void
}

export function TemplateWizard({ template, steps, onComplete, onCancel }: TemplateWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const currentStep = steps[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === steps.length - 1
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const validateStep = () => {
    const stepErrors: Record<string, string> = {}

    for (const field of currentStep.fields) {
      if (field.required && !values[field.key]?.trim()) {
        stepErrors[field.key] = 'Ce champ est requis'
      }
    }

    setErrors(stepErrors)
    return Object.keys(stepErrors).length === 0
  }

  const handleNext = () => {
    if (!validateStep()) return

    if (isLastStep) {
      // Traiter le contenu du template avec les valeurs
      const processedContent = processTemplateContent(template.content, values)
      onComplete(values, processedContent)
    } else {
      setCurrentStepIndex((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1)
    }
  }

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    // Effacer l'erreur quand l'utilisateur modifie le champ
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
    }
  }

  const renderField = (field: WizardField) => {
    const value = values[field.key] || field.defaultValue || ''
    const error = errors[field.key]

    const baseInputClass = `w-full px-4 py-2 rounded-lg border ${
      error
        ? 'border-red-500 focus:ring-red-500'
        : 'border-[var(--border-color)] focus:ring-blue-500'
    } bg-[var(--bg-secondary)] focus:outline-none focus:ring-2`

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={`${baseInputClass} resize-none`}
          />
        )

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            className={baseInputClass}
          >
            <option value="">-- Sélectionner --</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            className={baseInputClass}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className={baseInputClass}
          />
        )

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((opt) => (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name={field.key}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-4 h-4"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        )

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className={baseInputClass}
          />
        )
    }
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* En-tête */}
      <div className="p-4 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">{template.name}</h2>
            <p className="text-sm text-gray-500">{template.description}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Barre de progression */}
        <div className="relative">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center gap-1 text-xs ${
                  index <= currentStepIndex ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                  index < currentStepIndex
                    ? 'bg-blue-600 text-white'
                    : index === currentStepIndex
                    ? 'bg-blue-100 text-blue-600 border border-blue-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                  {index < currentStepIndex ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="hidden sm:inline">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu de l'étape */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-lg mx-auto">
          <h3 className="text-xl font-semibold mb-2">{currentStep.title}</h3>
          {currentStep.description && (
            <p className="text-gray-500 mb-6">{currentStep.description}</p>
          )}

          <div className="space-y-6">
            {currentStep.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
                {field.helpText && (
                  <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
                )}
                {errors[field.key] && (
                  <p className="text-xs text-red-500 mt-1">{errors[field.key]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 border-t border-[var(--border-color)] flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={isFirstStep}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Précédent
        </button>

        <button
          onClick={handleNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          {isLastStep ? 'Créer le document' : 'Suivant'}
          {!isLastStep && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

// Fonction pour traiter le contenu du template avec les valeurs du wizard
function processTemplateContent(content: JSONContent, values: Record<string, string>): JSONContent {
  const processNode = (node: JSONContent): JSONContent => {
    const processed = { ...node }

    // Traiter le texte
    if (processed.text) {
      processed.text = replaceVariables(processed.text, values)
    }

    // Traiter les enfants récursivement
    if (processed.content && Array.isArray(processed.content)) {
      processed.content = processed.content.map(processNode)
    }

    return processed
  }

  return processNode(content)
}

// Remplacer les variables {{key}} par leurs valeurs
function replaceVariables(text: string, values: Record<string, string>): string {
  return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmedKey = key.trim()
    return values[trimmedKey] || match
  })
}
