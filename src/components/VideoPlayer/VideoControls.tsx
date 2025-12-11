import { Show } from "solid-js";
import { useControls } from "./useControls";
import { CirclePauseIcon, PlayIcon, SkipBackIcon, SkipForwardIcon } from "lucide-solid";

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
                <SkipBackIcon class="h-6 w-6" />
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
                <Show when={!props.isPlaying()} fallback={<CirclePauseIcon class="h-10 w-10" />}>
                    <PlayIcon class="h-10 w-10" />
                </Show>
            </button>
            <button 
            class="active:scale-90 hover:text-orange-500"
            onclick={playNext} 
            >
                <SkipForwardIcon class="h-6 w-6" />
            </button>
        </div>
    );
}
