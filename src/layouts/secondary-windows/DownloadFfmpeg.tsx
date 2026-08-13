import { getCurrentWindow } from "@tauri-apps/api/window";
import styles from "./Windows.module.css"
import { onMount, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { invoke } from "@tauri-apps/api/core";

export function DownloadFfmpeg() {
    const window = getCurrentWindow();
    const [state, setState] = createStore({
        downloaded: 0,
        total: 0,
        message: "",
        ffprobe: "",
        ffmpeg: "",
        isDownloading: false
    })
    const percentage = () => {
        if (state.total === 0) return 0
        return Math.min(state.downloaded / state.total * 100, 100)
    }
    let unlisten = () => { }

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
        invoke<typeof state>("ffmpeg_details").then(res => setState(res))
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
            <Show when={state.ffmpeg || state.ffprobe}>
                <h2>Versions</h2>
            </Show>
            <Show when={state.ffmpeg}>
                <div>FFMpeg: {state.ffmpeg}</div>
            </Show>
            <Show when={state.ffprobe} >
                <div>FFProbe: {state.ffprobe}</div>
            </Show>
            <Show when={state.isDownloading}>
                <h2>Downloading FFMPEG</h2>
                <div role="progressbar" style={{ "--percentage": `${percentage()}%` }} />
                <aside>
                    <span> {state.downloaded} </span>
                    <span> / </span>
                    <span> {state.total} </span>
                </aside>
                <p> {state.message} </p>
            </Show>
        </div>
    )
}