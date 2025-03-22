import { readTextFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import { state } from "./state";
import { SessionJSON } from "./events/mainWindow";
import { WatchJSON } from "./routes/Settings";
import { readDirectories } from "./utils/readDirectories";
import { filterMap } from "./lib/filterMap";
import { onMount } from "solid-js";
import { useAction, useNavigate } from "@solidjs/router";
import { addDirectoriesToDatabase } from "./api/mutations";

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

export async function readWatchJson(scanAll = false) {

    try {
        const content = await readTextFile("watch.json", {
            baseDir: BaseDirectory.AppData
        })
        const data = JSON.parse(content) as WatchJSON[];
        const t = filterMap(data, val => val.scanOnStart || scanAll, val => val.path)
        const files = await readDirectories(t)
        if (!files?.length) return;
        return files
    } catch (error) {
        console.error(error);
        state.status.setStatus(String(error))
    }
}

export function useWatchJson() {
    const action = useAction(addDirectoriesToDatabase)
    onMount(async () => {
        try {
            const files = await readWatchJson()
            if (!files?.length) return
            state.status.setStatus("Reading files....")
            await action(files)
            state.status.clear()
        } catch (error) {
            state.status.setStatus(String(error))
        }
    })
}