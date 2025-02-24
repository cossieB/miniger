use playzer::{format, reader_writer, FileInfo};

#[tauri::command]
pub fn read_playlist(playlist: &str) -> Result<Vec<FileInfo>, String> {
    let format = format::Format::get_format(playlist)?;
    let reader = reader_writer::get_reader_writer(&format);
    let playlist = reader.read_file(&playlist);
    return Ok(playlist);
}