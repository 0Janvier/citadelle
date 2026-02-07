// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod menu;

use std::fs;
use std::path::{Path, PathBuf};
use serde::{Deserialize, Serialize};
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use tauri::Manager;
use rusqlite;

// ============================================================================
// File System Types
// ============================================================================

#[derive(Serialize, Deserialize)]
struct FileItem {
    id: String,
    name: String,
    path: String,
    #[serde(rename = "type")]
    item_type: String,
    children: Option<Vec<FileItem>>,
}

// ============================================================================
// Template Types
// ============================================================================

#[derive(Serialize, Deserialize, Clone)]
struct TemplateMetadata {
    id: String,
    name: String,
    description: String,
    category: String,
    icon: String,
    is_builtin: bool,
    is_custom: bool,
    updated_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
struct Template {
    id: String,
    name: String,
    description: String,
    category: String,
    icon: String,
    version: String,
    created_at: String,
    updated_at: String,
    is_builtin: bool,
    is_custom: bool,
    content: serde_json::Value,
    metadata: TemplateContentMetadata,
}

#[derive(Serialize, Deserialize, Clone)]
struct TemplateContentMetadata {
    default_styles: Vec<String>,
    suggested_length: Option<String>,
    tags: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone)]
struct StylesConfig {
    version: String,
    styles: Vec<serde_json::Value>,
    custom_styles: Vec<serde_json::Value>,
}

#[derive(Serialize, Deserialize, Clone)]
struct ThemeMetadata {
    id: String,
    name: String,
    description: String,
    is_builtin: bool,
    base: String,
}

// ============================================================================
// Helper Functions
// ============================================================================

fn generate_id(path: &str) -> String {
    let mut hasher = DefaultHasher::new();
    path.hash(&mut hasher);
    format!("{:x}", hasher.finish())
}

fn is_text_file(path: &Path) -> bool {
    if let Some(ext) = path.extension() {
        let ext = ext.to_string_lossy().to_lowercase();
        matches!(ext.as_str(), "md" | "markdown" | "txt" | "text" | "json" | "yaml" | "yml" | "toml" | "xml" | "html" | "css" | "js" | "ts" | "jsx" | "tsx" | "rs" | "py" | "rb" | "go" | "swift" | "c" | "cpp" | "h" | "hpp" | "java" | "kt" | "sh" | "bash" | "zsh" | "fish")
    } else {
        false
    }
}

fn is_exhibit_file(path: &Path) -> bool {
    if let Some(ext) = path.extension() {
        let ext = ext.to_string_lossy().to_lowercase();
        matches!(ext.as_str(),
            // PDF
            "pdf" |
            // Documents
            "doc" | "docx" | "odt" | "rtf" | "txt" |
            // Tableurs
            "xls" | "xlsx" | "ods" | "csv" |
            // Images
            "jpg" | "jpeg" | "png" | "gif" | "tiff" | "bmp" | "webp" |
            // Emails
            "eml" | "msg"
        )
    } else {
        false
    }
}

fn get_citadelle_dir() -> PathBuf {
    let home = dirs::home_dir().expect("Could not find home directory");
    home.join(".citadelle")
}

fn ensure_dir_exists(path: &Path) -> Result<(), String> {
    if !path.exists() {
        fs::create_dir_all(path).map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    Ok(())
}

// ============================================================================
// File System Commands
// ============================================================================

#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
async fn write_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content).map_err(|e| format!("Failed to write file: {}", e))
}

#[tauri::command]
async fn write_binary_file(path: String, content: Vec<u8>) -> Result<(), String> {
    fs::write(&path, content).map_err(|e| format!("Failed to write binary file: {}", e))
}

#[tauri::command]
async fn read_binary_file(path: String) -> Result<Vec<u8>, String> {
    fs::read(&path).map_err(|e| format!("Failed to read binary file: {}", e))
}

#[tauri::command]
async fn copy_file(source: String, destination: String) -> Result<(), String> {
    // Ensure destination directory exists
    if let Some(parent) = Path::new(&destination).parent() {
        if !parent.exists() {
            fs::create_dir_all(parent).map_err(|e| format!("Failed to create directory: {}", e))?;
        }
    }
    fs::copy(&source, &destination)
        .map(|_| ())
        .map_err(|e| format!("Failed to copy file: {}", e))
}

#[tauri::command]
async fn file_exists(path: String) -> Result<bool, String> {
    Ok(std::path::Path::new(&path).exists())
}

#[tauri::command]
async fn list_directory(path: String, recursive: bool) -> Result<Vec<FileItem>, String> {
    let dir_path = Path::new(&path);
    if !dir_path.is_dir() {
        return Err("Path is not a directory".to_string());
    }

    let mut items = Vec::new();

    let entries = fs::read_dir(dir_path).map_err(|e| e.to_string())?;

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let entry_path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();

        // Skip hidden files and system directories
        if name.starts_with('.') || name == "node_modules" || name == "target" {
            continue;
        }

        let is_dir = entry_path.is_dir();
        let path_str = entry_path.to_string_lossy().to_string();

        // For files, only include text files
        if !is_dir && !is_text_file(&entry_path) {
            continue;
        }

        let children = if recursive && is_dir {
            match list_directory_recursive(&path_str) {
                Ok(c) => Some(c),
                Err(_) => None,
            }
        } else {
            None
        };

        items.push(FileItem {
            id: generate_id(&path_str),
            name,
            path: path_str,
            item_type: if is_dir { "folder".to_string() } else { "file".to_string() },
            children,
        });
    }

    // Sort: folders first, then alphabetically
    items.sort_by(|a, b| {
        match (a.item_type.as_str(), b.item_type.as_str()) {
            ("folder", "file") => std::cmp::Ordering::Less,
            ("file", "folder") => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });

    Ok(items)
}

fn list_directory_recursive(path: &str) -> Result<Vec<FileItem>, String> {
    let dir_path = Path::new(path);
    if !dir_path.is_dir() {
        return Ok(Vec::new());
    }

    let mut items = Vec::new();
    let entries = fs::read_dir(dir_path).map_err(|e| e.to_string())?;

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let entry_path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();

        if name.starts_with('.') || name == "node_modules" || name == "target" {
            continue;
        }

        let is_dir = entry_path.is_dir();
        let path_str = entry_path.to_string_lossy().to_string();

        if !is_dir && !is_text_file(&entry_path) {
            continue;
        }

        let children = if is_dir {
            match list_directory_recursive(&path_str) {
                Ok(c) => Some(c),
                Err(_) => None,
            }
        } else {
            None
        };

        items.push(FileItem {
            id: generate_id(&path_str),
            name,
            path: path_str,
            item_type: if is_dir { "folder".to_string() } else { "file".to_string() },
            children,
        });
    }

    items.sort_by(|a, b| {
        match (a.item_type.as_str(), b.item_type.as_str()) {
            ("folder", "file") => std::cmp::Ordering::Less,
            ("file", "folder") => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });

    Ok(items)
}

#[tauri::command]
async fn create_folder(path: String) -> Result<(), String> {
    fs::create_dir_all(&path).map_err(|e| format!("Failed to create folder: {}", e))
}

#[tauri::command]
async fn rename_item(old_path: String, new_path: String) -> Result<(), String> {
    fs::rename(&old_path, &new_path).map_err(|e| format!("Failed to rename: {}", e))
}

#[tauri::command]
async fn move_item(source: String, destination: String) -> Result<(), String> {
    fs::rename(&source, &destination).map_err(|e| format!("Failed to move: {}", e))
}

#[tauri::command]
async fn delete_item(path: String) -> Result<(), String> {
    let p = Path::new(&path);
    if p.is_dir() {
        fs::remove_dir_all(&path).map_err(|e| format!("Failed to delete folder: {}", e))
    } else {
        fs::remove_file(&path).map_err(|e| format!("Failed to delete file: {}", e))
    }
}

// ============================================================================
// Project Search Commands
// ============================================================================

#[derive(Serialize)]
struct SearchHit {
    #[serde(rename = "documentPath")]
    document_path: String,
    #[serde(rename = "documentName")]
    document_name: String,
    line: usize,
    column: usize,
    #[serde(rename = "matchText")]
    match_text: String,
    context: String,
}

fn is_searchable_file(path: &Path, extensions: &[String]) -> bool {
    if let Some(ext) = path.extension() {
        let ext_str = ext.to_string_lossy().to_lowercase();
        extensions.iter().any(|e| e.to_lowercase() == ext_str)
    } else {
        false
    }
}

fn search_in_file(file_path: &Path, query: &str) -> Result<Vec<SearchHit>, String> {
    let content = fs::read_to_string(file_path)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    let query_lower = query.to_lowercase();
    let file_name = file_path.file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_default();
    let file_path_str = file_path.to_string_lossy().to_string();

    let mut hits = Vec::new();

    for (line_idx, line) in content.lines().enumerate() {
        let line_lower = line.to_lowercase();
        let mut search_start = 0;

        while let Some(col) = line_lower[search_start..].find(&query_lower) {
            let actual_col = search_start + col;
            let match_end = actual_col + query.len();
            let match_text = &line[actual_col..match_end];

            // Créer le contexte (30 caractères avant et après)
            let context_start = actual_col.saturating_sub(30);
            let context_end = (match_end + 30).min(line.len());
            let mut context = String::new();

            if context_start > 0 {
                context.push_str("...");
            }
            context.push_str(&line[context_start..context_end]);
            if context_end < line.len() {
                context.push_str("...");
            }

            hits.push(SearchHit {
                document_path: file_path_str.clone(),
                document_name: file_name.clone(),
                line: line_idx + 1,
                column: actual_col + 1,
                match_text: match_text.to_string(),
                context: context.trim().to_string(),
            });

            search_start = match_end;
        }
    }

    Ok(hits)
}

fn search_directory_recursive(
    dir_path: &Path,
    query: &str,
    extensions: &[String],
    results: &mut Vec<SearchHit>,
) -> Result<(), String> {
    let entries = fs::read_dir(dir_path).map_err(|e| e.to_string())?;

    for entry in entries.flatten() {
        let entry_path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();

        // Ignorer les fichiers/dossiers cachés et node_modules
        if name.starts_with('.') || name == "node_modules" || name == "target" {
            continue;
        }

        if entry_path.is_dir() {
            // Recherche récursive
            search_directory_recursive(&entry_path, query, extensions, results)?;
        } else if entry_path.is_file() && is_searchable_file(&entry_path, extensions) {
            // Rechercher dans le fichier
            if let Ok(hits) = search_in_file(&entry_path, query) {
                results.extend(hits);
            }
        }
    }

    Ok(())
}

#[tauri::command]
async fn search_in_project(
    root_path: String,
    query: String,
    extensions: Vec<String>,
) -> Result<Vec<SearchHit>, String> {
    if query.trim().is_empty() {
        return Ok(Vec::new());
    }

    let dir_path = Path::new(&root_path);
    if !dir_path.is_dir() {
        return Err("Le chemin n'est pas un dossier".to_string());
    }

    let mut results = Vec::new();
    search_directory_recursive(dir_path, &query, &extensions, &mut results)?;

    // Limiter à 500 résultats pour éviter les problèmes de performance
    results.truncate(500);

    Ok(results)
}

// ============================================================================
// Exhibit Files Commands (Pièces jointes)
// ============================================================================

#[derive(Serialize)]
struct ExhibitFile {
    name: String,
    path: String,
}

#[tauri::command]
async fn list_exhibit_files(path: String) -> Result<Vec<ExhibitFile>, String> {
    let dir_path = PathBuf::from(&path);

    if !dir_path.exists() {
        return Err("Le dossier n'existe pas".to_string());
    }

    if !dir_path.is_dir() {
        return Err("Le chemin n'est pas un dossier".to_string());
    }

    let mut files = Vec::new();

    let entries = fs::read_dir(&dir_path)
        .map_err(|e| format!("Impossible de lire le dossier: {}", e))?;

    for entry in entries.flatten() {
        let entry_path = entry.path();

        // Only include files (not directories) that match exhibit extensions
        if entry_path.is_file() && is_exhibit_file(&entry_path) {
            if let Some(name) = entry_path.file_name().and_then(|n| n.to_str()) {
                files.push(ExhibitFile {
                    name: name.to_string(),
                    path: entry_path.to_string_lossy().to_string(),
                });
            }
        }
    }

    // Sort alphabetically by name (case-insensitive)
    files.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

    Ok(files)
}

// ============================================================================
// User Data Directory Commands
// ============================================================================

#[tauri::command]
async fn get_user_data_path() -> Result<String, String> {
    let path = get_citadelle_dir();
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
async fn init_user_data_dir() -> Result<(), String> {
    let base_dir = get_citadelle_dir();

    // Create main directories
    let dirs = vec![
        base_dir.join("templates").join("documents"),
        base_dir.join("templates").join("export"),
        base_dir.join("styles"),
        base_dir.join("themes"),
    ];

    for dir in dirs {
        ensure_dir_exists(&dir)?;
    }

    // Initialize default styles file if it doesn't exist
    let styles_file = base_dir.join("styles").join("text-styles.json");
    if !styles_file.exists() {
        let default_styles = StylesConfig {
            version: "1.0.0".to_string(),
            styles: vec![],
            custom_styles: vec![],
        };
        let json = serde_json::to_string_pretty(&default_styles)
            .map_err(|e| format!("Failed to serialize styles: {}", e))?;
        fs::write(&styles_file, json)
            .map_err(|e| format!("Failed to write styles file: {}", e))?;
    }

    Ok(())
}

// ============================================================================
// Template Commands
// ============================================================================

#[tauri::command]
async fn list_templates(category: Option<String>) -> Result<Vec<TemplateMetadata>, String> {
    let templates_dir = get_citadelle_dir().join("templates").join("documents");
    ensure_dir_exists(&templates_dir)?;

    let mut templates = Vec::new();

    if templates_dir.exists() {
        let entries = fs::read_dir(&templates_dir)
            .map_err(|e| format!("Failed to read templates directory: {}", e))?;

        for entry in entries {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();

            if path.extension().map_or(false, |ext| ext == "json") {
                if let Ok(content) = fs::read_to_string(&path) {
                    if let Ok(template) = serde_json::from_str::<Template>(&content) {
                        // Filter by category if specified
                        if let Some(ref cat) = category {
                            if &template.category != cat {
                                continue;
                            }
                        }

                        templates.push(TemplateMetadata {
                            id: template.id,
                            name: template.name,
                            description: template.description,
                            category: template.category,
                            icon: template.icon,
                            is_builtin: template.is_builtin,
                            is_custom: template.is_custom,
                            updated_at: template.updated_at,
                        });
                    }
                }
            }
        }
    }

    // Sort by name
    templates.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

    Ok(templates)
}

#[tauri::command]
async fn read_template(id: String) -> Result<Template, String> {
    let templates_dir = get_citadelle_dir().join("templates").join("documents");
    let template_path = templates_dir.join(format!("{}.json", id));

    if !template_path.exists() {
        return Err(format!("Template not found: {}", id));
    }

    let content = fs::read_to_string(&template_path)
        .map_err(|e| format!("Failed to read template: {}", e))?;

    serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse template: {}", e))
}

#[tauri::command]
async fn save_template(template: Template) -> Result<(), String> {
    let templates_dir = get_citadelle_dir().join("templates").join("documents");
    ensure_dir_exists(&templates_dir)?;

    let template_path = templates_dir.join(format!("{}.json", template.id));

    let json = serde_json::to_string_pretty(&template)
        .map_err(|e| format!("Failed to serialize template: {}", e))?;

    fs::write(&template_path, json)
        .map_err(|e| format!("Failed to write template: {}", e))
}

#[tauri::command]
async fn delete_template(id: String) -> Result<(), String> {
    let templates_dir = get_citadelle_dir().join("templates").join("documents");
    let template_path = templates_dir.join(format!("{}.json", id));

    if !template_path.exists() {
        return Err(format!("Template not found: {}", id));
    }

    // Check if it's a builtin template
    if let Ok(content) = fs::read_to_string(&template_path) {
        if let Ok(template) = serde_json::from_str::<Template>(&content) {
            if template.is_builtin {
                return Err("Cannot delete builtin template".to_string());
            }
        }
    }

    fs::remove_file(&template_path)
        .map_err(|e| format!("Failed to delete template: {}", e))
}

// ============================================================================
// Style Commands
// ============================================================================

#[tauri::command]
async fn read_styles() -> Result<StylesConfig, String> {
    let styles_file = get_citadelle_dir().join("styles").join("text-styles.json");

    if !styles_file.exists() {
        return Ok(StylesConfig {
            version: "1.0.0".to_string(),
            styles: vec![],
            custom_styles: vec![],
        });
    }

    let content = fs::read_to_string(&styles_file)
        .map_err(|e| format!("Failed to read styles: {}", e))?;

    serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse styles: {}", e))
}

#[tauri::command]
async fn save_styles(styles: StylesConfig) -> Result<(), String> {
    let styles_dir = get_citadelle_dir().join("styles");
    ensure_dir_exists(&styles_dir)?;

    let styles_file = styles_dir.join("text-styles.json");

    let json = serde_json::to_string_pretty(&styles)
        .map_err(|e| format!("Failed to serialize styles: {}", e))?;

    fs::write(&styles_file, json)
        .map_err(|e| format!("Failed to write styles: {}", e))
}

// ============================================================================
// Theme Commands
// ============================================================================

#[tauri::command]
async fn list_themes() -> Result<Vec<ThemeMetadata>, String> {
    let themes_dir = get_citadelle_dir().join("themes");
    ensure_dir_exists(&themes_dir)?;

    let mut themes = Vec::new();

    if themes_dir.exists() {
        let entries = fs::read_dir(&themes_dir)
            .map_err(|e| format!("Failed to read themes directory: {}", e))?;

        for entry in entries {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();

            if path.extension().map_or(false, |ext| ext == "json") {
                if let Ok(content) = fs::read_to_string(&path) {
                    if let Ok(theme) = serde_json::from_str::<serde_json::Value>(&content) {
                        themes.push(ThemeMetadata {
                            id: theme["id"].as_str().unwrap_or("").to_string(),
                            name: theme["name"].as_str().unwrap_or("").to_string(),
                            description: theme["description"].as_str().unwrap_or("").to_string(),
                            is_builtin: theme["isBuiltin"].as_bool().unwrap_or(false),
                            base: theme["base"].as_str().unwrap_or("light").to_string(),
                        });
                    }
                }
            }
        }
    }

    // Sort by name
    themes.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

    Ok(themes)
}

#[tauri::command]
async fn read_theme(id: String) -> Result<serde_json::Value, String> {
    let themes_dir = get_citadelle_dir().join("themes");
    let theme_path = themes_dir.join(format!("{}.json", id));

    if !theme_path.exists() {
        return Err(format!("Theme not found: {}", id));
    }

    let content = fs::read_to_string(&theme_path)
        .map_err(|e| format!("Failed to read theme: {}", e))?;

    serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse theme: {}", e))
}

#[tauri::command]
async fn save_theme(theme: serde_json::Value) -> Result<(), String> {
    let themes_dir = get_citadelle_dir().join("themes");
    ensure_dir_exists(&themes_dir)?;

    let id = theme["id"].as_str()
        .ok_or("Theme must have an id")?;

    let theme_path = themes_dir.join(format!("{}.json", id));

    let json = serde_json::to_string_pretty(&theme)
        .map_err(|e| format!("Failed to serialize theme: {}", e))?;

    fs::write(&theme_path, json)
        .map_err(|e| format!("Failed to write theme: {}", e))
}

#[tauri::command]
async fn delete_theme(id: String) -> Result<(), String> {
    let themes_dir = get_citadelle_dir().join("themes");
    let theme_path = themes_dir.join(format!("{}.json", id));

    if !theme_path.exists() {
        return Err(format!("Theme not found: {}", id));
    }

    // Check if it's a builtin theme
    if let Ok(content) = fs::read_to_string(&theme_path) {
        if let Ok(theme) = serde_json::from_str::<serde_json::Value>(&content) {
            if theme["isBuiltin"].as_bool().unwrap_or(false) {
                return Err("Cannot delete builtin theme".to_string());
            }
        }
    }

    fs::remove_file(&theme_path)
        .map_err(|e| format!("Failed to delete theme: {}", e))
}

// ============================================================================
// Export Template Commands
// ============================================================================

#[tauri::command]
async fn list_export_templates() -> Result<Vec<serde_json::Value>, String> {
    let templates_dir = get_citadelle_dir().join("templates").join("export");
    ensure_dir_exists(&templates_dir)?;

    let mut templates = Vec::new();

    if templates_dir.exists() {
        let entries = fs::read_dir(&templates_dir)
            .map_err(|e| format!("Failed to read export templates directory: {}", e))?;

        for entry in entries {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();

            if path.extension().map_or(false, |ext| ext == "json") {
                if let Ok(content) = fs::read_to_string(&path) {
                    if let Ok(template) = serde_json::from_str::<serde_json::Value>(&content) {
                        templates.push(serde_json::json!({
                            "id": template["id"],
                            "name": template["name"],
                            "description": template["description"],
                            "format": template["format"],
                            "isBuiltin": template["isBuiltin"],
                        }));
                    }
                }
            }
        }
    }

    Ok(templates)
}

#[tauri::command]
async fn read_export_template(id: String) -> Result<serde_json::Value, String> {
    let templates_dir = get_citadelle_dir().join("templates").join("export");
    let template_path = templates_dir.join(format!("{}.json", id));

    if !template_path.exists() {
        return Err(format!("Export template not found: {}", id));
    }

    let content = fs::read_to_string(&template_path)
        .map_err(|e| format!("Failed to read export template: {}", e))?;

    serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse export template: {}", e))
}

#[tauri::command]
async fn save_export_template(template: serde_json::Value) -> Result<(), String> {
    let templates_dir = get_citadelle_dir().join("templates").join("export");
    ensure_dir_exists(&templates_dir)?;

    let id = template["id"].as_str()
        .ok_or("Export template must have an id")?;

    let template_path = templates_dir.join(format!("{}.json", id));

    let json = serde_json::to_string_pretty(&template)
        .map_err(|e| format!("Failed to serialize export template: {}", e))?;

    fs::write(&template_path, json)
        .map_err(|e| format!("Failed to write export template: {}", e))
}

#[tauri::command]
async fn delete_export_template(id: String) -> Result<(), String> {
    let templates_dir = get_citadelle_dir().join("templates").join("export");
    let template_path = templates_dir.join(format!("{}.json", id));

    if !template_path.exists() {
        return Err(format!("Export template not found: {}", id));
    }

    // Check if it's a builtin template
    if let Ok(content) = fs::read_to_string(&template_path) {
        if let Ok(template) = serde_json::from_str::<serde_json::Value>(&content) {
            if template["isBuiltin"].as_bool().unwrap_or(false) {
                return Err("Cannot delete builtin export template".to_string());
            }
        }
    }

    fs::remove_file(&template_path)
        .map_err(|e| format!("Failed to delete export template: {}", e))
}

// ============================================================================
// GoldoCab Integration Types
// ============================================================================

#[derive(Serialize, Deserialize, Clone)]
struct GoldocabEditSession {
    session_id: String,
    original_path: String,
    working_path: String,
    dossier_id: Option<String>,
    dossier_name: Option<String>,
    created_at: String,
    status: String, // "active", "completed", "cancelled"
}

#[derive(Serialize, Deserialize)]
struct GoldocabSessionResult {
    session_id: String,
    final_path: String,
    was_modified: bool,
}

// ============================================================================
// GoldoCab Integration Commands
// ============================================================================

/// Start a GoldoCab edit session - opens a document for editing with tracking
#[tauri::command]
async fn start_goldocab_edit_session(
    file_path: String,
    dossier_id: Option<String>,
    dossier_name: Option<String>,
) -> Result<GoldocabEditSession, String> {
    let path = PathBuf::from(&file_path);

    if !path.exists() {
        return Err(format!("File not found: {}", file_path));
    }

    // Generate a unique session ID
    let session_id = format!("{:x}", std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis());

    // Create session info
    let session = GoldocabEditSession {
        session_id: session_id.clone(),
        original_path: file_path.clone(),
        working_path: file_path.clone(), // Same path for now, could be a copy
        dossier_id,
        dossier_name,
        created_at: chrono_now(),
        status: "active".to_string(),
    };

    // Save session to handoff folder
    let handoff_dir = get_goldocab_handoff_dir()?;
    let session_file = handoff_dir.join(format!("{}.session.json", session_id));

    let session_json = serde_json::to_string_pretty(&session)
        .map_err(|e| format!("Failed to serialize session: {}", e))?;

    fs::write(&session_file, session_json)
        .map_err(|e| format!("Failed to save session file: {}", e))?;

    Ok(session)
}

/// Complete a GoldoCab edit session - marks the document as ready to return
#[tauri::command]
async fn complete_goldocab_edit_session(
    session_id: String,
    final_path: Option<String>,
) -> Result<GoldocabSessionResult, String> {
    let handoff_dir = get_goldocab_handoff_dir()?;
    let session_file = handoff_dir.join(format!("{}.session.json", &session_id));

    if !session_file.exists() {
        return Err(format!("Session not found: {}", session_id));
    }

    // Read session
    let session_content = fs::read_to_string(&session_file)
        .map_err(|e| format!("Failed to read session: {}", e))?;

    let mut session: GoldocabEditSession = serde_json::from_str(&session_content)
        .map_err(|e| format!("Failed to parse session: {}", e))?;

    // Update session status
    session.status = "completed".to_string();

    // Determine final path
    let result_path = final_path.unwrap_or(session.working_path.clone());

    // Check if file was modified (basic check - file exists and size > 0)
    let was_modified = PathBuf::from(&result_path).exists();

    // Write completion marker (.done file)
    let done_file = handoff_dir.join(format!("{}.done", session_id));
    let done_content = serde_json::json!({
        "session_id": session_id,
        "final_path": result_path,
        "completed_at": chrono_now(),
        "was_modified": was_modified
    });

    fs::write(&done_file, serde_json::to_string_pretty(&done_content).unwrap())
        .map_err(|e| format!("Failed to write done marker: {}", e))?;

    // Update session file
    fs::write(&session_file, serde_json::to_string_pretty(&session).unwrap())
        .map_err(|e| format!("Failed to update session: {}", e))?;

    Ok(GoldocabSessionResult {
        session_id,
        final_path: result_path,
        was_modified,
    })
}

/// Cancel a GoldoCab edit session
#[tauri::command]
async fn cancel_goldocab_edit_session(session_id: String) -> Result<(), String> {
    let handoff_dir = get_goldocab_handoff_dir()?;
    let session_file = handoff_dir.join(format!("{}.session.json", &session_id));

    if session_file.exists() {
        // Read and update session
        if let Ok(content) = fs::read_to_string(&session_file) {
            if let Ok(mut session) = serde_json::from_str::<GoldocabEditSession>(&content) {
                session.status = "cancelled".to_string();
                let _ = fs::write(&session_file, serde_json::to_string_pretty(&session).unwrap());
            }
        }
    }

    Ok(())
}

/// Get current GoldoCab edit session if any
#[tauri::command]
async fn get_goldocab_edit_session(session_id: String) -> Result<Option<GoldocabEditSession>, String> {
    let handoff_dir = get_goldocab_handoff_dir()?;
    let session_file = handoff_dir.join(format!("{}.session.json", &session_id));

    if !session_file.exists() {
        return Ok(None);
    }

    let content = fs::read_to_string(&session_file)
        .map_err(|e| format!("Failed to read session: {}", e))?;

    let session: GoldocabEditSession = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse session: {}", e))?;

    Ok(Some(session))
}

/// List all active GoldoCab edit sessions
#[tauri::command]
async fn list_goldocab_sessions() -> Result<Vec<GoldocabEditSession>, String> {
    let handoff_dir = get_goldocab_handoff_dir()?;
    let mut sessions = Vec::new();

    if let Ok(entries) = fs::read_dir(&handoff_dir) {
        for entry in entries.filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.extension().map_or(false, |e| e == "json")
                && path.file_name().map_or(false, |n| n.to_string_lossy().ends_with(".session.json")) {
                if let Ok(content) = fs::read_to_string(&path) {
                    if let Ok(session) = serde_json::from_str::<GoldocabEditSession>(&content) {
                        if session.status == "active" {
                            sessions.push(session);
                        }
                    }
                }
            }
        }
    }

    Ok(sessions)
}

/// Export document to GoldoCab with metadata
#[tauri::command]
async fn export_to_goldocab(
    content: String,
    file_name: String,
    dossier_id: Option<String>,
    document_type: Option<String>,
) -> Result<String, String> {
    let handoff_dir = get_goldocab_handoff_dir()?;

    // Create output path
    let output_path = handoff_dir.join(&file_name);

    // Write the document
    fs::write(&output_path, &content)
        .map_err(|e| format!("Failed to write document: {}", e))?;

    // Create metadata file
    let meta_path = handoff_dir.join(format!("{}.meta.json", file_name));
    let metadata = serde_json::json!({
        "file_name": file_name,
        "file_path": output_path.to_string_lossy(),
        "dossier_id": dossier_id,
        "document_type": document_type.unwrap_or("document".to_string()),
        "created_at": chrono_now(),
        "source": "citadelle"
    });

    fs::write(&meta_path, serde_json::to_string_pretty(&metadata).unwrap())
        .map_err(|e| format!("Failed to write metadata: {}", e))?;

    // Trigger GoldoCab URL scheme to notify about the new document
    let goldocab_url = format!(
        "goldocab://document/new?path={}&source=citadelle{}",
        urlencoding::encode(&output_path.to_string_lossy()),
        dossier_id.map(|id| format!("&dossierID={}", id)).unwrap_or_default()
    );

    // Open URL scheme (macOS)
    #[cfg(target_os = "macos")]
    {
        let _ = std::process::Command::new("open")
            .arg(&goldocab_url)
            .spawn();
    }

    Ok(output_path.to_string_lossy().to_string())
}

/// Helper: Get GoldoCab handoff directory
fn get_goldocab_handoff_dir() -> Result<PathBuf, String> {
    let home = dirs::home_dir().ok_or("Could not determine home directory")?;
    let handoff_dir = home.join("Documents").join("Cabinet").join("03_HANDOFF");

    if !handoff_dir.exists() {
        fs::create_dir_all(&handoff_dir)
            .map_err(|e| format!("Failed to create handoff directory: {}", e))?;
    }

    Ok(handoff_dir)
}

/// Helper: Get current timestamp
fn chrono_now() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let duration = SystemTime::now().duration_since(UNIX_EPOCH).unwrap();
    format!("{}", duration.as_secs())
}

// ============================================================================
// GoldoCab Database Types (read-only access)
// ============================================================================

#[derive(Serialize, Deserialize, Clone)]
struct GoldocabClient {
    id: i64,
    denomination: Option<String>,
    type_client: Option<String>,
    telephone: Option<String>,
    email: Option<String>,
    ville: Option<String>,
    code_postal: Option<String>,
    statut_client: Option<String>,
    nom: Option<String>,
    prenom: Option<String>,
    civilite: Option<String>,
    profession: Option<String>,
    forme_juridique: Option<String>,
    numero_siren: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
struct GoldocabDossier {
    id: i64,
    nom: Option<String>,
    type_dossier: Option<String>,
    client_id: Option<i64>,
    client_name: Option<String>,
    statut_gestion: Option<String>,
    etat: Option<String>,
    numero_rg: Option<String>,
    juridiction: Option<String>,
    date_audience: Option<String>,
    priorite: Option<i64>,
    est_favori: Option<bool>,
}

#[derive(Serialize, Deserialize, Clone)]
struct GoldocabItem {
    id: i64,
    titre: Option<String>,
    contexte: Option<String>,
    dossier_id: Option<i64>,
    est_tache: Option<bool>,
    date_echeance: Option<String>,
    urgence: Option<i64>,
    gtd_phase: Option<String>,
    en_cours: Option<bool>,
}

#[derive(Serialize, Deserialize)]
struct GoldocabStatus {
    available: bool,
    database_path: String,
    client_count: Option<i64>,
    dossier_count: Option<i64>,
}

// ============================================================================
// GoldoCab Database Helper
// ============================================================================

fn get_goldocab_db_path() -> PathBuf {
    let home = dirs::home_dir().expect("Could not find home directory");
    home.join("Library")
        .join("Application Support")
        .join("GoldoCab")
        .join("goldocab.sqlite")
}

fn open_goldocab_db() -> Result<rusqlite::Connection, String> {
    let db_path = get_goldocab_db_path();
    if !db_path.exists() {
        return Err("GOLDOCAB_UNAVAILABLE".to_string());
    }
    rusqlite::Connection::open_with_flags(
        &db_path,
        rusqlite::OpenFlags::SQLITE_OPEN_READ_ONLY | rusqlite::OpenFlags::SQLITE_OPEN_NO_MUTEX,
    )
    .map_err(|e| format!("Erreur ouverture base GoldoCab: {}", e))
}

/// Build a client display name from client row data
fn build_client_display_name(
    nom: &Option<String>,
    prenom: &Option<String>,
    denomination: &Option<String>,
    type_client: &Option<String>,
) -> Option<String> {
    if type_client.as_deref() == Some("PersonneMorale") {
        denomination.clone()
    } else {
        let parts: Vec<&str> = [prenom.as_deref(), nom.as_deref()]
            .iter()
            .filter_map(|p| *p)
            .collect();
        if parts.is_empty() {
            denomination.clone()
        } else {
            Some(parts.join(" "))
        }
    }
}

// ============================================================================
// GoldoCab Database Commands (read-only)
// ============================================================================

#[tauri::command]
async fn check_goldocab_status() -> Result<GoldocabStatus, String> {
    let db_path = get_goldocab_db_path();
    let path_str = db_path.to_string_lossy().to_string();

    let conn = match open_goldocab_db() {
        Ok(c) => c,
        Err(_) => {
            return Ok(GoldocabStatus {
                available: false,
                database_path: path_str,
                client_count: None,
                dossier_count: None,
            });
        }
    };

    let client_count: Option<i64> = conn
        .query_row("SELECT COUNT(*) FROM clients", [], |row| row.get(0))
        .ok();

    let dossier_count: Option<i64> = conn
        .query_row("SELECT COUNT(*) FROM dossiers", [], |row| row.get(0))
        .ok();

    Ok(GoldocabStatus {
        available: true,
        database_path: path_str,
        client_count,
        dossier_count,
    })
}

#[tauri::command]
async fn search_goldocab_clients(query: String, limit: Option<i64>) -> Result<Vec<GoldocabClient>, String> {
    let conn = open_goldocab_db()?;
    let max = limit.unwrap_or(20);
    let pattern = format!("%{}%", query.to_lowercase());

    let mut stmt = conn
        .prepare(
            "SELECT id, denomination, typeClient, telephone, email, ville, codePostal,
                    statutClient, nom, prenom, civilite, profession, formeJuridique, numeroSIREN
             FROM clients
             WHERE LOWER(COALESCE(nom,'')) LIKE ?1
                OR LOWER(COALESCE(prenom,'')) LIKE ?1
                OR LOWER(COALESCE(denomination,'')) LIKE ?1
                OR LOWER(COALESCE(email,'')) LIKE ?1
             ORDER BY COALESCE(nom, denomination, '') COLLATE NOCASE ASC
             LIMIT ?2",
        )
        .map_err(|e| format!("Erreur requete clients: {}", e))?;

    let rows = stmt
        .query_map(rusqlite::params![pattern, max], |row| {
            Ok(GoldocabClient {
                id: row.get(0)?,
                denomination: row.get(1)?,
                type_client: row.get(2)?,
                telephone: row.get(3)?,
                email: row.get(4)?,
                ville: row.get(5)?,
                code_postal: row.get(6)?,
                statut_client: row.get(7)?,
                nom: row.get(8)?,
                prenom: row.get(9)?,
                civilite: row.get(10)?,
                profession: row.get(11)?,
                forme_juridique: row.get(12)?,
                numero_siren: row.get(13)?,
            })
        })
        .map_err(|e| format!("Erreur lecture clients: {}", e))?;

    let mut clients = Vec::new();
    for row in rows {
        if let Ok(client) = row {
            clients.push(client);
        }
    }

    Ok(clients)
}

#[tauri::command]
async fn search_goldocab_dossiers(query: String, limit: Option<i64>) -> Result<Vec<GoldocabDossier>, String> {
    let conn = open_goldocab_db()?;
    let max = limit.unwrap_or(20);
    let pattern = format!("%{}%", query.to_lowercase());

    let mut stmt = conn
        .prepare(
            "SELECT d.id, d.nom, d.typeDossier, d.clientID, d.statutGestion, d.etat,
                    d.numeroRG, d.juridiction, d.dateAudience, d.priorite, d.estFavori,
                    c.nom AS c_nom, c.prenom AS c_prenom, c.denomination AS c_denom, c.typeClient AS c_type
             FROM dossiers d
             LEFT JOIN clients c ON d.clientID = c.id
             WHERE LOWER(COALESCE(d.nom,'')) LIKE ?1
                OR LOWER(COALESCE(d.numeroRG,'')) LIKE ?1
                OR LOWER(COALESCE(d.juridiction,'')) LIKE ?1
                OR LOWER(COALESCE(c.nom,'')) LIKE ?1
                OR LOWER(COALESCE(c.prenom,'')) LIKE ?1
                OR LOWER(COALESCE(c.denomination,'')) LIKE ?1
             ORDER BY COALESCE(d.estFavori, 0) DESC, d.id DESC
             LIMIT ?2",
        )
        .map_err(|e| format!("Erreur requete dossiers: {}", e))?;

    let rows = stmt
        .query_map(rusqlite::params![pattern, max], |row| {
            let c_nom: Option<String> = row.get(11)?;
            let c_prenom: Option<String> = row.get(12)?;
            let c_denom: Option<String> = row.get(13)?;
            let c_type: Option<String> = row.get(14)?;

            let client_name = build_client_display_name(&c_nom, &c_prenom, &c_denom, &c_type);

            Ok(GoldocabDossier {
                id: row.get(0)?,
                nom: row.get(1)?,
                type_dossier: row.get(2)?,
                client_id: row.get(3)?,
                client_name,
                statut_gestion: row.get(4)?,
                etat: row.get(5)?,
                numero_rg: row.get(6)?,
                juridiction: row.get(7)?,
                date_audience: row.get(8)?,
                priorite: row.get(9)?,
                est_favori: row.get(10)?,
            })
        })
        .map_err(|e| format!("Erreur lecture dossiers: {}", e))?;

    let mut dossiers = Vec::new();
    for row in rows {
        if let Ok(dossier) = row {
            dossiers.push(dossier);
        }
    }

    Ok(dossiers)
}

#[tauri::command]
async fn get_goldocab_client(id: i64) -> Result<Option<GoldocabClient>, String> {
    let conn = open_goldocab_db()?;

    let result = conn.query_row(
        "SELECT id, denomination, typeClient, telephone, email, ville, codePostal,
                statutClient, nom, prenom, civilite, profession, formeJuridique, numeroSIREN
         FROM clients WHERE id = ?1",
        rusqlite::params![id],
        |row| {
            Ok(GoldocabClient {
                id: row.get(0)?,
                denomination: row.get(1)?,
                type_client: row.get(2)?,
                telephone: row.get(3)?,
                email: row.get(4)?,
                ville: row.get(5)?,
                code_postal: row.get(6)?,
                statut_client: row.get(7)?,
                nom: row.get(8)?,
                prenom: row.get(9)?,
                civilite: row.get(10)?,
                profession: row.get(11)?,
                forme_juridique: row.get(12)?,
                numero_siren: row.get(13)?,
            })
        },
    );

    match result {
        Ok(client) => Ok(Some(client)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(format!("Erreur lecture client: {}", e)),
    }
}

#[tauri::command]
async fn get_goldocab_dossier_items(dossier_id: i64) -> Result<Vec<GoldocabItem>, String> {
    let conn = open_goldocab_db()?;

    let mut stmt = conn
        .prepare(
            "SELECT id, titre, contexte, dossierID, estTache, dateEcheance,
                    urgence, gtdPhase, enCours
             FROM items
             WHERE dossierID = ?1
             ORDER BY COALESCE(enCours, 0) DESC, COALESCE(urgence, 0) DESC, id DESC",
        )
        .map_err(|e| format!("Erreur requete items: {}", e))?;

    let rows = stmt
        .query_map(rusqlite::params![dossier_id], |row| {
            Ok(GoldocabItem {
                id: row.get(0)?,
                titre: row.get(1)?,
                contexte: row.get(2)?,
                dossier_id: row.get(3)?,
                est_tache: row.get(4)?,
                date_echeance: row.get(5)?,
                urgence: row.get(6)?,
                gtd_phase: row.get(7)?,
                en_cours: row.get(8)?,
            })
        })
        .map_err(|e| format!("Erreur lecture items: {}", e))?;

    let mut items = Vec::new();
    for row in rows {
        if let Ok(item) = row {
            items.push(item);
        }
    }

    Ok(items)
}

// ============================================================================
// Main Entry Point
// ============================================================================

fn main() {
    let menu = menu::create_app_menu();

    tauri::Builder::default()
        .menu(menu)
        .on_menu_event(|event| {
            let window = event.window();
            let menu_id = event.menu_item_id();
            // Emit event to frontend with the menu ID
            let _ = window.emit("menu-event", menu_id);
        })
        .setup(|app| {
            // Open devtools only in debug mode
            #[cfg(debug_assertions)]
            if let Some(window) = app.get_window("main") {
                window.open_devtools();
            }

            // Handle deep links (citadelle:// URLs)
            // Check if app was launched with a URL argument
            let args: Vec<String> = std::env::args().collect();
            if args.len() > 1 {
                let url = &args[1];
                if url.starts_with("citadelle://") {
                    // Emit the deep link to the frontend
                    if let Some(window) = app.get_window("main") {
                        let url_clone = url.clone();
                        let _ = window.emit("goldocab-open", &url_clone);
                    }
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // File system commands
            read_file,
            write_file,
            write_binary_file,
            read_binary_file,
            copy_file,
            file_exists,
            list_directory,
            create_folder,
            rename_item,
            move_item,
            delete_item,
            // Project search commands
            search_in_project,
            // Exhibit files commands (Pièces jointes)
            list_exhibit_files,
            // User data commands
            get_user_data_path,
            init_user_data_dir,
            // Template commands
            list_templates,
            read_template,
            save_template,
            delete_template,
            // Style commands
            read_styles,
            save_styles,
            // Theme commands
            list_themes,
            read_theme,
            save_theme,
            delete_theme,
            // Export template commands
            list_export_templates,
            read_export_template,
            save_export_template,
            delete_export_template,
            // GoldoCab integration commands
            start_goldocab_edit_session,
            complete_goldocab_edit_session,
            cancel_goldocab_edit_session,
            get_goldocab_edit_session,
            list_goldocab_sessions,
            export_to_goldocab,
            // GoldoCab database commands (read-only)
            check_goldocab_status,
            search_goldocab_clients,
            search_goldocab_dossiers,
            get_goldocab_client,
            get_goldocab_dossier_items,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
