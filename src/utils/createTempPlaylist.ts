import { invoke } from "@tauri-apps/api/core"
import { join, tempDir } from "@tauri-apps/api/path"
import { openPath } from "@tauri-apps/plugin-opener"
import { state } from "~/state"

export async function createTempPlaylist(files: {title: string, path: string}[]) {
    try {
        const path = await join(await tempDir(), "mngr_temp.m3u")
        await invoke("save_playlist", {
            path,
            files
        })
        await openPath(path)
    } catch (error) {
        state.status.setStatus(String(error))
    }
}