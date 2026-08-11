import { getCurrentWindow } from "@tauri-apps/api/window";
import styles from "./Windows.module.css"
import { onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { invoke } from "@tauri-apps/api/core";

export function DownloadFfmpeg() {
    const window = getCurrentWindow();
    const [state, setState] = createStore({
        downloaded: 0,
        total: 0,
        message: ""
    })
    const percentage = () => {
        if (state.total === 0) return 0
        return Math.min(state.downloaded / state.total * 100, 100)
    }
    let unlisten = () => {}

    onMount(async () => {
        const u1 = await window.listen<typeof state>("ffmpeg_progress", e => {
            setState(e.payload)
        })
        const u2 = await window.listen<string>("set-status", e => {
            setState('message', e.payload)
        })
        unlisten = () => {
            u1();
            u2()
        }
        try {
            await invoke("download_ffmpeg_if_missing")
        } catch (error: any) {
            setState('message', error.message)
        }
    })
    window.onCloseRequested(() => {
        unlisten();
        window.destroy()
    })
    return (
        <div class={styles.dl}>
            <h1>Downloading FFMPEG</h1>
            <div style={{"--percentage": `${percentage()}%`}} />
            <aside>
                <span> {state.downloaded} </span>
                <span> / </span>
                <span> {state.total} </span>
            </aside>
            <p> {state.message} </p>
        </div>
    )
}