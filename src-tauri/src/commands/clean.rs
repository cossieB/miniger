pub use std::{collections::HashSet, path::Path};

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[allow(nonstandard_style)]
pub struct PlaylistFile {
    title: String,
    path: String,
    rowId: String,
    cantPlay: Option<bool>,
}

#[tauri::command]
pub fn cleanup_playlist(playlist: Vec<PlaylistFile>) -> Vec<PlaylistFile> {
    let mut set = HashSet::new();
    playlist
        .into_iter()
        .filter(|info| {
            let exists = Path::new(&info.path).exists();
            let is_new = set.insert(info.path.to_string());
            return exists && is_new;
        })
        .collect()
}
