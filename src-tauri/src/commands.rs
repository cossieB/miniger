use std::{collections::HashSet, fs, path::Path, process::Command};

use playzer::{format, reader_writer, FileInfo};

use crate::{error::AppError, extensions::EXTENSIONS};

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

#[tauri::command]
pub fn load_directory(path: String) -> Result<Vec<FileInfo>, AppError> {
    let dir = Path::new(&path);
    let files = fs::read_dir(dir)?;
    let file_info = files
        .into_iter()
        .filter_map(|file| match file {
            Ok(entry) => {
                if !entry.file_type().unwrap().is_file() {
                    return None;
                }
                match entry.path().extension() {
                    Some(ext) => {
                        let ext = ext.to_str().unwrap_or_default();
                        if EXTENSIONS.contains(&ext) {
                            return Some(FileInfo::new(
                                entry.file_name().into_string().unwrap(),
                                entry.path().to_str().unwrap().to_string(),
                            ))
                        }
                        else {
                            return None
                        }
                    }
                    None => return None
                }
            },
            Err(_) => None,
        })
        .collect();
    Ok(file_info)
}

#[tauri::command]
pub fn open_explorer(path: String) -> Result<(), AppError> {
    Command::new("explorer").args(["/select,", &path]).spawn()?;
    Ok(())
}
