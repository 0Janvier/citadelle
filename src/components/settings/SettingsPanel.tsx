/**
 * Panneau de paramètres non-bloquant
 * Version sidebar du modal Settings.tsx
 */

import { useState, useRef } from 'react'
import { useSettingsStore } from '../../store/useSettingsStore'
import { useLawyerProfileStore } from '../../store/useLawyerProfileStore'
import { useToast } from '../../hooks/useToast'
import { save, open as openDialog } from '@tauri-apps/api/dialog'
import { invoke } from '@tauri-apps/api/tauri'
import { ChevronDown, ChevronRight, Settings, Edit3, Palette, Briefcase, Wrench } from 'lucide-react'

type SettingsSection = 'general' | 'editor' | 'appearance' | 'cabinet' | 'advanced'

interface SettingsPanelProps {
  onClose: () => void
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<SettingsSection>>(
    new Set(['general'])
  )
  const toast = useToast()
  const settings = useSettingsStore()

  const toggleSection = (section: SettingsSection) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <h2 className="font-semibold flex items-center gap-2">
          <Settings size={18} />
          Préférences
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Section Général */}
        <SettingsSectionHeader
          title="Général"
          icon={<Settings size={16} />}
          isExpanded={expandedSections.has('general')}
          onClick={() => toggleSection('general')}
        />
        {expandedSections.has('general') && (
          <div className="px-4 py-3 space-y-4 border-b border-[var(--border)]">
            <SettingRow label="Auto-save" description="Sauvegarder automatiquement">
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => settings.setAutoSave(e.target.checked)}
                className="w-4 h-4 accent-[var(--accent)]"
              />
            </SettingRow>

            <SettingRow label="Intervalle auto-save" description={`${settings.autoSaveInterval / 1000}s`}>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={settings.autoSaveInterval / 1000}
                onChange={(e) => settings.setAutoSaveInterval(Number(e.target.value) * 1000)}
                className="w-24"
              />
            </SettingRow>

            <SettingRow label="Fichiers récents" description={`${settings.recentFilesCount} fichiers`}>
              <input
                type="number"
                min="5"
                max="50"
                value={settings.recentFilesCount}
                onChange={(e) => settings.setRecentFilesCount(Number(e.target.value))}
                className="w-16 px-2 py-1 text-sm border border-[var(--border)] rounded bg-[var(--editor-bg)]"
              />
            </SettingRow>

            <SettingRow label="Confirmer fermeture" description="Avertir avant de fermer un onglet non sauvegardé">
              <input
                type="checkbox"
                checked={settings.confirmTabClose}
                onChange={(e) => settings.setConfirmTabClose(e.target.checked)}
                className="w-4 h-4 accent-[var(--accent)]"
              />
            </SettingRow>

            <SettingRow label="Restaurer session" description="Rouvrir les documents au démarrage">
              <input
                type="checkbox"
                checked={settings.restoreSession}
                onChange={(e) => settings.setRestoreSession(e.target.checked)}
                className="w-4 h-4 accent-[var(--accent)]"
              />
            </SettingRow>
          </div>
        )}

        {/* Section Éditeur */}
        <SettingsSectionHeader
          title="Éditeur"
          icon={<Edit3 size={16} />}
          isExpanded={expandedSections.has('editor')}
          onClick={() => toggleSection('editor')}
        />
        {expandedSections.has('editor') && (
          <div className="px-4 py-3 space-y-4 border-b border-[var(--border)]">
            <SettingRow label="Police">
              <select
                value={settings.fontFamily}
                onChange={(e) => settings.setFontFamily(e.target.value)}
                className="w-32 px-2 py-1 text-sm border border-[var(--border)] rounded bg-[var(--editor-bg)]"
              >
                <option value="system-ui">Système</option>
                <option value="'SF Mono', Monaco, monospace">SF Mono</option>
                <option value="'Menlo', monospace">Menlo</option>
                <option value="'Courier New', monospace">Courier New</option>
              </select>
            </SettingRow>

            <SettingRow label="Taille" description={`${settings.fontSize}px`}>
              <input
                type="range"
                min="10"
                max="24"
                value={settings.fontSize}
                onChange={(e) => settings.setFontSize(Number(e.target.value))}
                className="w-24"
              />
            </SettingRow>

            <SettingRow label="Interligne" description={`${settings.lineHeight}`}>
              <input
                type="range"
                min="1.0"
                max="2.0"
                step="0.1"
                value={settings.lineHeight}
                onChange={(e) => settings.setLineHeight(Number(e.target.value))}
                className="w-24"
              />
            </SettingRow>

            <SettingRow label="Retour à la ligne" description="Wrap automatique">
              <input
                type="checkbox"
                checked={settings.wordWrap}
                onChange={(e) => settings.setWordWrap(e.target.checked)}
                className="w-4 h-4 accent-[var(--accent)]"
              />
            </SettingRow>

            <SettingRow label="Numéros de ligne">
              <input
                type="checkbox"
                checked={settings.showLineNumbers}
                onChange={(e) => settings.setShowLineNumbers(e.target.checked)}
                className="w-4 h-4 accent-[var(--accent)]"
              />
            </SettingRow>

            {/* Mode Machine à écrire */}
            <div className="pt-2 border-t border-[var(--border)]">
              <div className="text-xs font-medium text-[var(--text-secondary)] mb-3">
                Mode Machine à Écrire
              </div>

              <SettingRow label="Activer" description="Cmd+Shift+T">
                <input
                  type="checkbox"
                  checked={settings.typewriterMode}
                  onChange={(e) => settings.setTypewriterMode(e.target.checked)}
                  className="w-4 h-4 accent-[var(--accent)]"
                />
              </SettingRow>

              {settings.typewriterMode && (
                <>
                  <SettingRow label="Opacité" description={`${Math.round(settings.typewriterDimOpacity * 100)}%`}>
                    <input
                      type="range"
                      min="0.2"
                      max="0.6"
                      step="0.05"
                      value={settings.typewriterDimOpacity}
                      onChange={(e) => settings.setTypewriterDimOpacity(Number(e.target.value))}
                      className="w-24"
                    />
                  </SettingRow>

                  <SettingRow label="Mode Focus">
                    <select
                      value={settings.typewriterHighlightStyle}
                      onChange={(e) => settings.setTypewriterHighlightStyle(e.target.value as 'line' | 'sentence' | 'paragraph')}
                      className="w-28 px-2 py-1 text-sm border border-[var(--border)] rounded bg-[var(--editor-bg)]"
                    >
                      <option value="paragraph">Paragraphe</option>
                      <option value="sentence">Phrase</option>
                      <option value="line">Ligne</option>
                    </select>
                  </SettingRow>

                  <SettingRow label="Position défilement">
                    <select
                      value={settings.typewriterScrollPosition}
                      onChange={(e) => settings.setTypewriterScrollPosition(e.target.value as 'top' | 'middle' | 'bottom' | 'variable' | 'none')}
                      className="w-28 px-2 py-1 text-sm border border-[var(--border)] rounded bg-[var(--editor-bg)]"
                    >
                      <option value="none">Sur place</option>
                      <option value="top">Haut</option>
                      <option value="middle">Milieu</option>
                      <option value="bottom">Bas</option>
                      <option value="variable">Variable</option>
                    </select>
                  </SettingRow>

                  <SettingRow label="Marquer la ligne">
                    <input
                      type="checkbox"
                      checked={settings.typewriterMarkLine}
                      onChange={(e) => settings.setTypewriterMarkLine(e.target.checked)}
                      className="w-4 h-4 accent-[var(--accent)]"
                    />
                  </SettingRow>
                </>
              )}
            </div>
          </div>
        )}

        {/* Section Apparence */}
        <SettingsSectionHeader
          title="Apparence"
          icon={<Palette size={16} />}
          isExpanded={expandedSections.has('appearance')}
          onClick={() => toggleSection('appearance')}
        />
        {expandedSections.has('appearance') && (
          <div className="px-4 py-3 space-y-4 border-b border-[var(--border)]">
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'light', label: 'Clair' },
                { value: 'dark', label: 'Sombre' },
                { value: 'sepia', label: 'Sepia' },
                { value: 'auto', label: 'Auto' },
              ].map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => settings.setTheme(theme.value as 'light' | 'dark' | 'sepia' | 'auto')}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    settings.theme === theme.value
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                      : 'border-[var(--border)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Section Cabinet */}
        <SettingsSectionHeader
          title="Cabinet"
          icon={<Briefcase size={16} />}
          isExpanded={expandedSections.has('cabinet')}
          onClick={() => toggleSection('cabinet')}
        />
        {expandedSections.has('cabinet') && (
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <CabinetSettingsCompact />
          </div>
        )}

        {/* Section Avancé */}
        <SettingsSectionHeader
          title="Avancé"
          icon={<Wrench size={16} />}
          isExpanded={expandedSections.has('advanced')}
          onClick={() => toggleSection('advanced')}
        />
        {expandedSections.has('advanced') && (
          <div className="px-4 py-3 space-y-3 border-b border-[var(--border)]">
            <button
              onClick={handleExport}
              className="w-full px-3 py-2 text-sm text-left border border-[var(--border)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              Exporter les paramètres
            </button>
            <button
              onClick={handleImport}
              className="w-full px-3 py-2 text-sm text-left border border-[var(--border)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              Importer les paramètres
            </button>
            <button
              onClick={handleReset}
              className="w-full px-3 py-2 text-sm text-left text-red-500 border border-red-300 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Réinitialiser les paramètres
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Composant pour les en-têtes de section repliables
function SettingsSectionHeader({
  title,
  icon,
  isExpanded,
  onClick,
}: {
  title: string
  icon: React.ReactNode
  isExpanded: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-4 py-3 hover:bg-[var(--bg-tertiary)] transition-colors border-b border-[var(--border)]"
    >
      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      <span className="text-[var(--text-secondary)]">{icon}</span>
      <span className="font-medium text-sm">{title}</span>
    </button>
  )
}

// Composant pour une ligne de paramètre
function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {description && (
          <div className="text-xs text-[var(--text-tertiary)] truncate">{description}</div>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

// Version compacte des paramètres cabinet
function CabinetSettingsCompact() {
  const profile = useLawyerProfileStore()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const signatureInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (base64: string | null) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setter(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-4">
      {/* Identité */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-[var(--text-secondary)]">Identité</div>
        <div className="grid grid-cols-3 gap-2">
          <select
            value={profile.civilite}
            onChange={(e) => profile.setField('civilite', e.target.value as 'Maitre' | 'Me' | '')}
            className="px-2 py-1.5 text-sm border border-[var(--border)] rounded bg-[var(--editor-bg)]"
          >
            <option value="Maitre">Maître</option>
            <option value="Me">Me</option>
            <option value="">-</option>
          </select>
          <input
            type="text"
            value={profile.prenom}
            onChange={(e) => profile.setField('prenom', e.target.value)}
            className="px-2 py-1.5 text-sm border border-[var(--border)] rounded bg-[var(--editor-bg)]"
            placeholder="Prénom"
          />
          <input
            type="text"
            value={profile.nom}
            onChange={(e) => profile.setField('nom', e.target.value)}
            className="px-2 py-1.5 text-sm border border-[var(--border)] rounded bg-[var(--editor-bg)]"
            placeholder="Nom"
          />
        </div>
      </div>

      {/* Cabinet */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-[var(--text-secondary)]">Cabinet</div>
        <input
          type="text"
          value={profile.cabinet}
          onChange={(e) => profile.setField('cabinet', e.target.value)}
          className="w-full px-2 py-1.5 text-sm border border-[var(--border)] rounded bg-[var(--editor-bg)]"
          placeholder="Nom du cabinet"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={profile.barreau}
            onChange={(e) => profile.setField('barreau', e.target.value)}
            className="px-2 py-1.5 text-sm border border-[var(--border)] rounded bg-[var(--editor-bg)]"
            placeholder="Barreau"
          />
          <input
            type="text"
            value={profile.numeroToque}
            onChange={(e) => profile.setField('numeroToque', e.target.value)}
            className="px-2 py-1.5 text-sm border border-[var(--border)] rounded bg-[var(--editor-bg)]"
            placeholder="N° Toque"
          />
        </div>
      </div>

      {/* Coordonnées */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-[var(--text-secondary)]">Coordonnées</div>
        <input
          type="text"
          value={profile.adresse}
          onChange={(e) => profile.setField('adresse', e.target.value)}
          className="w-full px-2 py-1.5 text-sm border border-[var(--border)] rounded bg-[var(--editor-bg)]"
          placeholder="Adresse"
        />
        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            value={profile.codePostal}
            onChange={(e) => profile.setField('codePostal', e.target.value)}
            className="px-2 py-1.5 text-sm border border-[var(--border)] rounded bg-[var(--editor-bg)]"
            placeholder="CP"
          />
          <input
            type="text"
            value={profile.ville}
            onChange={(e) => profile.setField('ville', e.target.value)}
            className="col-span-2 px-2 py-1.5 text-sm border border-[var(--border)] rounded bg-[var(--editor-bg)]"
            placeholder="Ville"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="tel"
            value={profile.telephone}
            onChange={(e) => profile.setField('telephone', e.target.value)}
            className="px-2 py-1.5 text-sm border border-[var(--border)] rounded bg-[var(--editor-bg)]"
            placeholder="Téléphone"
          />
          <input
            type="email"
            value={profile.email}
            onChange={(e) => profile.setField('email', e.target.value)}
            className="px-2 py-1.5 text-sm border border-[var(--border)] rounded bg-[var(--editor-bg)]"
            placeholder="Email"
          />
        </div>
      </div>

      {/* Visuels */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-[var(--text-secondary)]">Visuels</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="border border-dashed border-[var(--border)] rounded-lg p-2 text-center">
            {profile.logo ? (
              <div className="relative">
                <img src={profile.logo} alt="Logo" className="max-h-10 mx-auto object-contain" />
                <button
                  onClick={() => profile.setLogo(null)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs"
                >
                  ×
                </button>
              </div>
            ) : (
              <button
                onClick={() => logoInputRef.current?.click()}
                className="text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)]"
              >
                + Logo
              </button>
            )}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, profile.setLogo)}
            />
          </div>
          <div className="border border-dashed border-[var(--border)] rounded-lg p-2 text-center">
            {profile.signature ? (
              <div className="relative">
                <img src={profile.signature} alt="Signature" className="max-h-10 mx-auto object-contain" />
                <button
                  onClick={() => profile.setSignature(null)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs"
                >
                  ×
                </button>
              </div>
            ) : (
              <button
                onClick={() => signatureInputRef.current?.click()}
                className="text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)]"
              >
                + Signature
              </button>
            )}
            <input
              ref={signatureInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, profile.setSignature)}
            />
          </div>
        </div>
      </div>

      {/* Options d'export */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-[var(--text-secondary)]">Options d'export</div>
        <SettingRow label="Logo en en-tête">
          <input
            type="checkbox"
            checked={profile.afficherLogoEntete}
            onChange={(e) => profile.setField('afficherLogoEntete', e.target.checked)}
            className="w-4 h-4 accent-[var(--accent)]"
          />
        </SettingRow>
        <SettingRow label="Signature en pied">
          <input
            type="checkbox"
            checked={profile.afficherSignature}
            onChange={(e) => profile.setField('afficherSignature', e.target.checked)}
            className="w-4 h-4 accent-[var(--accent)]"
          />
        </SettingRow>
        <SettingRow label="Mentions légales">
          <input
            type="checkbox"
            checked={profile.afficherMentionsLegales}
            onChange={(e) => profile.setField('afficherMentionsLegales', e.target.checked)}
            className="w-4 h-4 accent-[var(--accent)]"
          />
        </SettingRow>
      </div>
    </div>
  )
}
