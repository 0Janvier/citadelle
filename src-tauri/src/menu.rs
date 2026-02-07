use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

pub fn create_app_menu() -> Menu {
    // ===== Citadelle (App) Menu =====
    let about = CustomMenuItem::new("about", "À propos de Citadelle");
    let preferences = CustomMenuItem::new("preferences", "Préférences...")
        .accelerator("Cmd+,");
    let quit = CustomMenuItem::new("quit", "Quitter Citadelle")
        .accelerator("Cmd+Q");

    let app_menu = Submenu::new(
        "Citadelle",
        Menu::new()
            .add_item(about)
            .add_native_item(MenuItem::Separator)
            .add_item(preferences)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Hide)
            .add_native_item(MenuItem::HideOthers)
            .add_native_item(MenuItem::ShowAll)
            .add_native_item(MenuItem::Separator)
            .add_item(quit),
    );

    // ===== Fichier (File) Menu =====
    let new_doc = CustomMenuItem::new("new_document", "Nouveau")
        .accelerator("Cmd+N");
    let open_doc = CustomMenuItem::new("open_document", "Ouvrir...")
        .accelerator("Cmd+O");
    let save = CustomMenuItem::new("save_document", "Enregistrer")
        .accelerator("Cmd+S");
    let save_as = CustomMenuItem::new("save_document_as", "Enregistrer sous...")
        .accelerator("Cmd+Shift+S");
    let save_as_template = CustomMenuItem::new("save_as_template", "Sauvegarder comme modèle...")
        .accelerator("Cmd+Shift+T");
    let close_tab = CustomMenuItem::new("close_tab", "Fermer l'onglet")
        .accelerator("Cmd+W");

    // Export submenu
    let export_md = CustomMenuItem::new("export_markdown", "Markdown (.md)");
    let export_html = CustomMenuItem::new("export_html", "HTML (.html)");
    let export_pdf = CustomMenuItem::new("export_pdf", "PDF");
    let export_docx = CustomMenuItem::new("export_docx", "Word (.docx)");

    let export_submenu = Submenu::new(
        "Exporter",
        Menu::new()
            .add_item(export_md)
            .add_item(export_html)
            .add_item(export_pdf)
            .add_item(export_docx),
    );

    let file_menu = Submenu::new(
        "Fichier",
        Menu::new()
            .add_item(new_doc)
            .add_item(open_doc)
            .add_native_item(MenuItem::Separator)
            .add_item(save)
            .add_item(save_as)
            .add_item(save_as_template)
            .add_native_item(MenuItem::Separator)
            .add_submenu(export_submenu)
            .add_native_item(MenuItem::Separator)
            .add_item(close_tab),
    );

    // ===== Édition (Edit) Menu =====
    let undo = CustomMenuItem::new("undo", "Annuler")
        .accelerator("Cmd+Z");
    let redo = CustomMenuItem::new("redo", "Rétablir")
        .accelerator("Cmd+Shift+Z");
    let find = CustomMenuItem::new("find", "Rechercher...")
        .accelerator("Cmd+F");
    let find_replace = CustomMenuItem::new("find_replace", "Rechercher et remplacer...")
        .accelerator("Cmd+H");
    let global_search = CustomMenuItem::new("global_search", "Recherche globale")
        .accelerator("Cmd+Shift+F");

    let edit_menu = Submenu::new(
        "Édition",
        Menu::new()
            .add_item(undo)
            .add_item(redo)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Cut)
            .add_native_item(MenuItem::Copy)
            .add_native_item(MenuItem::Paste)
            .add_native_item(MenuItem::SelectAll)
            .add_native_item(MenuItem::Separator)
            .add_item(find)
            .add_item(find_replace)
            .add_item(global_search),
    );

    // ===== Affichage (View) Menu =====
    // Theme submenu
    let theme_light = CustomMenuItem::new("theme_light", "Clair");
    let theme_dark = CustomMenuItem::new("theme_dark", "Sombre");
    let theme_sepia = CustomMenuItem::new("theme_sepia", "Sépia");
    let theme_midnight = CustomMenuItem::new("theme_midnight", "Bleu nuit");
    let theme_auto = CustomMenuItem::new("theme_auto", "Automatique");

    let theme_submenu = Submenu::new(
        "Thème",
        Menu::new()
            .add_item(theme_light)
            .add_item(theme_dark)
            .add_item(theme_sepia)
            .add_item(theme_midnight)
            .add_item(theme_auto),
    );

    // Zoom submenu
    let zoom_in = CustomMenuItem::new("zoom_in", "Agrandir")
        .accelerator("Cmd+=");
    let zoom_out = CustomMenuItem::new("zoom_out", "Réduire")
        .accelerator("Cmd+-");
    let zoom_reset = CustomMenuItem::new("zoom_reset", "Réinitialiser")
        .accelerator("Cmd+0");

    let zoom_submenu = Submenu::new(
        "Zoom",
        Menu::new()
            .add_item(zoom_in)
            .add_item(zoom_out)
            .add_native_item(MenuItem::Separator)
            .add_item(zoom_reset),
    );

    // Typewriter mode submenu
    let typewriter_toggle = CustomMenuItem::new("typewriter_toggle", "Activer/Désactiver")
        .accelerator("Cmd+Shift+T");
    let tw_focus_paragraph = CustomMenuItem::new("tw_focus_paragraph", "Focus: Paragraphe");
    let tw_focus_sentence = CustomMenuItem::new("tw_focus_sentence", "Focus: Phrase");
    let tw_focus_line = CustomMenuItem::new("tw_focus_line", "Focus: Ligne");
    let tw_pos_none = CustomMenuItem::new("tw_pos_none", "Position: Sur place");
    let tw_pos_top = CustomMenuItem::new("tw_pos_top", "Position: Haut");
    let tw_pos_middle = CustomMenuItem::new("tw_pos_middle", "Position: Milieu");
    let tw_pos_bottom = CustomMenuItem::new("tw_pos_bottom", "Position: Bas");
    let tw_pos_variable = CustomMenuItem::new("tw_pos_variable", "Position: Variable");

    let typewriter_submenu = Submenu::new(
        "Mode machine à écrire",
        Menu::new()
            .add_item(typewriter_toggle)
            .add_native_item(MenuItem::Separator)
            .add_item(tw_focus_paragraph)
            .add_item(tw_focus_sentence)
            .add_item(tw_focus_line)
            .add_native_item(MenuItem::Separator)
            .add_item(tw_pos_none)
            .add_item(tw_pos_top)
            .add_item(tw_pos_middle)
            .add_item(tw_pos_bottom)
            .add_item(tw_pos_variable),
    );

    let distraction_free = CustomMenuItem::new("distraction_free", "Mode sans distraction")
        .accelerator("Cmd+Shift+D");
    let page_mode = CustomMenuItem::new("page_mode", "Mode page")
        .accelerator("Cmd+Shift+L");

    // Show/Hide submenu
    let toggle_toolbar = CustomMenuItem::new("toggle_toolbar", "Barre d'outils");
    let toggle_statusbar = CustomMenuItem::new("toggle_statusbar", "Barre de statut");
    let toggle_tabbar = CustomMenuItem::new("toggle_tabbar", "Barre d'onglets");
    let toggle_sidebar = CustomMenuItem::new("toggle_sidebar", "Panneau latéral")
        .accelerator("Cmd+B");

    let show_hide_submenu = Submenu::new(
        "Afficher/Masquer",
        Menu::new()
            .add_item(toggle_toolbar)
            .add_item(toggle_statusbar)
            .add_item(toggle_tabbar)
            .add_item(toggle_sidebar),
    );

    let view_menu = Submenu::new(
        "Affichage",
        Menu::new()
            .add_submenu(theme_submenu)
            .add_native_item(MenuItem::Separator)
            .add_submenu(zoom_submenu)
            .add_native_item(MenuItem::Separator)
            .add_submenu(typewriter_submenu)
            .add_item(distraction_free)
            .add_item(page_mode)
            .add_native_item(MenuItem::Separator)
            .add_submenu(show_hide_submenu),
    );

    // ===== Format Menu =====
    let bold = CustomMenuItem::new("format_bold", "Gras")
        .accelerator("Cmd+Alt+B");
    let italic = CustomMenuItem::new("format_italic", "Italique")
        .accelerator("Cmd+I");
    let underline = CustomMenuItem::new("format_underline", "Souligné")
        .accelerator("Cmd+U");
    let strike = CustomMenuItem::new("format_strike", "Barré")
        .accelerator("Cmd+Shift+X");
    let highlight = CustomMenuItem::new("format_highlight", "Surligner")
        .accelerator("Cmd+Shift+H");
    let superscript = CustomMenuItem::new("format_superscript", "Exposant");
    let subscript = CustomMenuItem::new("format_subscript", "Indice");

    let h1 = CustomMenuItem::new("format_h1", "Titre 1")
        .accelerator("Cmd+1");
    let h2 = CustomMenuItem::new("format_h2", "Titre 2")
        .accelerator("Cmd+2");
    let h3 = CustomMenuItem::new("format_h3", "Titre 3")
        .accelerator("Cmd+3");

    // Lists submenu
    let bullet_list = CustomMenuItem::new("format_bullet_list", "Liste à puces")
        .accelerator("Cmd+Shift+U");
    let ordered_list = CustomMenuItem::new("format_ordered_list", "Liste numérotée")
        .accelerator("Cmd+Shift+O");
    let task_list = CustomMenuItem::new("format_task_list", "Liste de tâches");

    let lists_submenu = Submenu::new(
        "Listes",
        Menu::new()
            .add_item(bullet_list)
            .add_item(ordered_list)
            .add_item(task_list),
    );

    let blockquote = CustomMenuItem::new("format_blockquote", "Citation")
        .accelerator("Cmd+Shift+Q");

    // Code submenu
    let code_inline = CustomMenuItem::new("format_code_inline", "Code en ligne")
        .accelerator("Cmd+E");
    let code_block = CustomMenuItem::new("format_code_block", "Bloc de code");

    let code_submenu = Submenu::new(
        "Code",
        Menu::new()
            .add_item(code_inline)
            .add_item(code_block),
    );

    let horizontal_rule = CustomMenuItem::new("format_hr", "Ligne horizontale")
        .accelerator("Cmd+Shift+-");
    let page_break = CustomMenuItem::new("format_page_break", "Saut de page");

    let format_menu = Submenu::new(
        "Format",
        Menu::new()
            .add_item(bold)
            .add_item(italic)
            .add_item(underline)
            .add_item(strike)
            .add_item(highlight)
            .add_native_item(MenuItem::Separator)
            .add_item(superscript)
            .add_item(subscript)
            .add_native_item(MenuItem::Separator)
            .add_item(h1)
            .add_item(h2)
            .add_item(h3)
            .add_native_item(MenuItem::Separator)
            .add_submenu(lists_submenu)
            .add_native_item(MenuItem::Separator)
            .add_item(blockquote)
            .add_submenu(code_submenu)
            .add_native_item(MenuItem::Separator)
            .add_item(horizontal_rule)
            .add_item(page_break),
    );

    // ===== Document Menu =====
    let pieces = CustomMenuItem::new("doc_pieces", "Pièces justificatives")
        .accelerator("Cmd+Shift+J");
    let toc = CustomMenuItem::new("doc_toc", "Table des matières")
        .accelerator("Cmd+Shift+M");
    let clauses = CustomMenuItem::new("doc_clauses", "Bibliothèque de clauses")
        .accelerator("Cmd+Shift+C");
    let variables = CustomMenuItem::new("doc_variables", "Variables")
        .accelerator("Cmd+Shift+V");
    let codes = CustomMenuItem::new("doc_codes", "Codes juridiques")
        .accelerator("Cmd+Shift+K");
    let deadlines = CustomMenuItem::new("doc_deadlines", "Délais")
        .accelerator("Cmd+Shift+E");

    let document_menu = Submenu::new(
        "Document",
        Menu::new()
            .add_item(pieces)
            .add_item(toc)
            .add_native_item(MenuItem::Separator)
            .add_item(clauses)
            .add_item(variables)
            .add_native_item(MenuItem::Separator)
            .add_item(codes)
            .add_item(deadlines),
    );

    // ===== Fenêtre (Window) Menu =====
    let window_menu = Submenu::new(
        "Fenêtre",
        Menu::new()
            .add_native_item(MenuItem::Minimize)
            .add_native_item(MenuItem::Zoom)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::CloseWindow),
    );

    // ===== Aide (Help) Menu =====
    let documentation = CustomMenuItem::new("help_docs", "Documentation");
    let shortcuts = CustomMenuItem::new("help_shortcuts", "Raccourcis clavier");

    let help_menu = Submenu::new(
        "Aide",
        Menu::new()
            .add_item(documentation)
            .add_item(shortcuts),
    );

    // Build the complete menu
    Menu::new()
        .add_submenu(app_menu)
        .add_submenu(file_menu)
        .add_submenu(edit_menu)
        .add_submenu(view_menu)
        .add_submenu(format_menu)
        .add_submenu(document_menu)
        .add_submenu(window_menu)
        .add_submenu(help_menu)
}
