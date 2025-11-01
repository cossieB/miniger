import { PlayListSvg } from "../../icons";
import { loadPlaylist } from "../../utils/loadPlaylist";

export function LoadPlaylistBtn() {
    return (
        <button
            title="Load Playlist"
            onclick={loadPlaylist}
        >
            <PlayListSvg />
        </button>
    )

}
