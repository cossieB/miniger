import { createEffect, onCleanup } from "solid-js";
import { useControls } from "./useControls";
import { on } from "solid-js";
import { state } from "../../state";

type P = {
    ref: HTMLVideoElement;
    src: string;
    setTime: (time: number) => void;
    setIsPlaying: (isPlaying: boolean) => void;
    isPlaying: boolean;
};


export function CustomVideo(props: P) {
    let t: number
    
    const {playNext, currentVideo} = useControls();
    
    onCleanup(() => {
        clearTimeout(t);
    })
    createEffect(on(currentVideo, () => {
        clearTimeout(t)
    }))

    return (
        <video
            class="w-full h-full object-contain"
            ref={props.ref}
            src={props.src}
            ontimeupdate={e => {
                props.setTime(e.currentTarget.currentTime / e.currentTarget.duration * 100);
            }}
            oncanplay={(e) => {
                if (!e.currentTarget.ended) {
                    e.currentTarget.play();
                }
            }}
            onended={(e) => {
                props.setIsPlaying(false);
                e.currentTarget.pause();
            }}
            onplaying={() => props.setIsPlaying(true)}
            onpause={() => {
                props.setIsPlaying(false);
            }}
            onclick={(e) => {
                if (props.isPlaying) {
                    e.currentTarget.pause();
                }
                else
                    e.currentTarget.play();
            }}
            onerror={() => {
                const i = state.sidePanel.list.findIndex(item => item.rowId === currentVideo()?.rowId)
                state.sidePanel.markDirty(i)
                t = setTimeout(playNext, 500)
            }}
            onkeyup={e => {
                if (e.key === "F11") {
                    props.ref.requestFullscreen()
                }
            }}
            ondblclick={e => {
                e.currentTarget.requestFullscreen()
            }}
        >
        </video>
    );
}

