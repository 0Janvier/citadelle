import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Editor } from '@tiptap/react'

export interface TocEntry {
  id: string
  level: number        // 1-4 (H1-H4)
  text: string
  position: number     // Position in document (node position)
  children: TocEntry[]
  numbering?: string   // Computed numbering (e.g., "I.A.1.")
}

export type NumberingFormat =
  | 'roman'       // I, II, III, IV...
  | 'alpha-upper' // A, B, C, D...
  | 'alpha-lower' // a, b, c, d...
  | 'numeric'     // 1, 2, 3, 4...
  | 'none'        // No numbering

export interface TocSettings {
  level1Format: NumberingFormat
  level2Format: NumberingFormat
  level3Format: NumberingFormat
  level4Format: NumberingFormat
  showNumbering: boolean
  separator: string // "." or ")" etc.
}

const defaultSettings: TocSettings = {
  level1Format: 'roman',
  level2Format: 'alpha-upper',
  level3Format: 'numeric',
  level4Format: 'alpha-lower',
  showNumbering: true,
  separator: '.',
}

interface TocStore {
  // Panel visibility
  panelOpen: boolean
  setPanelOpen: (open: boolean) => void
  togglePanel: () => void

  // Settings panel
  settingsOpen: boolean
  setSettingsOpen: (open: boolean) => void

  // Settings
  settings: TocSettings
  updateSettings: (settings: Partial<TocSettings>) => void
  resetSettings: () => void

  // TOC entries (flat and hierarchical)
  entries: TocEntry[]
  setEntries: (entries: TocEntry[]) => void

  // Active entry (for highlighting current section)
  activeEntryId: string | null
  setActiveEntryId: (id: string | null) => void

  // Expand/Collapse state (planner style)
  expandedEntries: string[]
  toggleTocEntryExpansion: (id: string) => void
  expandAllEntries: () => void
  collapseAllEntries: () => void

  // Actions
  generateToc: (editor: Editor) => void
  navigateToEntry: (editor: Editor, entry: TocEntry) => void
}

// Generate unique ID for heading
const generateHeadingId = (text: string, index: number): string => {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9\u00C0-\u017F]+/gi, '-') // Handle French accents
    .replace(/^-|-$/g, '')
  return `${slug}-${index}`
}

// Convert number to Roman numerals
function toRoman(num: number): string {
  const romanNumerals: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ]

  let result = ''
  for (const [value, symbol] of romanNumerals) {
    while (num >= value) {
      result += symbol
      num -= value
    }
  }
  return result
}

// Format number according to format type
function formatNumber(num: number, format: NumberingFormat): string {
  switch (format) {
    case 'roman':
      return toRoman(num)
    case 'alpha-upper':
      return String.fromCharCode(64 + num) // A, B, C...
    case 'alpha-lower':
      return String.fromCharCode(96 + num) // a, b, c...
    case 'numeric':
      return num.toString()
    case 'none':
      return ''
    default:
      return num.toString()
  }
}

// Get format for a specific level
function getFormatForLevel(level: number, settings: TocSettings): NumberingFormat {
  switch (level) {
    case 1: return settings.level1Format
    case 2: return settings.level2Format
    case 3: return settings.level3Format
    case 4: return settings.level4Format
    default: return 'numeric'
  }
}

// Get all entry IDs recursively (for expand all)
const getAllEntryIds = (entries: TocEntry[]): string[] => {
  const ids: string[] = []
  for (const entry of entries) {
    ids.push(entry.id)
    if (entry.children.length > 0) {
      ids.push(...getAllEntryIds(entry.children))
    }
  }
  return ids
}

// Get IDs of entries that have children (for initial expansion)
const getEntriesWithChildren = (entries: TocEntry[]): string[] => {
  const ids: string[] = []
  for (const entry of entries) {
    if (entry.children.length > 0) {
      ids.push(entry.id)
      ids.push(...getEntriesWithChildren(entry.children))
    }
  }
  return ids
}

// Build hierarchical structure with numbering
const buildHierarchyWithNumbering = (
  flatEntries: TocEntry[],
  settings: TocSettings
): TocEntry[] => {
  const result: TocEntry[] = []
  const stack: { entry: TocEntry; index: number }[] = []
  const counters: number[] = [0, 0, 0, 0, 0] // Counter for each level

  for (const entry of flatEntries) {
    // Reset counters for deeper levels
    for (let i = entry.level; i <= 4; i++) {
      counters[i] = 0
    }

    // Increment counter for this level
    counters[entry.level]++

    // Build numbering string
    let numbering = ''
    if (settings.showNumbering) {
      const parts: string[] = []

      // Find the parent levels in the stack
      const parentLevels: number[] = []
      for (const item of stack) {
        if (item.entry.level < entry.level) {
          parentLevels.push(item.entry.level)
        }
      }

      // Add parent numberings
      for (const lvl of parentLevels) {
        const format = getFormatForLevel(lvl, settings)
        if (format !== 'none') {
          parts.push(formatNumber(counters[lvl], format))
        }
      }

      // Add current level numbering
      const currentFormat = getFormatForLevel(entry.level, settings)
      if (currentFormat !== 'none') {
        parts.push(formatNumber(counters[entry.level], currentFormat))
      }

      if (parts.length > 0) {
        numbering = parts.join(settings.separator) + settings.separator
      }
    }

    const newEntry: TocEntry = { ...entry, children: [], numbering }

    // Pop items from stack that are same level or higher
    while (stack.length > 0 && stack[stack.length - 1].entry.level >= entry.level) {
      stack.pop()
    }

    if (stack.length === 0) {
      // Top-level entry
      result.push(newEntry)
    } else {
      // Child of last item in stack
      stack[stack.length - 1].entry.children.push(newEntry)
    }

    stack.push({ entry: newEntry, index: counters[entry.level] })
  }

  return result
}

export const useTocStore = create<TocStore>()(
  persist(
    (set, get) => ({
      panelOpen: false,
      setPanelOpen: (open) => set({ panelOpen: open }),
      togglePanel: () => set((state) => ({ panelOpen: !state.panelOpen })),

      settingsOpen: false,
      setSettingsOpen: (open) => set({ settingsOpen: open }),

      settings: defaultSettings,
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
      resetSettings: () => set({ settings: defaultSettings }),

      entries: [],
      setEntries: (entries) => set({ entries }),

      activeEntryId: null,
      setActiveEntryId: (id) => set({ activeEntryId: id }),

      // Expand/Collapse state
      expandedEntries: [],

      toggleTocEntryExpansion: (id) => {
        const expanded = get().expandedEntries
        if (expanded.includes(id)) {
          set({ expandedEntries: expanded.filter((eid) => eid !== id) })
        } else {
          set({ expandedEntries: [...expanded, id] })
        }
      },

      expandAllEntries: () => {
        const allIds = getEntriesWithChildren(get().entries)
        set({ expandedEntries: allIds })
      },

      collapseAllEntries: () => {
        set({ expandedEntries: [] })
      },

      generateToc: (editor) => {
        if (!editor) {
          set({ entries: [] })
          return
        }

        const { settings } = get()
        const flatEntries: TocEntry[] = []
        let headingIndex = 0

        // Traverse the document to find all headings
        editor.state.doc.descendants((node, pos) => {
          if (node.type.name === 'heading') {
            const level = node.attrs.level as number
            const text = node.textContent || ''

            if (text.trim() && level >= 1 && level <= 4) {
              flatEntries.push({
                id: generateHeadingId(text, headingIndex++),
                level,
                text: text.trim(),
                position: pos,
                children: [],
              })
            }
          }
          return true
        })

        // Build hierarchical structure with proper numbering
        const hierarchicalEntries = buildHierarchyWithNumbering(flatEntries, settings)
        set({ entries: hierarchicalEntries })
      },

      navigateToEntry: (editor, entry) => {
        if (!editor) return

        // Focus editor and scroll to heading position
        editor.chain().focus().setTextSelection(entry.position).run()

        // Get the DOM element and scroll it into view
        const { view } = editor
        const domPos = view.domAtPos(entry.position)
        if (domPos && domPos.node) {
          const element = domPos.node.parentElement
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }

        // Set as active entry
        set({ activeEntryId: entry.id })
      },
    }),
    {
      name: 'citadelle-toc',
      partialize: (state) => ({
        settings: state.settings,
        expandedEntries: state.expandedEntries,
      }),
    }
  )
)
