use playzer::{format, reader_writer, FileInfo};

#[tauri::command]
pub fn save_playlist(path: String, files: Vec<FileInfo>) -> Result<(), String> {
    let format = format::Format::get_format(&path)?;
    let writer = reader_writer::get_reader_writer(&format);
    let files: Vec<String> = files.into_iter().map(|f| f.path().to_string()).collect();
    writer.write_file(&files, path)?;
    Ok(())
}