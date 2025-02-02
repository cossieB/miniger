import { Show } from "solid-js";
import { SkipBackSvg, PauseSvg, PlaySvg, SkipForwardSvg } from "../../icons";
import { useControls } from "./useControls";

type P = {
    video: HTMLVideoElement;
    isPlaying: () => boolean;
};

export function VideoControls(props: P) {
    const { playNext, playPrevious } = useControls()
    return (
        <div class="flex-1 flex h-full items-center justify-center gap-2.5">
            <button
            class="active:scale-90 hover:text-orange-500"
                onclick={() => {
                    if (props.video.currentTime > 5)
                        return props.video.currentTime = 0

                    playPrevious()
                }}
            >
                <SkipBackSvg class="h-6 w-6" />
            </button>
            <button
            class="active:scale-90 hover:text-orange-500"
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
            class="active:scale-90 hover:text-orange-500"
            onclick={playNext} 
            >
                <SkipForwardSvg class="h-6 w-6" />
            </button>
        </div>
    );
}
