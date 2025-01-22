import { ClearSVG } from "../../icons";
import { state } from "../../state";

export function ClearPlaylistBtn() {
    return <ClearSVG
        title="Clear Playlist"
        class="mr-5"
        classList={{ 'fill-zinc-500': state.sidePanel.list.length == 0 }}
        onclick={() => {
            if (state.sidePanel.list.length === 0) return;
            state.sidePanel.clear()
        }}
    />
}
