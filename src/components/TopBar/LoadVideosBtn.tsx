import { Film } from "lucide-solid";
import { loadVideos } from "~/utils/loadPlaylist";

export function LoadVideosBtn() {
    return (
        <button
            title="Load Videos"
            onclick={loadVideos}
        >
            <Film />
        </button>
    )

}