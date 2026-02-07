import { useState, type ReactNode } from 'react'
import {
  Settings as SettingsIcon,
  Pencil,
  Palette,
  Scale,
  FileText,
  Library,
  Wrench,
} from 'lucide-react'
import { SettingsGeneral } from './settings/SettingsGeneral'
import { SettingsEditor } from './settings/SettingsEditor'
import { SettingsAppearance } from './settings/SettingsAppearance'
import { SettingsCabinet } from './settings/SettingsCabinet'
import { SettingsExportPdf } from './settings/SettingsExportPdf'
import { SettingsLibrary } from './settings/SettingsLibrary'
import { SettingsAdvanced } from './settings/SettingsAdvanced'

type SettingsTab = 'general' | 'editor' | 'appearance' | 'cabinet' | 'export-pdf' | 'library' | 'advanced'

const TABS: { id: SettingsTab; label: string; icon: ReactNode }[] = [
  { id: 'general', label: 'Général', icon: <SettingsIcon size={16} /> },
  { id: 'editor', label: 'Éditeur', icon: <Pencil size={16} /> },
  { id: 'appearance', label: 'Apparence', icon: <Palette size={16} /> },
  { id: 'cabinet', label: 'Cabinet', icon: <Scale size={16} /> },
  { id: 'export-pdf', label: 'Export PDF', icon: <FileText size={16} /> },
  { id: 'library', label: 'Bibliothèque', icon: <Library size={16} /> },
  { id: 'advanced', label: 'Avancé', icon: <Wrench size={16} /> },
]

const TAB_TITLES: Record<SettingsTab, string> = {
  general: 'Général',
  editor: 'Éditeur',
  appearance: 'Apparence',
  cabinet: 'Cabinet',
  'export-pdf': 'Export PDF',
  library: 'Bibliothèque',
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
                <span className="mr-2 inline-flex items-center">{tab.icon}</span>
                <span className="text-sm">{tab.label}</span>
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
            {activeTab === 'advanced' && <SettingsAdvanced />}
          </div>
        </div>
      </div>
    </div>
  )
}
