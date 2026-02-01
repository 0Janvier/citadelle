// Library Storage - Interface with Tauri for unified clause/snippet library
// Uses existing Tauri commands (read_file, write_file, file_exists, etc.)

import { invoke } from '@tauri-apps/api/tauri'
import type {
  LibraryItem,
  LibraryCategory,
  LibraryMetadata,
  LibraryExport,
  ImportResult,
} from '../types/library'
import { DEFAULT_CATEGORIES } from '../types/library'

// ============================================================================
// Constants
// ============================================================================

const LIBRARY_DIR = 'library'
const ITEMS_DIR = 'items'
const CATEGORIES_FILE = 'categories.json'
const METADATA_FILE = 'metadata.json'
const BACKUPS_DIR = 'backups'

// ============================================================================
// Path Helpers
// ============================================================================

/**
 * Get the Citadelle user data directory (~/.citadelle)
 */
async function getUserDataPath(): Promise<string> {
  return invoke<string>('get_user_data_path')
}

/**
 * Get the library directory path
 */
export async function getLibraryPath(): Promise<string> {
  const userDataPath = await getUserDataPath()
  return `${userDataPath}/${LIBRARY_DIR}`
}

/**
 * Get the items directory path
 */
async function getItemsPath(): Promise<string> {
  const libraryPath = await getLibraryPath()
  return `${libraryPath}/${ITEMS_DIR}`
}

/**
 * Get the path for a specific item
 */
async function getItemPath(id: string): Promise<string> {
  const itemsPath = await getItemsPath()
  return `${itemsPath}/${id}.json`
}

/**
 * Get the categories file path
 */
async function getCategoriesPath(): Promise<string> {
  const libraryPath = await getLibraryPath()
  return `${libraryPath}/${CATEGORIES_FILE}`
}

/**
 * Get the metadata file path
 */
async function getMetadataPath(): Promise<string> {
  const libraryPath = await getLibraryPath()
  return `${libraryPath}/${METADATA_FILE}`
}

/**
 * Get the backups directory path
 */
async function getBackupsPath(): Promise<string> {
  const libraryPath = await getLibraryPath()
  return `${libraryPath}/${BACKUPS_DIR}`
}

// ============================================================================
// File System Helpers
// ============================================================================

async function fileExists(path: string): Promise<boolean> {
  try {
    return await invoke<boolean>('file_exists', { path })
  } catch {
    return false
  }
}

async function readFile(path: string): Promise<string> {
  return invoke<string>('read_file', { path })
}

async function writeFile(path: string, content: string): Promise<void> {
  return invoke<void>('write_file', { path, content })
}

async function deleteFile(path: string): Promise<void> {
  return invoke<void>('delete_item', { path })
}

async function createDirectory(path: string): Promise<void> {
  return invoke<void>('create_folder', { path })
}

interface FileItem {
  id: string
  name: string
  path: string
  type: string
  children?: FileItem[]
}

async function listDirectory(path: string): Promise<FileItem[]> {
  try {
    return await invoke<FileItem[]>('list_directory', { path, recursive: false })
  } catch {
    return []
  }
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize the library directory structure
 */
export async function initLibraryDirectory(): Promise<void> {
  const libraryPath = await getLibraryPath()
  const itemsPath = await getItemsPath()
  const backupsPath = await getBackupsPath()

  // Create directories if they don't exist
  if (!(await fileExists(libraryPath))) {
    await createDirectory(libraryPath)
  }
  if (!(await fileExists(itemsPath))) {
    await createDirectory(itemsPath)
  }
  if (!(await fileExists(backupsPath))) {
    await createDirectory(backupsPath)
  }

  // Initialize categories if not exist
  const categoriesPath = await getCategoriesPath()
  if (!(await fileExists(categoriesPath))) {
    const now = new Date().toISOString()
    const categories: LibraryCategory[] = DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      createdAt: now,
      updatedAt: now,
    }))
    await writeFile(categoriesPath, JSON.stringify(categories, null, 2))
  }

  // Initialize metadata if not exist
  const metadataPath = await getMetadataPath()
  if (!(await fileExists(metadataPath))) {
    const metadata: LibraryMetadata = {
      version: '1.0.0',
      itemCount: 0,
      categoryCount: DEFAULT_CATEGORIES.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2))
  }
}

/**
 * Check if library needs migration (from localStorage)
 */
export async function needsMigration(): Promise<boolean> {
  const metadataPath = await getMetadataPath()
  const exists = await fileExists(metadataPath)

  // If metadata exists, check if it has been migrated
  if (exists) {
    try {
      const content = await readFile(metadataPath)
      const metadata = JSON.parse(content) as LibraryMetadata
      return metadata.migratedFrom === undefined && metadata.itemCount === 0
    } catch {
      return true
    }
  }

  return true
}

// ============================================================================
// Metadata Operations
// ============================================================================

/**
 * Load library metadata
 */
export async function loadMetadata(): Promise<LibraryMetadata> {
  const metadataPath = await getMetadataPath()

  if (!(await fileExists(metadataPath))) {
    await initLibraryDirectory()
  }

  const content = await readFile(metadataPath)
  return JSON.parse(content) as LibraryMetadata
}

/**
 * Save library metadata
 */
export async function saveMetadata(metadata: LibraryMetadata): Promise<void> {
  const metadataPath = await getMetadataPath()
  metadata.updatedAt = new Date().toISOString()
  await writeFile(metadataPath, JSON.stringify(metadata, null, 2))
}

/**
 * Update item and category counts in metadata
 */
export async function updateMetadataCounts(): Promise<void> {
  const items = await loadAllItems()
  const categories = await loadCategories()
  const metadata = await loadMetadata()

  metadata.itemCount = items.length
  metadata.categoryCount = categories.length
  await saveMetadata(metadata)
}

// ============================================================================
// Category Operations
// ============================================================================

/**
 * Load all categories
 */
export async function loadCategories(): Promise<LibraryCategory[]> {
  const categoriesPath = await getCategoriesPath()

  if (!(await fileExists(categoriesPath))) {
    await initLibraryDirectory()
    return loadCategories()
  }

  const content = await readFile(categoriesPath)
  return JSON.parse(content) as LibraryCategory[]
}

/**
 * Save all categories
 */
export async function saveCategories(categories: LibraryCategory[]): Promise<void> {
  const categoriesPath = await getCategoriesPath()
  await writeFile(categoriesPath, JSON.stringify(categories, null, 2))
  await updateMetadataCounts()
}

/**
 * Save a single category (add or update)
 */
export async function saveCategory(category: LibraryCategory): Promise<void> {
  const categories = await loadCategories()
  const index = categories.findIndex((c) => c.id === category.id)

  category.updatedAt = new Date().toISOString()

  if (index >= 0) {
    categories[index] = category
  } else {
    category.createdAt = new Date().toISOString()
    categories.push(category)
  }

  await saveCategories(categories)
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<void> {
  const categories = await loadCategories()
  const filtered = categories.filter((c) => c.id !== id)
  await saveCategories(filtered)
}

// ============================================================================
// Item Operations
// ============================================================================

/**
 * Load all library items
 */
export async function loadAllItems(): Promise<LibraryItem[]> {
  const itemsPath = await getItemsPath()

  if (!(await fileExists(itemsPath))) {
    await initLibraryDirectory()
    return []
  }

  const files = await listDirectory(itemsPath)
  const items: LibraryItem[] = []

  for (const file of files) {
    if (file.name.endsWith('.json')) {
      try {
        const content = await readFile(file.path)
        const item = JSON.parse(content) as LibraryItem
        items.push(item)
      } catch (error) {
        console.error(`Failed to load item ${file.name}:`, error)
      }
    }
  }

  return items
}

/**
 * Load a single item by ID
 */
export async function loadItem(id: string): Promise<LibraryItem | null> {
  const itemPath = await getItemPath(id)

  if (!(await fileExists(itemPath))) {
    return null
  }

  const content = await readFile(itemPath)
  return JSON.parse(content) as LibraryItem
}

/**
 * Save a library item
 */
export async function saveItem(item: LibraryItem): Promise<void> {
  const itemPath = await getItemPath(item.id)
  const itemsPath = await getItemsPath()

  // Ensure items directory exists
  if (!(await fileExists(itemsPath))) {
    await createDirectory(itemsPath)
  }

  item.updatedAt = new Date().toISOString()
  await writeFile(itemPath, JSON.stringify(item, null, 2))
  await updateMetadataCounts()
}

/**
 * Delete a library item
 */
export async function deleteItem(id: string): Promise<void> {
  const itemPath = await getItemPath(id)

  if (await fileExists(itemPath)) {
    await deleteFile(itemPath)
    await updateMetadataCounts()
  }
}

/**
 * Check if an item exists
 */
export async function itemExists(id: string): Promise<boolean> {
  const itemPath = await getItemPath(id)
  return fileExists(itemPath)
}

// ============================================================================
// Backup Operations
// ============================================================================

/**
 * Create a backup of the entire library
 */
export async function createBackup(): Promise<string> {
  const items = await loadAllItems()
  const categories = await loadCategories()
  const metadata = await loadMetadata()

  const backup: LibraryExport = {
    version: metadata.version,
    exportedAt: new Date().toISOString(),
    items,
    categories,
  }

  const backupsPath = await getBackupsPath()
  if (!(await fileExists(backupsPath))) {
    await createDirectory(backupsPath)
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = `${backupsPath}/backup-${timestamp}.json`

  await writeFile(backupPath, JSON.stringify(backup, null, 2))

  // Update metadata with last backup time
  metadata.lastBackup = new Date().toISOString()
  await saveMetadata(metadata)

  return backupPath
}

/**
 * List all backups
 */
export async function listBackups(): Promise<{ path: string; date: string }[]> {
  const backupsPath = await getBackupsPath()

  if (!(await fileExists(backupsPath))) {
    return []
  }

  const files = await listDirectory(backupsPath)
  return files
    .filter((f) => f.name.startsWith('backup-') && f.name.endsWith('.json'))
    .map((f) => ({
      path: f.path,
      date: f.name.replace('backup-', '').replace('.json', '').replace(/-/g, ':'),
    }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

/**
 * Restore from a backup
 */
export async function restoreBackup(backupPath: string): Promise<void> {
  const content = await readFile(backupPath)
  const backup = JSON.parse(content) as LibraryExport

  // Clear existing items
  const items = await loadAllItems()
  for (const item of items) {
    await deleteItem(item.id)
  }

  // Restore items
  for (const item of backup.items) {
    await saveItem(item)
  }

  // Restore categories
  await saveCategories(backup.categories)
}

// ============================================================================
// Export/Import Operations
// ============================================================================

/**
 * Export the entire library as JSON string
 */
export async function exportLibrary(): Promise<string> {
  const items = await loadAllItems()
  const categories = await loadCategories()
  const metadata = await loadMetadata()

  const exportData: LibraryExport = {
    version: metadata.version,
    exportedAt: new Date().toISOString(),
    items,
    categories,
  }

  return JSON.stringify(exportData, null, 2)
}

/**
 * Export specific items as JSON string
 */
export async function exportItems(ids: string[]): Promise<string> {
  const allItems = await loadAllItems()
  const items = allItems.filter((item) => ids.includes(item.id))
  const categories = await loadCategories()
  const metadata = await loadMetadata()

  // Only include categories used by exported items
  const usedCategoryIds = new Set(items.map((item) => item.categoryId))
  const usedCategories = categories.filter((cat) => usedCategoryIds.has(cat.id))

  const exportData: LibraryExport = {
    version: metadata.version,
    exportedAt: new Date().toISOString(),
    items,
    categories: usedCategories,
  }

  return JSON.stringify(exportData, null, 2)
}

/**
 * Import library from JSON string
 * @param json JSON string containing LibraryExport
 * @param merge If true, merge with existing items. If false, replace all.
 */
export async function importLibrary(
  json: string,
  merge: boolean = true
): Promise<ImportResult> {
  const errors: string[] = []
  let itemsImported = 0
  let itemsSkipped = 0
  let categoriesImported = 0

  try {
    const importData = JSON.parse(json) as LibraryExport

    // Import categories first
    const existingCategories = await loadCategories()
    const existingCategoryIds = new Set(existingCategories.map((c) => c.id))

    for (const category of importData.categories) {
      if (!existingCategoryIds.has(category.id)) {
        existingCategories.push(category)
        categoriesImported++
      }
    }

    await saveCategories(existingCategories)

    // Import items
    if (!merge) {
      // Clear existing items
      const existingItems = await loadAllItems()
      for (const item of existingItems) {
        await deleteItem(item.id)
      }
    }

    for (const item of importData.items) {
      try {
        // If merging, check if item exists
        if (merge) {
          const existing = await loadItem(item.id)
          if (existing) {
            // Skip or update based on timestamp
            if (new Date(item.updatedAt) > new Date(existing.updatedAt)) {
              await saveItem(item)
              itemsImported++
            } else {
              itemsSkipped++
            }
            continue
          }
        }

        await saveItem(item)
        itemsImported++
      } catch (error) {
        errors.push(`Failed to import item ${item.id}: ${error}`)
      }
    }

    return { success: errors.length === 0, itemsImported, itemsSkipped, categoriesImported, errors }
  } catch (error) {
    errors.push(`Failed to parse import data: ${error}`)
    return { success: false, itemsImported: 0, itemsSkipped: 0, categoriesImported: 0, errors }
  }
}
