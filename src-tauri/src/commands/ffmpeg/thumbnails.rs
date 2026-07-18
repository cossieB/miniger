use std::{os::windows::process::CommandExt, process::Command, thread};

use tauri::Manager;

use crate::logger::CrashLogger;

#[tauri::command]
pub async fn generate_thumbnails(app_handle: tauri::AppHandle, videos: Vec<super::F>) {
    let dir = app_handle
        .path()
        .app_data_dir()
        .unwrap_or_log_fatal()
        .join("thumbs");
    let handle = thread::spawn(move || {
        for video in &videos {
            let output = Command::new("ffmpeg")
                .creation_flags(0x08000000)
                .args([
                    "-y",
                    "-ss", "00:02:00",
                    "-i", &video.path,
                    "-vf", "scale=1280:-1",
                    "-vframes", "1",
                    dir.join(format!("{}{}", video.filmId, ".webp")).to_str().unwrap()
                ])
                .output();

            if let Err(e) = output {
                println!("{:?}", e)
            }
        }
    });
    handle.join().unwrap();
}