import { usePdfExportSettingsStore } from '../../store/usePdfExportSettingsStore'
import { useEditorStore } from '../../store/useEditorStore'

interface SettingsExportPdfProps {
  onClose: () => void
}

export function SettingsExportPdf({ onClose }: SettingsExportPdfProps) {
  const pdfSettings = usePdfExportSettingsStore()
  const setPdfExportSettingsOpen = useEditorStore((state) => state.setPdfExportSettingsOpen)

  const openFullSettings = () => {
    onClose()
    setPdfExportSettingsOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Quick settings */}
      <div>
        <h4 className="text-sm font-medium mb-3">Numérotation des titres</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="headingNumbering"
              checked={pdfSettings.headingNumbering.enabled}
              onChange={(e) => pdfSettings.setNumberingEnabled(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="headingNumbering" className="text-sm">
              Activer la numérotation des titres
            </label>
          </div>

          {pdfSettings.headingNumbering.enabled && (
            <div className="ml-6 space-y-3">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Style</label>
                <select
                  value={pdfSettings.headingNumbering.style}
                  onChange={(e) => pdfSettings.setNumberingStyle(e.target.value as 'juridique' | 'numeric')}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
                >
                  <option value="juridique">Juridique français (I. A. 1. a.)</option>
                  <option value="numeric">Numérique (1.1.1)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Profondeur max</label>
                <select
                  value={pdfSettings.headingNumbering.maxLevel}
                  onChange={(e) => pdfSettings.setNumberingMaxLevel(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
                >
                  <option value="2">2 niveaux</option>
                  <option value="3">3 niveaux</option>
                  <option value="4">4 niveaux</option>
                  <option value="5">5 niveaux</option>
                  <option value="6">6 niveaux</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Typography quick settings */}
      <div>
        <h4 className="text-sm font-medium mb-3">Typographie</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">Police</label>
            <select
              value={pdfSettings.typography.fontFamily}
              onChange={(e) => pdfSettings.setFontFamily(e.target.value as 'Garamond' | 'Roboto')}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
            >
              <option value="Garamond">Garamond</option>
              <option value="Roboto">Roboto</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">
              Taille de police ({pdfSettings.typography.baseFontSize}pt)
            </label>
            <input
              type="range"
              min="10"
              max="14"
              value={pdfSettings.typography.baseFontSize}
              onChange={(e) => pdfSettings.setBaseFontSize(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Page layout quick settings */}
      <div>
        <h4 className="text-sm font-medium mb-3">Mise en page</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">Format</label>
            <select
              value={pdfSettings.pageLayout.format}
              onChange={(e) => pdfSettings.setPageFormat(e.target.value as 'A4' | 'Letter' | 'Legal')}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
            >
              <option value="A4">A4</option>
              <option value="Letter">Letter</option>
              <option value="Legal">Legal</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">Orientation</label>
            <select
              value={pdfSettings.pageLayout.orientation}
              onChange={(e) => pdfSettings.setOrientation(e.target.value as 'portrait' | 'landscape')}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Paysage</option>
            </select>
          </div>
        </div>
      </div>

      {/* Open full settings button */}
      <div className="border-t border-[var(--border)] pt-6">
        <button
          onClick={openFullSettings}
          className="w-full px-4 py-3 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Paramètres avancés d'export PDF
        </button>
        <p className="text-xs text-[var(--text-secondary)] mt-2 text-center">
          Couleurs des titres, marges, en-têtes, pieds de page...
        </p>
      </div>

      {/* Preview */}
      <div className="border-t border-[var(--border)] pt-6">
        <h4 className="text-sm font-medium mb-3">Aperçu de la numérotation</h4>
        <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--editor-bg)] font-serif text-sm space-y-1">
          {pdfSettings.headingNumbering.enabled ? (
            <>
              <div className="font-bold text-base">
                {pdfSettings.headingNumbering.style === 'juridique' ? 'I.' : '1.'} Premier titre
              </div>
              <div className="ml-4 font-semibold">
                {pdfSettings.headingNumbering.style === 'juridique' ? 'A.' : '1.1.'} Sous-titre
              </div>
              {pdfSettings.headingNumbering.maxLevel >= 3 && (
                <div className="ml-8">
                  {pdfSettings.headingNumbering.style === 'juridique' ? '1.' : '1.1.1.'} Détail
                </div>
              )}
              {pdfSettings.headingNumbering.maxLevel >= 4 && (
                <div className="ml-12 text-[var(--text-secondary)]">
                  {pdfSettings.headingNumbering.style === 'juridique' ? 'a.' : '1.1.1.1.'} Sous-détail
                </div>
              )}
              <div className="font-bold text-base mt-2">
                {pdfSettings.headingNumbering.style === 'juridique' ? 'II.' : '2.'} Deuxième titre
              </div>
            </>
          ) : (
            <>
              <div className="font-bold text-base">Premier titre</div>
              <div className="ml-4 font-semibold">Sous-titre</div>
              <div className="ml-8">Détail</div>
              <div className="font-bold text-base mt-2">Deuxième titre</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
