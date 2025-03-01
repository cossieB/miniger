import { invoke } from "@tauri-apps/api/core";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export async function openSettingsWindow() {
    const window = new WebviewWindow("settings", {
        alwaysOnTop: true,
        center: true,
        height: 600,
        width: 600,
        url: "/settings",
        maximizable: false,
        minimizable: false,
    })
    window.once("tauri://created", () => {

    })
    window.once("tauri://error", (e) => {
        invoke("echo", { string: JSON.stringify(e.payload) });

    })
}