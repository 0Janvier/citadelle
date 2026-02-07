import { useEffect, useRef, useState, useMemo } from 'react'

interface ShortcutGroup {
  title: string
  shortcuts: { keys: string; description: string }[]
}

const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0
const mod = isMac ? '\u2318' : 'Ctrl'
const shift = isMac ? '\u21E7' : 'Shift'
const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Fichier',
    shortcuts: [
      { keys: `${mod}+N`, description: 'Nouveau document' },
      { keys: `${mod}+O`, description: 'Ouvrir un fichier' },
      { keys: `${mod}+${shift}+O`, description: 'Ouvrir un dossier projet' },
      { keys: `${mod}+S`, description: 'Enregistrer' },
      { keys: `${mod}+${shift}+S`, description: 'Enregistrer sous' },
      { keys: `${mod}+W`, description: 'Fermer l\'onglet' },
      { keys: `${mod}+P`, description: 'Imprimer' },
      { keys: `${mod}+${shift}+P`, description: 'Palette de commandes' },
      { keys: `${mod}+K`, description: 'Switcher de fichiers' },
    ],
  },
  {
    title: 'Edition',
    shortcuts: [
      { keys: `${mod}+Z`, description: 'Annuler' },
      { keys: `${mod}+${shift}+Z`, description: 'Refaire' },
      { keys: `${mod}+F`, description: 'Rechercher' },
      { keys: `${mod}+H`, description: 'Rechercher et remplacer' },
      { keys: `${mod}+${shift}+F`, description: 'Rechercher dans le projet' },
    ],
  },
  {
    title: 'Format',
    shortcuts: [
      { keys: `${mod}+B`, description: 'Gras' },
      { keys: `${mod}+I`, description: 'Italique' },
      { keys: `${mod}+U`, description: 'Souligner' },
      { keys: `${mod}+${shift}+X`, description: 'Barrer' },
      { keys: `${mod}+${shift}+H`, description: 'Surligner' },
      { keys: `${mod}+E`, description: 'Code en ligne' },
      { keys: `${mod}+.`, description: 'Exposant' },
      { keys: `${mod}+,`, description: 'Indice' },
    ],
  },
  {
    title: 'Affichage',
    shortcuts: [
      { keys: `${mod}+T`, description: 'Changer de theme' },
      { keys: `${mod}+${shift}+D`, description: 'Mode sans distraction' },
      { keys: `${mod}+${shift}+L`, description: 'Mode page' },
      { keys: `${mod}+${shift}+T`, description: 'Mode machine a ecrire' },
      { keys: `${mod}+\\`, description: 'Afficher/masquer la sidebar' },
      { keys: `${mod}+=`, description: 'Zoom avant' },
      { keys: `${mod}+-`, description: 'Zoom arriere' },
      { keys: `${mod}+0`, description: 'Reinitialiser le zoom' },
    ],
  },
  {
    title: 'Insertion',
    shortcuts: [
      { keys: `${mod}+${shift}+N`, description: 'Note de bas de page' },
    ],
  },
  {
    title: 'Panneaux',
    shortcuts: [
      { keys: `${mod}+${shift}+M`, description: 'Commentaires' },
      { keys: `${mod}+${shift}+G`, description: 'Glossaire des termes' },
      { keys: `${mod}+${shift}+J`, description: 'Pieces du document' },
      { keys: `${mod}+${shift}+C`, description: 'Clauses' },
      { keys: `${mod}+${shift}+V`, description: 'Variables' },
      { keys: `${mod}+${shift}+K`, description: 'Codes juridiques' },
      { keys: `${mod}+${shift}+E`, description: 'Echeances' },
      { keys: `${mod}+${shift}+H`, description: 'Historique des versions' },
      { keys: `${mod}+${shift}+.`, description: 'Rouvrir dernier panneau' },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { keys: `${mod}+Tab`, description: 'Onglet suivant' },
      { keys: `${mod}+${shift}+Tab`, description: 'Onglet precedent' },
      { keys: `${mod}+1...9`, description: 'Aller a l\'onglet N' },
      { keys: `${mod}+,`, description: 'Preferences' },
    ],
  },
]

interface KeyboardShortcutsDialogProps {
  open: boolean
  onClose: () => void
}

export function KeyboardShortcutsDialog({ open, onClose }: KeyboardShortcutsDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!open) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    // Focus search on open
    setTimeout(() => searchRef.current?.focus(), 100)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
      setSearchQuery('')
    }
  }, [open, onClose])

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return SHORTCUT_GROUPS
    const q = searchQuery.toLowerCase()
    return SHORTCUT_GROUPS
      .map((group) => ({
        ...group,
        shortcuts: group.shortcuts.filter(
          (s) => s.description.toLowerCase().includes(q) || s.keys.toLowerCase().includes(q)
        ),
      }))
      .filter((group) => group.shortcuts.length > 0)
  }, [searchQuery])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-4 animate-fadeIn"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        ref={dialogRef}
        className="relative bg-[var(--bg)] border border-[var(--border)] rounded-hig-xl shadow-hig-modal max-w-2xl w-full max-h-[80vh] flex flex-col animate-scaleIn"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 id="shortcuts-title" className="text-title-2 font-semibold text-[var(--text)]">
            Raccourcis clavier
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[var(--editor-bg)] transition-colors text-[var(--text-secondary)]"
            aria-label="Fermer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search bar */}
        <div className="px-6 py-3 border-b border-[var(--border)]">
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrer les raccourcis..."
            className="w-full px-3 py-1.5 text-sm rounded-md border border-[var(--border)] bg-[var(--editor-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--text)]"
          />
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-4">
          {filteredGroups.length === 0 ? (
            <p className="text-center text-sm text-[var(--text-secondary)] py-4">Aucun raccourci ne correspond</p>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {filteredGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                    {group.title}
                  </h3>
                  <div className="space-y-1">
                    {group.shortcuts.map((shortcut) => (
                      <div key={shortcut.keys} className="flex items-center justify-between py-1">
                        <span className="text-sm text-[var(--text)]">{shortcut.description}</span>
                        <kbd className="ml-4 shrink-0 px-1.5 py-0.5 text-xs font-mono bg-[var(--editor-bg)] border border-[var(--border)] rounded text-[var(--text-secondary)]">
                          {shortcut.keys}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
