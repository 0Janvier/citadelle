import { useState, useEffect } from 'react'

const ONBOARDING_KEY = 'citadelle-onboarding-done'

interface WelcomeScreenProps {
  onDismiss: () => void
}

const FEATURES = [
  {
    title: 'Slash Commands',
    description: 'Tapez / dans l\'editeur pour inserer rapidement des clauses, formules et articles de code.',
    shortcut: '/',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M7 20L17 4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Palette de commandes',
    description: 'Accedez a toutes les fonctionnalites depuis la palette de commandes.',
    shortcut: '\u2318\u21E7P',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Panneaux lateraux',
    description: 'Format, Sommaire, Clauses, Codes juridiques, Versions... tout est accessible dans la barre laterale droite.',
    shortcut: '\u2318\u21E7C',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M15 3v18" />
      </svg>
    ),
  },
  {
    title: 'Export PDF & DOCX',
    description: 'Exportez vos documents en PDF ou Word avec en-tetes, pieds de page et numerotation.',
    shortcut: '\u2318E',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M12 18v-6" />
        <path d="M9 15l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Raccourcis clavier',
    description: 'Plus de 50 raccourcis pour naviguer, formater et gerer vos documents efficacement.',
    shortcut: '\u2318/',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01" strokeLinecap="round" />
        <path d="M8 12h8" />
        <path d="M6 16h.01M10 16h4M18 16h.01" strokeLinecap="round" />
      </svg>
    ),
  },
]

export function WelcomeScreen({ onDismiss }: WelcomeScreenProps) {
  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-4 animate-fadeIn"
      onClick={(e) => { if (e.target === e.currentTarget) handleDismiss() }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative bg-[var(--bg)] border border-[var(--border)] rounded-xl shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col animate-scaleIn overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 text-center">
          <h1 className="text-2xl font-bold text-[var(--text)]">Bienvenue dans Citadelle</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Votre editeur de documents juridiques.
            Voici quelques fonctionnalites pour commencer.
          </p>
        </div>

        {/* Features */}
        <div className="flex-1 overflow-y-auto px-8 py-4">
          <div className="space-y-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-4 p-3 rounded-lg border border-[var(--border)] bg-[var(--editor-bg)]"
              >
                <div className="text-[var(--accent)] shrink-0 mt-0.5">
                  {feature.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[var(--text)]">{feature.title}</h3>
                    <kbd className="px-1.5 py-0.5 text-xs font-mono bg-[var(--bg)] border border-[var(--border)] rounded text-[var(--text-secondary)]">
                      {feature.shortcut}
                    </kbd>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-[var(--border)] flex justify-end">
          <button
            onClick={handleDismiss}
            className="px-6 py-2 text-sm font-medium bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Commencer
          </button>
        </div>
      </div>
    </div>
  )

  function handleDismiss() {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    onDismiss()
  }
}

export function useShowWelcome(): [boolean, () => void] {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY)
    if (!done) {
      setShow(true)
    }
  }, [])

  return [show, () => setShow(false)]
}
