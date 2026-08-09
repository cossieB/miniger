use crate::logger::CrashLogger;
use std::fs;
use tauri::{App, Manager};

pub fn create_dirs(app: &App) {
    let app_data_dir = app.path().app_data_dir().unwrap_or_log_fatal();
    let img_dir = app_data_dir.join("images");
    fs::create_dir_all(img_dir).unwrap_or_log_fatal();
    let thumbs_dir = app_data_dir.join("thumbs");
    fs::create_dir_all(thumbs_dir).unwrap_or_log_fatal();
    let backup_dir = app_data_dir.join("backups");
    fs::create_dir_all(backup_dir).unwrap_or_log_fatal();
}
