import { PlayListSvg } from "../../icons";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { setState, state } from "../../state";

export function LoadPlaylistBtn() {
    return <PlayListSvg
        class="ml-auto"
        title="Load Playlist"
        onclick={async () => {
            const selection = await open({
                title: "Select a playlist",
                filters: [{
                    name: "Playlist files",
                    extensions: ["mpcpl", "asx", "m3u", "pls"]
                }]
            });

            if (!selection) return;
            try {
                const t: { title: string; path: string; }[] = await invoke("read_playlist", {
                    playlist: selection
                });
                const v = t.map(x => ({
                    ...x,
                    studio_name: "",
                    tags: [],
                    actors: []
                }))
                setState('sidePanel', 'list', v);
            }
            catch (error) {
                state.status.setStatus(error as string)
            }
        }} />;
}
