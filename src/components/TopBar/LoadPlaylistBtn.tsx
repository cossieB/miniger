import { PlayListSvg } from "../../icons";
import { loadPlaylist } from "../../utils/loadPlaylist";

export function LoadPlaylistBtn() {
    return <PlayListSvg
        title="Load Playlist"
        onclick={loadPlaylist}
    />;
}
