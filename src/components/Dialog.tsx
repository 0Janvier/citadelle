import React, { useEffect, useRef } from 'react'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  type?: 'confirm' | 'alert' | 'prompt' | 'custom'
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  destructive?: boolean
  children?: React.ReactNode
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  type = 'alert',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  onConfirm,
  destructive = false,
  children,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement

      // Focus trap
      const focusableElements = dialogRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements?.[0] as HTMLElement
      firstElement?.focus()

      // Handle Escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }

      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'

      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = ''
        previousActiveElement.current?.focus()
      }
    }
  }, [open, onClose])

  if (!open) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleConfirm = () => {
    onConfirm?.()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="
          relative bg-[var(--bg)]
          border border-[var(--border)]
          rounded-hig-xl shadow-hig-modal
          max-w-md w-full p-6
          animate-scaleIn
        "
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby={description ? 'dialog-description' : undefined}
      >
        {/* Title */}
        <h2
          id="dialog-title"
          className="text-title-2 font-semibold text-[var(--text)] mb-2"
        >
          {title}
        </h2>

        {/* Description */}
        {description && (
          <p
            id="dialog-description"
            className="text-body-hig text-[var(--text-secondary)] mb-6"
          >
            {description}
          </p>
        )}

        {/* Custom content */}
        {children && <div className="mb-6">{children}</div>}

        {/* Actions - HIG compliant button sizes */}
        <div className="flex gap-3 justify-end">
          {type !== 'alert' && (
            <button
              onClick={onClose}
              autoFocus={destructive}
              className="
                px-4 min-h-button-lg
                rounded-hig-md
                text-body-hig font-medium
                text-[var(--text)]
                hover:bg-[var(--editor-bg)]
                transition-colors duration-fast
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2
              "
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={type === 'alert' ? onClose : handleConfirm}
            className={`
              px-4 min-h-button-lg
              rounded-hig-md
              text-body-hig font-medium
              transition-colors duration-fast
              focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2
              ${destructive
                ? 'bg-[var(--status-error)] hover:opacity-90 text-white'
                : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white'
              }
            `}
            autoFocus={!destructive}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
