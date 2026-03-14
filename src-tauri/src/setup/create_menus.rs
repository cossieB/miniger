use std::{os::windows::process::CommandExt, process::Command};

use tauri::{
    App, Manager, menu::{MenuBuilder, SubmenuBuilder}
};

pub fn create_menus(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    let app_submenu = SubmenuBuilder::new(app, "App")
        .text("load_playlist", "Load Playlist File")
        .text("load_videos", "Load Videos")
        .text("scan_folders", "Scan Folders")
        .text("play_playlist", "Play Playlist")
        .text("open_drag_drop", "Drop Files")
        .quit()
        .build()?;

    let tools_submenu = SubmenuBuilder::new(app, "Tools")
        .text("convert_playlist", "Convert Playlist")
        .text("data_dir", "Show data folder")
        .build()?;

    let ffmpeg_submenu = SubmenuBuilder::new(app, "FFMpeg")
        .text("thumbs", "Generate Thumbnails")
        .text("metadata", "Get Metadata")
        .text("transcode", "Convert Videos")
        .enabled(
            Command::new("ffmpeg")
                .creation_flags(0x08000000)
                .output()
                .is_ok(),
        )
        .build()?;

    let menu = MenuBuilder::new(app)
        .items(&[&app_submenu, &tools_submenu, &ffmpeg_submenu])
        .build()?;

    let main = app.get_webview_window("main").unwrap();
    main.set_menu(menu)?;
    Ok(())
}
