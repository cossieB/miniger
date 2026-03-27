use std::{os::windows::process::CommandExt, process::Command};

use serde::{Deserialize, Serialize};
use tauri::Emitter;
use tauri_plugin_log::log;

use crate::AppError;

#[tauri::command]
pub async fn get_metadata(
    app: tauri::AppHandle,
    videos: Vec<super::F>,
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
        let json = serde_json::from_str::<super::FfprobeMetadata>(&str);
        match json {
            Ok(metadata) => {
                vec.push(Response { filmId: video.filmId, metadata });
            },
            Err(e) => {
                log::warn!("{} at path {}", e, video.path);
            }
        }
        if let Ok(metadata) = serde_json::from_str::<super::FfprobeMetadata>(&str) {
            vec.push(Response {
                filmId: video.filmId,
                metadata,
            });
        }
    }
    update_frontend(&app, 100.0);
    return Ok(vec);
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
