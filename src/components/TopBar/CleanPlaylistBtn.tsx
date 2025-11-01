import { BroomSvg } from "../../icons";
import { invoke } from "@tauri-apps/api/core";
import { state } from "../../state";

export function CleanPlaylistBtn() {
    return (
        <button
            title="Remove Duplicate And Inaccessible Files"
            onclick={async () => {
                if (state.sidePanel.list.length === 0) return
                console.log(state.sidePanel.list)
                const filtered: any = await invoke('cleanup_playlist', { playlist: state.sidePanel.list });
                state.sidePanel.setFiles(filtered);
            }}
        >
            <BroomSvg
                classList={{ 'fill-zinc-500': state.sidePanel.list.length == 0 }}
            />
        </button>
    )


}
