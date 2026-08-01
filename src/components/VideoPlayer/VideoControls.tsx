import { Show } from "solid-js";
import { useControls } from "./useControls";
import { CirclePauseIcon, PlayIcon, SkipBackIcon, SkipForwardIcon } from "lucide-solid";
import styles from "./VideoPlayer.module.css"

type P = {
    video: HTMLVideoElement;
    isPlaying: () => boolean;
};

export function VideoControls(props: P) {
    const { playNext, playPrevious } = useControls()
    return (
        <div class={`${styles.controls} ${styles.elements}`}>
            <button                
                onclick={() => {
                    if (props.video.currentTime > 5)
                        return props.video.currentTime = 0

                    playPrevious()
                }}
            >
                <SkipBackIcon />
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
                <Show when={!props.isPlaying()} fallback={<CirclePauseIcon class={styles.midIcon} />}>
                    <PlayIcon class={styles.midIcon} />
                </Show>
            </button>
            <button                
                onclick={playNext}
            >
                <SkipForwardIcon />
            </button>
        </div>
    );
}
