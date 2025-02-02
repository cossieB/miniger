import { useSearchParams } from "@solidjs/router";
import { state } from "../../state";

export function useControls() {
    const [searchParams, setSearchParams] = useSearchParams<{rowId: string}>();
    const id = () => searchParams.rowId ?? ""
    const index = () => state.sidePanel.list.findIndex(item => item.rowId === id()) ?? 0;
    const currentVideo = () => state.sidePanel.list.find(item => item.rowId === id())
    
    function playNext() {
        const playlist = state.sidePanel.list
        if (playlist.length === 0) return;
        if (index() >= playlist.length - 1){
            const item = state.sidePanel.list[0]
            return setSearchParams({rowId: item.rowId})
        }
        const item = state.sidePanel.list[index() + 1]
        setSearchParams({rowId: item.rowId});
    }

    function playPrevious() {
        if (index() === 0) return;
        const playlist = state.sidePanel.list
        if (playlist.length === 0) return;
        const item = state.sidePanel.list[index() - 1]
        setSearchParams({rowId: item.rowId});
    }
    
    return {
        playNext, playPrevious, currentVideo
    }
}