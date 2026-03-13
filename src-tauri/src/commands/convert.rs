use std::{os::windows::process::CommandExt, process::Command};

use tauri::Manager;

use crate::AppError;

#[tauri::command]
pub async fn transcode(app: tauri::AppHandle, src: String, dest: String) -> Result<(), AppError> {
    let dir = app.path().app_data_dir().unwrap();
    let t = dir.join("progress.txt");

    let output = Command::new("ffmpeg")
        .creation_flags(0x08000000)
        .arg("-progress")
        .arg(t.to_str().unwrap())
        .arg("-i")
        .arg(src.clone())
        .arg("-c:v")
        .arg("libx264")
        .arg("-preset")
        .arg("fast")
        .arg("-crf")
        .arg("23")
        .arg("-c:a")
        .arg("copy")
        .arg(dest.clone())
        .output();

    match output {
        Ok(output) => {
            println!("{:#?}", String::from_utf8(output.stdout));
            println!("{:#?}", String::from_utf8(output.stderr));
            Ok(())
        }
        Err(err) => Err(err.into()),
    }
        
}