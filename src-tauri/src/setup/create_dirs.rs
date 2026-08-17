use crate::logger::CrashLogger;
use std::fs;
use tauri::{App, Manager};

pub fn create_dirs(app: &App) {
    let app_data_dir = app.path().app_data_dir().unwrap_or_log_fatal();    

    for segment in ["images", "thumbs", "backups", "tmdb"] {
        let path = app_data_dir.join(segment);
        fs::create_dir_all(path).unwrap_or_log_fatal();
    }
}
