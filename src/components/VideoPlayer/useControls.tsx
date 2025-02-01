import { useSearchParams } from "@solidjs/router";
import { state } from "../../state";

export function useControls() {
    const [searchParams, setSearchParams] = useSearchParams();
    const index = () => Number(searchParams.i) ?? 0

    function playNext() {
        const playlist = state.sidePanel.list
        if (playlist.length === 0) return;
        if (index() >= playlist.length - 1)
            return setSearchParams({i: 0})
        setSearchParams({i: index() + 1});
    }
    function playPrevious() {
        const playlist = state.sidePanel.list
        if (playlist.length === 0) return;
        setSearchParams({i: Math.max(0, index() - 1)});
    }

    return {
        playNext, playPrevious
    }
}