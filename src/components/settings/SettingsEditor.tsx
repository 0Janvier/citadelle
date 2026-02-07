import { useSettingsStore } from '../../store/useSettingsStore'
import { generateNumberingPreview } from '../../lib/headingNumbering'

export function SettingsEditor() {
  const settings = useSettingsStore()

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Police</label>
        <select
          value={settings.fontFamily}
          onChange={(e) => settings.setFontFamily(e.target.value)}
          className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)]"
        >
          <option value="system-ui">Système</option>
          <option value="'SF Mono', Monaco, monospace">SF Mono</option>
          <option value="'Menlo', monospace">Menlo</option>
          <option value="'Courier New', monospace">Courier New</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Taille de police (px)
        </label>
        <input
          type="range"
          min="10"
          max="24"
          value={settings.fontSize}
          onChange={(e) => settings.setFontSize(Number(e.target.value))}
          className="w-full"
        />
        <div className="text-sm text-[var(--text-secondary)] mt-1">{settings.fontSize}px</div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Hauteur de ligne</label>
        <input
          type="range"
          min="1.0"
          max="2.0"
          step="0.1"
          value={settings.lineHeight}
          onChange={(e) => settings.setLineHeight(Number(e.target.value))}
          className="w-full"
        />
        <div className="text-sm text-[var(--text-secondary)] mt-1">{settings.lineHeight}</div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="wordWrap"
          checked={settings.wordWrap}
          onChange={(e) => settings.setWordWrap(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="wordWrap" className="text-sm">
          Retour à la ligne automatique
        </label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showLineNumbers"
          checked={settings.showLineNumbers}
          onChange={(e) => settings.setShowLineNumbers(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="showLineNumbers" className="text-sm">
          Afficher numéros de ligne
        </label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="frenchTypography"
          checked={settings.frenchTypography}
          onChange={(e) => settings.setFrenchTypography(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="frenchTypography" className="text-sm">
          Typographie francaise automatique
        </label>
      </div>
      <p className="text-xs text-[var(--text-secondary)] -mt-4 ml-6">
        Insere automatiquement des espaces insecables avant : ; ? ! et autour des guillemets.
      </p>

      {/* Heading Numbering Section */}
      <div className="border-t border-[var(--border)] pt-6 mt-6">
        <h4 className="text-sm font-medium mb-4">Numerotation des titres</h4>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="headingNumberingEnabled"
              checked={settings.headingNumbering.enabled}
              onChange={(e) => settings.setHeadingNumbering({ enabled: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="headingNumberingEnabled" className="text-sm">
              Activer la numerotation automatique
            </label>
          </div>

          <div className={settings.headingNumbering.enabled ? '' : 'opacity-50 pointer-events-none'}>
            <label className="block text-sm font-medium mb-2">Style</label>
            <select
              value={settings.headingNumbering.style}
              onChange={(e) => settings.setHeadingNumbering({ style: e.target.value as 'juridique' | 'numeric' })}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)]"
            >
              <option value="juridique">Juridique (I., A., 1., a.)</option>
              <option value="numeric">Numerique (1., 1.1., 1.1.1.)</option>
            </select>
          </div>

          {/* Preview */}
          {settings.headingNumbering.enabled && (
            <div className="bg-[var(--editor-bg)] border border-[var(--border)] rounded-lg p-3">
              <div className="text-xs text-[var(--text-secondary)] mb-2 font-medium">Apercu :</div>
              <div className="text-sm font-mono space-y-0.5">
                {generateNumberingPreview({
                  enabled: true,
                  style: settings.headingNumbering.style,
                  startLevel: settings.headingNumbering.startLevel,
                  maxLevel: 4,
                }).map((line, i) => (
                  <div key={i} className="text-[var(--text)]">{line}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Typewriter Mode Section */}
      <div className="border-t border-[var(--border)] pt-6 mt-6">
        <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
          <span>Mode Machine à Écrire</span>
          <span className="text-xs text-[var(--text-secondary)] font-normal">Cmd+Shift+T</span>
        </h4>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="typewriterMode"
              checked={settings.typewriterMode}
              onChange={(e) => settings.setTypewriterMode(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="typewriterMode" className="text-sm">
              Activer le mode machine à écrire
            </label>
          </div>

          <div className={settings.typewriterMode ? '' : 'opacity-50 pointer-events-none'}>
            <label className="block text-sm font-medium mb-2">
              Opacité du texte atténué
            </label>
            <input
              type="range"
              min="0.2"
              max="0.6"
              step="0.05"
              value={settings.typewriterDimOpacity}
              onChange={(e) => settings.setTypewriterDimOpacity(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-sm text-[var(--text-secondary)] mt-1">
              {Math.round(settings.typewriterDimOpacity * 100)}%
            </div>
          </div>

          <div className={settings.typewriterMode ? '' : 'opacity-50 pointer-events-none'}>
            <label className="block text-sm font-medium mb-2">
              Mode Focus
            </label>
            <select
              value={settings.typewriterHighlightStyle}
              onChange={(e) => settings.setTypewriterHighlightStyle(e.target.value as 'line' | 'sentence' | 'paragraph')}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)]"
            >
              <option value="paragraph">Paragraphe</option>
              <option value="sentence">Phrase</option>
              <option value="line">Ligne</option>
            </select>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              Choisissez quel niveau de texte reste visible : le paragraphe entier,
              la phrase courante ou uniquement la ligne en cours d'édition.
            </p>
          </div>

          <div className={settings.typewriterMode ? '' : 'opacity-50 pointer-events-none'}>
            <label className="block text-sm font-medium mb-2">
              Position du défilement fixe
            </label>
            <select
              value={settings.typewriterScrollPosition}
              onChange={(e) => settings.setTypewriterScrollPosition(e.target.value as 'top' | 'middle' | 'bottom' | 'variable' | 'none')}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)]"
            >
              <option value="none">Sur place</option>
              <option value="top">Haut</option>
              <option value="middle">Milieu</option>
              <option value="bottom">Bas</option>
              <option value="variable">Variable</option>
            </select>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              Position verticale où la ligne active reste fixée. "Sur place" désactive
              le défilement automatique. "Variable" permet un déplacement libre et
              ne fixe la position qu'à la frappe.
            </p>
          </div>

          <div className={settings.typewriterMode ? '' : 'opacity-50 pointer-events-none'}>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="typewriterMarkLine"
                checked={settings.typewriterMarkLine}
                onChange={(e) => settings.setTypewriterMarkLine(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="typewriterMarkLine" className="text-sm">
                Marquer la ligne courante
              </label>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              Ajoute une teinte grise subtile sous la ligne en cours d'édition.
            </p>
          </div>

          <p className="text-xs text-[var(--text-secondary)]">
            Le mode machine à écrire (style Ulysses) garde le curseur fixé verticalement
            et atténue le texte environnant pour une meilleure concentration.
          </p>
        </div>
      </div>
    </div>
  )
}
