use std::{collections::HashSet, fs, path::Path, process::Command};

use playzer::{format, reader_writer, FileInfo};

use crate::{error::AppError, extensions::EXTENSIONS};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

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
    let mut file_info = Vec::with_capacity(1000);
    read_recursive(&dir, &mut file_info, 0)?;
    Ok(file_info)
}

pub fn read_recursive(path: &Path, files: &mut Vec<FileInfo>, depth: u8) -> Result<(), AppError> {

    const MAX_DEPTH: u8 = 3;
    let dir = Path::new(&path);
    let dir_items = fs::read_dir(dir)?;

    
    for item in dir_items {
        let entry = item?;
        let file_type = entry.file_type()?;

        if file_type.is_file() {
            if let Some(ext) = entry.path().extension() {
                let ext = ext.to_str().unwrap_or_default();
                if EXTENSIONS.contains(&ext) {
                    files.push(FileInfo::new(
                        entry.file_name().into_string().unwrap(),
                        entry.path().to_str().unwrap().to_string(),
                    ));
                }
            }
        }
        else if file_type.is_dir() && depth < MAX_DEPTH {
            read_recursive(entry.path().as_path(), files, depth + 1)?;
        } 
    }
    return Ok(());
}

#[tauri::command]
pub fn open_explorer(path: String) -> Result<(), AppError> {
    let os = std::env::consts::OS;
    if os == "windows" {
        Command::new("explorer").args(["/select,", &path]).spawn()?;
        return Ok(());
    } else if os == "macos" {
        Command::new("open").args(["-R", &path]).spawn()?;
        return Ok(());
    }
    Err("Unsupported platform".to_string().into())
}

#[tauri::command]
pub fn echo(string: String) {
    println!("{string}")
}