use std::path::PathBuf;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct GoldocabClient {
    pub id: i64,
    pub denomination: Option<String>,
    pub type_client: Option<String>,
    pub telephone: Option<String>,
    pub email: Option<String>,
    pub ville: Option<String>,
    pub code_postal: Option<String>,
    pub statut_client: Option<String>,
    pub nom: Option<String>,
    pub prenom: Option<String>,
    pub civilite: Option<String>,
    pub profession: Option<String>,
    pub forme_juridique: Option<String>,
    pub numero_siren: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct GoldocabDossier {
    pub id: i64,
    pub nom: Option<String>,
    pub type_dossier: Option<String>,
    pub client_id: Option<i64>,
    pub client_name: Option<String>,
    pub statut_gestion: Option<String>,
    pub etat: Option<String>,
    pub numero_rg: Option<String>,
    pub juridiction: Option<String>,
    pub date_audience: Option<String>,
    pub priorite: Option<i64>,
    pub est_favori: Option<bool>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct GoldocabItem {
    pub id: i64,
    pub titre: Option<String>,
    pub contexte: Option<String>,
    pub dossier_id: Option<i64>,
    pub est_tache: Option<bool>,
    pub date_echeance: Option<String>,
    pub urgence: Option<i64>,
    pub gtd_phase: Option<String>,
    pub en_cours: Option<bool>,
}

#[derive(Serialize, Deserialize)]
pub struct GoldocabStatus {
    pub available: bool,
    pub database_path: String,
    pub client_count: Option<i64>,
    pub dossier_count: Option<i64>,
}

fn get_goldocab_db_path() -> PathBuf {
    let home = dirs::home_dir().expect("Could not find home directory");
    home.join("Library")
        .join("Application Support")
        .join("GoldoCab")
        .join("goldocab.sqlite")
}

fn open_goldocab_db() -> Result<rusqlite::Connection, String> {
    let db_path = get_goldocab_db_path();
    if !db_path.exists() {
        return Err("GOLDOCAB_UNAVAILABLE".to_string());
    }
    rusqlite::Connection::open_with_flags(
        &db_path,
        rusqlite::OpenFlags::SQLITE_OPEN_READ_ONLY | rusqlite::OpenFlags::SQLITE_OPEN_NO_MUTEX,
    )
    .map_err(|e| format!("Erreur ouverture base GoldoCab: {}", e))
}

fn build_client_display_name(
    nom: &Option<String>,
    prenom: &Option<String>,
    denomination: &Option<String>,
    type_client: &Option<String>,
) -> Option<String> {
    if type_client.as_deref() == Some("PersonneMorale") {
        denomination.clone()
    } else {
        let parts: Vec<&str> = [prenom.as_deref(), nom.as_deref()]
            .iter()
            .filter_map(|p| *p)
            .collect();
        if parts.is_empty() {
            denomination.clone()
        } else {
            Some(parts.join(" "))
        }
    }
}

#[tauri::command]
pub async fn check_goldocab_status() -> Result<GoldocabStatus, String> {
    let db_path = get_goldocab_db_path();
    let path_str = db_path.to_string_lossy().to_string();

    let conn = match open_goldocab_db() {
        Ok(c) => c,
        Err(_) => {
            return Ok(GoldocabStatus {
                available: false,
                database_path: path_str,
                client_count: None,
                dossier_count: None,
            });
        }
    };

    let client_count: Option<i64> = conn
        .query_row("SELECT COUNT(*) FROM clients", [], |row| row.get(0))
        .ok();

    let dossier_count: Option<i64> = conn
        .query_row("SELECT COUNT(*) FROM dossiers", [], |row| row.get(0))
        .ok();

    Ok(GoldocabStatus {
        available: true,
        database_path: path_str,
        client_count,
        dossier_count,
    })
}

#[tauri::command]
pub async fn search_goldocab_clients(query: String, limit: Option<i64>) -> Result<Vec<GoldocabClient>, String> {
    let conn = open_goldocab_db()?;
    let max = limit.unwrap_or(20);
    let pattern = format!("%{}%", query.to_lowercase());

    let mut stmt = conn
        .prepare(
            "SELECT id, denomination, typeClient, telephone, email, ville, codePostal,
                    statutClient, nom, prenom, civilite, profession, formeJuridique, numeroSIREN
             FROM clients
             WHERE LOWER(COALESCE(nom,'')) LIKE ?1
                OR LOWER(COALESCE(prenom,'')) LIKE ?1
                OR LOWER(COALESCE(denomination,'')) LIKE ?1
                OR LOWER(COALESCE(email,'')) LIKE ?1
             ORDER BY COALESCE(nom, denomination, '') COLLATE NOCASE ASC
             LIMIT ?2",
        )
        .map_err(|e| format!("Erreur requete clients: {}", e))?;

    let rows = stmt
        .query_map(rusqlite::params![pattern, max], |row| {
            Ok(GoldocabClient {
                id: row.get(0)?,
                denomination: row.get(1)?,
                type_client: row.get(2)?,
                telephone: row.get(3)?,
                email: row.get(4)?,
                ville: row.get(5)?,
                code_postal: row.get(6)?,
                statut_client: row.get(7)?,
                nom: row.get(8)?,
                prenom: row.get(9)?,
                civilite: row.get(10)?,
                profession: row.get(11)?,
                forme_juridique: row.get(12)?,
                numero_siren: row.get(13)?,
            })
        })
        .map_err(|e| format!("Erreur lecture clients: {}", e))?;

    let mut clients = Vec::new();
    for row in rows {
        if let Ok(client) = row {
            clients.push(client);
        }
    }

    Ok(clients)
}

#[tauri::command]
pub async fn search_goldocab_dossiers(query: String, limit: Option<i64>) -> Result<Vec<GoldocabDossier>, String> {
    let conn = open_goldocab_db()?;
    let max = limit.unwrap_or(20);
    let pattern = format!("%{}%", query.to_lowercase());

    let mut stmt = conn
        .prepare(
            "SELECT d.id, d.nom, d.typeDossier, d.clientID, d.statutGestion, d.etat,
                    d.numeroRG, d.juridiction, d.dateAudience, d.priorite, d.estFavori,
                    c.nom AS c_nom, c.prenom AS c_prenom, c.denomination AS c_denom, c.typeClient AS c_type
             FROM dossiers d
             LEFT JOIN clients c ON d.clientID = c.id
             WHERE LOWER(COALESCE(d.nom,'')) LIKE ?1
                OR LOWER(COALESCE(d.numeroRG,'')) LIKE ?1
                OR LOWER(COALESCE(d.juridiction,'')) LIKE ?1
                OR LOWER(COALESCE(c.nom,'')) LIKE ?1
                OR LOWER(COALESCE(c.prenom,'')) LIKE ?1
                OR LOWER(COALESCE(c.denomination,'')) LIKE ?1
             ORDER BY COALESCE(d.estFavori, 0) DESC, d.id DESC
             LIMIT ?2",
        )
        .map_err(|e| format!("Erreur requete dossiers: {}", e))?;

    let rows = stmt
        .query_map(rusqlite::params![pattern, max], |row| {
            let c_nom: Option<String> = row.get(11)?;
            let c_prenom: Option<String> = row.get(12)?;
            let c_denom: Option<String> = row.get(13)?;
            let c_type: Option<String> = row.get(14)?;

            let client_name = build_client_display_name(&c_nom, &c_prenom, &c_denom, &c_type);

            Ok(GoldocabDossier {
                id: row.get(0)?,
                nom: row.get(1)?,
                type_dossier: row.get(2)?,
                client_id: row.get(3)?,
                client_name,
                statut_gestion: row.get(4)?,
                etat: row.get(5)?,
                numero_rg: row.get(6)?,
                juridiction: row.get(7)?,
                date_audience: row.get(8)?,
                priorite: row.get(9)?,
                est_favori: row.get(10)?,
            })
        })
        .map_err(|e| format!("Erreur lecture dossiers: {}", e))?;

    let mut dossiers = Vec::new();
    for row in rows {
        if let Ok(dossier) = row {
            dossiers.push(dossier);
        }
    }

    Ok(dossiers)
}

#[tauri::command]
pub async fn get_goldocab_client(id: i64) -> Result<Option<GoldocabClient>, String> {
    let conn = open_goldocab_db()?;

    let result = conn.query_row(
        "SELECT id, denomination, typeClient, telephone, email, ville, codePostal,
                statutClient, nom, prenom, civilite, profession, formeJuridique, numeroSIREN
         FROM clients WHERE id = ?1",
        rusqlite::params![id],
        |row| {
            Ok(GoldocabClient {
                id: row.get(0)?,
                denomination: row.get(1)?,
                type_client: row.get(2)?,
                telephone: row.get(3)?,
                email: row.get(4)?,
                ville: row.get(5)?,
                code_postal: row.get(6)?,
                statut_client: row.get(7)?,
                nom: row.get(8)?,
                prenom: row.get(9)?,
                civilite: row.get(10)?,
                profession: row.get(11)?,
                forme_juridique: row.get(12)?,
                numero_siren: row.get(13)?,
            })
        },
    );

    match result {
        Ok(client) => Ok(Some(client)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(format!("Erreur lecture client: {}", e)),
    }
}

#[tauri::command]
pub async fn get_goldocab_dossier_items(dossier_id: i64) -> Result<Vec<GoldocabItem>, String> {
    let conn = open_goldocab_db()?;

    let mut stmt = conn
        .prepare(
            "SELECT id, titre, contexte, dossierID, estTache, dateEcheance,
                    urgence, gtdPhase, enCours
             FROM items
             WHERE dossierID = ?1
             ORDER BY COALESCE(enCours, 0) DESC, COALESCE(urgence, 0) DESC, id DESC",
        )
        .map_err(|e| format!("Erreur requete items: {}", e))?;

    let rows = stmt
        .query_map(rusqlite::params![dossier_id], |row| {
            Ok(GoldocabItem {
                id: row.get(0)?,
                titre: row.get(1)?,
                contexte: row.get(2)?,
                dossier_id: row.get(3)?,
                est_tache: row.get(4)?,
                date_echeance: row.get(5)?,
                urgence: row.get(6)?,
                gtd_phase: row.get(7)?,
                en_cours: row.get(8)?,
            })
        })
        .map_err(|e| format!("Erreur lecture items: {}", e))?;

    let mut items = Vec::new();
    for row in rows {
        if let Ok(item) = row {
            items.push(item);
        }
    }

    Ok(items)
}
