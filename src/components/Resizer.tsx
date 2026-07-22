import { onCleanup } from "solid-js";

type Props = {
    displacement: number;
    minDisplacement: number
    maxDisplacement: number
    onMove: (displacement: number) => void
    vertical?: boolean
}

export default function Resizer(props: Props) {
    const abortController = new AbortController

    document.addEventListener("mouseup", e => {
        e.preventDefault();        
        document.removeEventListener("mousemove", handleMouseMove)
    }, { signal: abortController.signal })

    onCleanup(() => {
        abortController.abort()
    })

    const handleMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        const point = props.vertical ? e.clientY : e.clientX
        const displacement = Math.max(props.minDisplacement, Math.min(props.maxDisplacement, point))        
        props.onMove(displacement)
    }
    return (
        <div
            class="bg-orange-600 absolute transition-[height] z-50 rounded-sm"
            classList={{
                "h-10 w-2 top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-ew-resize": !props.vertical,
                "w-10 h-2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize": !!props.vertical
            }}
            onMouseDown={e => {
                e.preventDefault();
                document.addEventListener("mousemove", handleMouseMove);
            }}
            style={{
                [props.vertical ? "top" :"left"]: props.displacement + "px"
            }}
        />
    )
}