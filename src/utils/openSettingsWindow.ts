import { invoke } from "@tauri-apps/api/core";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export async function openSettingsWindow() {
    try {
        const window = new WebviewWindow("settings", {
            alwaysOnTop: true,
            center: true,
            height: 600,
            width: 600,
            url: "/settings"
        })
        window.once("tauri://created", (e) => {
            
        })
        window.once("tauri://error", (e) => {
            invoke("echo", {string: JSON.stringify(e.payload)});

        })
    } catch (error) {
        console.error(error);
    }
}