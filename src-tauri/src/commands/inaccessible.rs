use std::path::Path;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[allow(non_snake_case)]
pub struct MyFile {
    pub title: String,
    pub filmId: u32,
    pub path: String,
}

#[tauri::command]
pub fn get_inaccessible(playlist: Vec<MyFile>) -> Vec<MyFile> {
    playlist
        .into_iter()
        .filter(|f| !Path::new(&f.path).exists())
        .collect()
}
