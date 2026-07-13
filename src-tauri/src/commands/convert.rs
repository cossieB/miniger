use std::process::Command;
use tauri_plugin_log::log;

use crate::AppError;

#[tauri::command]
pub async fn transcode(src: String, dest: String) -> Result<(), AppError> {
    process(&src, &dest)?;
    Ok(())
}

fn process(src: &str, dest: &str) -> Result<std::process::Output, AppError> {
    let args = [
        "ffmpeg", 
        "-i", src, 
        "-c:v", "libx264", 
        "-preset", "fast", 
        "-crf", "23", 
        "-c:a", "copy", 
        dest
    ];

    return if cfg!(target_os = "windows") {
        Command::new("cmd")
            .arg("/C")
            .arg("start")
            .args(&args)
            .output()
            .map_err(|e| {
                log::error!("{e}");
                AppError::new("Could not start FFMPEG. Is it installed?".to_string())
            })
    } else if cfg!(target_os = "macos") {
        let script = format!(
            "tell app \"Terminal\" to do script \"ffmpeg -i \" & quoted form of \"{}\" & \" -c:v libx264 -preset fast -crf 23 -c:a copy \" & quoted form of \"{}\"",
            src, dest
        );

        Command::new("osascript")
            .args(&["-e", &script])
            .output()
            .map_err(|e| {
                log::error!("{e}");
                AppError::new("Could not start FFMPEG. Is it installed?".to_string())
            })
    } else if cfg!(target_os = "linux") {
        Command::new("xterm")
            .arg("-e")
            .args(&args)
            .output()
            .map_err(|e| {
                log::error!("{e}");
                AppError::new("Could not start FFMPEG. Is it installed?".to_string())
            })
    } else {
        return Err(AppError::new("Unsupported operating system".to_owned()));
    };
}
