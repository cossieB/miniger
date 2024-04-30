// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use playzer;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str, num: i32) -> String {
    format!("Hello, {name}! You've been greeted from Rust! You chose the number {num}")
}

#[tauri::command]
fn read_playlist(playlist: &str) -> Vec<String> {
    let config = playzer::config::Config::new(playlist.to_string(), ".", true, false).unwrap();
    let reader = playzer::format::get_reader_writer(&config.format());
    let (playlist, _) = reader.read_file(&config);
    return playlist;
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![greet, read_playlist])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
