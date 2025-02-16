import { convertFileSrc } from "@tauri-apps/api/core";
import { state } from "../state";

export function Miniplayer() {
    const src = () => convertFileSrc(state.miniplayer!.path);
    return (
        <div class="mt-auto bg-black h-[25%]">
            <button class="absolute z-50" onclick={() => state.setMiniplayer(null)}>X</button>
            <video class="h-full w-full" autoplay src={src()} onplay={(e) => e.currentTarget.volume = 0} controls></video>
        </div>
    )
}