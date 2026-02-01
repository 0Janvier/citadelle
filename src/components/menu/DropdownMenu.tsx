import { ReactNode, useRef, useEffect, useState } from 'react'

interface DropdownMenuProps {
  children: ReactNode
  isOpen: boolean
  onClose: () => void
}

export function DropdownMenu({ children, isOpen, onClose }: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [focusedIndex, setFocusedIndex] = useState(0)

  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(0)
      return
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const menuItems = menuRef.current?.querySelectorAll('[role="menuitem"]:not([disabled])')
      if (!menuItems) return

      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          onClose()
          break
        case 'ArrowDown':
          e.preventDefault()
          setFocusedIndex(i => Math.min(i + 1, menuItems.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setFocusedIndex(i => Math.max(i - 1, 0))
          break
        case 'Home':
          e.preventDefault()
          setFocusedIndex(0)
          break
        case 'End':
          e.preventDefault()
          setFocusedIndex(menuItems.length - 1)
          break
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Focus management
  useEffect(() => {
    if (!isOpen) return
    const menuItems = menuRef.current?.querySelectorAll('[role="menuitem"]:not([disabled])')
    if (menuItems?.[focusedIndex]) {
      (menuItems[focusedIndex] as HTMLElement).focus()
    }
  }, [focusedIndex, isOpen])

  if (!isOpen) return null

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-orientation="vertical"
      className="
        absolute top-full left-0 mt-1
        min-w-[220px] py-1
        bg-[var(--bg)]
        border border-[var(--border)]
        rounded-hig-lg
        shadow-hig-popover
        z-dropdown
        animate-scaleIn
      "
    >
      {children}
    </div>
  )
}
