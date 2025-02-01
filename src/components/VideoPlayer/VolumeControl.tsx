type Props = {
    video: HTMLVideoElement;
};
export function VolumeControl(props: Props) {
    return (
        <input
            class="right-0 absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            type="range"
            min={0}
            max={100}
            oninput={e => {
                props.video.volume = Number(e.currentTarget.value) / 100;
            }} />
    );
}
