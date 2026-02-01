// Icônes SVG pour la gestion des tableaux

interface IconProps {
  className?: string
}

export function TableIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  )
}

export function AddRowAboveIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="10" width="18" height="11" rx="1" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="10" x2="9" y2="21" />
      <line x1="15" y1="10" x2="15" y2="21" />
      <line x1="12" y1="2" x2="12" y2="7" />
      <polyline points="9 5 12 2 15 5" />
    </svg>
  )
}

export function AddRowBelowIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="11" rx="1" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="3" x2="9" y2="14" />
      <line x1="15" y1="3" x2="15" y2="14" />
      <line x1="12" y1="17" x2="12" y2="22" />
      <polyline points="9 19 12 22 15 19" />
    </svg>
  )
}

export function AddColumnLeftIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="10" y="3" width="11" height="18" rx="1" />
      <line x1="10" y1="9" x2="21" y2="9" />
      <line x1="10" y1="15" x2="21" y2="15" />
      <line x1="15" y1="3" x2="15" y2="21" />
      <line x1="2" y1="12" x2="7" y2="12" />
      <polyline points="5 9 2 12 5 15" />
    </svg>
  )
}

export function AddColumnRightIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="11" height="18" rx="1" />
      <line x1="3" y1="9" x2="14" y2="9" />
      <line x1="3" y1="15" x2="14" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="17" y1="12" x2="22" y2="12" />
      <polyline points="19 9 22 12 19 15" />
    </svg>
  )
}

export function DeleteRowIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="8" y1="12" x2="16" y2="12" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function DeleteColumnIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
      <line x1="12" y1="8" x2="12" y2="16" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function DeleteTableIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" opacity="0.5" />
      <line x1="3" y1="9" x2="21" y2="9" opacity="0.5" />
      <line x1="3" y1="15" x2="21" y2="15" opacity="0.5" />
      <line x1="9" y1="3" x2="9" y2="21" opacity="0.5" />
      <line x1="15" y1="3" x2="15" y2="21" opacity="0.5" />
      <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2.5" stroke="currentColor" strokeLinecap="round" />
      <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2.5" stroke="currentColor" strokeLinecap="round" />
    </svg>
  )
}

export function MergeCellsIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="12" y1="3" x2="12" y2="8" />
      <line x1="12" y1="16" x2="12" y2="21" />
      <line x1="3" y1="12" x2="8" y2="12" />
      <line x1="16" y1="12" x2="21" y2="12" />
      <polyline points="9 9 12 12 9 15" />
      <polyline points="15 9 12 12 15 15" />
    </svg>
  )
}

export function SplitCellIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="12" y1="3" x2="12" y2="21" strokeDasharray="2 2" />
      <line x1="3" y1="12" x2="21" y2="12" strokeDasharray="2 2" />
      <polyline points="9 9 6 12 9 15" />
      <polyline points="15 9 18 12 15 15" />
    </svg>
  )
}

export function CellColorIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="14" rx="2" />
      <rect x="3" y="19" width="18" height="3" rx="1" fill="currentColor" />
    </svg>
  )
}

export function AlignLeftIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="15" y2="12" />
      <line x1="3" y1="18" x2="18" y2="18" />
    </svg>
  )
}

export function AlignCenterIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="6" y1="12" x2="18" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  )
}

export function AlignRightIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="9" y1="12" x2="21" y2="12" />
      <line x1="6" y1="18" x2="21" y2="18" />
    </svg>
  )
}

export function HeaderRowIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <rect x="3" y="3" width="18" height="6" rx="2" fill="currentColor" opacity="0.3" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="9" x2="9" y2="21" />
      <line x1="15" y1="9" x2="15" y2="21" />
    </svg>
  )
}
