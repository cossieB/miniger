use std::{process::Command, sync::Arc};

use tauri::Manager;
use tokio::task::JoinSet;

use crate::logger::CrashLogger;

#[tauri::command]
pub async fn generate_thumbnails(app_handle: tauri::AppHandle, videos: Vec<super::F>) {
    let mut cmd = Command::new("ffmpeg");

    // Apply the flag only on Windows (0x08000000 is CREATE_NO_WINDOW)
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000);
    }

    let ffmpeg = cmd.arg("-version").output();

    if ffmpeg.is_err() {
        return;
    }
    let dir = Arc::new(
        app_handle
            .path()
            .app_data_dir()
            .unwrap_or_log_fatal()
            .join("thumbs"),
    );

    let concurrency = std::thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(4);

    let mut videos_iter = videos.into_iter();
    let mut set = JoinSet::new();

    // seed initial batch
    for video in videos_iter.by_ref().take(concurrency) {
        let dir = Arc::clone(&dir);
        set.spawn(generate_one(dir, video));
    }

    // as each finishes, pull in the next one
    while let Some(_) = set.join_next().await {
        if let Some(video) = videos_iter.next() {
            let dir = Arc::clone(&dir);
            set.spawn(generate_one(dir, video));
        }
    }
}

async fn generate_one(dir: Arc<std::path::PathBuf>, video: super::F) {
    let out_path = dir.join(format!("{}.webp", video.filmId));
    if out_path.exists() {
        return;
    }

    let mut cmd = tokio::process::Command::new("ffmpeg");
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.as_std_mut().creation_flags(0x08000000);
    }
    let result = cmd
        .args([
            "-y",
            "-ss",
            "00:02:00",
            "-i",
            &video.path,
            "-an",
            "-vf",
            "scale=1280:-1",
            "-vframes",
            "1",
        ])
        .arg(&out_path)
        .output()
        .await;

    if let Err(e) = result {
        eprintln!("ffmpeg failed for {}: {:?}", video.filmId, e);
    }
}
