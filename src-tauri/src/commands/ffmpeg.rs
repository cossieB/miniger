use std::{process::Command, thread};

use serde::{Deserialize, Serialize};
use tauri::{Emitter, Manager};

#[derive(Serialize, Deserialize)]
#[allow(non_snake_case)]
pub struct F {
    path: String,
    filmId: i32,
}

#[tauri::command]
pub async fn generate_thumbnails(app_handle: tauri::AppHandle, videos: Vec<F>) {
    let dir = app_handle.path().app_data_dir().unwrap().join("thumbs");
    let handle = thread::spawn(move || {
        for video in &videos {
            let mut cmd = Command::new("ffmpeg");
            cmd.arg("-y")
                .arg("-ss")
                .arg("00:02:00")
                .arg("-i")
                .arg(video.path.clone())
                .arg("-vf")
                .arg("scale=720:-1")
                .arg("-vframes")
                .arg("1")
                .arg(dir.join(format!("{}{}", video.filmId, ".jpg")));

            let output = cmd.output();

            if let Err(e) = output {
                println!("{:?}", e)
            }
        }
    });
    handle.join().unwrap();
    println!("DONE");
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
    format: FFprobeFormat
}

#[tauri::command]
pub async fn get_metadata(app: tauri::AppHandle, videos: Vec<F>) -> Vec<Option<FfprobeMetadata>> {
    let mut vec: Vec<Option<FfprobeMetadata>> = Vec::with_capacity(videos.len());
    
    for (i, video) in videos.iter().enumerate() {
        let mut cmd = Command::new("ffprobe");
        cmd.arg("-v")
            .arg("quiet")
            .arg("-print_format")
            .arg("json")
            .arg("-show_format")
            .arg("-show_streams")
            .arg(format!("{}", video.path));

        let result = cmd.output();
        if i % 50 == 0 {
            let _ = app.emit_to("main", "set-status", format!("Getting metadata .... {}%",  (100 * (i + 1)) as f64 / videos.len() as f64));
        }
        match result {
            Ok(out) => {
                let o = out.stdout;
                let o = String::from_utf8(o);
                match o {
                    Ok(v) => {
                        println!("{v}");
                        let data: Option<FfprobeMetadata> = serde_json::from_str(&v).ok();
                        vec.push(data);
                    },
                    Err(_) => {
                        vec.push(None);
                    },
                }
            },
            Err(_) => todo!(),
        }
    }
    
    return vec;
}

