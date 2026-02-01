/**
 * Bouton standardisé pour le Ribbon
 */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

interface RibbonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  isActive?: boolean
  variant?: 'default' | 'icon' | 'large'
  tooltip?: string
}

export const RibbonButton = forwardRef<HTMLButtonElement, RibbonButtonProps>(
  ({ children, isActive, variant = 'default', tooltip, className = '', disabled, ...props }, ref) => {
    const baseClasses = `
      flex items-center justify-center
      rounded-md transition-all duration-150
      focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1
      disabled:opacity-40 disabled:cursor-not-allowed
    `

    const variantClasses = {
      default: 'px-2.5 py-1.5 text-sm gap-1.5',
      icon: 'w-8 h-8',
      large: 'flex-col px-3 py-2 min-w-[52px] text-xs gap-1',
    }

    const stateClasses = isActive
      ? 'bg-[var(--accent)] text-white'
      : 'hover:bg-[var(--bg-hover)] text-[var(--text)]'

    return (
      <button
        ref={ref}
        type="button"
        title={tooltip}
        disabled={disabled}
        className={`${baseClasses} ${variantClasses[variant]} ${stateClasses} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

RibbonButton.displayName = 'RibbonButton'
