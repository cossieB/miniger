use std::{collections::HashSet, path::Path};

use playzer::{config, reader_writer, FileInfo};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
pub fn greet(name: &str, num: i32) -> String {
    format!("Hello, {name}! You've been greeted from Rust! You chose the number {num}")
}

#[tauri::command]
pub fn read_playlist(playlist: &str) -> Result<Vec<FileInfo>, String> {
    let config = config::Config::new(playlist.to_string(), None, true, false)?;
    let reader = reader_writer::get_reader_writer(&config.format());
    let playlist = reader.read_file(&config);
    return Ok(playlist);
}
#[tauri::command]
pub fn cleanup_playlist(playlist: Vec<FileInfo>) -> Vec<FileInfo> {
    let mut set = HashSet::new();
    playlist
    .into_iter()
    .filter(|info| {
            let exists = Path::new(info.path()).exists();
            let is_new = set.insert(info.path().to_string());
            return  exists && is_new;
        })
        .collect()
}