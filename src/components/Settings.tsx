import { useState, useRef } from 'react'
import { useSettingsStore } from '../store/useSettingsStore'
import { useLawyerProfileStore } from '../store/useLawyerProfileStore'
import { useToast } from '../hooks/useToast'
import { save, open as openDialog } from '@tauri-apps/api/dialog'
import { invoke } from '@tauri-apps/api/tauri'
import { ClauseManager } from './clauses'
import { LibraryBrowser } from './library'

type SettingsTab = 'general' | 'editor' | 'appearance' | 'cabinet' | 'library' | 'clausier' | 'advanced'

interface SettingsProps {
  open: boolean
  onClose: () => void
}

export function Settings({ open, onClose }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const toast = useToast()

  // Settings store
  const settings = useSettingsStore()

  if (!open) return null

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Settings Panel */}
      <div
        className="relative bg-[var(--bg)] border border-[var(--border)] rounded-xl shadow-2xl w-full max-w-5xl h-[700px] flex animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar */}
        <div className="w-48 border-r border-[var(--border)] p-4">
          <h2 className="text-lg font-semibold mb-4">Préférences</h2>
          <nav className="space-y-1">
            {[
              { id: 'general', label: 'Général', icon: '⚙️' },
              { id: 'editor', label: 'Éditeur', icon: '📝' },
              { id: 'appearance', label: 'Apparence', icon: '🎨' },
              { id: 'cabinet', label: 'Cabinet', icon: '⚖️' },
              { id: 'library', label: 'Bibliothèque', icon: '📚' },
              { id: 'clausier', label: 'Clausier (ancien)', icon: '📋' },
              { id: 'advanced', label: 'Avancé', icon: '🔧' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[var(--accent)] text-white'
                    : 'hover:bg-[var(--editor-bg)]'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
            <h3 className="text-xl font-semibold">
              {activeTab === 'general' && 'Général'}
              {activeTab === 'editor' && 'Éditeur'}
              {activeTab === 'appearance' && 'Apparence'}
              {activeTab === 'cabinet' && 'Cabinet'}
              {activeTab === 'library' && 'Bibliothèque'}
              {activeTab === 'clausier' && 'Clausier (ancien)'}
              {activeTab === 'advanced' && 'Avancé'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--editor-bg)] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Settings Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'general' && (
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
                  <div className="text-sm text-gray-500 mt-1">
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
            )}

            {activeTab === 'editor' && (
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
                  <div className="text-sm text-gray-500 mt-1">{settings.fontSize}px</div>
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
                  <div className="text-sm text-gray-500 mt-1">{settings.lineHeight}</div>
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

                {/* Typewriter Mode Section */}
                <div className="border-t border-[var(--border)] pt-6 mt-6">
                  <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                    <span>Mode Machine à Écrire</span>
                    <span className="text-xs text-gray-500 font-normal">Cmd+Shift+T</span>
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
                      <div className="text-sm text-gray-500 mt-1">
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
                      <p className="text-xs text-gray-500 mt-2">
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
                      <p className="text-xs text-gray-500 mt-2">
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
                      <p className="text-xs text-gray-500 mt-2">
                        Ajoute une teinte grise subtile sous la ligne en cours d'édition.
                      </p>
                    </div>

                    <p className="text-xs text-gray-500">
                      Le mode machine à écrire (style Ulysses) garde le curseur fixé verticalement
                      et atténue le texte environnant pour une meilleure concentration.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
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
            )}

            {activeTab === 'cabinet' && <CabinetSettings />}

            {activeTab === 'library' && <LibraryBrowser />}

            {activeTab === 'clausier' && <ClauseManager />}

            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Gestion des paramètres</h4>
                  <div className="space-y-2">
                    <button
                      onClick={handleExport}
                      className="w-full px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--editor-bg)] transition-colors text-left"
                    >
                      📤 Exporter les paramètres
                    </button>
                    <button
                      onClick={handleImport}
                      className="w-full px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--editor-bg)] transition-colors text-left"
                    >
                      📥 Importer les paramètres
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Composant pour les paramètres du cabinet
function CabinetSettings() {
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
    <div className="space-y-6">
      {/* Identité */}
      <div>
        <h4 className="text-sm font-medium mb-3">Identité</h4>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Civilité</label>
            <select
              value={profile.civilite}
              onChange={(e) => profile.setField('civilite', e.target.value as 'Maitre' | 'Me' | '')}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
            >
              <option value="Maitre">Maître</option>
              <option value="Me">Me</option>
              <option value="">Aucune</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Prénom</label>
            <input
              type="text"
              value={profile.prenom}
              onChange={(e) => profile.setField('prenom', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
              placeholder="Jean"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Nom</label>
            <input
              type="text"
              value={profile.nom}
              onChange={(e) => profile.setField('nom', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
              placeholder="DUPONT"
            />
          </div>
        </div>
      </div>

      {/* Cabinet */}
      <div>
        <h4 className="text-sm font-medium mb-3">Cabinet</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Nom du cabinet</label>
            <input
              type="text"
              value={profile.cabinet}
              onChange={(e) => profile.setField('cabinet', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
              placeholder="Cabinet DUPONT & Associés"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Barreau</label>
              <input
                type="text"
                value={profile.barreau}
                onChange={(e) => profile.setField('barreau', e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
                placeholder="Paris"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">N° Toque</label>
              <input
                type="text"
                value={profile.numeroToque}
                onChange={(e) => profile.setField('numeroToque', e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
                placeholder="A0123"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Coordonnées */}
      <div>
        <h4 className="text-sm font-medium mb-3">Coordonnées</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Adresse</label>
            <input
              type="text"
              value={profile.adresse}
              onChange={(e) => profile.setField('adresse', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
              placeholder="123 rue du Palais"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Code postal</label>
              <input
                type="text"
                value={profile.codePostal}
                onChange={(e) => profile.setField('codePostal', e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
                placeholder="75001"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Ville</label>
              <input
                type="text"
                value={profile.ville}
                onChange={(e) => profile.setField('ville', e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
                placeholder="Paris"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Téléphone</label>
              <input
                type="tel"
                value={profile.telephone}
                onChange={(e) => profile.setField('telephone', e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
                placeholder="01 23 45 67 89"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => profile.setField('email', e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
                placeholder="contact@cabinet.fr"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logo et Signature */}
      <div>
        <h4 className="text-sm font-medium mb-3">Visuels</h4>
        <div className="grid grid-cols-2 gap-4">
          {/* Logo */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">Logo du cabinet</label>
            <div className="border border-dashed border-[var(--border)] rounded-lg p-4 text-center">
              {profile.logo ? (
                <div className="relative">
                  <img
                    src={profile.logo}
                    alt="Logo"
                    className="max-h-16 mx-auto object-contain"
                  />
                  <button
                    onClick={() => profile.setLogo(null)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="text-sm text-gray-500 hover:text-[var(--accent)]"
                >
                  + Ajouter un logo
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
          </div>

          {/* Signature */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">Signature</label>
            <div className="border border-dashed border-[var(--border)] rounded-lg p-4 text-center">
              {profile.signature ? (
                <div className="relative">
                  <img
                    src={profile.signature}
                    alt="Signature"
                    className="max-h-16 mx-auto object-contain"
                  />
                  <button
                    onClick={() => profile.setSignature(null)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signatureInputRef.current?.click()}
                  className="text-sm text-gray-500 hover:text-[var(--accent)]"
                >
                  + Ajouter signature
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
      </div>

      {/* Options d'export */}
      <div>
        <h4 className="text-sm font-medium mb-3">Options d'export</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="afficherLogoEntete"
              checked={profile.afficherLogoEntete}
              onChange={(e) => profile.setField('afficherLogoEntete', e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="afficherLogoEntete" className="text-sm">
              Afficher le logo dans l'en-tête
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="afficherSignature"
              checked={profile.afficherSignature}
              onChange={(e) => profile.setField('afficherSignature', e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="afficherSignature" className="text-sm">
              Afficher la signature en bas de document
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="afficherMentionsLegales"
              checked={profile.afficherMentionsLegales}
              onChange={(e) => profile.setField('afficherMentionsLegales', e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="afficherMentionsLegales" className="text-sm">
              Afficher les mentions légales en pied de page
            </label>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Format pagination</label>
            <select
              value={profile.paginationFormat}
              onChange={(e) => profile.setField('paginationFormat', e.target.value as any)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
            >
              <option value="Page X sur Y">Page X sur Y</option>
              <option value="Page X/Y">Page X/Y</option>
              <option value="X/Y">X/Y</option>
              <option value="">Aucune</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Mentions légales</label>
            <textarea
              value={profile.mentionsLegales}
              onChange={(e) => profile.setField('mentionsLegales', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm h-20 resize-none"
              placeholder="Mentions légales du cabinet..."
            />
          </div>
        </div>
      </div>

      {/* Aperçu de l'en-tête */}
      {(profile.nom || profile.cabinet) && (
        <div className="border-t border-[var(--border)] pt-4">
          <h4 className="text-sm font-medium mb-3">Aperçu de l'en-tête</h4>
          <div className="border border-[var(--border)] rounded-lg p-4 bg-white dark:bg-gray-800">
            <div className="flex items-start gap-4">
              {profile.logo && profile.afficherLogoEntete && (
                <img src={profile.logo} alt="Logo" className="h-12 object-contain" />
              )}
              <div className="flex-1 text-sm">
                {profile.cabinet && <div className="font-bold">{profile.cabinet}</div>}
                {profile.getFullName() && <div>{profile.getFullName()}</div>}
                {(profile.barreau || profile.numeroToque) && (
                  <div className="text-gray-500 text-xs">
                    {profile.barreau && `Barreau de ${profile.barreau}`}
                    {profile.barreau && profile.numeroToque && ' - '}
                    {profile.numeroToque && `Toque ${profile.numeroToque}`}
                  </div>
                )}
              </div>
              <div className="text-right text-xs text-gray-500">
                {profile.adresse && <div>{profile.adresse}</div>}
                {(profile.codePostal || profile.ville) && (
                  <div>{profile.codePostal} {profile.ville}</div>
                )}
                {profile.telephone && <div>Tél : {profile.telephone}</div>}
                {profile.email && <div>{profile.email}</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
