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

let prevElem: HTMLElement | null = null;

getAllWindows().then(async windows => {
    const dropWindow = windows.find(w => w.label === "drag-drop")
    const unlisten = await dropWindow?.listen<E>("tauri://drag-drop", async event => {
        prevElem?.classList.remove("pt-5")
        prevElem = null;
        const pos = event.payload.position
        const target = document.elementFromPoint(pos.x, pos.y) as HTMLLIElement | null;
            
        const files = event.payload.paths
        for (const path of files) {
            let idx = path.lastIndexOf(".")
            if (idx < 0) 
                continue;
            
            const extension = path.slice(idx + 1);
            if (!extension) continue;
    
            const i = target?.dataset.i === undefined ? state.sidePanel.list.length : Number(target.dataset.i)
    
            if (["mpcpl", "asx", "m3u", "pls"].includes(extension.toLowerCase())) {
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

    await dropWindow?.listen<E>("tauri://drag-over", e => {
        const pos = e.payload.position
        const target = document.elementFromPoint(pos.x, pos.y) as HTMLLIElement | null;

        if (!target || !target.classList.contains("sidepanel-item")) {
            prevElem?.classList.remove("pt-5")
            prevElem = null;
            return
        };
        prevElem?.classList.remove("pt-5")
        target.classList.add("pt-5")
        prevElem = target
    })

    await dropWindow?.listen<E>("tauri://drag-leave", e => {
        prevElem?.classList.remove("pt-5")
        prevElem = null;
    })
    dropWindow?.onCloseRequested(() => unlisten?.())
});
