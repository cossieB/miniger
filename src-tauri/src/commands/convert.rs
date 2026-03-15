use std::process::Command;
use tauri_plugin_log::log;

use crate::AppError;

#[tauri::command]
pub async fn transcode(src: String, dest: String) -> Result<(), AppError> {
    process(&src, &dest)?;
    Ok(())
}

fn process(src: &String, dest: &String) -> Result<std::process::Output, AppError>{
    let args = [
            "ffmpeg", 
            "-i", src, 
            "-c:v", "libx264", 
            "-preset", "fast", 
            "-crf", "23", 
            "-c:a", "copy", 
            dest];
            
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
        .arg("/C")
        .arg("start")
        .args(&args)
        .output()
        .map_err(|e| {
            log::error!("{e}");
            AppError::new("Could not start FFMPEG. Is it installed?".to_string())
        })
    }
    #[cfg(target_os = "macos")] 
    {
        Command::new("osascript")
        .args(&["-e", format!("tell app \"Terminal\" to do script \"ffmpeg -i '{}' -c:v libx264 -preset fast -crf 23 -c:a copy '{}'\"", src, dest)])
        .output()
        .map_err(|e| {
            log::error!("{e}");
            AppError::new("Could not start FFMPEG. Is it installed?".to_string())
        })
    }
    #[cfg(target_os = "linux")]
    {
        Command::new("xterm")
        .arg("-e")
        .args(&args)
        .output()
        .map_err(|e| {
            log::error!("{e}");
            AppError::new("Could not start FFMPEG. Is it installed?".to_string())
        })
    }
}

