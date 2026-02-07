import { useSettingsStore } from '../../store/useSettingsStore'

export function SettingsGeneral() {
  const settings = useSettingsStore()

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          Intervalle auto-save (secondes)
        </label>
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={settings.autoSaveInterval / 1000}
          onChange={(e) => settings.setAutoSaveInterval(Number(e.target.value) * 1000)}
          className="w-full"
        />
        <div className="text-sm text-[var(--text-secondary)] mt-1">
          {settings.autoSaveInterval / 1000} secondes
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Nombre de fichiers récents
        </label>
        <input
          type="number"
          min="5"
          max="50"
          value={settings.recentFilesCount}
          onChange={(e) => settings.setRecentFilesCount(Number(e.target.value))}
          className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)]"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="autoSave"
          checked={settings.autoSave}
          onChange={(e) => settings.setAutoSave(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="autoSave" className="text-sm">
          Activer auto-save
        </label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="confirmTabClose"
          checked={settings.confirmTabClose}
          onChange={(e) => settings.setConfirmTabClose(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="confirmTabClose" className="text-sm">
          Confirmer fermeture tabs non sauvegardés
        </label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="restoreSession"
          checked={settings.restoreSession}
          onChange={(e) => settings.setRestoreSession(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="restoreSession" className="text-sm">
          Restaurer session au démarrage
        </label>
      </div>
    </div>
  )
}
