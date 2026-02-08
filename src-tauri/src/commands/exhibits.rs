use std::fs;
use std::path::Path;
use serde::Serialize;

use super::common::validate_path;

#[derive(Serialize)]
pub struct ExhibitFile {
    pub name: String,
    pub path: String,
}

fn is_exhibit_file(path: &Path) -> bool {
    if let Some(ext) = path.extension() {
        let ext = ext.to_string_lossy().to_lowercase();
        matches!(ext.as_str(),
            "pdf" |
            "doc" | "docx" | "odt" | "rtf" | "txt" |
            "xls" | "xlsx" | "ods" | "csv" |
            "jpg" | "jpeg" | "png" | "gif" | "tiff" | "bmp" | "webp" |
            "eml" | "msg"
        )
    } else {
        false
    }
}

#[tauri::command]
pub async fn list_exhibit_files(path: String) -> Result<Vec<ExhibitFile>, String> {
    let dir_path = validate_path(&path)?;

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

        if entry_path.is_file() && is_exhibit_file(&entry_path) {
            if let Some(name) = entry_path.file_name().and_then(|n| n.to_str()) {
                files.push(ExhibitFile {
                    name: name.to_string(),
                    path: entry_path.to_string_lossy().to_string(),
                });
            }
        }
    }

    files.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

    Ok(files)
}
