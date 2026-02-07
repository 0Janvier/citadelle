import { useSettingsStore } from '../../store/useSettingsStore'

export function SettingsAppearance() {
  const settings = useSettingsStore()

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Thème</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'light', label: 'Clair' },
            { value: 'dark', label: 'Sombre' },
            { value: 'sepia', label: 'Sepia' },
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

      <div className="p-4 bg-[var(--editor-bg)] rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Le thème automatique suit les préférences système de votre ordinateur.
        </p>
      </div>
    </div>
  )
}
