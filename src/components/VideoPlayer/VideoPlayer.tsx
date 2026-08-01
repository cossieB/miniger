import { convertFileSrc } from "@tauri-apps/api/core"
import { createEffect, createSignal } from "solid-js"
import { VideoControls } from "./VideoControls";
import { CustomVideo } from "./CustomVideo";
import { useControls } from "./useControls";
import { VolumeControl } from "./VolumeControl";
import styles from "./VideoPlayer.module.css"

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
        <div class={styles.container}>
            <div
                class={styles.player}
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
            <div class={styles.controlsWrapper}>
                <div class={`${styles.elements}`}>
                    {/* TODO: loop, repeat, random video controls etc */}
                </div>
                <input
                    type="range"
                    class={styles.seekbar}
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