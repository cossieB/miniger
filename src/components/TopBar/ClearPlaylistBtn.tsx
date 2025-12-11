import { CircleXIcon } from "lucide-solid";
import { state } from "../../state";

export function ClearPlaylistBtn() {
    return (
        <button
            title="Clear Playlist"
            onclick={() => {
                if (state.sidePanel.list.length === 0) return;
                state.sidePanel.clear()
            }}
        >
            <CircleXIcon
                class="mr-5"
                classList={{ 'fill-zinc-500': state.sidePanel.list.length == 0 }}
            />
        </button>
    ) 
}
