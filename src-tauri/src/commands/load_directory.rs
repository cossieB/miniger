use std::{fs, path::Path};

use playzer::FileInfo;

use crate::{AppError, EXTENSIONS};

const MAX_DEPTH: u8 = 3;

#[tauri::command]
pub async fn load_directory(path: String) -> Result<Vec<FileInfo>, AppError> {
    let result = tauri::async_runtime::spawn_blocking(move || {
        let dir = Path::new(&path);
        let mut file_info = Vec::with_capacity(1000);
        read_recursive(dir, &mut file_info, 0)?;
        Ok(file_info)
    })
    .await
    .map_err(|e| AppError::new(e.to_string()))?;
    result
}

fn read_recursive(path: &Path, files: &mut Vec<FileInfo>, depth: u8) -> Result<(), AppError> {
    let dir_items = fs::read_dir(path)?;
    if depth > MAX_DEPTH  {
        return Ok(());
    }
    for entry in dir_items {
        let entry = entry?;
        let file_type = entry.file_type()?;
        let entry_path = entry.path();

        if file_type.is_file() {
            let Some(ext) = entry_path.extension() else {
                continue;
            };

            let ext_str = ext.to_string_lossy().to_lowercase();
            if EXTENSIONS.contains(&ext_str.as_str()) {
                let file_name = entry.file_name().to_string_lossy().into_owned();
                let full_path = entry_path.to_string_lossy().into_owned();
                files.push(FileInfo::new(file_name, full_path));
            }
        } else if file_type.is_dir() {
            read_recursive(&entry_path, files, depth + 1)?;
        }
    }

    Ok(())
}
