use std::fs;
use serde::{Deserialize, Serialize};

use super::common::*;

#[derive(Serialize, Deserialize, Clone)]
pub struct ThemeMetadata {
    pub id: String,
    pub name: String,
    pub description: String,
    pub is_builtin: bool,
    pub base: String,
}

#[tauri::command]
pub async fn list_themes() -> Result<Vec<ThemeMetadata>, String> {
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

    themes.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

    Ok(themes)
}

#[tauri::command]
pub async fn read_theme(id: String) -> Result<serde_json::Value, String> {
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
pub async fn save_theme(theme: serde_json::Value) -> Result<(), String> {
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
pub async fn delete_theme(id: String) -> Result<(), String> {
    let themes_dir = get_citadelle_dir().join("themes");
    let theme_path = themes_dir.join(format!("{}.json", id));

    if !theme_path.exists() {
        return Err(format!("Theme not found: {}", id));
    }

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
