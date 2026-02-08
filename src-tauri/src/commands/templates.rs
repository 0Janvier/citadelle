use std::fs;
use serde::{Deserialize, Serialize};

use super::common::*;

#[derive(Serialize, Deserialize, Clone)]
pub struct TemplateMetadata {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub icon: String,
    pub is_builtin: bool,
    pub is_custom: bool,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Template {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub icon: String,
    pub version: String,
    pub created_at: String,
    pub updated_at: String,
    pub is_builtin: bool,
    pub is_custom: bool,
    pub content: serde_json::Value,
    pub metadata: TemplateContentMetadata,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct TemplateContentMetadata {
    pub default_styles: Vec<String>,
    pub suggested_length: Option<String>,
    pub tags: Vec<String>,
}

#[tauri::command]
pub async fn list_templates(category: Option<String>) -> Result<Vec<TemplateMetadata>, String> {
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

    templates.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

    Ok(templates)
}

#[tauri::command]
pub async fn read_template(id: String) -> Result<Template, String> {
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
pub async fn save_template(template: Template) -> Result<(), String> {
    let templates_dir = get_citadelle_dir().join("templates").join("documents");
    ensure_dir_exists(&templates_dir)?;

    let template_path = templates_dir.join(format!("{}.json", template.id));

    let json = serde_json::to_string_pretty(&template)
        .map_err(|e| format!("Failed to serialize template: {}", e))?;

    fs::write(&template_path, json)
        .map_err(|e| format!("Failed to write template: {}", e))
}

#[tauri::command]
pub async fn delete_template(id: String) -> Result<(), String> {
    let templates_dir = get_citadelle_dir().join("templates").join("documents");
    let template_path = templates_dir.join(format!("{}.json", id));

    if !template_path.exists() {
        return Err(format!("Template not found: {}", id));
    }

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
