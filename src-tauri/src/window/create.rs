use tauri::{AppHandle, Emitter, Listener, Manager, WebviewUrl, WebviewWindow};

use crate::logger::logger;

pub fn create_window(app: &AppHandle, label: &str, url: &str, options: super::WindowSettings) {
    let builder = WebviewWindow::builder(app, label, WebviewUrl::App(url.into()));
    let mut builder = builder
        .title(options.title)
        .drag_and_drop(options.drag_drop_enabled)
        .maximized(options.maximized)
        .inner_size(options.width, options.height)
        .always_on_top(options.always_on_top)
        .minimizable(options.minimizable)
        .maximizable(options.maximizable);

    if options.center {
        builder = builder.center();
    }
    let window = builder.build();

    match window {
        Ok(window) => {
            let main_window = app.get_webview_window("main").unwrap();
            if options.disable_main {
                let _ = main_window.set_enabled(false);
            };
            window.listen("tauri://close-requested", move |_| {
                let _ = main_window.set_enabled(true);
            });
        }
        Err(error) => match error {
            tauri::Error::WindowLabelAlreadyExists(_)
            | tauri::Error::WebviewLabelAlreadyExists(_) => {
                let existing_window = app.get_webview_window(label);
                if let Some(existing) = existing_window {
                    let _ = existing.set_focus();
                }
            }
            _ => {
                let _ = app.emit_to(
                    "main",
                    "set-status",
                    "Could not open window. Please try again",
                );
                logger(app, error.to_string().as_bytes());
            }
        },
    }
}
