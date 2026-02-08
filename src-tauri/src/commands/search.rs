use std::fs;
use std::path::Path;
use serde::Serialize;

use super::common::*;

#[derive(Serialize)]
pub struct SearchHit {
    #[serde(rename = "documentPath")]
    pub document_path: String,
    #[serde(rename = "documentName")]
    pub document_name: String,
    pub line: usize,
    pub column: usize,
    #[serde(rename = "matchText")]
    pub match_text: String,
    pub context: String,
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

        if name.starts_with('.') || name == "node_modules" || name == "target" {
            continue;
        }

        if entry_path.is_dir() {
            search_directory_recursive(&entry_path, query, extensions, results)?;
        } else if entry_path.is_file() && is_searchable_file(&entry_path, extensions) {
            if let Ok(hits) = search_in_file(&entry_path, query) {
                results.extend(hits);
            }
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn search_in_project(
    root_path: String,
    query: String,
    extensions: Vec<String>,
) -> Result<Vec<SearchHit>, String> {
    if query.trim().is_empty() {
        return Ok(Vec::new());
    }

    let validated = validate_path(&root_path)?;
    let dir_path = validated.as_path();
    if !dir_path.is_dir() {
        return Err("Le chemin n'est pas un dossier".to_string());
    }

    let mut results = Vec::new();
    search_directory_recursive(dir_path, &query, &extensions, &mut results)?;

    results.truncate(500);

    Ok(results)
}
