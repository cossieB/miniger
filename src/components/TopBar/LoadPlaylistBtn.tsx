import { PlayListSvg } from "../../icons";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { state } from "../../state";
import { getFilmCache, getFilmDetails } from "./getFilmDetails";

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
                const fileList: { title: string; path: string; }[] = await invoke("read_playlist", {
                    playlist: selection
                });
                const cache = await getFilmCache()
                const films = getFilmDetails(fileList, cache)
                state.sidePanel.setFiles(films)
            }
            catch (error) {
                state.status.setStatus(error as string)
            }
        }}
    />;
}
