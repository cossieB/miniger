use std::{fs, path::Path};

use playzer::FileInfo;

use crate::{AppError, EXTENSIONS};

#[tauri::command]
pub fn load_directory(path: String) -> Result<Vec<FileInfo>, AppError> {
    let dir = Path::new(&path);
    let mut file_info = Vec::with_capacity(1000);
    read_recursive(&dir, &mut file_info, 0)?;
    Ok(file_info)
}

fn read_recursive(path: &Path, files: &mut Vec<FileInfo>, depth: u8) -> Result<(), AppError> {
    const MAX_DEPTH: u8 = 3;
    let dir = Path::new(&path);
    let dir_items = fs::read_dir(dir)?;

    for item in dir_items {
        let entry = item?;
        let file_type = entry.file_type()?;

        if file_type.is_file() {
            if let Some(ext) = entry.path().extension() {
                let ext = ext.to_str().unwrap_or_default().to_lowercase();
                if EXTENSIONS.contains(&ext.as_str()) {
                    files.push(FileInfo::new(
                        entry.file_name().into_string().unwrap(),
                        entry.path().to_str().unwrap().to_string(),
                    ));
                }
            }
        } else if file_type.is_dir() && depth < MAX_DEPTH {
            read_recursive(entry.path().as_path(), files, depth + 1)?;
        }
    }
    return Ok(());
}
