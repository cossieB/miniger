use tauri::{App, Manager};

pub fn create_dirs(app: &App) {
    let app_data_dir = app.path().app_data_dir().unwrap();
    let img_dir = app_data_dir.join("images");
    if !img_dir.exists() {
        std::fs::create_dir_all(img_dir).unwrap()
    }
    let thumbs_dir = app_data_dir.join("thumbs");
    if !thumbs_dir.exists() {
        std::fs::create_dir_all(thumbs_dir).unwrap()
    }
}