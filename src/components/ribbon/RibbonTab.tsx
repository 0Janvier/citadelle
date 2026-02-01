/**
 * Onglet du Ribbon
 */

import type { ReactNode } from 'react'

interface RibbonTabProps {
  children: ReactNode
  className?: string
}

export function RibbonTab({ children, className = '' }: RibbonTabProps) {
  return (
    <div className={`ribbon-tab flex items-stretch gap-1 px-2 ${className}`}>
      {children}
    </div>
  )
}
