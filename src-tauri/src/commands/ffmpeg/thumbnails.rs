use std::{process::Command, sync::Arc};

use tauri::Manager;
use tokio::task::JoinSet;

use crate::{AppError, logger::CrashLogger};

#[tauri::command]
pub async fn generate_thumbnails(
    app_handle: tauri::AppHandle,
    videos: Vec<super::F>,
    lock: tauri::State<'_, super::ProcessingLock>,
) -> Result<(), AppError> {
    let _guard = lock.0.lock().await;
    let mut cmd = Command::new("ffmpeg");

    // Apply the flag only on Windows (0x08000000 is CREATE_NO_WINDOW)
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000);
    }

    let ffmpeg = cmd.arg("-version").output();

    if ffmpeg.is_err() {
        return Err(AppError::new("FFMPEG is not installed".to_string()));
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
    Ok(())
}

async fn generate_one(dir: Arc<std::path::PathBuf>, video: super::F) {
    let out_path = dir.join(format!("{}.webp", video.filmId));
    if out_path.exists() {
        return;
    }

    for ts in ["00:02:00", "00:00:05", "00:00:00"] {
        match try_extract_frame(&video.path, &out_path, ts).await {
            Ok(true) => return, // success, thumbnail written
            Ok(false) => {
                eprintln!(
                    "ffmpeg produced no output for {} at {}, trying next timestamp",
                    video.filmId, ts
                );
            }
            Err(e) => {
                eprintln!(
                    "ffmpeg failed for {} at {}: {:?}, trying next timestamp",
                    video.filmId, ts, e
                );
            }
        }
    }

    eprintln!(
        "giving up on thumbnail for {} after all timestamps failed",
        video.filmId
    );
}

/// Attempts to extract a single frame at `timestamp`.
/// Returns Ok(true) on success, Ok(false) if ffmpeg ran but produced no file,
/// Err if the process itself failed to spawn/run.
async fn try_extract_frame(
    src: &str,
    out_path: &std::path::Path,
    timestamp: &str,
) -> std::io::Result<bool> {
    let mut cmd = tokio::process::Command::new("ffmpeg");
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.as_std_mut().creation_flags(0x08000000);
    }

    let output = cmd
        .args([
            "-y",
            "-ss",
            timestamp,
            "-i",
            src,
            "-an",
            "-vf",
            "scale=1280:-1",
            "-vframes",
            "1",
        ])
        .arg(out_path)
        .output()
        .await?;

    Ok(output.status.success() && out_path.exists())
}