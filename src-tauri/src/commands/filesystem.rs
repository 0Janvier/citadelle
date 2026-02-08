use std::fs;
use std::path::Path;
use serde::{Deserialize, Serialize};

use super::common::*;

#[derive(Serialize, Deserialize)]
pub struct FileItem {
    pub id: String,
    pub name: String,
    pub path: String,
    #[serde(rename = "type")]
    pub item_type: String,
    pub children: Option<Vec<FileItem>>,
}

#[tauri::command]
pub async fn read_file(path: String) -> Result<String, String> {
    let validated = validate_path(&path)?;
    fs::read_to_string(&validated).map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
pub async fn write_file(path: String, content: String) -> Result<(), String> {
    let validated = validate_path(&path)?;
    fs::write(&validated, content).map_err(|e| format!("Failed to write file: {}", e))
}

#[tauri::command]
pub async fn write_binary_file(path: String, content: Vec<u8>) -> Result<(), String> {
    let validated = validate_path(&path)?;
    fs::write(&validated, content).map_err(|e| format!("Failed to write binary file: {}", e))
}

#[tauri::command]
pub async fn read_binary_file(path: String) -> Result<Vec<u8>, String> {
    let validated = validate_path(&path)?;
    fs::read(&validated).map_err(|e| format!("Failed to read binary file: {}", e))
}

#[tauri::command]
pub async fn copy_file(source: String, destination: String) -> Result<(), String> {
    let (validated_src, validated_dst) = validate_two_paths(&source, &destination)?;
    // Ensure destination directory exists
    if let Some(parent) = validated_dst.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent).map_err(|e| format!("Failed to create directory: {}", e))?;
        }
    }
    fs::copy(&validated_src, &validated_dst)
        .map(|_| ())
        .map_err(|e| format!("Failed to copy file: {}", e))
}

#[tauri::command]
pub async fn file_exists(path: String) -> Result<bool, String> {
    let validated = validate_path(&path)?;
    Ok(validated.exists())
}

#[tauri::command]
pub async fn list_directory(path: String, recursive: bool) -> Result<Vec<FileItem>, String> {
    let validated = validate_path(&path)?;
    let dir_path = validated.as_path();
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
pub async fn create_folder(path: String) -> Result<(), String> {
    let validated = validate_path(&path)?;
    fs::create_dir_all(&validated).map_err(|e| format!("Failed to create folder: {}", e))
}

#[tauri::command]
pub async fn rename_item(old_path: String, new_path: String) -> Result<(), String> {
    let (validated_old, validated_new) = validate_two_paths(&old_path, &new_path)?;
    fs::rename(&validated_old, &validated_new).map_err(|e| format!("Failed to rename: {}", e))
}

#[tauri::command]
pub async fn move_item(source: String, destination: String) -> Result<(), String> {
    let (validated_src, validated_dst) = validate_two_paths(&source, &destination)?;
    fs::rename(&validated_src, &validated_dst).map_err(|e| format!("Failed to move: {}", e))
}

#[tauri::command]
pub async fn delete_item(path: String) -> Result<(), String> {
    let validated = validate_path(&path)?;
    if validated.is_dir() {
        fs::remove_dir_all(&validated).map_err(|e| format!("Failed to delete folder: {}", e))
    } else {
        fs::remove_file(&validated).map_err(|e| format!("Failed to delete file: {}", e))
    }
}
