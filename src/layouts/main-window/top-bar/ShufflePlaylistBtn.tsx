import { ShuffleIcon } from "lucide-solid";
import { state } from "~/state";

export function ShufflePlaylistBtn() {
    return (
        <button
            title="Shuffle Playlist"
            onClick={state.sidePanel.shuffle}            >

            <ShuffleIcon
                classList={{ 'fill-zinc-500': state.sidePanel.list.length == 0 }}
            />
        </button>
    )
}