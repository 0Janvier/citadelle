/**
 * Groupe de boutons dans le Ribbon avec label en bas
 */

import type { ReactNode } from 'react'

interface RibbonGroupProps {
  label: string
  children: ReactNode
  className?: string
}

export function RibbonGroup({ label, children, className = '' }: RibbonGroupProps) {
  return (
    <div className={`ribbon-group flex flex-col ${className}`}>
      <div className="flex items-center gap-0.5 px-1 py-1">
        {children}
      </div>
      <div className="ribbon-group-label text-[10px] text-center text-[var(--text-secondary)] border-t border-[var(--border)] pt-0.5 mt-auto">
        {label}
      </div>
    </div>
  )
}

export function RibbonSeparator() {
  return <div className="w-px h-6 bg-[var(--border)] mx-1.5" />
}

export function RibbonDivider() {
  return <div className="w-px self-stretch bg-[var(--border)] mx-2" />
}
