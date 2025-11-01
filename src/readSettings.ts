import { readTextFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import { state } from "./state";
import { SessionJSON } from "./events/mainWindow";
import { WatchJSON } from "./windows/Settings";
import { readDirectories } from "./utils/readDirectories";
import { filterMap } from "./lib/filterMap";
import { onMount } from "solid-js";
import { createAsync, useAction, useNavigate } from "@solidjs/router";
import { addDirectoriesToDatabase } from "./api/mutations";
import { sleep } from "./lib/sleep";
import { getFilms } from "./api/data";

export async function readSession() {
    const navigate = useNavigate()
    try {
        const content = await readTextFile("session.json", {
            baseDir: BaseDirectory.AppData
        })

        const settings = JSON.parse(content) as SessionJSON

        state.sidePanel.setFiles(settings.list ?? [])
        settings.treeWidth && state.tree.setWidth(settings.treeWidth * window.innerWidth)
        settings.sidePanelWidth && state.sidePanel.setWidth(settings.sidePanelWidth * window.innerWidth)
    } catch (error) { }

    finally {
        navigate("/")
    }
}

async function readWatchJson() {
    await sleep(1000)
    try {
        const content = await readTextFile("watch.json", {
            baseDir: BaseDirectory.AppData
        })
        const data = JSON.parse(content) as WatchJSON[];
        const t = filterMap(data, val => val.scanOnStart, val => val.path)
        if (t.length == 0) return;
        const files = await readDirectories(t)
        return files
    } catch (error) {
        console.error(error);
        state.status.setStatus(String(error))
    }
}

export function useWatchJson() {
    const films = createAsync(() => getFilms())
    const action = useAction(addDirectoriesToDatabase)
    onMount(async () => {
        try {
            const files = await readWatchJson()
            if (!files?.length) return
            state.status.setStatus("Reading files....")
            const paths = new Set((films.latest ?? []).map(f => f.path))
            const newFiles = files.filter(f => !paths.has(f.path))
            await action(newFiles)
            state.status.clear()
        } catch (error) {
            state.status.setStatus(String(error))
        }
    })
}