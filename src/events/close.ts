import { getAllWindows } from "@tauri-apps/api/window";
import { BaseDirectory, writeTextFile } from "@tauri-apps/plugin-fs";
import { unwrap } from "solid-js/store";
import { state } from "~/state";
import {revalidate} from "@solidjs/router"
import { getFilms } from "~/api/data";
import { loadPlaylist, loadVideos } from "~/utils/loadPlaylist";
import { openSettingsWindow } from "~/utils/openSettingsWindow";

export type SessionJSON = {
    list: typeof state['sidePanel']['list'],
    sidePanelWidth: number,
    treeWidth: number,
}

getAllWindows().then(windows => {
    const mainWindow = windows.find(w => w.label === "main")!
    
    mainWindow.listen("tauri://close-requested", async e => {
        const data: SessionJSON = {
            list: unwrap(state.sidePanel.list),
            sidePanelWidth: unwrap(state.sidePanel.width),
            treeWidth: unwrap(state.tree.width)
        };
        
        await writeTextFile("session.json", JSON.stringify(data), {
            baseDir: BaseDirectory.AppData
        });
        mainWindow.destroy();
    })

    mainWindow.listen("update-films", async () => {
        state.status.setStatus("Scanning for new files")
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
})
