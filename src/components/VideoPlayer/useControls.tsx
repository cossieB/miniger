import { useSearchParams } from "@solidjs/router";
import { state } from "../../state";

export function useControls() {
    const [searchParams, setSearchParams] = useSearchParams<{id: string}>();
    const id = () => searchParams.id ?? ""
    const index = () => state.sidePanel.list.findIndex(item => item.id === id()) ?? 0;
    const currentVideo = () => state.sidePanel.list.find(item => item.id === id())
    
    function playNext() {
        const playlist = state.sidePanel.list
        if (playlist.length === 0) return;
        if (index() >= playlist.length - 1){
            const item = state.sidePanel.list[0]
            return setSearchParams({id: item.id})
        }
        const item = state.sidePanel.list[index() + 1]
        setSearchParams({id: item.id});
    }

    function playPrevious() {
        if (index() === 0) return;
        const playlist = state.sidePanel.list
        if (playlist.length === 0) return;
        const item = state.sidePanel.list[index() - 1]
        setSearchParams({id: item.id});
    }
    
    return {
        playNext, playPrevious, currentVideo
    }
}