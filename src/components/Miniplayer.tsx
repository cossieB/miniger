import { convertFileSrc } from "@tauri-apps/api/core";
import { state } from "../state";

export function Miniplayer() {
    const src = () => convertFileSrc(state.miniplayer!.path);
    return (
        <div class="mt-auto bg-orange-500">
            <button onclick={() => state.setMiniplayer(null)}>X</button>
            <video autoplay src={src()} controls></video>
        </div>
    )
}