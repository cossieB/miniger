import { save } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { state } from "../../state";
import { SaveIcon } from "lucide-solid";

export function SavePlaylistBtn() {
    return (
        <button
            title="Save Playlist"
            onclick={async () => {
                if (state.sidePanel.list.length == 0) return;
                try {
                    const path = await save({
                        title: "Save playlist",
                        filters: [{
                            name: "Winamp Playlist",
                            extensions: ["m3u", "m3u8"],
                        }, {
                            name: "Windows Media Playlist",
                            extensions: ["asx"],
                        }, {
                            name: "Playlist",
                            extensions: ["pls"],
                        }, {
                            name: "MPC Playlist",
                            extensions: ["mpcpl"],
                        }]
                    });
                    if (path)
                        await invoke('save_playlist', { path, files: state.sidePanel.list });
                } catch (error) {
                    console.error(error);
                    state.status.setStatus("Error saving playlist")
                }
            }}
        >
            <SaveIcon
                classList={{ 'fill-zinc-500': state.sidePanel.list.length == 0 }}
            />
        </button>
    )
}
