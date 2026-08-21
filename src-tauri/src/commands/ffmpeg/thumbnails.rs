use crate::{AppError, logger::CrashLogger};
use ffmpeg_sidecar::command::{FfmpegCommand, ffmpeg_is_installed};
use std::{path::PathBuf, sync::Arc};
use tauri::Manager;
use tokio::task::JoinSet;

#[tauri::command]
pub async fn generate_thumbnails(
    app_handle: tauri::AppHandle,
    videos: Vec<super::F>,
    lock: tauri::State<'_, super::ProcessingLock>,
) -> Result<(), AppError> {
    let _guard = lock.0.lock().await;

    if !ffmpeg_is_installed() {
        return Err(AppError::new("FFMPEG is not installed".to_string()));
    }

    let dir = Arc::new(
        app_handle
            .path()
            .app_data_dir()
            .unwrap_or_log_fatal()
            .join("images/thumbs"),
    );

    let concurrency = std::thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(4);

    let mut videos_iter = videos.into_iter();
    let mut set = JoinSet::new();

    for video in videos_iter.by_ref().take(concurrency) {
        let dir = Arc::clone(&dir);
        set.spawn(generate_one(dir, video));
    }

    while let Some(_) = set.join_next().await {
        if let Some(video) = videos_iter.next() {
            let dir = Arc::clone(&dir);
            set.spawn(generate_one(dir, video));
        }
    }
    Ok(())
}

async fn generate_one(dir: Arc<PathBuf>, video: super::F) {
    let out_path = dir.join(format!("{}.webp", video.filmId));
    if out_path.exists() {
        return;
    }

    for ts in ["00:02:00", "00:00:05", "00:00:00"] {
        match try_extract_frame(video.path.clone(), out_path.clone(), ts).await {
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

async fn try_extract_frame(
    src: String,
    out_path: PathBuf,
    timestamp: &'static str,
) -> std::io::Result<bool> {
    tokio::task::spawn_blocking(move || -> std::io::Result<bool> {
        let mut cmd = FfmpegCommand::new();

        cmd.hide_banner()
            .create_no_window()
            .overwrite() // -y; also stops ffmpeg hanging on a stdin overwrite prompt
            .args(["-ss", timestamp])
            .input(&src)
            .args(["-an", "-vf", "scale=1280:-1", "-vframes", "1"])
            .output(out_path.to_string_lossy());

        let mut child = cmd
            .spawn()
            .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e.to_string()))?;

        child
            .iter()
            .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e.to_string()))?
            .for_each(|_event| {});

        Ok(out_path.exists())
    })
    .await
    .unwrap_or_else(|e| {
        Err(std::io::Error::new(
            std::io::ErrorKind::Other,
            e.to_string(),
        ))
    })
}
