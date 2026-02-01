import type { ReactNode } from 'react'

interface PanelHeaderProps {
  title: string
  onClose?: () => void
  action?: ReactNode
}

export function PanelHeader({ title, onClose, action }: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="flex items-center gap-2">
        {action}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[var(--bg-secondary)] transition-colors"
            title="Fermer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
