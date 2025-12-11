import { ListIcon } from "lucide-solid";
import { loadPlaylist } from "../../utils/loadPlaylist";

export function LoadPlaylistBtn() {
    return (
        <button
            title="Load Playlist"
            onclick={loadPlaylist}
        >
            <ListIcon />
        </button>
    )

}
