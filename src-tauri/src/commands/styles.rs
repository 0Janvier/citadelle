use std::fs;
use serde::{Deserialize, Serialize};

use super::common::*;

#[derive(Serialize, Deserialize, Clone)]
pub struct StylesConfig {
    pub version: String,
    pub styles: Vec<serde_json::Value>,
    pub custom_styles: Vec<serde_json::Value>,
}

#[tauri::command]
pub async fn read_styles() -> Result<StylesConfig, String> {
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
pub async fn save_styles(styles: StylesConfig) -> Result<(), String> {
    let styles_dir = get_citadelle_dir().join("styles");
    ensure_dir_exists(&styles_dir)?;

    let styles_file = styles_dir.join("text-styles.json");

    let json = serde_json::to_string_pretty(&styles)
        .map_err(|e| format!("Failed to serialize styles: {}", e))?;

    fs::write(&styles_file, json)
        .map_err(|e| format!("Failed to write styles: {}", e))
}
