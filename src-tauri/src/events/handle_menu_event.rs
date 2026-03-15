use tauri::menu::MenuEvent;
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_opener::open_path;

use crate::window;

pub fn handle_menu_event(app: &AppHandle, event: MenuEvent) {
    match event.id().as_ref() {
        "transcode" => {
            window::create_window(
                &app,
                "transcode",
                "/transcode",
                window::WindowSettings {
                    title: "Convert Videos".into(),
                    maximized: true,
                    ..Default::default()
                },
            );
        }
        "settings" => {
            window::create_window(
                &app,
                "settings",
                "/settings",
                window::WindowSettings {
                    always_on_top: true,
                    height: 600_f64,
                    width: 600_f64,
                    maximizable: false,
                    minimizable: false,
                    ..Default::default()
                },
            );
        }
        "convert_playlist" => {
            window::create_window(
                &app,
                "convert",
                "/convert",
                window::WindowSettings {
                    always_on_top: true,
                    height: 300_f64,
                    width: 600_f64,
                    maximizable: false,
                    minimizable: false,
                    title: "Convert Playlist".into(),
                    ..Default::default()
                },
            );
        }
        "open_drag_drop" => {
            window::create_window(
                &app,
                "drag-drop",
                "/dragdrop",
                window::WindowSettings {
                    title: "Drop Files".into(),
                    drag_drop_enabled: true,
                    ..Default::default()
                },
            );            
        }
        "thumbs" => {
            window::create_window(
                &app,
                "thumbs",
                "/thumbs",
                window::WindowSettings {
                    maximized: true,
                    title: "Thumbnails".into(),
                    ..Default::default()
                },
            );            
        }
        "data_dir" => {
            let dir = app.path().app_data_dir();
            if let Ok(dir) = dir {
                let _ = open_path(dir, None::<&str>);
            }
        }
        _ => {
            let _ = app.emit_to("main", &event.id.as_ref(), 1);
        }
    }
}
