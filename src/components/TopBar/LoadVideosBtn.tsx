import { FilmstripSvg } from "~/icons";
import { loadVideos } from "~/utils/loadPlaylist";

export function LoadVideosBtn() {
    return (
        <button
            title="Load Videos"
            onclick={loadVideos}
        >
            <FilmstripSvg />
        </button>
    )

}