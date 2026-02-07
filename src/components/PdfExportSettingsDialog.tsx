/**
 * Dialog de personnalisation des paramètres d'export PDF
 *
 * Interface avec 4 onglets :
 * - Numérotation : style et niveaux
 * - Typographie : police, taille, couleurs
 * - Mise en page : format, orientation, marges
 * - En-têtes/Pieds : contenu personnalisé
 */

import { useState } from 'react'
import { X, FileText, Type, Layout, Heading, Image } from 'lucide-react'
import {
  usePdfExportSettingsStore,
  LEGAL_HEADING_COLORS,
} from '../store/usePdfExportSettingsStore'
import { useLawyerProfileStore } from '../store/useLawyerProfileStore'
import { generateNumberingPreview } from '../lib/headingNumbering'

interface PdfExportSettingsDialogProps {
  isOpen: boolean
  onClose: () => void
  onExport?: () => void
}

type TabId = 'numbering' | 'typography' | 'layout' | 'headers'

const tabs: { id: TabId; label: string; icon: typeof FileText }[] = [
  { id: 'numbering', label: 'Numérotation', icon: FileText },
  { id: 'typography', label: 'Typographie', icon: Type },
  { id: 'layout', label: 'Mise en page', icon: Layout },
  { id: 'headers', label: 'En-têtes', icon: Heading },
]

export function PdfExportSettingsDialog({
  isOpen,
  onClose,
  onExport,
}: PdfExportSettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<TabId>('numbering')
  const store = usePdfExportSettingsStore()

  if (!isOpen) return null

  const handleExport = () => {
    onExport?.()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--bg)] border border-[var(--border)] rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold text-[var(--text)]">
            Paramètres d'export PDF
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <X size={20} className="text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border)] px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text)]'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'numbering' && <NumberingTab />}
          {activeTab === 'typography' && <TypographyTab />}
          {activeTab === 'layout' && <LayoutTab />}
          {activeTab === 'headers' && <HeadersTab />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)]">
          <button
            onClick={() => store.resetToDefaults()}
            className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
          >
            Réinitialiser
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-[var(--border)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
            >
              Fermer
            </button>
            {onExport && (
              <button
                onClick={handleExport}
                className="px-4 py-2 text-sm bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Exporter PDF
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Onglet Numérotation
 */
function NumberingTab() {
  const {
    headingNumbering,
    includeTOC,
    setNumberingEnabled,
    setNumberingStyle,
    setNumberingStartLevel,
    setNumberingMaxLevel,
    setIncludeTOC,
  } = usePdfExportSettingsStore()

  const preview = generateNumberingPreview(headingNumbering)

  return (
    <div className="space-y-6">
      {/* Activer la numérotation */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-[var(--text)]">
            Numérotation automatique
          </label>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Ajoute des numéros devant les titres
          </p>
        </div>
        <input
          type="checkbox"
          checked={headingNumbering.enabled}
          onChange={(e) => setNumberingEnabled(e.target.checked)}
          className="w-5 h-5 accent-[var(--accent)]"
        />
      </div>

      {/* Table des matières */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-[var(--text)]">
            Table des matières
          </label>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Ajoute une TdM en première page
          </p>
        </div>
        <input
          type="checkbox"
          checked={includeTOC}
          onChange={(e) => setIncludeTOC(e.target.checked)}
          className="w-5 h-5 accent-[var(--accent)]"
        />
      </div>

      {headingNumbering.enabled && (
        <>
          {/* Style de numérotation */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Style de numérotation
            </label>
            <select
              value={headingNumbering.style}
              onChange={(e) =>
                setNumberingStyle(e.target.value as 'juridique' | 'numeric')
              }
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)]"
            >
              <option value="juridique">
                Juridique français (I., A., 1., a., i.)
              </option>
              <option value="numeric">Numérique (1., 1.1., 1.1.1.)</option>
            </select>
          </div>

          {/* Niveau de départ */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Niveau de départ
            </label>
            <select
              value={headingNumbering.startLevel}
              onChange={(e) => setNumberingStartLevel(Number(e.target.value))}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)]"
            >
              <option value={1}>Titre 1 (h1)</option>
              <option value={2}>Titre 2 (h2)</option>
              <option value={3}>Titre 3 (h3)</option>
            </select>
          </div>

          {/* Profondeur max */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Profondeur maximale
            </label>
            <select
              value={headingNumbering.maxLevel}
              onChange={(e) => setNumberingMaxLevel(Number(e.target.value))}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)]"
            >
              <option value={1}>1 niveau</option>
              <option value={2}>2 niveaux</option>
              <option value={3}>3 niveaux</option>
              <option value={4}>4 niveaux</option>
              <option value={5}>5 niveaux</option>
              <option value={6}>6 niveaux</option>
            </select>
          </div>

          {/* Aperçu */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Aperçu
            </label>
            <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] font-mono text-sm">
              {preview.map((line, i) => (
                <div key={i} className="text-[var(--text)]">
                  {line}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/**
 * Onglet Typographie
 */
function TypographyTab() {
  const {
    typography,
    setFontFamily,
    setBaseFontSize,
    setLineHeight,
    setHeadingColor,
  } = usePdfExportSettingsStore()

  const colorPresets = [
    { name: 'Bleu foncé', value: LEGAL_HEADING_COLORS.darkBlue },
    { name: 'Bleu moyen', value: LEGAL_HEADING_COLORS.mediumBlue },
    { name: 'Gris foncé', value: LEGAL_HEADING_COLORS.darkGray },
    { name: 'Gris moyen', value: LEGAL_HEADING_COLORS.mediumGray },
    { name: 'Noir', value: LEGAL_HEADING_COLORS.black },
  ]

  return (
    <div className="space-y-6">
      {/* Police */}
      <div>
        <label className="block text-sm font-medium text-[var(--text)] mb-2">
          Police
        </label>
        <select
          value={typography.fontFamily}
          onChange={(e) =>
            setFontFamily(e.target.value as 'Garamond' | 'Roboto')
          }
          className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)]"
        >
          <option value="Garamond">EB Garamond (serif, classique)</option>
          <option value="Roboto">Roboto (sans-serif, moderne)</option>
        </select>
      </div>

      {/* Taille de base */}
      <div>
        <label className="block text-sm font-medium text-[var(--text)] mb-2">
          Taille de police : {typography.baseFontSize}pt
        </label>
        <input
          type="range"
          min="8"
          max="16"
          step="1"
          value={typography.baseFontSize}
          onChange={(e) => setBaseFontSize(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-1">
          <span>8pt</span>
          <span>12pt</span>
          <span>16pt</span>
        </div>
      </div>

      {/* Interligne */}
      <div>
        <label className="block text-sm font-medium text-[var(--text)] mb-2">
          Interligne : {typography.lineHeight.toFixed(1)}
        </label>
        <input
          type="range"
          min="1.0"
          max="2.5"
          step="0.1"
          value={typography.lineHeight}
          onChange={(e) => setLineHeight(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-1">
          <span>Simple</span>
          <span>1.5</span>
          <span>Double</span>
        </div>
      </div>

      {/* Couleurs des titres */}
      <div>
        <label className="block text-sm font-medium text-[var(--text)] mb-3">
          Couleurs des titres
        </label>
        <div className="space-y-3">
          {(['h1', 'h2', 'h3', 'h4'] as const).map((level) => (
            <div key={level} className="flex items-center gap-3">
              <span className="w-16 text-sm text-[var(--text-secondary)]">
                {level.toUpperCase()}
              </span>
              <select
                value={typography.headingColors[level]}
                onChange={(e) => setHeadingColor(level, e.target.value)}
                className="flex-1 px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)]"
              >
                {colorPresets.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.name}
                  </option>
                ))}
              </select>
              <div
                className="w-8 h-8 rounded border border-[var(--border)]"
                style={{ backgroundColor: typography.headingColors[level] }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Onglet Mise en page
 */
function LayoutTab() {
  const { pageLayout, setPageFormat, setOrientation, setMargin } =
    usePdfExportSettingsStore()

  return (
    <div className="space-y-6">
      {/* Format de page */}
      <div>
        <label className="block text-sm font-medium text-[var(--text)] mb-2">
          Format de page
        </label>
        <select
          value={pageLayout.format}
          onChange={(e) =>
            setPageFormat(e.target.value as 'A4' | 'Letter' | 'Legal')
          }
          className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)]"
        >
          <option value="A4">A4 (210 x 297 mm)</option>
          <option value="Letter">Letter (216 x 279 mm)</option>
          <option value="Legal">Legal (216 x 356 mm)</option>
        </select>
      </div>

      {/* Orientation */}
      <div>
        <label className="block text-sm font-medium text-[var(--text)] mb-2">
          Orientation
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => setOrientation('portrait')}
            className={`flex-1 px-4 py-3 border rounded-lg transition-colors ${
              pageLayout.orientation === 'portrait'
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                : 'border-[var(--border)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <div className="w-6 h-8 mx-auto mb-2 border-2 border-current rounded" />
            <span className="text-sm">Portrait</span>
          </button>
          <button
            onClick={() => setOrientation('landscape')}
            className={`flex-1 px-4 py-3 border rounded-lg transition-colors ${
              pageLayout.orientation === 'landscape'
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                : 'border-[var(--border)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <div className="w-8 h-6 mx-auto mb-2 border-2 border-current rounded" />
            <span className="text-sm">Paysage</span>
          </button>
        </div>
      </div>

      {/* Marges */}
      <div>
        <label className="block text-sm font-medium text-[var(--text)] mb-3">
          Marges (cm)
        </label>
        <div className="grid grid-cols-2 gap-4">
          {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
            <div key={side}>
              <label className="block text-xs text-[var(--text-secondary)] mb-1 capitalize">
                {side === 'top'
                  ? 'Haut'
                  : side === 'bottom'
                    ? 'Bas'
                    : side === 'left'
                      ? 'Gauche'
                      : 'Droite'}
              </label>
              <input
                type="number"
                min="0.5"
                max="5"
                step="0.1"
                value={pageLayout.margins[side]}
                onChange={(e) => setMargin(side, Number(e.target.value))}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)]"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Onglet En-têtes/Pieds de page
 */
function HeadersTab() {
  const {
    headerFooter,
    setHeaderEnabled,
    setHeaderContent,
    setFooterEnabled,
    setFooterContent,
    setFirstPageDifferent,
    setIncludeLogo,
    setLogoPosition,
    setLogoMaxHeight,
  } = usePdfExportSettingsStore()

  const profile = useLawyerProfileStore()
  const hasLogo = !!profile.logo

  const variables = [
    { label: 'Titre du document', value: '{{document.title}}' },
    { label: 'Page actuelle', value: '{{page.current}}' },
    { label: 'Nombre de pages', value: '{{page.total}}' },
    { label: 'Date (JJ/MM/AAAA)', value: '{{date.format("DD/MM/YYYY")}}' },
    { label: 'Date (long)', value: '{{date.format("D MMMM YYYY")}}' },
  ]

  return (
    <div className="space-y-6">
      {/* Logo du cabinet */}
      <div className="space-y-3 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image size={18} className="text-[var(--text-secondary)]" />
            <label className="text-sm font-medium text-[var(--text)]">
              Logo du cabinet
            </label>
          </div>
          <input
            type="checkbox"
            checked={headerFooter.includeLogo}
            onChange={(e) => setIncludeLogo(e.target.checked)}
            disabled={!hasLogo}
            className="w-5 h-5 accent-[var(--accent)] disabled:opacity-50"
          />
        </div>

        {!hasLogo && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Aucun logo configuré. Ajoutez votre logo dans Préférences → Cabinet.
          </p>
        )}

        {hasLogo && headerFooter.includeLogo && (
          <>
            {/* Aperçu du logo */}
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white dark:bg-gray-800 rounded border border-[var(--border)]">
                <img
                  src={profile.logo!}
                  alt="Logo cabinet"
                  className="max-h-12 object-contain"
                />
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Ce logo sera ajouté dans l'en-tête du PDF.
              </p>
            </div>

            {/* Position du logo */}
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-2">
                Position du logo
              </label>
              <div className="flex gap-2">
                {(['left', 'center', 'right'] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setLogoPosition(pos)}
                    className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-colors ${
                      headerFooter.logoPosition === pos
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                        : 'border-[var(--border)] hover:bg-[var(--bg)]'
                    }`}
                  >
                    {pos === 'left' ? 'Gauche' : pos === 'center' ? 'Centre' : 'Droite'}
                  </button>
                ))}
              </div>
            </div>

            {/* Taille du logo */}
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-2">
                Hauteur max : {headerFooter.logoMaxHeight}pt
              </label>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={headerFooter.logoMaxHeight}
                onChange={(e) => setLogoMaxHeight(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-1">
                <span>Petit</span>
                <span>Moyen</span>
                <span>Grand</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Variables disponibles */}
      <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
        <p className="text-xs text-[var(--text-secondary)] mb-2">
          Variables disponibles :
        </p>
        <div className="flex flex-wrap gap-2">
          {variables.map((v) => (
            <code
              key={v.value}
              className="px-2 py-1 text-xs bg-[var(--bg)] rounded border border-[var(--border)]"
              title={v.label}
            >
              {v.value}
            </code>
          ))}
        </div>
      </div>

      {/* En-tête */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[var(--text)]">
            En-tête
          </label>
          <input
            type="checkbox"
            checked={headerFooter.headerEnabled}
            onChange={(e) => setHeaderEnabled(e.target.checked)}
            className="w-5 h-5 accent-[var(--accent)]"
          />
        </div>
        {headerFooter.headerEnabled && (
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Gauche"
              value={headerFooter.headerContent.left}
              onChange={(e) =>
                setHeaderContent({
                  ...headerFooter.headerContent,
                  left: e.target.value,
                })
              }
              className="px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)]"
            />
            <input
              type="text"
              placeholder="Centre"
              value={headerFooter.headerContent.center}
              onChange={(e) =>
                setHeaderContent({
                  ...headerFooter.headerContent,
                  center: e.target.value,
                })
              }
              className="px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)]"
            />
            <input
              type="text"
              placeholder="Droite"
              value={headerFooter.headerContent.right}
              onChange={(e) =>
                setHeaderContent({
                  ...headerFooter.headerContent,
                  right: e.target.value,
                })
              }
              className="px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)]"
            />
          </div>
        )}
      </div>

      {/* Pied de page */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[var(--text)]">
            Pied de page
          </label>
          <input
            type="checkbox"
            checked={headerFooter.footerEnabled}
            onChange={(e) => setFooterEnabled(e.target.checked)}
            className="w-5 h-5 accent-[var(--accent)]"
          />
        </div>
        {headerFooter.footerEnabled && (
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Gauche"
              value={headerFooter.footerContent.left}
              onChange={(e) =>
                setFooterContent({
                  ...headerFooter.footerContent,
                  left: e.target.value,
                })
              }
              className="px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)]"
            />
            <input
              type="text"
              placeholder="Centre"
              value={headerFooter.footerContent.center}
              onChange={(e) =>
                setFooterContent({
                  ...headerFooter.footerContent,
                  center: e.target.value,
                })
              }
              className="px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)]"
            />
            <input
              type="text"
              placeholder="Droite"
              value={headerFooter.footerContent.right}
              onChange={(e) =>
                setFooterContent({
                  ...headerFooter.footerContent,
                  right: e.target.value,
                })
              }
              className="px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)]"
            />
          </div>
        )}
      </div>

      {/* Première page différente */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
        <div>
          <label className="text-sm font-medium text-[var(--text)]">
            Première page différente
          </label>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Masquer l'en-tête/pied sur la première page
          </p>
        </div>
        <input
          type="checkbox"
          checked={headerFooter.firstPageDifferent}
          onChange={(e) => setFirstPageDifferent(e.target.checked)}
          className="w-5 h-5 accent-[var(--accent)]"
        />
      </div>
    </div>
  )
}

export default PdfExportSettingsDialog
