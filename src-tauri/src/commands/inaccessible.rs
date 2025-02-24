use std::path::Path;

use playzer::FileInfo;

#[tauri::command]
pub fn get_inaccessible(playlist: Vec<FileInfo>) -> Vec<FileInfo> {
    playlist
        .into_iter()
        .filter(|f| !Path::new(f.path()).exists())
        .collect()
}