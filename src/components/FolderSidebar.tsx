import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useFolderStore, FolderItem } from '../store/useFolderStore'
import { useFileOperations } from '../hooks/useFileOperations'
import { useToast } from '../hooks/useToast'
import { open } from '@tauri-apps/api/dialog'

// Flatten the tree into a navigable list (respecting expanded folders)
function flattenVisibleItems(
  items: FolderItem[],
  expandedFolders: string[],
  parentPath: string[] = []
): { item: FolderItem; depth: number; parentId: string | null }[] {
  const result: { item: FolderItem; depth: number; parentId: string | null }[] = []

  for (const item of items) {
    const parentId = parentPath.length > 0 ? parentPath[parentPath.length - 1] : null
    result.push({ item, depth: parentPath.length, parentId })

    if (item.type === 'folder' && expandedFolders.includes(item.id) && item.children) {
      result.push(...flattenVisibleItems(item.children, expandedFolders, [...parentPath, item.id]))
    }
  }

  return result
}

export function FolderSidebar() {
  const {
    rootPath,
    setRootPath,
    items,
    sidebarVisible,
    sidebarWidth,
    setSidebarWidth,
    toggleSidebar,
    expandedFolders,
    toggleFolderExpansion,
    setFolderExpanded,
    selectedItemId,
    setSelectedItem,
    focusedItemId,
    setFocusedItem,
    quickSearchQuery,
    setQuickSearchQuery,
    isLoading,
    refreshFolder,
  } = useFolderStore()

  const { openFileFromPath } = useFileOperations()
  const toast = useToast()
  const [isResizing, setIsResizing] = useState(false)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const treeContainerRef = useRef<HTMLDivElement>(null)
  const quickSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Flatten visible items for keyboard navigation
  const flatItems = useMemo(
    () => flattenVisibleItems(items, expandedFolders),
    [items, expandedFolders]
  )

  // Find current focused index
  const focusedIndex = useMemo(() => {
    if (!focusedItemId) return -1
    return flatItems.findIndex((fi) => fi.item.id === focusedItemId)
  }, [flatItems, focusedItemId])

  // Find item by ID in flat list
  const findFlatItem = useCallback(
    (id: string | null) => {
      if (!id) return null
      return flatItems.find((fi) => fi.item.id === id) || null
    },
    [flatItems]
  )

  const handleSelectFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      })
      if (selected && typeof selected === 'string') {
        setRootPath(selected)
        await refreshFolder(selected)
      }
    } catch (error) {
      console.error('Failed to select folder:', error)
      toast.error('Impossible d\'ouvrir le dossier')
    }
  }

  const handleItemClick = (item: FolderItem) => {
    setSelectedItem(item.id)
    setFocusedItem(item.id)
    if (item.type === 'folder') {
      toggleFolderExpansion(item.id)
    } else {
      openFileFromPath(item.path)
    }
  }

  // Activate the focused item (Enter key)
  const activateFocusedItem = useCallback(() => {
    const flatItem = findFlatItem(focusedItemId)
    if (!flatItem) return

    const { item } = flatItem
    setSelectedItem(item.id)

    if (item.type === 'folder') {
      toggleFolderExpansion(item.id)
    } else {
      openFileFromPath(item.path)
    }
  }, [focusedItemId, findFlatItem, setSelectedItem, toggleFolderExpansion, openFileFromPath])

  // Navigate to previous item
  const navigatePrevious = useCallback(() => {
    if (flatItems.length === 0) return

    if (focusedIndex <= 0) {
      // Wrap to last item or stay at first
      setFocusedItem(flatItems[flatItems.length - 1].item.id)
    } else {
      setFocusedItem(flatItems[focusedIndex - 1].item.id)
    }
  }, [flatItems, focusedIndex, setFocusedItem])

  // Navigate to next item
  const navigateNext = useCallback(() => {
    if (flatItems.length === 0) return

    if (focusedIndex < 0 || focusedIndex >= flatItems.length - 1) {
      // Wrap to first item
      setFocusedItem(flatItems[0].item.id)
    } else {
      setFocusedItem(flatItems[focusedIndex + 1].item.id)
    }
  }, [flatItems, focusedIndex, setFocusedItem])

  // Expand folder or move into children
  const expandOrEnter = useCallback(() => {
    const flatItem = findFlatItem(focusedItemId)
    if (!flatItem) return

    const { item } = flatItem

    if (item.type === 'folder') {
      if (!expandedFolders.includes(item.id)) {
        // Expand the folder
        setFolderExpanded(item.id, true)
      } else if (item.children && item.children.length > 0) {
        // Already expanded, move to first child
        setFocusedItem(item.children[0].id)
      }
    }
  }, [focusedItemId, findFlatItem, expandedFolders, setFolderExpanded, setFocusedItem])

  // Collapse folder or move to parent
  const collapseOrParent = useCallback(() => {
    const flatItem = findFlatItem(focusedItemId)
    if (!flatItem) return

    const { item, parentId } = flatItem

    if (item.type === 'folder' && expandedFolders.includes(item.id)) {
      // Collapse the folder
      setFolderExpanded(item.id, false)
    } else if (parentId) {
      // Move to parent
      setFocusedItem(parentId)
    }
  }, [focusedItemId, findFlatItem, expandedFolders, setFolderExpanded, setFocusedItem])

  // Navigate to first item
  const navigateFirst = useCallback(() => {
    if (flatItems.length > 0) {
      setFocusedItem(flatItems[0].item.id)
    }
  }, [flatItems, setFocusedItem])

  // Navigate to last item
  const navigateLast = useCallback(() => {
    if (flatItems.length > 0) {
      setFocusedItem(flatItems[flatItems.length - 1].item.id)
    }
  }, [flatItems, setFocusedItem])

  // Quick search - find item starting with typed characters
  const handleQuickSearch = useCallback(
    (char: string) => {
      // Clear previous timeout
      if (quickSearchTimeoutRef.current) {
        clearTimeout(quickSearchTimeoutRef.current)
      }

      // Build new query
      const newQuery = quickSearchQuery + char.toLowerCase()
      setQuickSearchQuery(newQuery)

      // Find matching item
      const matchIndex = flatItems.findIndex((fi) =>
        fi.item.name.toLowerCase().startsWith(newQuery)
      )

      if (matchIndex !== -1) {
        setFocusedItem(flatItems[matchIndex].item.id)
      }

      // Clear query after 1 second of inactivity
      quickSearchTimeoutRef.current = setTimeout(() => {
        setQuickSearchQuery('')
      }, 1000)
    },
    [flatItems, quickSearchQuery, setQuickSearchQuery, setFocusedItem]
  )

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Ignore if no items
      if (flatItems.length === 0) return

      // Initialize focus if not set
      if (!focusedItemId && flatItems.length > 0) {
        setFocusedItem(flatItems[0].item.id)
        return
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          navigatePrevious()
          break

        case 'ArrowDown':
          e.preventDefault()
          navigateNext()
          break

        case 'ArrowRight':
          e.preventDefault()
          expandOrEnter()
          break

        case 'ArrowLeft':
          e.preventDefault()
          collapseOrParent()
          break

        case 'Enter':
          e.preventDefault()
          activateFocusedItem()
          break

        case 'Home':
          e.preventDefault()
          navigateFirst()
          break

        case 'End':
          e.preventDefault()
          navigateLast()
          break

        case 'Escape':
          // Clear focus and quick search
          setQuickSearchQuery('')
          treeContainerRef.current?.blur()
          break

        default:
          // Quick search - alphanumeric characters
          if (e.key.length === 1 && /[a-zA-Z0-9._-]/.test(e.key)) {
            e.preventDefault()
            handleQuickSearch(e.key)
          }
          break
      }
    },
    [
      flatItems,
      focusedItemId,
      setFocusedItem,
      navigatePrevious,
      navigateNext,
      expandOrEnter,
      collapseOrParent,
      activateFocusedItem,
      navigateFirst,
      navigateLast,
      handleQuickSearch,
      setQuickSearchQuery,
    ]
  )

  // Scroll focused item into view
  useEffect(() => {
    if (!focusedItemId || !treeContainerRef.current) return

    const focusedElement = treeContainerRef.current.querySelector(
      `[data-item-id="${focusedItemId}"]`
    )
    if (focusedElement) {
      focusedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [focusedItemId])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (quickSearchTimeoutRef.current) {
        clearTimeout(quickSearchTimeoutRef.current)
      }
    }
  }, [])

  // Resize handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = e.clientX
      setSidebarWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, setSidebarWidth])

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, item: FolderItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, item: FolderItem) => {
    if (item.type === 'folder') {
      e.preventDefault()
      setDragOverId(item.id)
    }
  }

  const handleDragLeave = () => {
    setDragOverId(null)
  }

  const handleDrop = async (e: React.DragEvent, targetFolder: FolderItem) => {
    e.preventDefault()
    setDragOverId(null)

    const sourceData = e.dataTransfer.getData('application/json')
    if (!sourceData) return

    try {
      const sourceItem = JSON.parse(sourceData) as FolderItem
      const newPath = `${targetFolder.path}/${sourceItem.name}`
      await useFolderStore.getState().moveItem(sourceItem.path, newPath)
    } catch (error) {
      console.error('Failed to move item:', error)
      toast.error('Impossible de déplacer l\'élément')
    }
  }

  if (!sidebarVisible) return null

  const folderName = rootPath ? rootPath.split('/').pop() : null

  return (
    <div
      ref={sidebarRef}
      className="h-full border-r border-[var(--border)] bg-[var(--bg)] flex flex-col relative select-none"
      style={{ width: sidebarWidth, minWidth: sidebarWidth }}
    >
      {/* Header */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={toggleSidebar}
            className="p-1.5 hover:bg-[var(--editor-bg)] rounded-md transition-colors"
            title="Masquer la sidebar (Cmd+\)"
          >
            <SidebarCollapseIcon className="w-4 h-4 text-gray-500" />
          </button>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 truncate">
            {folderName || 'Fichiers'}
          </span>
        </div>
        <button
          onClick={handleSelectFolder}
          className="p-1.5 hover:bg-[var(--editor-bg)] rounded-md transition-colors"
          title="Ouvrir un dossier"
        >
          <FolderPlusIcon className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Quick search indicator */}
      {quickSearchQuery && (
        <div className="px-3 py-1 bg-[var(--accent)]/10 border-b border-[var(--border)]">
          <span className="text-xs text-[var(--accent)] font-mono">{quickSearchQuery}</span>
        </div>
      )}

      {/* Folder tree */}
      <div
        ref={treeContainerRef}
        className={`flex-1 overflow-y-auto overflow-x-hidden py-1 outline-none ${
          isFocused ? 'ring-1 ring-inset ring-[var(--accent)]/30' : ''
        }`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setIsFocused(true)
          // Set initial focus if none
          if (!focusedItemId && flatItems.length > 0) {
            setFocusedItem(flatItems[0].item.id)
          }
        }}
        onBlur={() => setIsFocused(false)}
        role="tree"
        aria-label="Arborescence des fichiers"
      >
        {!rootPath ? (
          <div className="px-4 py-12 text-center">
            <FolderIcon className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <button
              onClick={handleSelectFolder}
              className="text-sm text-[var(--accent)] hover:underline"
            >
              Sélectionner un dossier
            </button>
            <p className="text-xs text-gray-400 mt-2">Cmd+\ pour afficher/masquer</p>
          </div>
        ) : isLoading ? (
          <div className="px-4 py-12 text-center">
            <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-500 mt-3">Chargement...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-gray-500">Dossier vide</p>
          </div>
        ) : (
          <FolderTree
            items={items}
            expandedFolders={expandedFolders}
            selectedItemId={selectedItemId}
            focusedItemId={focusedItemId}
            dragOverId={dragOverId}
            isSidebarFocused={isFocused}
            onItemClick={handleItemClick}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            depth={0}
          />
        )}
      </div>

      {/* Keyboard hints (shown when focused) */}
      {isFocused && rootPath && items.length > 0 && (
        <div className="px-2 py-1.5 border-t border-[var(--border)] bg-[var(--editor-bg)]">
          <p className="text-[10px] text-gray-400 text-center">
            ↑↓ naviguer · ← replier · → déplier · Entrée ouvrir
          </p>
        </div>
      )}

      {/* Resize handle */}
      <div
        className={`absolute top-0 right-0 w-1 h-full cursor-col-resize transition-colors ${
          isResizing ? 'bg-[var(--accent)]' : 'hover:bg-[var(--accent)]/50'
        }`}
        onMouseDown={handleMouseDown}
      />
    </div>
  )
}

// Recursive folder tree component
function FolderTree({
  items,
  expandedFolders,
  selectedItemId,
  focusedItemId,
  dragOverId,
  isSidebarFocused,
  onItemClick,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  depth,
}: {
  items: FolderItem[]
  expandedFolders: string[]
  selectedItemId: string | null
  focusedItemId: string | null
  dragOverId: string | null
  isSidebarFocused: boolean
  onItemClick: (item: FolderItem) => void
  onDragStart: (e: React.DragEvent, item: FolderItem) => void
  onDragOver: (e: React.DragEvent, item: FolderItem) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent, item: FolderItem) => void
  depth: number
}) {
  return (
    <div role="group">
      {items.map((item) => {
        const isExpanded = expandedFolders.includes(item.id)
        const isSelected = selectedItemId === item.id
        const isFocused = focusedItemId === item.id
        const isDragOver = dragOverId === item.id

        return (
          <div key={item.id} role="treeitem" aria-expanded={item.type === 'folder' ? isExpanded : undefined}>
            <div
              data-item-id={item.id}
              className={`
                flex items-center gap-1.5 px-2 py-1 cursor-pointer
                transition-colors duration-100
                ${isSelected ? 'bg-[var(--accent)]/15 text-[var(--accent)]' : 'hover:bg-[var(--editor-bg)]'}
                ${isDragOver ? 'bg-[var(--accent)]/25' : ''}
                ${isFocused && isSidebarFocused ? 'ring-1 ring-inset ring-[var(--accent)] rounded-sm' : ''}
              `}
              style={{ paddingLeft: `${8 + depth * 12}px` }}
              onClick={() => onItemClick(item)}
              draggable
              onDragStart={(e) => onDragStart(e, item)}
              onDragOver={(e) => onDragOver(e, item)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, item)}
            >
              {item.type === 'folder' ? (
                <ChevronIcon
                  className={`w-3 h-3 shrink-0 transition-transform duration-150 text-gray-400 ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                />
              ) : (
                <span className="w-3" />
              )}
              {item.type === 'folder' ? (
                <FolderIcon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--accent)]/70'}`} />
              ) : (
                <DocumentIcon className="w-4 h-4 shrink-0 text-gray-400" />
              )}
              <span className="text-sm truncate">{item.name}</span>
            </div>

            {item.type === 'folder' && isExpanded && item.children && item.children.length > 0 && (
              <FolderTree
                items={item.children}
                expandedFolders={expandedFolders}
                selectedItemId={selectedItemId}
                focusedItemId={focusedItemId}
                dragOverId={dragOverId}
                isSidebarFocused={isSidebarFocused}
                onItemClick={onItemClick}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                depth={depth + 1}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// Icon components (Apple SF Symbols style)
function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
    </svg>
  )
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  )
}

function FolderPlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  )
}

function SidebarCollapseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
    </svg>
  )
}
