import { useSettingsStore } from '../../store/useSettingsStore'
import { useToast } from '../../hooks/useToast'
import { save, open as openDialog } from '@tauri-apps/api/dialog'
import { invoke } from '@tauri-apps/api/tauri'

export function SettingsAdvanced() {
  const settings = useSettingsStore()
  const toast = useToast()

  const handleExport = async () => {
    try {
      const selected = await save({
        defaultPath: 'citadelle-settings.json',
        filters: [{ name: 'JSON', extensions: ['json'] }],
      })

      if (selected) {
        const json = settings.exportSettings()
        await invoke('write_file', { path: selected, content: json })
        toast.success('Paramètres exportés')
      }
    } catch (error) {
      toast.error(`Erreur lors de l'export: ${error}`)
    }
  }

  const handleImport = async () => {
    try {
      const selected = await openDialog({
        multiple: false,
        filters: [{ name: 'JSON', extensions: ['json'] }],
      })

      if (selected && typeof selected === 'string') {
        const content = await invoke<string>('read_file', { path: selected })
        settings.importSettings(content)
        toast.success('Paramètres importés')
      }
    } catch (error) {
      toast.error(`Erreur lors de l'import: ${error}`)
    }
  }

  const handleReset = () => {
    if (confirm('Réinitialiser tous les paramètres par défaut ?')) {
      settings.resetToDefaults()
      toast.success('Paramètres réinitialisés')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium mb-3">Gestion des paramètres</h4>
        <div className="space-y-2">
          <button
            onClick={handleExport}
            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--editor-bg)] transition-colors text-left"
          >
            Exporter les paramètres
          </button>
          <button
            onClick={handleImport}
            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--editor-bg)] transition-colors text-left"
          >
            Importer les paramètres
          </button>
        </div>
      </div>

      <div className="border-t border-[var(--border)] pt-6">
        <h4 className="text-sm font-medium mb-3 text-red-500">Zone de danger</h4>
        <button
          onClick={handleReset}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Réinitialiser tous les paramètres
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Cette action restaurera tous les paramètres par défaut.
        </p>
      </div>
    </div>
  )
}
