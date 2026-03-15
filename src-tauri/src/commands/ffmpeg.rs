use std::{os::windows::process::CommandExt, process::Command, thread};

use serde::{Deserialize, Serialize};
use tauri::{Emitter, Manager};
use tauri_plugin_log::log::warn;

use crate::{logger::CrashLogger, AppError};

#[derive(Serialize, Deserialize)]
#[allow(non_snake_case)]
pub struct F {
    path: String,
    filmId: i32,
}

#[tauri::command]
pub async fn generate_thumbnails(app_handle: tauri::AppHandle, videos: Vec<F>) {
    let dir = app_handle
        .path()
        .app_data_dir()
        .unwrap_or_log_fatal()
        .join("thumbs");
    let handle = thread::spawn(move || {
        for video in &videos {
            let output = Command::new("ffmpeg")
                .creation_flags(0x08000000)
                .arg("-y")
                .arg("-ss")
                .arg("00:02:00")
                .arg("-i")
                .arg(video.path.clone())
                .arg("-vf")
                .arg("scale=720:-1")
                .arg("-vframes")
                .arg("1")
                .arg(dir.join(format!("{}{}", video.filmId, ".jpg")))
                .output();

            if let Err(e) = output {
                println!("{:?}", e)
            }
        }
    });
    handle.join().unwrap();
}

#[derive(Serialize, Deserialize)]
pub struct FFprobeStream {
    codec_name: String,
    codec_type: String,
    width: Option<i32>,
    height: Option<i32>,
}

#[derive(Serialize, Deserialize)]
pub struct FFprobeFormat {
    duration: String,
    size: String,
    bit_rate: String,
}

#[derive(Serialize, Deserialize)]
pub struct FfprobeMetadata {
    streams: Vec<FFprobeStream>,
    format: FFprobeFormat,
}

#[derive(Serialize, Deserialize)]
#[allow(non_snake_case)]
pub struct Response {
    filmId: i32,
    metadata: FfprobeMetadata,
}

#[tauri::command]
pub async fn get_metadata(
    app: tauri::AppHandle,
    videos: Vec<F>,
) -> Result<Vec<Response>, AppError> {
    let ffprobe = Command::new("ffprobe")
        .creation_flags(0x08000000)
        .arg("-version")
        .output();
    if let Err(_) = ffprobe {
        return Err(AppError::new("ffprobe is not installed".to_string()));
    }

    let mut vec: Vec<Response> = Vec::with_capacity(videos.len());
    for (i, video) in videos.iter().enumerate() {
        let result = Command::new("ffprobe")
            .creation_flags(0x08000000)
            .arg("-v")
            .arg("quiet")
            .arg("-print_format")
            .arg("json")
            .arg("-show_format")
            .arg("-show_streams")
            .arg(format!("{}", video.path))
            .output();

        if i % 50 == 0 {
            let percentage = (100 * (i + 1)) as f64 / videos.len() as f64;
            update_frontend(&app, percentage);
        }
        let Ok(out) = result else {
            println!("{:#?}", result);
            continue;
        };

        let temp = out.stdout;
        let o = String::from_utf8(temp);

        let Ok(str) = o else {
            println!("{:#?}", o);
            continue;
        };
        let json = serde_json::from_str::<FfprobeMetadata>(&str);
        match json {
            Ok(metadata) => {
                vec.push(Response { filmId: video.filmId, metadata });
            },
            Err(e) => {
                warn!("{} at path {}", e, video.path);
            }
        }
        if let Ok(metadata) = serde_json::from_str::<FfprobeMetadata>(&str) {
            vec.push(Response {
                filmId: video.filmId,
                metadata,
            });
        }
    }
    update_frontend(&app, 100.into());
    return Ok(vec);
}

fn update_frontend(app: &tauri::AppHandle, percentage: f64) {
    let _ = app.emit_to(
        "main",
        "set-status",
        format!("Getting metadata .... {percentage}%"),
    );
}
