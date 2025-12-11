import { useMatch } from "@solidjs/router";
import { Show } from "solid-js";
import { state } from "../../state";
import { ListVideoIcon } from "lucide-solid";

export function AddToPlaylistBtn() {
    const match = useMatch(() => "/movies/**")
    return (
        <Show when={!!match()}>
            <button
                title="Add to playlist"
                onclick={() => {
                    state.sidePanel.push(state.mainPanel.selectedItems)
                }}
            >
                <ListVideoIcon
                    classList={{ 'fill-zinc-500': state.mainPanel.selectedItems.length == 0 }}
                />
            </button>
        </Show>
    )
}

