import { convertFileSrc } from "@tauri-apps/api/core"
import { createEffect, createSignal } from "solid-js"
import { VideoControls } from "./VideoControls";
import { CustomVideo } from "./CustomVideo";
import { useControls } from "./useControls";
import { VolumeControl } from "./VolumeControl";

export function VideoPlayer() {
    let video!: HTMLVideoElement
    const { currentVideo } = useControls()
    const [src, setSrc] = createSignal("")
    const [isPlaying, setIsPlaying] = createSignal(false)
    const [time, setTime] = createSignal(0)

    createEffect(() => {
        if (currentVideo()) {
            setSrc(convertFileSrc(currentVideo()!.path))
        }
    })

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
            <div class="w-full flex justify-center gap-5 h-20 shrink-0 relative">
                <div class="flex-1">
                    {/* TODO: loop, repeat, random video controls etc */}
                </div>
                <input
                    type="range"
                    class="w-full absolute top-0 -translate-y-1/2 flex-1"
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
                <VolumeControl video={video} />
            </div>
        </div>
    )
}