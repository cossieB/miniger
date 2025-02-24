use std::process::Command;

use crate::error::AppError;

#[tauri::command]
pub fn open_explorer(path: String) -> Result<(), AppError> {
    let os = std::env::consts::OS;
    if os == "windows" {
        Command::new("explorer").args(["/select,", &path]).spawn()?;
        return Ok(());
    } else if os == "macos" {
        Command::new("open").args(["-R", &path]).spawn()?;
        return Ok(());
    }
    Err("Unsupported platform".to_string().into())
}