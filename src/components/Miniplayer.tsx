import { convertFileSrc } from "@tauri-apps/api/core";
import { state } from "../state";
import styles from "./Miniplayer.module.css"

export function Miniplayer() {
    const src = () => convertFileSrc(state.miniplayer.video?.path ?? "");
    return (
        <div
            class={styles.miniplayer}
            style={{ height: (state.miniplayer.height) + "px" }}
        >
            <button class="absolute z-50" onclick={() => state.miniplayer.setVideo(null)}>X</button>
            <video class="fillUp" autoplay src={src()} onplay={(e) => e.currentTarget.volume = 0} controls></video>
        </div>
    )
}
