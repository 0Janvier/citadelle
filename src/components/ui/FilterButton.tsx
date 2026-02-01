import type { ReactNode } from 'react'

interface FilterButtonProps {
  onClick: () => void
  isActive: boolean
  children: ReactNode
  className?: string
}

export function FilterButton({
  onClick,
  isActive,
  children,
  className = '',
}: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 min-h-button-md text-callout rounded-full
        transition-colors duration-fast
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2
        ${isActive
          ? 'bg-[var(--accent)] text-white'
          : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text)]'
        }
        ${className}
      `}
    >
      {children}
    </button>
  )
}

interface FilterGroupProps {
  children: ReactNode
  className?: string
}

export function FilterGroup({ children, className = '' }: FilterGroupProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {children}
    </div>
  )
}
