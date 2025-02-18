// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use db::get_migrations;

mod commands;
mod db;
mod error;
mod extensions;

fn main() {
    let migrations = get_migrations();

    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:mngr.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::echo,
            commands::read_playlist,
            commands::cleanup_playlist,
            commands::save_playlist,
            commands::get_inaccessible,
            commands::load_directory,
            commands::open_explorer,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
