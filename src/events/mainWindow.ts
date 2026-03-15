import { getAllWindows } from "@tauri-apps/api/window";
import { BaseDirectory, writeTextFile } from "@tauri-apps/plugin-fs";
import { unwrap } from "solid-js/store";
import { state } from "~/state";
import { revalidate } from "@solidjs/router"
import { getFilms } from "~/api/data";
import { loadPlaylist, loadVideos } from "~/utils/loadPlaylist";
import { appDataDir, } from "@tauri-apps/api/path";
import { openPath } from "@tauri-apps/plugin-opener";
import { createTempPlaylist } from "~/utils/createTempPlaylist";
import { updateMetadata } from "~/utils/updateMetadata";

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
    
    mainWindow.listen("play_playlist", async () => {
        await createTempPlaylist(state.sidePanel.list)
    })

    mainWindow.listen("drop_ready", (e) => {
        mainWindow.emitTo("drag-drop", "sidepanel-files", state.sidePanel.list.map(x => ({ title: x.title, path: x.path })))
    })
    mainWindow.listen<typeof state['sidePanel']['list']>("files-dropped", e => {
        state.sidePanel.setFiles(e.payload);
    })
    mainWindow.listen("data_dir", async () => {
        try {
            openPath(await appDataDir())
        } 
        catch (error) {
            console.error(error)
        }
    })
    mainWindow.listen("metadata", updateMetadata)
})

