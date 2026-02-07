import { useState } from 'react'
import { SettingsGeneral } from './settings/SettingsGeneral'
import { SettingsEditor } from './settings/SettingsEditor'
import { SettingsAppearance } from './settings/SettingsAppearance'
import { SettingsCabinet } from './settings/SettingsCabinet'
import { SettingsExportPdf } from './settings/SettingsExportPdf'
import { SettingsLibrary } from './settings/SettingsLibrary'
import { SettingsClausier } from './settings/SettingsClausier'
import { SettingsAdvanced } from './settings/SettingsAdvanced'

type SettingsTab = 'general' | 'editor' | 'appearance' | 'cabinet' | 'export-pdf' | 'library' | 'clausier' | 'advanced'

const TABS: { id: SettingsTab; label: string; icon: string }[] = [
  { id: 'general', label: 'Général', icon: '⚙️' },
  { id: 'editor', label: 'Éditeur', icon: '📝' },
  { id: 'appearance', label: 'Apparence', icon: '🎨' },
  { id: 'cabinet', label: 'Cabinet', icon: '⚖️' },
  { id: 'export-pdf', label: 'Export PDF', icon: '📄' },
  { id: 'library', label: 'Bibliothèque', icon: '📚' },
  { id: 'clausier', label: 'Clausier (ancien)', icon: '📋' },
  { id: 'advanced', label: 'Avancé', icon: '🔧' },
]

const TAB_TITLES: Record<SettingsTab, string> = {
  general: 'Général',
  editor: 'Éditeur',
  appearance: 'Apparence',
  cabinet: 'Cabinet',
  'export-pdf': 'Export PDF',
  library: 'Bibliothèque',
  clausier: 'Clausier (ancien)',
  advanced: 'Avancé',
}

interface SettingsProps {
  open: boolean
  onClose: () => void
}

export function Settings({ open, onClose }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')

  if (!open) return null

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
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
            <h3 className="text-xl font-semibold">{TAB_TITLES[activeTab]}</h3>
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
            {activeTab === 'general' && <SettingsGeneral />}
            {activeTab === 'editor' && <SettingsEditor />}
            {activeTab === 'appearance' && <SettingsAppearance />}
            {activeTab === 'cabinet' && <SettingsCabinet />}
            {activeTab === 'export-pdf' && <SettingsExportPdf onClose={onClose} />}
            {activeTab === 'library' && <SettingsLibrary />}
            {activeTab === 'clausier' && <SettingsClausier />}
            {activeTab === 'advanced' && <SettingsAdvanced />}
          </div>
        </div>
      </div>
    </div>
  )
}
