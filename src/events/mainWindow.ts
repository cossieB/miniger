import { getAllWindows } from "@tauri-apps/api/window";
import { BaseDirectory, writeTextFile } from "@tauri-apps/plugin-fs";
import { unwrap } from "solid-js/store";
import { state } from "~/state";
import { revalidate } from "@solidjs/router"
import { loadPlaylist, loadVideos } from "~/features/movies/utils/loadPlaylist";
import { createTempPlaylist } from "~/features/movies/utils/createTempPlaylist";
import { updateMetadata } from "~/features/movies/utils/updateMetadata";
import { getFilmsWithoutMetadata } from "~/repositories/filmsRepository";
import { getFilms } from "~/features/movies";
import { activeView } from "~/layouts/main-window/top-bar/ViewToggle";
import { movieGridSort } from "~/features/movies/contexts/MovieGridContext";
import type { SessionJSON } from "~/utils/session";

getAllWindows().then(windows => {
    const mainWindow = windows.find(w => w.label === "main")!

    mainWindow.listen<string>("set-status", e => {
        state.status.setStatus(e.payload)
    })

    mainWindow.listen("tauri://close-requested", async e => {
        const data: SessionJSON = {
            location: window.location.pathname + window.location.search,
            view: activeView(),
            sort: movieGridSort(),
            list: unwrap(state.sidePanel.list).map(file => {
                const {title, path} = file;
                return {title, path}
            }),
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

    mainWindow.listen("metadata", async () => {
        const videos = await getFilmsWithoutMetadata()
        updateMetadata(videos)
    })
})

