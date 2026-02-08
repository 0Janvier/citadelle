use std::fs;

use super::common::*;

#[tauri::command]
pub async fn list_export_templates() -> Result<Vec<serde_json::Value>, String> {
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
pub async fn read_export_template(id: String) -> Result<serde_json::Value, String> {
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
pub async fn save_export_template(template: serde_json::Value) -> Result<(), String> {
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
pub async fn delete_export_template(id: String) -> Result<(), String> {
    let templates_dir = get_citadelle_dir().join("templates").join("export");
    let template_path = templates_dir.join(format!("{}.json", id));

    if !template_path.exists() {
        return Err(format!("Export template not found: {}", id));
    }

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
