use std::{process::Command, thread};

use serde::{Deserialize, Serialize};
use tauri::Manager;

#[derive(Serialize, Deserialize)]
#[allow(non_snake_case)]
pub struct F {
    path: String,
    filmId: i32,
}

#[tauri::command]
pub async  fn generate_thumbnails(app_handle: tauri::AppHandle, videos: Vec<F>) {
    let dir = app_handle.path().app_data_dir().unwrap().join("thumbs");
    let handle = thread::spawn(move|| { 
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
