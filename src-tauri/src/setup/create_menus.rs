use ffmpeg_sidecar::command::ffmpeg_is_installed;
use tauri::{
    App, Manager,
    menu::{MenuBuilder, SubmenuBuilder},
};

pub fn create_menus(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    let app_submenu = SubmenuBuilder::new(app, "App")
        .text("load_playlist", "Load Playlist File")
        .text("load_videos", "Load Videos")
        .text("settings", "Scan Folders")
        .text("play_playlist", "Play Playlist")
        .text("open_drag_drop", "Drop Files")
        .quit()
        .build()?;

    let tools_submenu = SubmenuBuilder::new(app, "Tools")
        .text("tmdb", "The Movie Database")
        .text("convert_playlist", "Convert Playlist")
        .text("data_dir", "Show data folder")
        .build()?;

    let builder = SubmenuBuilder::new(app, "FFMPEG");

    let ffmpeg_submenu = if ffmpeg_is_installed() {
        builder
            .text("thumbs", "Generate Thumbnails")
            .text("metadata", "Get Metadata")
            .text("transcode", "Convert Videos")
            .text("ffmpeg_version", "Version")
            .build()?
    } else {
        builder.text("ffmpeg_version", "Download FFMPEG").build()?
    };

    let menu = MenuBuilder::new(app)
        .items(&[&app_submenu, &tools_submenu, &ffmpeg_submenu])
        .build()?;

    let main = app.get_webview_window("main").unwrap();
    main.set_menu(menu)?;
    Ok(())
}
