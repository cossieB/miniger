// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use miniger::{commands, db::get_migrations, utils::create_dirs};
use std::process::Command;
use tauri::{
    menu::{MenuBuilder, SubmenuBuilder, MenuItemBuilder, MenuId},
    Emitter, Manager,
};

fn main() {
    let migrations = get_migrations();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {

            // create images folder
            let app_data_dir = app.path().app_data_dir().unwrap();
            create_dirs(app_data_dir);

            //submenus
            let app_submenu = SubmenuBuilder::new(app, "App")
                .text("load_playlist", "Load Playlist File")
                .text("load_videos", "Load Videos")
                .text("scan_folders", "Scan Folders")
                .text("play_playlist", "Play Playlist")
                .text("open_drag_drop", "Drop Files")
                .quit()
                .build()?;

            let tools_submenu = SubmenuBuilder::new(app, "Tools")
                .text("convert_playlist", "Convert Playlist")
                .text("data_dir", "Show data folder")
                .build()?;

            let ffmpeg_submenu = SubmenuBuilder::new(app, "FFMpeg")
                .text("thumbs", "Generate Thumbnails")
                .text("metadata", "Get Metadata")
                .enabled(Command::new("ffmpeg").output().is_ok())
                .build()?;

            let menu = MenuBuilder::new(app)
                .items(&[&app_submenu, &tools_submenu, &ffmpeg_submenu])
                .build()?;


            let main = app.get_webview_window("main").unwrap();
            main.set_menu(menu)?;
            
            Ok(())
        })
        .on_menu_event(|app, event| {
            app.emit_to("main", &event.id.as_ref(), 1).unwrap();
        })
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
            commands::convert_playlist,
            commands::generate_thumbnails,
            commands::get_metadata
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

