import { convertFileSrc } from "@tauri-apps/api/core"
import { createEffect, createSignal, on, onMount } from "solid-js"
import { state } from "../../state"
import { useSearchParams } from "@solidjs/router"
import { PlaySvg, SkipBackSvg, SkipForwardSvg } from "../../icons";

export function VideoPlayer() {
    const [searchParams] = useSearchParams();
    const [src, setSrc] = createSignal("")
    let isPlaying = false
    let video!: HTMLVideoElement
    const index = () => Number(searchParams.i) ?? 0

    const [time, setTime] = createSignal(0)
    
    onMount(() => {
        video.play()
    })

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
                <video
                    class="w-full h-full object-contain"
                    ref={video}
                    src={src()}
                    onTimeUpdate={e => {
                        setTime(video.currentTime / video.duration * 100)
                    }}
                />

            </div>
            <div class="w-full flex justify-center gap-5 h-20 flex-shrink-0 relative">
                <input 
                    type="range" 
                    class="w-full absolute top-0 -translate-y-1/2 bg-orange-600"
                    value={time()}
                    min={0}
                    max={100}
                    oninput={e => {

                        video.currentTime = Number(e.currentTarget.value) / 100 * video.duration;

                    }}
                />
                <button >
                    <SkipBackSvg />
                </button>
                <button 
                    onclick={() => {
                    if (!isPlaying) {
                        video.play()
                        isPlaying = true
                    }
                    else {
                        video.pause()
                        isPlaying = false
                    }
                }}
                >
                    <PlaySvg />
                </button>
                <button>
                    <SkipForwardSvg />
                </button>
            </div>
        </div>
    )
}