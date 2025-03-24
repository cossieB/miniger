use std::path::Path;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct MyFile {
    pub title: String,
    pub film_id: u32,
    pub path: String
}

#[tauri::command]
pub fn get_inaccessible(playlist: Vec<MyFile>) -> Vec<MyFile> {
    playlist
        .into_iter()
        .filter(|f| !Path::new(&f.path).exists())
        .collect()
}