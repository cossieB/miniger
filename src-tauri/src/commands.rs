use std::{collections::HashSet, path::Path};

use playzer::{format, reader_writer, FileInfo};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
pub fn greet(name: &str, num: i32) -> String {
    format!("Hello, {name}! You've been greeted from Rust! You chose the number {num}")
}

#[tauri::command]
pub fn read_playlist(playlist: &str) -> Result<Vec<FileInfo>, String> {
    let format = format::Format::get_format(playlist)?;
    let reader = reader_writer::get_reader_writer(&format);
    let playlist = reader.read_file(&playlist);
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
            return exists && is_new;
        })
        .collect()
}

#[tauri::command]
pub fn save_playlist(path: String, files: Vec<FileInfo>) -> Result<(), String> {
    let format = format::Format::get_format(&path)?;
    let writer = reader_writer::get_reader_writer(&format);
    let files: Vec<String> = files.into_iter().map(|f| f.path().to_string()).collect();
    writer.write_file(&files, path)?;
    Ok(())
}

#[tauri::command]
pub fn get_inaccessible(playlist: Vec<FileInfo>) -> Vec<FileInfo> {
    playlist
        .into_iter()
        .filter(|f| !Path::new(f.path()).exists())
        .collect()
}
