import { useSettingsStore } from '../../store/useSettingsStore'

const ACCENT_PRESETS = [
  { label: 'Par defaut', color: null },
  { label: 'Bleu', color: '#007aff' },
  { label: 'Violet', color: '#8b5cf6' },
  { label: 'Rose', color: '#ec4899' },
  { label: 'Rouge', color: '#ef4444' },
  { label: 'Orange', color: '#f97316' },
  { label: 'Vert', color: '#22c55e' },
  { label: 'Emeraude', color: '#10b981' },
  { label: 'Indigo', color: '#6366f1' },
]

export function SettingsAppearance() {
  const settings = useSettingsStore()

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Theme</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'light', label: 'Clair' },
            { value: 'dark', label: 'Sombre' },
            { value: 'sepia', label: 'Sepia' },
            { value: 'midnight', label: 'Midnight' },
            { value: 'auto', label: 'Automatique' },
          ].map((theme) => (
            <button
              key={theme.value}
              onClick={() => settings.setTheme(theme.value as any)}
              className={`px-4 py-3 rounded-lg border transition-colors ${
                settings.theme === theme.value
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                  : 'border-[var(--border)] hover:bg-[var(--editor-bg)]'
              }`}
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Couleur d'accent</label>
        <div className="flex flex-wrap gap-2">
          {ACCENT_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => settings.setAccentColor(preset.color)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                settings.accentColor === preset.color
                  ? 'border-[var(--text)] scale-110'
                  : 'border-transparent hover:scale-105'
              }`}
              style={{
                backgroundColor: preset.color || 'var(--accent)',
                ...(preset.color === null ? { background: 'conic-gradient(#007aff, #8b5cf6, #ec4899, #ef4444, #f97316, #22c55e, #007aff)' } : {}),
              }}
              title={preset.label}
            />
          ))}
        </div>
        {settings.accentColor && (
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            Accent : {settings.accentColor}
          </p>
        )}
      </div>

      <div className="p-4 bg-[var(--editor-bg)] rounded-lg">
        <p className="text-sm text-[var(--text-secondary)]">
          Le theme automatique suit les preferences systeme de votre ordinateur.
        </p>
      </div>
    </div>
  )
}
