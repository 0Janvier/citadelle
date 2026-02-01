import { ReactNode, KeyboardEvent } from 'react'

interface MenuItemProps {
  label: string
  shortcut?: string
  icon?: ReactNode
  onClick: () => void
  disabled?: boolean
  checked?: boolean
  danger?: boolean
}

export function MenuItem({
  label,
  shortcut,
  icon,
  onClick,
  disabled = false,
  checked,
  danger = false,
}: MenuItemProps) {
  const handleClick = () => {
    if (!disabled) {
      onClick()
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      className={`
        w-full flex items-center justify-between
        px-3 min-h-button-md py-2
        text-left text-callout
        transition-colors duration-instant
        outline-none rounded-hig-sm mx-1
        focus-visible:bg-[var(--editor-bg)]
        ${disabled
          ? 'opacity-50 cursor-not-allowed text-[var(--text-secondary)]'
          : 'hover:bg-[var(--editor-bg)] cursor-default'
        }
        ${danger && !disabled ? 'text-[var(--status-error)] hover:text-[var(--status-error)]' : 'text-[var(--text)]'}
      `}
      style={{ width: 'calc(100% - 8px)' }}
    >
      <span className="flex items-center gap-2">
        {checked !== undefined && (
          <span className="w-4 flex justify-center">
            {checked && (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>
        )}
        {icon && <span className="w-4 h-4 flex items-center justify-center">{icon}</span>}
        <span>{label}</span>
      </span>
      {shortcut && (
        <span className="text-footnote text-[var(--text-muted)] ml-8 font-light">
          {shortcut}
        </span>
      )}
    </button>
  )
}
