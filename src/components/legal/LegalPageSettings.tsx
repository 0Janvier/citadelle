import { usePageStore, PAGE_DIMENSIONS, MARGIN_PRESETS } from '../../store/usePageStore'
import type { PageFormat, PageOrientation, ScrollPageBreakStyle } from '../../store/usePageStore'

interface LegalPageSettingsProps {
  onClose?: () => void
}

/**
 * Panneau de configuration de page pour documents juridiques
 *
 * Permet de configurer :
 * - Format et orientation de la page
 * - Marges (avec présets juridiques)
 * - En-tête et pied de page
 * - Variables dynamiques (numéro de page, titre, date)
 */
export function LegalPageSettings({ onClose }: LegalPageSettingsProps) {
  const {
    pageFormat,
    orientation,
    margins,
    headerEnabled,
    headerHeight,
    headerContent,
    footerEnabled,
    footerHeight,
    footerContent,
    firstPage,
    setPageFormat,
    setOrientation,
    setMargins,
    applyMarginPreset,
    setHeaderEnabled,
    setHeaderHeight,
    setHeaderContent,
    setFooterEnabled,
    setFooterHeight,
    setFooterContent,
    setDifferentFirstPage,
    setFirstPageHeaderEnabled,
    setFirstPageHeaderContent,
    setFirstPageFooterEnabled,
    setFirstPageFooterContent,
    showScrollPageBreaks,
    scrollPageBreakStyle,
    setShowScrollPageBreaks,
    setScrollPageBreakStyle,
    resetToDefaults,
  } = usePageStore()

  return (
    <div className="legal-page-settings p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--text)]">
          Mise en page
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Format et orientation */}
      <section>
        <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
          Format de page
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">Format</label>
            <select
              value={pageFormat}
              onChange={(e) => setPageFormat(e.target.value as PageFormat)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm"
            >
              {Object.entries(PAGE_DIMENSIONS).map(([format, { label }]) => (
                <option key={format} value={format}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">Orientation</label>
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as PageOrientation)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Paysage</option>
            </select>
          </div>
        </div>
      </section>

      {/* Marges */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-[var(--text-secondary)]">
            Marges
          </h4>
          <select
            onChange={(e) => {
              if (e.target.value) {
                applyMarginPreset(e.target.value as keyof typeof MARGIN_PRESETS)
              }
            }}
            className="px-2 py-1 text-xs rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)]"
            defaultValue=""
          >
            <option value="">Présets...</option>
            {Object.entries(MARGIN_PRESETS).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">Haut (px)</label>
            <input
              type="number"
              value={margins.top}
              onChange={(e) => setMargins({ top: parseInt(e.target.value) || 0 })}
              min={0}
              max={200}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">Bas (px)</label>
            <input
              type="number"
              value={margins.bottom}
              onChange={(e) => setMargins({ bottom: parseInt(e.target.value) || 0 })}
              min={0}
              max={200}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">Gauche (px)</label>
            <input
              type="number"
              value={margins.left}
              onChange={(e) => setMargins({ left: parseInt(e.target.value) || 0 })}
              min={0}
              max={200}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">Droite (px)</label>
            <input
              type="number"
              value={margins.right}
              onChange={(e) => setMargins({ right: parseInt(e.target.value) || 0 })}
              min={0}
              max={200}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm"
            />
          </div>
        </div>
      </section>

      {/* En-tête */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-[var(--text-secondary)]">
            En-tête
          </h4>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={headerEnabled}
              onChange={(e) => setHeaderEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)]"
            />
            <span className="text-xs text-[var(--text-muted)]">Activé</span>
          </label>
        </div>

        {headerEnabled && (
          <div className="space-y-3 pl-2 border-l-2 border-[var(--border)]">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Hauteur (px)</label>
              <input
                type="number"
                value={headerHeight}
                onChange={(e) => setHeaderHeight(parseInt(e.target.value) || 50)}
                min={20}
                max={150}
                className="w-24 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Gauche</label>
                <input
                  type="text"
                  value={headerContent.left}
                  onChange={(e) => setHeaderContent({ left: e.target.value })}
                  placeholder="Référence..."
                  className="w-full px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Centre</label>
                <input
                  type="text"
                  value={headerContent.center}
                  onChange={(e) => setHeaderContent({ center: e.target.value })}
                  placeholder="Titre..."
                  className="w-full px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Droite</label>
                <input
                  type="text"
                  value={headerContent.right}
                  onChange={(e) => setHeaderContent({ right: e.target.value })}
                  placeholder="Date..."
                  className="w-full px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Pied de page */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-[var(--text-secondary)]">
            Pied de page
          </h4>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={footerEnabled}
              onChange={(e) => setFooterEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)]"
            />
            <span className="text-xs text-[var(--text-muted)]">Activé</span>
          </label>
        </div>

        {footerEnabled && (
          <div className="space-y-3 pl-2 border-l-2 border-[var(--border)]">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Hauteur (px)</label>
              <input
                type="number"
                value={footerHeight}
                onChange={(e) => setFooterHeight(parseInt(e.target.value) || 40)}
                min={20}
                max={150}
                className="w-24 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Gauche</label>
                <input
                  type="text"
                  value={footerContent.left}
                  onChange={(e) => setFooterContent({ left: e.target.value })}
                  placeholder=""
                  className="w-full px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Centre</label>
                <input
                  type="text"
                  value={footerContent.center}
                  onChange={(e) => setFooterContent({ center: e.target.value })}
                  placeholder="Page {{page.current}} / {{page.total}}"
                  className="w-full px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Droite</label>
                <input
                  type="text"
                  value={footerContent.right}
                  onChange={(e) => setFooterContent({ right: e.target.value })}
                  placeholder=""
                  className="w-full px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Première page différente */}
      <section className="pt-2 border-t border-[var(--border)]">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-[var(--text-secondary)]">
            Première page différente
          </h4>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={firstPage.differentFirstPage}
              onChange={(e) => setDifferentFirstPage(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)]"
            />
            <span className="text-xs text-[var(--text-muted)]">Activé</span>
          </label>
        </div>

        {firstPage.differentFirstPage && (
          <div className="space-y-4 pl-2 border-l-2 border-[var(--accent)]/30">
            <p className="text-xs text-[var(--text-muted)]">
              Configurez des en-têtes et pieds de page spécifiques pour la première page du document.
            </p>

            {/* En-tête première page */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[var(--text-secondary)]">En-tête (1ère page)</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={firstPage.headerEnabled}
                    onChange={(e) => setFirstPageHeaderEnabled(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[var(--border)] text-[var(--accent)]"
                  />
                  <span className="text-xs text-[var(--text-muted)]">Activé</span>
                </label>
              </div>
              {firstPage.headerEnabled && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">Gauche</label>
                    <input
                      type="text"
                      value={firstPage.headerContent.left}
                      onChange={(e) => setFirstPageHeaderContent({ left: e.target.value })}
                      placeholder=""
                      className="w-full px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">Centre</label>
                    <input
                      type="text"
                      value={firstPage.headerContent.center}
                      onChange={(e) => setFirstPageHeaderContent({ center: e.target.value })}
                      placeholder=""
                      className="w-full px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">Droite</label>
                    <input
                      type="text"
                      value={firstPage.headerContent.right}
                      onChange={(e) => setFirstPageHeaderContent({ right: e.target.value })}
                      placeholder=""
                      className="w-full px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Pied de page première page */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[var(--text-secondary)]">Pied de page (1ère page)</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={firstPage.footerEnabled}
                    onChange={(e) => setFirstPageFooterEnabled(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[var(--border)] text-[var(--accent)]"
                  />
                  <span className="text-xs text-[var(--text-muted)]">Activé</span>
                </label>
              </div>
              {firstPage.footerEnabled && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">Gauche</label>
                    <input
                      type="text"
                      value={firstPage.footerContent.left}
                      onChange={(e) => setFirstPageFooterContent({ left: e.target.value })}
                      placeholder=""
                      className="w-full px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">Centre</label>
                    <input
                      type="text"
                      value={firstPage.footerContent.center}
                      onChange={(e) => setFirstPageFooterContent({ center: e.target.value })}
                      placeholder=""
                      className="w-full px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">Droite</label>
                    <input
                      type="text"
                      value={firstPage.footerContent.right}
                      onChange={(e) => setFirstPageFooterContent({ right: e.target.value })}
                      placeholder=""
                      className="w-full px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Previsualisation en mode scroll */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-[var(--text-secondary)]">
            Apercu des pages (mode scroll)
          </h4>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showScrollPageBreaks}
              onChange={(e) => setShowScrollPageBreaks(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)]"
            />
            <span className="text-xs text-[var(--text-muted)]">Afficher</span>
          </label>
        </div>

        {showScrollPageBreaks && (
          <div className="space-y-3 pl-2 border-l-2 border-[var(--border)]">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Style d'affichage</label>
              <select
                value={scrollPageBreakStyle}
                onChange={(e) => setScrollPageBreakStyle(e.target.value as ScrollPageBreakStyle)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm"
              >
                <option value="line">Ligne simple</option>
                <option value="compact">En-tetes/pieds compacts</option>
                <option value="full">En-tetes/pieds complets</option>
              </select>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Affiche les delimitations de pages pendant l'edition en mode defilement.
            </p>
          </div>
        )}
      </section>

      {/* Variables disponibles */}
      <section className="pt-2 border-t border-[var(--border)]">
        <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
          Variables disponibles
        </h4>
        <div className="flex flex-wrap gap-1">
          {[
            { var: '{{page.current}}', label: 'N° page' },
            { var: '{{page.total}}', label: 'Total pages' },
            { var: '{{document.title}}', label: 'Titre' },
            { var: '{{document.numero}}', label: 'N° document' },
            { var: '{{date.format("DD/MM/YYYY")}}', label: 'Date' },
          ].map(({ var: variable, label }) => (
            <button
              key={variable}
              onClick={() => {
                navigator.clipboard.writeText(variable)
              }}
              className="px-2 py-1 text-xs bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded hover:bg-[var(--accent)] hover:text-white transition-colors"
              title={`Cliquer pour copier : ${variable}`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="flex justify-end pt-2">
        <button
          onClick={resetToDefaults}
          className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  )
}

export default LegalPageSettings
