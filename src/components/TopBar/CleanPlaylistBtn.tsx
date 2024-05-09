import { BroomSvg } from "../../icons";
import { invoke } from "@tauri-apps/api/core";
import { setState, state } from "../../state";

export function CleanPlaylistBtn() {
    return <BroomSvg
        onclick={async () => {
            const filtered: any = await invoke('cleanup_playlist', { playlist: state.sidePanel.list });
            setState('sidePanel', 'list', filtered);
        }} />;
}
