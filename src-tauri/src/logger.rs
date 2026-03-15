use std::{fs, io::Write};
use tauri::{AppHandle, Manager};
use tauri_plugin_log::log::error;

pub fn logger(app: &AppHandle, buf: &[u8]) {
    let file = fs::OpenOptions::new()
        .append(true)
        .create(true)
        .open(app.path().app_data_dir().unwrap_or_log_fatal().join("log.txt"));
    
    if let Ok(mut file) = file {
        let _ = file.write_all(buf);
    }
}


pub trait CrashLogger<T> {
    fn unwrap_or_log_fatal(self) -> T;
}

impl<T, E: std::fmt::Display> CrashLogger<T> for Result<T, E> {
    fn unwrap_or_log_fatal(self) -> T {
        match self {
            Ok(val) => val,
            Err(err) => {
                error!("CRITICAL FAILURE: {}", err);
                panic!("Application crashed: {}", err);
            }
        }
    }
}