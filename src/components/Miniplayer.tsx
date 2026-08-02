import { convertFileSrc } from "@tauri-apps/api/core";
import { state } from "../state";
import { Show } from "solid-js";
import { appDataDir, sep } from "@tauri-apps/api/path";
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
const dir = await appDataDir()

export function Thumbnail() {
    const film = () => state.mainPanel.getSelections().at(0)
    return (
        <Show when={state.settings.showThumbnail && film()}>
            <div class="mt-auto bg-black">
                <button class="absolute z-50" onclick={() => state.settings.toggleSetting("showThumbnail")}>X</button>
                <img class="mt-auto" src={convertFileSrc(`${dir}${sep()}thumbs${sep()}${film()}.jpg`)} alt="" />
            </div>
        </Show>
    )
}