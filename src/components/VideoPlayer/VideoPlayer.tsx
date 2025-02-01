import { convertFileSrc } from "@tauri-apps/api/core"
import { createEffect, createSignal, on, onMount } from "solid-js"
import { state } from "../../state"
import { useSearchParams } from "@solidjs/router"
import { VideoControls } from "./VideoControls";
import { CustomVideo } from "./CustomVideo";

export function VideoPlayer() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [src, setSrc] = createSignal("")
    const [isPlaying, setIsPlaying] = createSignal(false)
    let video!: HTMLVideoElement
    const index = () => Number(searchParams.i) ?? 0

    const [time, setTime] = createSignal(0)

    createEffect(on(index, () => {
        const file = state.sidePanel.list.at(index())
        if (file) {
            setSrc(convertFileSrc(file.path))
        }
    }))

    return (
        <div class="w-full h-full flex flex-col relative">
            <div
                class=" bg-black items-center justify-center flex"
                style={{
                    height: "calc(100% - 5rem)"
                }}
            >
                <CustomVideo
                    ref={video}
                    src={src()}
                    setTime={setTime}
                    setIsPlaying={setIsPlaying}
                    isPlaying={isPlaying()}
                />
            </div>
            <div class="w-full flex justify-center gap-5 h-20 flex-shrink-0 relative">
                <input
                    type="range"
                    class="w-full absolute top-0 -translate-y-1/2"
                    value={time()}
                    min={0}
                    max={100}
                    oninput={e => {
                        video.currentTime = Number(e.currentTarget.value) / 100 * video.duration;
                    }}
                />
                <VideoControls
                    video={video}
                    isPlaying={isPlaying}
                />
            </div>
        </div>
    )
}