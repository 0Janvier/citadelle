use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};

use super::common::chrono_now;

#[derive(Serialize, Deserialize, Clone)]
pub struct GoldocabEditSession {
    pub session_id: String,
    pub original_path: String,
    pub working_path: String,
    pub dossier_id: Option<String>,
    pub dossier_name: Option<String>,
    pub created_at: String,
    pub status: String,
}

#[derive(Serialize, Deserialize)]
pub struct GoldocabSessionResult {
    pub session_id: String,
    pub final_path: String,
    pub was_modified: bool,
}

fn get_goldocab_handoff_dir() -> Result<PathBuf, String> {
    let home = dirs::home_dir().ok_or("Could not determine home directory")?;
    let handoff_dir = home.join("Documents").join("Cabinet").join("03_HANDOFF");

    if !handoff_dir.exists() {
        fs::create_dir_all(&handoff_dir)
            .map_err(|e| format!("Failed to create handoff directory: {}", e))?;
    }

    Ok(handoff_dir)
}

#[tauri::command]
pub async fn start_goldocab_edit_session(
    file_path: String,
    dossier_id: Option<String>,
    dossier_name: Option<String>,
) -> Result<GoldocabEditSession, String> {
    let path = PathBuf::from(&file_path);

    if !path.exists() {
        return Err(format!("File not found: {}", file_path));
    }

    let session_id = format!("{:x}", std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis());

    let session = GoldocabEditSession {
        session_id: session_id.clone(),
        original_path: file_path.clone(),
        working_path: file_path.clone(),
        dossier_id,
        dossier_name,
        created_at: chrono_now(),
        status: "active".to_string(),
    };

    let handoff_dir = get_goldocab_handoff_dir()?;
    let session_file = handoff_dir.join(format!("{}.session.json", session_id));

    let session_json = serde_json::to_string_pretty(&session)
        .map_err(|e| format!("Failed to serialize session: {}", e))?;

    fs::write(&session_file, session_json)
        .map_err(|e| format!("Failed to save session file: {}", e))?;

    Ok(session)
}

#[tauri::command]
pub async fn complete_goldocab_edit_session(
    session_id: String,
    final_path: Option<String>,
) -> Result<GoldocabSessionResult, String> {
    let handoff_dir = get_goldocab_handoff_dir()?;
    let session_file = handoff_dir.join(format!("{}.session.json", &session_id));

    if !session_file.exists() {
        return Err(format!("Session not found: {}", session_id));
    }

    let session_content = fs::read_to_string(&session_file)
        .map_err(|e| format!("Failed to read session: {}", e))?;

    let mut session: GoldocabEditSession = serde_json::from_str(&session_content)
        .map_err(|e| format!("Failed to parse session: {}", e))?;

    session.status = "completed".to_string();

    let result_path = final_path.unwrap_or(session.working_path.clone());

    let was_modified = PathBuf::from(&result_path).exists();

    let done_file = handoff_dir.join(format!("{}.done", session_id));
    let done_content = serde_json::json!({
        "session_id": session_id,
        "final_path": result_path,
        "completed_at": chrono_now(),
        "was_modified": was_modified
    });

    fs::write(&done_file, serde_json::to_string_pretty(&done_content).unwrap())
        .map_err(|e| format!("Failed to write done marker: {}", e))?;

    fs::write(&session_file, serde_json::to_string_pretty(&session).unwrap())
        .map_err(|e| format!("Failed to update session: {}", e))?;

    Ok(GoldocabSessionResult {
        session_id,
        final_path: result_path,
        was_modified,
    })
}

#[tauri::command]
pub async fn cancel_goldocab_edit_session(session_id: String) -> Result<(), String> {
    let handoff_dir = get_goldocab_handoff_dir()?;
    let session_file = handoff_dir.join(format!("{}.session.json", &session_id));

    if session_file.exists() {
        if let Ok(content) = fs::read_to_string(&session_file) {
            if let Ok(mut session) = serde_json::from_str::<GoldocabEditSession>(&content) {
                session.status = "cancelled".to_string();
                let _ = fs::write(&session_file, serde_json::to_string_pretty(&session).unwrap());
            }
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn get_goldocab_edit_session(session_id: String) -> Result<Option<GoldocabEditSession>, String> {
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

#[tauri::command]
pub async fn list_goldocab_sessions() -> Result<Vec<GoldocabEditSession>, String> {
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

#[tauri::command]
pub async fn export_to_goldocab(
    content: String,
    file_name: String,
    dossier_id: Option<String>,
    document_type: Option<String>,
) -> Result<String, String> {
    let handoff_dir = get_goldocab_handoff_dir()?;

    let output_path = handoff_dir.join(&file_name);

    fs::write(&output_path, &content)
        .map_err(|e| format!("Failed to write document: {}", e))?;

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

    let goldocab_url = format!(
        "goldocab://document/new?path={}&source=citadelle{}",
        urlencoding::encode(&output_path.to_string_lossy()),
        dossier_id.map(|id| format!("&dossierID={}", id)).unwrap_or_default()
    );

    #[cfg(target_os = "macos")]
    {
        let _ = std::process::Command::new("open")
            .arg(&goldocab_url)
            .spawn();
    }

    Ok(output_path.to_string_lossy().to_string())
}
