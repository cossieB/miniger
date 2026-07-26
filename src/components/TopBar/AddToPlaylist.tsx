import { useMatch } from "@solidjs/router";
import { Show } from "solid-js";
import { state } from "../../state";
import { ListVideoIcon } from "lucide-solid";

export const addSelectionToPlaylist = () => {
    state.sidePanel.push(state.mainPanel.getSelections());
};
export function AddToPlaylistBtn() {
    const match = useMatch(() => "/movies/**")
    return (
        <Show when={!!match()}>
            <button
                title="Add to playlist"
                onclick={addSelectionToPlaylist}
            >
                <ListVideoIcon
                    classList={{ 'text-zinc-500': state.mainPanel.getSelections().length == 0 }}                    
                />
            </button>
        </Show>
    )
}

