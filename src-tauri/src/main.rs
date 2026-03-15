// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use miniger::{commands, events::handle_menu_event, setup};

fn main() {
    let migrations = setup::db::get_migrations();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            setup::create_dirs(app);
            setup::create_menus(app)
        })
        .on_menu_event(handle_menu_event)
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:mngr.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Stdout),
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::LogDir {file_name: Some("miniger.log".to_string())}),
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Webview)
                ])
                .level(tauri_plugin_log::log::LevelFilter::Warn)
                .max_file_size(2_u128.pow(30))
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            commands::echo,
            commands::read_playlist,
            commands::cleanup_playlist,
            commands::save_playlist,
            commands::get_inaccessible,
            commands::load_directory,
            commands::open_explorer,
            commands::convert_playlist,
            commands::generate_thumbnails,
            commands::get_metadata,
            commands::recycle,
            commands::transcode,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
