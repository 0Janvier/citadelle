import type { ReactNode } from 'react'

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral'

interface StatusBadgeProps {
  status: StatusType
  children: ReactNode
  size?: 'sm' | 'md'
  className?: string
}

const statusStyles: Record<StatusType, string> = {
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
}

export function StatusBadge({
  status,
  children,
  size = 'sm',
  className = '',
}: StatusBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${statusStyles[status]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
