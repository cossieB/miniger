import { ReactiveSet } from "@solid-primitives/set";
import { invoke } from "@tauri-apps/api/core";
import { createSignal } from "solid-js";

export function useGetThumbnails() {

    type Video = {
        path: string;
        filmId: number;
    };
    const hasProcessed = new ReactiveSet<number>()
    const [cacheBuster, setCachebuster] = createSignal(Date.now())
    const [videos, setVideos] = createSignal<Video[]>([])

    let timer = -1

    async function getThumbnails() {
        
        const vids = videos().filter(vid => !hasProcessed.has(vid.filmId));
        if (vids.length == 0) return;
        await invoke("generate_thumbnails", {
            videos: vids
        })
        vids.forEach(vid => hasProcessed.add(vid.filmId))
        const set = new Set(vids.map(vid => vid.filmId))
        const difference = videos().filter(vid => !set.has(vid.filmId));
        setVideos(difference);
        setCachebuster(Date.now())
    }

    function addThumbnail(video: Video) {
        clearTimeout(timer)
        setVideos(prev => [...prev, video])
        timer = window.setTimeout(getThumbnails, 2000)
    }
    
    return { cacheBuster, addThumbnail }
}