use playzer::{format, reader_writer, FileInfo};

use crate::AppError;

#[tauri::command]
pub fn read_playlist(playlist: &str) -> Result<Vec<FileInfo>, String> {
    let format = format::Format::get_format(playlist)?;
    let reader = reader_writer::get_reader_writer(&format);
    let playlist = reader.read_file(&playlist);
    return Ok(playlist);
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
pub fn convert_playlist(source: String, destination: String) -> Result<(), AppError> {
    let files = read_playlist(&source)?;
    save_playlist(destination, files)?;
    Ok(())
}
