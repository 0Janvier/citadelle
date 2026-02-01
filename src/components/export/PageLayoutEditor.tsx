import type { PageLayout, PageSize } from '../../types/templates'

interface PageLayoutEditorProps {
  layout: PageLayout
  onChange: (layout: PageLayout) => void
  disabled?: boolean
}

const PAGE_SIZE_OPTIONS: Array<{ value: PageSize; label: string; dimensions: string }> = [
  { value: 'A4', label: 'A4', dimensions: '210 × 297 mm' },
  { value: 'Letter', label: 'Letter', dimensions: '8.5 × 11 in' },
  { value: 'Legal', label: 'Legal', dimensions: '8.5 × 14 in' },
  { value: 'A5', label: 'A5', dimensions: '148 × 210 mm' },
]

const MARGIN_PRESETS = [
  { name: 'Étroit', value: '1.5cm' },
  { name: 'Normal', value: '2.5cm' },
  { name: 'Large', value: '3.5cm' },
]

export function PageLayoutEditor({
  layout,
  onChange,
  disabled = false,
}: PageLayoutEditorProps) {
  const updateLayout = (updates: Partial<PageLayout>) => {
    onChange({ ...layout, ...updates })
  }

  const updateMargins = (key: keyof PageLayout['margins'], value: string) => {
    onChange({
      ...layout,
      margins: { ...layout.margins, [key]: value },
    })
  }

  const applyMarginPreset = (value: string) => {
    onChange({
      ...layout,
      margins: {
        top: value,
        bottom: value,
        left: value,
        right: value,
      },
    })
  }

  return (
    <div className="space-y-4">
      {/* Page size and orientation */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Format
          </label>
          <select
            value={layout.size}
            onChange={(e) => updateLayout({ size: e.target.value as PageSize })}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {PAGE_SIZE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label} ({opt.dimensions})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Orientation
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => updateLayout({ orientation: 'portrait' })}
              disabled={disabled}
              className={`
                flex-1 px-3 py-2 text-sm rounded-lg border transition-colors
                ${layout.orientation === 'portrait'
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-6" viewBox="0 0 16 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="1" width="14" height="22" rx="1" />
                </svg>
                Portrait
              </div>
            </button>
            <button
              onClick={() => updateLayout({ orientation: 'landscape' })}
              disabled={disabled}
              className={`
                flex-1 px-3 py-2 text-sm rounded-lg border transition-colors
                ${layout.orientation === 'landscape'
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-6 h-4" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="1" width="22" height="14" rx="1" />
                </svg>
                Paysage
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Margins */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Marges
          </label>
          <div className="flex gap-1">
            {MARGIN_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyMarginPreset(preset.value)}
                disabled={disabled}
                className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Haut</label>
            <input
              type="text"
              value={layout.margins.top}
              onChange={(e) => updateMargins('top', e.target.value)}
              disabled={disabled}
              className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Bas</label>
            <input
              type="text"
              value={layout.margins.bottom}
              onChange={(e) => updateMargins('bottom', e.target.value)}
              disabled={disabled}
              className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Gauche</label>
            <input
              type="text"
              value={layout.margins.left}
              onChange={(e) => updateMargins('left', e.target.value)}
              disabled={disabled}
              className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Droite</label>
            <input
              type="text"
              value={layout.margins.right}
              onChange={(e) => updateMargins('right', e.target.value)}
              disabled={disabled}
              className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {/* Visual preview */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Aperçu
        </label>
        <div className="flex justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div
            className={`
              bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 shadow-sm
              ${layout.orientation === 'portrait' ? 'w-20 h-28' : 'w-28 h-20'}
            `}
          >
            <div
              className="w-full h-full border-2 border-dashed border-blue-300 dark:border-blue-700"
              style={{
                borderTopWidth: `${parseInt(layout.margins.top) / 8}px`,
                borderBottomWidth: `${parseInt(layout.margins.bottom) / 8}px`,
                borderLeftWidth: `${parseInt(layout.margins.left) / 8}px`,
                borderRightWidth: `${parseInt(layout.margins.right) / 8}px`,
              }}
            >
              <div className="w-full h-full bg-blue-50 dark:bg-blue-900/20" />
            </div>
          </div>
        </div>
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
          Zone bleue = contenu, bordure = marges
        </p>
      </div>
    </div>
  )
}
