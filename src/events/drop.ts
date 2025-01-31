import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { sep } from "@tauri-apps/api/path";
import { processPlaylist } from "../components/TopBar/getFilmDetails";
import { state } from "../state";
import videoExtensions from "../videoExtensions.json"

type E = {
    paths: string[];
    position: {
        x: number;
        y: number;
    }
}

listen<E>("tauri://drag-drop", async event => {
    const pos = event.payload.position
    const target = document.elementFromPoint(pos.x, pos.y);
    const elem = target?.closest<HTMLElement>(".droppable")
    if (!elem) return;

    const files = event.payload.paths
    for (const path of files) {
        let idx = path.lastIndexOf(".")
        if (idx < 0) 
            continue;
        
        const extension = path.slice(idx + 1);
        if (!extension) continue;

        const i = elem.dataset.i === undefined ? state.sidePanel.list.length : Number(elem.dataset.i)

        if (["mpcpl", "asx", "m3u", "pls"].includes(extension)) {
            const fileList: { title: string; path: string; }[] = await invoke("read_playlist", {
                playlist: path
            });
            const playlist = await processPlaylist(fileList); 
            state.sidePanel.insertAt(i, playlist)
        }
        if (videoExtensions.includes(extension)) {
            const title = path.slice(path.lastIndexOf(sep()) + 1)
            const playlist = await processPlaylist([{title, path}]);
            state.sidePanel.insertAt(i, playlist)
        }
    }
})