import { useEditorStore } from '../store/useEditorStore'

export function ExportProgressOverlay() {
  const isExporting = useEditorStore((state) => state.isExporting)
  const exportFormat = useEditorStore((state) => state.exportFormat)

  if (!isExporting) return null

  const formatLabel = exportFormat === 'docx' ? 'Word' : exportFormat?.toUpperCase() || 'document'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl shadow-2xl px-8 py-6 flex flex-col items-center gap-4 min-w-[280px]">
        <div className="relative w-10 h-10">
          <svg className="w-10 h-10 animate-spin text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-[var(--text)]">
            Export {formatLabel} en cours...
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Veuillez patienter
          </p>
        </div>
      </div>
    </div>
  )
}
