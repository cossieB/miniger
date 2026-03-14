use std::process::Command;

use crate::AppError;

#[tauri::command]
pub async fn transcode(src: String, dest: String) -> Result<(), AppError> {
    process(&src, &dest);
    Ok(())
}

fn process(src: &String, dest: &String) {
    let args = [
            "ffmpeg", 
            "-i", src, 
            "-c:v", "libx264", 
            "-preset", "fast", 
            "-crf", "23", 
            "-c:a", "copy", 
            dest];
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
        .arg("/C")
        .arg("start")
        .args(&args)
        .output()
        .expect("Couldn't start FFMPEG");
    }
    #[cfg(target_os = "macos")] 
    {
        Command::new("osascript")
        .args(&["-e", format!("tell app \"Terminal\" to do script \"ffmpeg -i '{}' -c:v libx264 -preset fast -crf 23 -c:a copy '{}'\"", src, dest)])
        .output()
        .expect("Couldn't start FFMPEG")
    }
    #[cfg(target_os = "linux")]
    {
        Command::new("xterm")
        .arg("-e")
        .args(&args)
        .output()
        .expect("Couldn't start FFMPEG")
    }
}

