import { createEffect, createSignal, Show } from "solid-js";
import { MuteSvg, VolumeSvg } from "../../icons";

type Props = {
    video: HTMLVideoElement;
};
export function VolumeControl(props: Props) {
    let previousVolume = 50
    const [volume, setVolume] = createSignal(previousVolume)

    const isMuted = () => volume() == 0

    createEffect(() => {
        props.video.volume = volume() / 100
    })

    return (
        <div class="flex-1 flex h-full items-center justify-center gap-2.5">
            <button
                onclick={() => {
                    if (isMuted()) {
                        setVolume(previousVolume)
                    }
                    else {
                        setVolume(0)
                    }
                }}
            >
                <Show when={isMuted()} fallback={<VolumeSvg class="h-6 w-6" />} >
                    <MuteSvg class="h-6 w-6" />
                </Show>
            </button>
            <input
                class=""
                type="range"
                min={0}
                max={100}
                value={volume()}
                oninput={e => {
                    setVolume(Number(e.currentTarget.value))
                    previousVolume = Number(e.currentTarget.value)
                }} 
                />
        </div>
    );
}
