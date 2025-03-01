import { getAllWindows } from "@tauri-apps/api/window";
import { BaseDirectory, writeTextFile } from "@tauri-apps/plugin-fs";
import { unwrap } from "solid-js/store";
import { state } from "~/state";
import {revalidate} from "@solidjs/router"
import { getFilms } from "~/api/data";
import { loadPlaylist, loadVideos } from "~/utils/loadPlaylist";
import { openSettingsWindow } from "~/utils/openSettingsWindow";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { invoke } from "@tauri-apps/api/core";

export type SessionJSON = {
    list: typeof state['sidePanel']['list'],
    sidePanelWidth: number,
    treeWidth: number,
}

getAllWindows().then(windows => {
    const mainWindow = windows.find(w => w.label === "main")!
    
    mainWindow.listen<string>("set-status", e => {
        state.status.setStatus(e.payload)
    })

    mainWindow.listen("tauri://close-requested", async e => {
        const data: SessionJSON = {
            list: unwrap(state.sidePanel.list),
            sidePanelWidth: unwrap(state.sidePanel.width) / window.innerWidth,
            treeWidth: unwrap(state.tree.width) / window.innerWidth,
        };
        
        await writeTextFile("session.json", JSON.stringify(data), {
            baseDir: BaseDirectory.AppData
        });
        mainWindow.destroy();
    })

    mainWindow.listen("update-films", async () => {
        await revalidate(getFilms.key)
        state.status.clear();
    })

    mainWindow.listen("load_playlist", async () => {
        loadPlaylist()
    })
    mainWindow.listen("load_videos", async () => {
        loadVideos()
    })
    mainWindow.listen("scan_folders", () => {
        openSettingsWindow()
    })
    mainWindow.listen("convert_playlist", () => {
        const window = new WebviewWindow("convert", {
            alwaysOnTop: true,
            center: true,
            height: 300,
            width: 600,
            url: "/convert",
            maximizable: false,
            minimizable: false,
            title: "Convert Playlist"
        })
        window.once("tauri://created", () => {
    
        })
        window.once("tauri://error", (e) => {
            invoke("echo", { string: JSON.stringify(e.payload) });
    
        })
    })
})
