import { getAllWindows } from "@tauri-apps/api/window";
import { BaseDirectory, writeTextFile } from "@tauri-apps/plugin-fs";
import { unwrap } from "solid-js/store";
import { state } from "~/state";
import { revalidate } from "@solidjs/router"
import { getFilms } from "~/api/data";
import { loadPlaylist, loadVideos } from "~/utils/loadPlaylist";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { invoke } from "@tauri-apps/api/core";
import { join, tempDir, } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-shell";

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
            mainWindow.setEnabled(false)
        })
        window.once("tauri://error", (e) => {
            invoke("echo", { string: JSON.stringify(e.payload) });
        })
        window.onCloseRequested(() => {
            mainWindow.setEnabled(true)
        })
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
            mainWindow.setEnabled(false)
        })
        window.once("tauri://error", (e) => {
            invoke("echo", { string: JSON.stringify(e.payload) });
        })
        window.onCloseRequested(() => {
            mainWindow.setEnabled(true)
        })
    })
    mainWindow.listen("play_playlist", async () => {
        try {
            const path = await join(await tempDir(), "mngr_temp.m3u")
            await invoke("save_playlist", {
                path,
                files: state.sidePanel.list
            })
            open(path)
        } catch (error) {
            state.status.setStatus(String(error))
        }
    })
    mainWindow.listen("open_drag_drop", () => {
        const window = new WebviewWindow("drag-drop", {
            url: "/dragdrop",
            dragDropEnabled: true,
            title: "Drop files",
        })
        window.once("tauri://created", (e) => {
            mainWindow.setEnabled(false)
        })
        window.once("tauri://error", (e) => {
            invoke("echo", { string: JSON.stringify(e.payload) });

        })
        window.onCloseRequested(() => {
            mainWindow.setEnabled(true)
        })
    })
    mainWindow.listen("drop_ready", (e) => {
        mainWindow.emitTo("drag-drop", "sidepanel-files", state.sidePanel.list.map(x => ({ title: x.title, path: x.path })))
    })
    mainWindow.listen<typeof state['sidePanel']['list']>("files-dropped", e => {
        state.sidePanel.setFiles(e.payload);
    })
})
