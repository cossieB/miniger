import { useMatch } from "@solidjs/router";
import { AddToPlaylistSvg } from "../../icons";
import { Show } from "solid-js";
import { state } from "../../state";

export function AddToPlaylist() {
    const match = useMatch(() => "/movies/**")
    return (
        <Show when={!!match()}>
            <AddToPlaylistSvg
                classList={{ 'fill-zinc-500': state.mainPanel.selectedItems.length == 0 }}
                title="Add to playlist"
                onclick={() => {
                    state.sidePanel.push(state.mainPanel.selectedItems)
                }}
            />
        </Show>
    )
}

