import { Volume2Icon, VolumeXIcon } from "lucide-solid";
import { createEffect, createSignal, Show } from "solid-js";

type Props = {
    video: HTMLVideoElement;
};
export function VolumeControl(props: Props) {
    let previousVolume = Number(localStorage.getItem("volume")) || 50
    const [volume, setVolume] = createSignal(previousVolume);
    const changeVolume = (vol: number) => {
        setVolume(vol)
        localStorage.setItem("volume", String(vol))
    }
    const isMuted = () => volume() == 0

    createEffect(() => {
        props.video.volume = volume() / 100
    })

    return (
        <div class="flex-1 flex h-full items-center justify-center gap-2.5">
            <button
                onclick={() => {
                    if (isMuted()) {
                        changeVolume(previousVolume || 50)
                    }
                    else {
                        changeVolume(0)
                    }
                }}
            >
                <Show when={isMuted()} fallback={<Volume2Icon class="h-6 w-6" />} >
                    <VolumeXIcon class="h-6 w-6" />
                </Show>
            </button>
            <input
                class=""
                type="range"
                min={0}
                max={100}
                value={volume()}
                oninput={e => {
                    changeVolume(Number(e.currentTarget.value))
                    previousVolume = Number(e.currentTarget.value)
                }} 
                />
        </div>
    );
}
