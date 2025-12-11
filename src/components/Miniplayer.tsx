import { convertFileSrc } from "@tauri-apps/api/core";
import { state } from "../state";
import { Show } from "solid-js";
import { appDataDir, sep } from "@tauri-apps/api/path";

export function Miniplayer() {
    const src = () => convertFileSrc(state.miniplayer.video?.path ?? "");
    return (
        <Show when={!!state.miniplayer.video}>
            <div class="mt-auto bg-black">
                <button class="absolute z-50" onclick={() => state.miniplayer.setVideo(null)}>X</button>
                <video class="h-full w-full" autoplay src={src()} onplay={(e) => e.currentTarget.volume = 0} controls></video>
            </div>
        </Show>
    )
}
const dir = await appDataDir()

export function Thumbnail() {
    const filmId = () => state.mainPanel.selectedIds.at(0)
    return (
        <Show when={state.settings.showThumbnail && filmId()}>
            <div class="mt-auto bg-black">
                <button class="absolute z-50" onclick={() => state.settings.toggleSetting("showThumbnail")}>X</button>
                <img class="mt-auto" src={convertFileSrc(`${dir}${sep()}thumbs${sep()}${filmId()}.jpg`)} alt="" />
            </div>
        </Show>
    )
}