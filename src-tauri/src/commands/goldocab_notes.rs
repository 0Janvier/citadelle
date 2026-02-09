use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

fn get_notes_dir() -> Result<PathBuf, String> {
    let home = dirs::home_dir().ok_or("Could not determine home directory")?;
    let notes_dir = home.join("Documents").join("Cabinet").join("Notes");

    if !notes_dir.exists() {
        fs::create_dir_all(&notes_dir)
            .map_err(|e| format!("Failed to create notes directory: {}", e))?;
    }

    Ok(notes_dir)
}

#[derive(Serialize, Deserialize, Clone)]
pub struct NoteFileEntry {
    pub path: String,
    pub filename: String,
    pub folder: String,
    pub id: Option<String>,
    pub title: Option<String>,
    pub tags: Vec<String>,
    pub is_pinned: bool,
    pub color: Option<String>,
    pub dossier_id: Option<String>,
    pub client_id: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub excerpt: String,
    pub word_count: usize,
}

#[derive(Serialize, Deserialize)]
pub struct NoteFileContent {
    pub path: String,
    pub frontmatter: Option<NoteFrontmatter>,
    pub body: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct NoteFrontmatter {
    pub id: String,
    pub title: String,
    pub dossier_id: Option<String>,
    pub client_id: Option<String>,
    pub folder_id: Option<String>,
    pub tags: Vec<String>,
    pub is_pinned: bool,
    pub color: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

/// Parse le frontmatter YAML d'un contenu markdown
fn parse_frontmatter(content: &str) -> (Option<NoteFrontmatter>, String) {
    let trimmed = content.trim_start();

    if !trimmed.starts_with("---") {
        return (None, content.to_string());
    }

    // Trouver la fin du frontmatter
    let after_first = &trimmed[3..];
    let end_pos = after_first.find("\n---");

    let end_pos = match end_pos {
        Some(pos) => pos,
        None => return (None, content.to_string()),
    };

    let fm_block = &after_first[1..end_pos]; // Skip leading \n
    let body = &after_first[(end_pos + 4)..]; // Skip \n---
    let body = body.trim_start_matches('\n');

    // Parser les paires cle: valeur
    let mut id = String::new();
    let mut title = String::from("Sans titre");
    let mut dossier_id: Option<String> = None;
    let mut client_id: Option<String> = None;
    let mut folder_id: Option<String> = None;
    let mut tags: Vec<String> = Vec::new();
    let mut is_pinned = false;
    let mut color: Option<String> = None;
    let mut created_at = String::new();
    let mut updated_at = String::new();

    for line in fm_block.lines() {
        let line = line.trim();
        if let Some(colon_pos) = line.find(':') {
            let key = line[..colon_pos].trim();
            let mut value = line[(colon_pos + 1)..].trim().to_string();

            // Retirer les guillemets
            if value.starts_with('"') && value.ends_with('"') && value.len() >= 2 {
                value = value[1..value.len()-1].replace("\\\"", "\"");
            }

            match key {
                "id" => id = value,
                "title" => title = value,
                "dossierID" => { if !value.is_empty() && value != "null" { dossier_id = Some(value); } }
                "clientID" => { if !value.is_empty() && value != "null" { client_id = Some(value); } }
                "folderID" => { if !value.is_empty() && value != "null" { folder_id = Some(value); } }
                "isPinned" => is_pinned = value == "true",
                "color" => { if !value.is_empty() && value != "null" { color = Some(value); } }
                "createdAt" => created_at = value,
                "updatedAt" => updated_at = value,
                "tags" => {
                    if value.starts_with('[') && value.ends_with(']') {
                        let inner = &value[1..value.len()-1];
                        tags = inner.split(',')
                            .map(|s| {
                                let s = s.trim();
                                if s.starts_with('"') && s.ends_with('"') && s.len() >= 2 {
                                    s[1..s.len()-1].to_string()
                                } else {
                                    s.to_string()
                                }
                            })
                            .filter(|s| !s.is_empty())
                            .collect();
                    }
                }
                _ => {}
            }
        }
    }

    if id.is_empty() || created_at.is_empty() {
        return (None, content.to_string());
    }

    let fm = NoteFrontmatter {
        id,
        title,
        dossier_id,
        client_id,
        folder_id,
        tags,
        is_pinned,
        color,
        created_at,
        updated_at,
    };

    (Some(fm), body.to_string())
}

/// Serialise le frontmatter en YAML
fn serialize_frontmatter(fm: &NoteFrontmatter) -> String {
    let mut lines = vec!["---".to_string()];

    lines.push(format!("id: \"{}\"", fm.id));
    lines.push(format!("title: \"{}\"", fm.title.replace('"', "\\\"")));

    if let Some(ref did) = fm.dossier_id {
        lines.push(format!("dossierID: \"{}\"", did));
    }
    if let Some(ref cid) = fm.client_id {
        lines.push(format!("clientID: \"{}\"", cid));
    }
    if let Some(ref fid) = fm.folder_id {
        lines.push(format!("folderID: \"{}\"", fid));
    }

    let tags_str: Vec<String> = fm.tags.iter().map(|t| format!("\"{}\"", t)).collect();
    lines.push(format!("tags: [{}]", tags_str.join(", ")));

    lines.push(format!("isPinned: {}", fm.is_pinned));

    if let Some(ref c) = fm.color {
        lines.push(format!("color: \"{}\"", c));
    }

    lines.push(format!("createdAt: \"{}\"", fm.created_at));
    lines.push(format!("updatedAt: \"{}\"", fm.updated_at));

    lines.push("---".to_string());

    lines.join("\n")
}

/// Genere un slug de nom de fichier
fn slugify(title: &str) -> String {
    let slug: String = title
        .to_lowercase()
        .chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() { c }
            else { '-' }
        })
        .collect();

    // Compacter les tirets multiples
    let mut result = String::new();
    let mut last_was_dash = false;
    for c in slug.chars() {
        if c == '-' {
            if !last_was_dash {
                result.push(c);
            }
            last_was_dash = true;
        } else {
            result.push(c);
            last_was_dash = false;
        }
    }

    let result = result.trim_matches('-').to_string();
    if result.is_empty() {
        "sans-titre".to_string()
    } else if result.len() > 60 {
        result[..60].to_string()
    } else {
        result
    }
}

#[tauri::command]
pub async fn list_goldocab_notes() -> Result<Vec<NoteFileEntry>, String> {
    let notes_dir = get_notes_dir()?;
    let mut entries = Vec::new();

    fn scan_dir(dir: &std::path::Path, folder_name: &str, entries: &mut Vec<NoteFileEntry>) {
        if let Ok(read_dir) = fs::read_dir(dir) {
            for entry in read_dir.filter_map(|e| e.ok()) {
                let path = entry.path();

                if path.is_dir() {
                    let sub_folder = path.file_name()
                        .map(|n| n.to_string_lossy().to_string())
                        .unwrap_or_default();
                    if !sub_folder.starts_with('.') {
                        scan_dir(&path, &sub_folder, entries);
                    }
                } else if path.extension().map_or(false, |e| e == "md") {
                    if let Ok(content) = fs::read_to_string(&path) {
                        let (fm, body) = parse_frontmatter(&content);

                        let excerpt = body.chars().take(200).collect::<String>();
                        let word_count = body.split_whitespace().count();

                        let entry = NoteFileEntry {
                            path: path.to_string_lossy().to_string(),
                            filename: path.file_name().map(|n| n.to_string_lossy().to_string()).unwrap_or_default(),
                            folder: folder_name.to_string(),
                            id: fm.as_ref().map(|f| f.id.clone()),
                            title: fm.as_ref().map(|f| f.title.clone()),
                            tags: fm.as_ref().map(|f| f.tags.clone()).unwrap_or_default(),
                            is_pinned: fm.as_ref().map(|f| f.is_pinned).unwrap_or(false),
                            color: fm.as_ref().and_then(|f| f.color.clone()),
                            dossier_id: fm.as_ref().and_then(|f| f.dossier_id.clone()),
                            client_id: fm.as_ref().and_then(|f| f.client_id.clone()),
                            created_at: fm.as_ref().map(|f| f.created_at.clone()),
                            updated_at: fm.as_ref().map(|f| f.updated_at.clone()),
                            excerpt,
                            word_count,
                        };
                        entries.push(entry);
                    }
                }
            }
        }
    }

    scan_dir(&notes_dir, "", &mut entries);

    // Trier par updated_at desc
    entries.sort_by(|a, b| {
        let a_date = a.updated_at.as_deref().unwrap_or("");
        let b_date = b.updated_at.as_deref().unwrap_or("");
        b_date.cmp(a_date)
    });

    Ok(entries)
}

#[tauri::command]
pub async fn read_goldocab_note(path: String) -> Result<NoteFileContent, String> {
    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read note: {}", e))?;

    let (frontmatter, body) = parse_frontmatter(&content);

    Ok(NoteFileContent {
        path,
        frontmatter,
        body,
    })
}

#[tauri::command]
pub async fn create_goldocab_note(
    title: String,
    content: String,
    folder: Option<String>,
    dossier_id: Option<String>,
    client_id: Option<String>,
    tags: Option<Vec<String>>,
) -> Result<String, String> {
    let notes_dir = get_notes_dir()?;

    // Determiner le dossier cible
    let target_dir = if let Some(ref folder_name) = folder {
        let dir = notes_dir.join(folder_name);
        if !dir.exists() {
            fs::create_dir_all(&dir)
                .map_err(|e| format!("Failed to create folder: {}", e))?;
        }
        dir
    } else {
        let dir = notes_dir.join("Sans dossier");
        if !dir.exists() {
            fs::create_dir_all(&dir)
                .map_err(|e| format!("Failed to create folder: {}", e))?;
        }
        dir
    };

    let note_id = Uuid::new_v4().to_string();
    let now = chrono_iso8601_now();

    let slug = slugify(&title);
    let short_id = &note_id[..8];
    let filename = format!("{}-{}.md", slug, short_id);
    let file_path = target_dir.join(&filename);

    let fm = NoteFrontmatter {
        id: note_id,
        title: title.clone(),
        dossier_id,
        client_id,
        folder_id: None,
        tags: tags.unwrap_or_default(),
        is_pinned: false,
        color: None,
        created_at: now.clone(),
        updated_at: now,
    };

    let frontmatter_str = serialize_frontmatter(&fm);
    let full_content = if content.is_empty() {
        format!("{}\n", frontmatter_str)
    } else {
        format!("{}\n\n{}\n", frontmatter_str, content)
    };

    fs::write(&file_path, full_content)
        .map_err(|e| format!("Failed to write note: {}", e))?;

    // Notifier GoldoCab
    #[cfg(target_os = "macos")]
    {
        let goldocab_url = format!(
            "goldocab://note/modified?path={}&noteID={}",
            urlencoding::encode(&file_path.to_string_lossy()),
            urlencoding::encode(&fm.id)
        );
        let _ = std::process::Command::new("open")
            .arg(&goldocab_url)
            .spawn();
    }

    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn save_goldocab_note(
    path: String,
    body: String,
    frontmatter_json: Option<String>,
) -> Result<(), String> {
    // Lire le frontmatter existant ou utiliser celui fourni
    let fm = if let Some(ref json_str) = frontmatter_json {
        serde_json::from_str::<NoteFrontmatter>(json_str)
            .map_err(|e| format!("Failed to parse frontmatter: {}", e))?
    } else {
        // Lire depuis le fichier existant
        let existing = fs::read_to_string(&path)
            .map_err(|e| format!("Failed to read existing note: {}", e))?;
        let (existing_fm, _) = parse_frontmatter(&existing);
        existing_fm.ok_or("No frontmatter found in existing file")?
    };

    // Mettre a jour updatedAt
    let mut updated_fm = fm;
    updated_fm.updated_at = chrono_iso8601_now();

    let frontmatter_str = serialize_frontmatter(&updated_fm);
    let full_content = if body.is_empty() {
        format!("{}\n", frontmatter_str)
    } else {
        format!("{}\n\n{}\n", frontmatter_str, body)
    };

    fs::write(&path, full_content)
        .map_err(|e| format!("Failed to write note: {}", e))?;

    // Notifier GoldoCab
    #[cfg(target_os = "macos")]
    {
        let goldocab_url = format!(
            "goldocab://note/modified?path={}&noteID={}",
            urlencoding::encode(&path),
            urlencoding::encode(&updated_fm.id)
        );
        let _ = std::process::Command::new("open")
            .arg(&goldocab_url)
            .spawn();
    }

    Ok(())
}

#[tauri::command]
pub async fn delete_goldocab_note(path: String) -> Result<(), String> {
    if std::path::Path::new(&path).exists() {
        fs::remove_file(&path)
            .map_err(|e| format!("Failed to delete note: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
pub async fn list_note_folders() -> Result<Vec<String>, String> {
    let notes_dir = get_notes_dir()?;
    let mut folders = Vec::new();

    if let Ok(entries) = fs::read_dir(&notes_dir) {
        for entry in entries.filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.is_dir() {
                let name = path.file_name()
                    .map(|n| n.to_string_lossy().to_string())
                    .unwrap_or_default();
                if !name.starts_with('.') {
                    folders.push(name);
                }
            }
        }
    }

    folders.sort();
    Ok(folders)
}

fn chrono_iso8601_now() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let duration = SystemTime::now().duration_since(UNIX_EPOCH).unwrap();
    let secs = duration.as_secs();
    // Format ISO 8601 simplifie
    let datetime = time_to_iso8601(secs);
    datetime
}

fn time_to_iso8601(epoch_secs: u64) -> String {
    // Conversion simplifiee epoch -> ISO 8601
    let days = epoch_secs / 86400;
    let time_of_day = epoch_secs % 86400;
    let hours = time_of_day / 3600;
    let minutes = (time_of_day % 3600) / 60;
    let seconds = time_of_day % 60;

    // Calcul de la date depuis epoch (1970-01-01)
    let mut y = 1970i64;
    let mut remaining_days = days as i64;

    loop {
        let days_in_year = if is_leap_year(y) { 366 } else { 365 };
        if remaining_days < days_in_year {
            break;
        }
        remaining_days -= days_in_year;
        y += 1;
    }

    let days_in_months: [i64; 12] = if is_leap_year(y) {
        [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    } else {
        [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    };

    let mut m = 0;
    for i in 0..12 {
        if remaining_days < days_in_months[i] {
            m = i;
            break;
        }
        remaining_days -= days_in_months[i];
    }

    format!(
        "{:04}-{:02}-{:02}T{:02}:{:02}:{:02}Z",
        y,
        m + 1,
        remaining_days + 1,
        hours,
        minutes,
        seconds
    )
}

fn is_leap_year(year: i64) -> bool {
    (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)
}
