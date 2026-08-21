use crate::logger::CrashLogger;
use std::fs::{self, File};
use tauri::{App, Manager};

pub fn create_dirs(app: &App) {
    let app_data_dir = app.path().app_data_dir().unwrap_or_log_fatal();

    for segment in [
        "images/actors",
        "images/thumbs",
        "backups",
        "images/posters",
    ] {
        let path = app_data_dir.join(segment);
        fs::create_dir_all(path).unwrap_or_log_fatal();
    }
    let path = app_data_dir.join("watch.json");

    let file = File::options()
        .read(true)
        .write(true)
        .create(true)
        .open(&path);

    match file {
        Ok(mut f) => {
            if let Ok(metadata) = f.metadata() {
                if metadata.len() == 0 {
                    if serde_json::to_writer(&mut f, &serde_json::json!([])).is_err() {
                        eprintln!("Failed to write initial JSON data.");
                    }
                }
            }
        }
        Err(_) => {
            eprintln!("Failed to open or create the file.");
        }
    }
}