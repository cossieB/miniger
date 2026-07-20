use serde::{Deserialize, Serialize};
use std::sync::Arc;
use std::sync::atomic::{AtomicUsize, Ordering};
use tauri::Emitter;
use tauri_plugin_log::log;
use tokio::process::Command;
use tokio::task::JoinSet;

use crate::AppError;

#[tauri::command]
pub async fn get_metadata(
    app: tauri::AppHandle,
    videos: Vec<super::F>,
    lock: tauri::State<'_, super::ProcessingLock>,
) -> Result<Vec<Response>, AppError> {
    let _guard = lock.0.lock().await;
    let mut cmd = Command::new("ffprobe");
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.as_std_mut().creation_flags(0x08000000);
    }
    let ffprobe = cmd.arg("-version").output().await;

    if ffprobe.is_err() {
        return Err(AppError::new("ffprobe is not installed".to_string()));
    }

    let total = videos.len();
    let concurrency = std::thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(4);

    let completed = Arc::new(AtomicUsize::new(0));
    let mut videos_iter = videos.into_iter();
    let mut set = JoinSet::new();

    for video in videos_iter.by_ref().take(concurrency) {
        let completed = Arc::clone(&completed);
        set.spawn(probe_one(video, completed));
    }

    let mut vec: Vec<Response> = Vec::with_capacity(total);

    while let Some(res) = set.join_next().await {
        if let Some(video) = videos_iter.next() {
            let completed = Arc::clone(&completed);
            set.spawn(probe_one(video, completed));
        }

        match res {
            Ok(Some(response)) => vec.push(response),
            Ok(None) => {} // logged inside probe_one
            Err(e) => log::warn!("task join error: {e}"),
        }

        let done = completed.load(Ordering::Relaxed);
        if done % 50 == 0 || done == total {
            let percentage = (100 * done) as f64 / total as f64;
            update_frontend(&app, percentage);
        }
    }

    update_frontend(&app, 100.0);
    Ok(vec)
}

async fn probe_one(video: super::F, completed: Arc<AtomicUsize>) -> Option<Response> {
    let mut cmd = Command::new("ffprobe");

    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.as_std_mut().creation_flags(0x08000000);
    }
    let result = cmd
        .args([
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            &video.path,
        ])
        .output()
        .await;

    completed.fetch_add(1, Ordering::Relaxed);

    let out = match result {
        Ok(out) => out,
        Err(e) => {
            log::warn!("ffprobe failed for {}: {:?}", video.path, e);
            return None;
        }
    };

    let str = match String::from_utf8(out.stdout) {
        Ok(s) => s,
        Err(e) => {
            log::warn!("invalid utf8 from ffprobe for {}: {:?}", video.path, e);
            return None;
        }
    };

    match serde_json::from_str::<super::FfprobeMetadata>(&str) {
        Ok(metadata) => Some(Response {
            filmId: video.filmId,
            metadata,
        }),
        Err(e) => {
            log::warn!("{} at path {}", e, video.path);
            None
        }
    }
}

fn update_frontend(app: &tauri::AppHandle, percentage: f64) {
    let _ = app.emit_to(
        "main",
        "set-status",
        format!("Getting metadata .... {percentage}%"),
    );
}
#[derive(Serialize, Deserialize)]
#[allow(non_snake_case)]
pub struct Response {
    filmId: i32,
    metadata: super::FfprobeMetadata,
}
