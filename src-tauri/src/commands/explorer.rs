use std::process::Command;

use crate::error::AppError;

#[tauri::command]
pub fn open_explorer(path: String) -> Result<(), AppError> {
    #[cfg(target_os = "windows")]
    {
        Command::new("explorer").args(["/select,", &path]).spawn()?;
        return Ok(());
    } 
    #[cfg(target_os = "macos")]
    {
        Command::new("open").args(["-R", &path]).spawn()?;
        return Ok(());
    }
    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open").arg(&path).spawn()?;
        return Ok(());
    }
}