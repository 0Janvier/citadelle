import type { ReactNode, MouseEvent } from 'react'

interface ActionButtonProps {
  onClick: (e: MouseEvent<HTMLButtonElement>) => void
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  fullWidth?: boolean
  icon?: ReactNode
  className?: string
  title?: string
}

export function ActionButton({
  onClick,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  icon,
  className = '',
  title,
}: ActionButtonProps) {
  // Base styles with HIG-compliant focus ring
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-medium rounded-hig-md
    transition-all duration-fast
    focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2
  `

  const variantStyles = {
    primary: 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] active:opacity-90',
    secondary: 'bg-[var(--bg-secondary)] text-[var(--text)] hover:bg-[var(--bg-tertiary)] active:bg-[var(--bg-tertiary)]',
    success: 'bg-[var(--status-success)] text-white hover:opacity-90 active:opacity-80',
    danger: 'bg-[var(--status-error)] text-white hover:opacity-90 active:opacity-80',
  }

  // HIG-compliant sizes (minimum 36px for sm, 44px for touch targets)
  const sizeStyles = {
    sm: 'px-3 min-h-button-sm text-callout',
    md: 'px-4 min-h-button-md text-body-hig',
    lg: 'px-5 min-h-button-lg text-title-3',
  }

  const disabledStyles = disabled
    ? 'opacity-50 cursor-not-allowed bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
    : 'cursor-pointer'
  const widthStyles = fullWidth ? 'w-full' : ''

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${widthStyles} ${className}`}
    >
      {icon}
      {children}
    </button>
  )
}
