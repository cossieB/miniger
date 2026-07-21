import { onCleanup } from "solid-js";

type Props = {
    x: number;
    min: number
    max: number
    onMove: (x: number, y: number) => void
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
        e.preventDefault()
        const newX = props.vertical ? 0 : Math.max(props.min, Math.min(props.max, e.clientX))
        props.onMove(newX, e.clientY)
    }
    return (
        <div
            class="bg-orange-600 cursor-ew-resize absolute top-1/2  transition-[height] z-50 rounded-sm"
            classList={{
                "h-10 w-2 -translate-y-1/2 -translate-x-1/2": !props.vertical,
                "w-10 h-2 -translate-x-1/2 -translate-y-1/2": !!props.vertical
            }}
            onMouseDown={e => {
                e.preventDefault();
                document.addEventListener("mousemove", handleMouseMove);
            }}
            style={{
                left: props.x + "px"
            }}
        />
    )
}