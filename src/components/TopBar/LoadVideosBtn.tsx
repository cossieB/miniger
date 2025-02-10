import { FilmstripSvg } from "~/icons";
import { loadVideos } from "~/utils/loadPlaylist";

export function LoadVideosBtn() {
    return <FilmstripSvg
        title="Load Videos"
        onclick={loadVideos}
    />
}