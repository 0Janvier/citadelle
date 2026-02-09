// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod menu;
mod commands;

use tauri::Manager;

fn main() {
    let menu = menu::create_app_menu();

    tauri::Builder::default()
        .menu(menu)
        .on_menu_event(|event| {
            let window = event.window();
            let menu_id = event.menu_item_id();
            let _ = window.emit("menu-event", menu_id);
        })
        .setup(|app| {
            #[cfg(debug_assertions)]
            if let Some(window) = app.get_window("main") {
                window.open_devtools();
            }

            // Handle deep links (citadelle:// URLs)
            let args: Vec<String> = std::env::args().collect();
            if args.len() > 1 {
                let url = &args[1];
                if url.starts_with("citadelle://") {
                    if let Some(window) = app.get_window("main") {
                        let url_clone = url.clone();
                        let _ = window.emit("goldocab-open", &url_clone);
                    }
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // File system commands
            commands::read_file,
            commands::write_file,
            commands::write_binary_file,
            commands::read_binary_file,
            commands::copy_file,
            commands::file_exists,
            commands::list_directory,
            commands::create_folder,
            commands::rename_item,
            commands::move_item,
            commands::delete_item,
            // Project search
            commands::search_in_project,
            // Exhibit files (Pieces jointes)
            commands::list_exhibit_files,
            // User data
            commands::get_user_data_path,
            commands::init_user_data_dir,
            // Templates
            commands::list_templates,
            commands::read_template,
            commands::save_template,
            commands::delete_template,
            // Styles
            commands::read_styles,
            commands::save_styles,
            // Themes
            commands::list_themes,
            commands::read_theme,
            commands::save_theme,
            commands::delete_theme,
            // Export templates
            commands::list_export_templates,
            commands::read_export_template,
            commands::save_export_template,
            commands::delete_export_template,
            // GoldoCab integration
            commands::start_goldocab_edit_session,
            commands::complete_goldocab_edit_session,
            commands::cancel_goldocab_edit_session,
            commands::get_goldocab_edit_session,
            commands::list_goldocab_sessions,
            commands::export_to_goldocab,
            // GoldoCab database (read-only)
            commands::check_goldocab_status,
            commands::search_goldocab_clients,
            commands::search_goldocab_dossiers,
            commands::get_goldocab_client,
            commands::get_goldocab_dossier_items,
            // GoldoCab notes (shared .md files)
            commands::list_goldocab_notes,
            commands::read_goldocab_note,
            commands::create_goldocab_note,
            commands::save_goldocab_note,
            commands::delete_goldocab_note,
            commands::list_note_folders,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
