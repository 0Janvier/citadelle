use std::fs;

use super::common::*;
use super::styles::StylesConfig;

#[tauri::command]
pub async fn get_user_data_path() -> Result<String, String> {
    let path = get_citadelle_dir();
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn init_user_data_dir() -> Result<(), String> {
    let base_dir = get_citadelle_dir();

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
