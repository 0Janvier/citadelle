import { ReactNode, useState, useRef, useEffect } from 'react'

interface SubMenuProps {
  label: string
  icon?: ReactNode
  children: ReactNode
  disabled?: boolean
}

export function SubMenu({ label, icon, children, disabled = false }: SubMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<'right' | 'left'>('right')
  const containerRef = useRef<HTMLDivElement>(null)
  const submenuRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = () => {
    if (disabled) return
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true)
    }, 150)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 100)
  }

  // Determine submenu position based on available space
  useEffect(() => {
    if (isOpen && submenuRef.current && containerRef.current) {
      const submenuRect = submenuRef.current.getBoundingClientRect()
      const windowWidth = window.innerWidth

      if (submenuRect.right > windowWidth - 20) {
        setPosition('left')
      } else {
        setPosition('right')
      }
    }
  }, [isOpen])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`
          w-full flex items-center justify-between px-3 py-1.5 text-sm
          ${disabled
            ? 'opacity-40 cursor-not-allowed'
            : 'hover:bg-[var(--editor-bg)] cursor-default'
          }
          ${isOpen ? 'bg-[var(--editor-bg)]' : ''}
        `}
      >
        <span className="flex items-center gap-2">
          {icon && <span className="w-4 h-4 flex items-center justify-center">{icon}</span>}
          <span>{label}</span>
        </span>
        <svg
          className="w-3 h-3 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {isOpen && !disabled && (
        <div
          ref={submenuRef}
          className={`
            absolute top-0 min-w-[200px] py-1
            bg-[var(--bg)] border border-[var(--border)] rounded-lg shadow-lg
            z-[60]
            ${position === 'right' ? 'left-full ml-0.5' : 'right-full mr-0.5'}
          `}
          style={{
            animation: 'menuFadeIn 100ms ease-out',
          }}
        >
          {children}
        </div>
      )}
    </div>
  )
}
