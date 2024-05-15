import { useMatch } from "@solidjs/router";
import { AddToPlaylistSvg } from "../../icons";
import { Show } from "solid-js";
import { state } from "../../state";

export function AddToPlaylist() {
    const match = useMatch(() => "/movies/**")
    return (
        <Show when={!!match()}>
            <AddToPlaylistSvg
                class="ml-auto"
                title="Add to playlist"
                onclick={() => {
                    state.sidePanel.push(state.mainPanel.selectedItems)
                }}
            />
        </Show>
    )
}

