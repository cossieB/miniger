import { ClearPlaylist } from "../../icons";
import { setState, state } from "../../state";


export function ClearPlaylistBtn() {
    return <ClearPlaylist
    title="Clear Playlist"
    class="mr-5"
        classList={{ 'fill-zinc-500': state.sidePanel.list.length == 0 }}
        onclick={() => {
            if (state.sidePanel.list.length === 0) return;
            setState('sidePanel', 'list', [])
        }}
    />
}
