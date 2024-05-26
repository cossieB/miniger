import { BroomSvg } from "../../icons";
import { invoke } from "@tauri-apps/api/core";
import { setState, state } from "../../state";

export function CleanPlaylistBtn() {
    return <BroomSvg
        title="Remove Duplicate And Inaccessible Files"
        classList={{ 'fill-zinc-500': state.sidePanel.list.length == 0 }}
        onclick={async () => {
            if (state.sidePanel.list.length === 0) return
            const filtered: any = await invoke('cleanup_playlist', { playlist: state.sidePanel.list });
            setState('sidePanel', 'list', filtered);
        }} />;
}
