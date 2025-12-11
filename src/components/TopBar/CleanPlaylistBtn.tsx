import { invoke } from "@tauri-apps/api/core";
import { state } from "../../state";
import { BrushCleaningIcon } from "lucide-solid";

export function CleanPlaylistBtn() {
    return (
        <button
            title="Remove Duplicate And Inaccessible Files"
            onclick={async () => {
                if (state.sidePanel.list.length === 0) return
                const filtered: any = await invoke('cleanup_playlist', { playlist: state.sidePanel.list });
                state.sidePanel.setFiles(filtered);
            }}
        >
            <BrushCleaningIcon
                classList={{ 'fill-zinc-500': state.sidePanel.list.length == 0 }}
            />
        </button>
    )


}
