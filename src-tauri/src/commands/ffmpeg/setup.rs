use ffmpeg_sidecar::{
    download::{FfmpegDownloadProgressEvent, auto_download_with_progress},
    ffprobe::ffprobe_version,
    version::ffmpeg_version,
};
use serde::{Deserialize, Serialize};
use tauri::Emitter;

use crate::AppError;

#[tauri::command]
pub async fn download_ffmpeg_if_missing(app_handle: tauri::AppHandle) -> Result<(), AppError> {
    auto_download_with_progress(|event| match event {
        FfmpegDownloadProgressEvent::Starting => {
            let _ = app_handle.emit_to("main","set-status", "Downloading Ffmpeg...");
            let _ = app_handle.emit("ffmpeg_progress", Status{
                downloaded: None,
                is_downloading: Some(true),
                total: None
            });
        }
        FfmpegDownloadProgressEvent::Downloading {
            total_bytes,
            downloaded_bytes,
        } => {
            let _ = app_handle.emit(
                "ffmpeg_progress",
                Status {
                    downloaded: Some(downloaded_bytes),
                    total: Some(total_bytes),
                    is_downloading: None
                },
            );
        }
        FfmpegDownloadProgressEvent::UnpackingArchive => {
            let _ = app_handle.emit("set-status", "Extractive Archive...");
        }
        FfmpegDownloadProgressEvent::Done => {
            let _ = app_handle.emit("set-status", "✔️ Ffmpeg succesfully installed. Please restart the app for the changes to be reflected.");
        }
    })
    .map_err(|e| AppError::new(format!("Error downloading ffmpeg: {:?}", e)))?;
    Ok(())
}

#[tauri::command]
pub fn ffmpeg_details() -> FfmpegVersion {
    FfmpegVersion {
        ffprobe: ffprobe_version().unwrap_or_default(),
        ffmpeg: ffmpeg_version().unwrap_or_default(),
    }
}

#[derive(Serialize, Deserialize, Clone)]
struct Status {
    downloaded: Option<u64>,
    total: Option<u64>,
    is_downloading: Option<bool>
}

#[derive(Serialize, Deserialize)]
pub struct FfmpegVersion {
    pub ffprobe: String,
    pub ffmpeg: String,
}