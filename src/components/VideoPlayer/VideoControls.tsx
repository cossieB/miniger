import { Show } from "solid-js";
import { SkipBackSvg, PauseSvg, PlaySvg, SkipForwardSvg } from "../../icons";
import { useControls } from "./useControls";

type P = {
    video: HTMLVideoElement;
    isPlaying: () => boolean;
};

export function VideoControls(props: P) {
    const {playNext, playPrevious} = useControls()
    return (
        <>
            <button
                onclick={() => {
                    if (props.video.currentTime > 5)
                        return props.video.currentTime = 0

                    playPrevious()
                }}
            >
                <SkipBackSvg class="h-6 w-6" />
            </button>
            <button
                onclick={() => {
                    
                    if (!props.isPlaying()) {
                        props.video.play();
                    }
                    else {
                        props.video.pause();
                    }
                }}
            >
                <Show when={!props.isPlaying()} fallback={<PauseSvg class="h-10 w-10" />}>
                    <PlaySvg class="h-10 w-10" />
                </Show>
            </button>
            <button
            onclick={playNext}
            >
                <SkipForwardSvg class="h-6 w-6" />
            </button>
        </>
    );
}
