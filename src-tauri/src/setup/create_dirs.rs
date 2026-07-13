use std::fs;
use tauri::{ App, Manager };
use crate::logger::CrashLogger;

pub fn create_dirs(app: &App) {
    let app_data_dir = app.path().app_data_dir().unwrap_or_log_fatal();
    let img_dir = app_data_dir.join("images");
    if !img_dir.exists() {
        fs::create_dir_all(img_dir).unwrap_or_log_fatal()
    }
    let thumbs_dir = app_data_dir.join("thumbs");
    if !thumbs_dir.exists() {
        fs::create_dir_all(thumbs_dir).unwrap_or_log_fatal()
    }
}