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
                    state.sidePanel.push(state.getSelections())
                }}
            >
                <ListVideoIcon
                    classList={{ 'text-zinc-500': state.mainPanel.selectedIds.length == 0 }}                    
                />
            </button>
        </Show>
    )
}

