pub(crate) use std::{collections::HashSet, path::Path};

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct Actor {
    actor_id: i32,
    name: String,
    dob: Option<String>,
    nationality: Option<String>,
    gender: Option<String>,
    image: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct  PlaylistFile {
    title: String,
    path: String,
    studio_name: Option<String>,
    actors: Vec<Actor>,
    tags: Vec<String>,
    rowId: String,
    cantPlay: Option<bool>,
    isOnDb: bool
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