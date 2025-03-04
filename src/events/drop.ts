import { invoke } from "@tauri-apps/api/core";
import { sep } from "@tauri-apps/api/path";
import { state } from "../state";
import videoExtensions from "../videoExtensions.json"
import { getAllWindows } from "@tauri-apps/api/window";

type E = {
    paths: string[];
    position: {
        x: number;
        y: number;
    }
}
getAllWindows().then(async windows => {
    const dropWindow = windows.find(w => w.label === "drop")
    const unlisten = await dropWindow?.listen<E>("tauri://drag-drop", async event => {
        const pos = event.payload.position
        const target = document.elementFromPoint(pos.x, pos.y);
        const elem = target?.closest<HTMLElement>(".droppable"); console.log(target, elem)
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
                state.sidePanel.insertAt(i, fileList)
            }
            if (videoExtensions.includes(extension)) {
                const title = path.slice(path.lastIndexOf(sep()) + 1)
                state.sidePanel.insertAt(i, [{title, path}])
            }
        }
    })
    dropWindow?.onCloseRequested(() => unlisten?.())
});
