import { useControls } from "./useControls";

type P = {
    ref: HTMLVideoElement;
    src: string;
    setTime: (time: number) => void;
    setIsPlaying: (isPlaying: boolean) => void;
    isPlaying: boolean;
};

export function CustomVideo(props: P) {
    const {playNext} = useControls();
    return (
        <video
            class="w-full h-full object-contain"
            ref={props.ref}
            src={props.src}
            ontimeupdate={e => {
                props.setTime(e.currentTarget.currentTime / e.currentTarget.duration * 100);
            }}
            oncanplay={(e) => {
                if (!e.currentTarget.ended) {
                    e.currentTarget.play();
                }
            }}
            onended={(e) => {
                props.setIsPlaying(false);
                e.currentTarget.pause();
            }}
            onplaying={() => props.setIsPlaying(true)}
            onpause={() => {
                props.setIsPlaying(false);
            }}
            onclick={(e) => {
                if (props.isPlaying) {
                    e.currentTarget.pause();
                }

                else
                    e.currentTarget.play();
            }}
            onerror={() => {
                playNext()
            }}
        />
    );
}

