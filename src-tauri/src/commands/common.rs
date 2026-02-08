use std::collections::hash_map::DefaultHasher;
use std::fs;
use std::hash::{Hash, Hasher};
use std::path::{Path, PathBuf};

pub fn generate_id(path: &str) -> String {
    let mut hasher = DefaultHasher::new();
    path.hash(&mut hasher);
    format!("{:x}", hasher.finish())
}

pub fn is_text_file(path: &Path) -> bool {
    if let Some(ext) = path.extension() {
        let ext = ext.to_string_lossy().to_lowercase();
        matches!(ext.as_str(), "md" | "markdown" | "txt" | "text" | "json" | "yaml" | "yml" | "toml" | "xml" | "html" | "css" | "js" | "ts" | "jsx" | "tsx" | "rs" | "py" | "rb" | "go" | "swift" | "c" | "cpp" | "h" | "hpp" | "java" | "kt" | "sh" | "bash" | "zsh" | "fish")
    } else {
        false
    }
}

pub fn get_citadelle_dir() -> PathBuf {
    let home = dirs::home_dir().expect("Could not find home directory");
    home.join(".citadelle")
}

pub fn ensure_dir_exists(path: &Path) -> Result<(), String> {
    if !path.exists() {
        fs::create_dir_all(path).map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    Ok(())
}

/// Validates that a path is within allowed directories to prevent path traversal.
/// Allowed roots: $HOME (and everything under it), /tmp, and the .citadelle data dir.
/// Rejects paths containing ".." traversal or pointing outside allowed areas.
pub fn validate_path(path_str: &str) -> Result<PathBuf, String> {
    let path = PathBuf::from(path_str);

    // Reject obvious traversal patterns in the raw string
    if path_str.contains("..") {
        return Err("Access denied: path traversal detected".to_string());
    }

    // For existing paths, canonicalize to resolve symlinks
    // For non-existing paths (writes), canonicalize the parent
    let canonical = if path.exists() {
        path.canonicalize()
            .map_err(|e| format!("Invalid path: {}", e))?
    } else if let Some(parent) = path.parent() {
        if parent.exists() {
            let canonical_parent = parent.canonicalize()
                .map_err(|e| format!("Invalid parent path: {}", e))?;
            canonical_parent.join(path.file_name().unwrap_or_default())
        } else {
            // Parent doesn't exist yet (will be created) - use the path as-is after basic checks
            path.clone()
        }
    } else {
        return Err("Access denied: invalid path".to_string());
    };

    let home = dirs::home_dir().ok_or("Cannot determine home directory")?;
    let tmp = PathBuf::from("/tmp");

    let allowed_roots = [
        home,
        tmp,
    ];

    if !allowed_roots.iter().any(|root| canonical.starts_with(root)) {
        return Err(format!("Access denied: path '{}' is outside allowed directories", path_str));
    }

    Ok(canonical)
}

/// Same as validate_path but for two paths (source + destination operations)
pub fn validate_two_paths(path1: &str, path2: &str) -> Result<(PathBuf, PathBuf), String> {
    let p1 = validate_path(path1)?;
    let p2 = validate_path(path2)?;
    Ok((p1, p2))
}

/// Get current timestamp as seconds since epoch
pub fn chrono_now() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let duration = SystemTime::now().duration_since(UNIX_EPOCH).unwrap();
    format!("{}", duration.as_secs())
}
