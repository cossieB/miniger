import { PlayListSvg } from "../../icons";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { setState } from "../../state";

export function LoadPlaylistBtn() {
    return <PlayListSvg
        class="ml-auto"
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
                    playlist: selection.path
                });
                setState('sidePanel', 'list', t);
            }
            catch (error) {
                setState('status', error as string);
                setTimeout(() => {
                    setState('status', "");
                }, 5000);
            }
        }} />;
}
