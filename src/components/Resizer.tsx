import { createSignal, onMount } from "solid-js";

type Props = {
    min: number;
    length: number
    orientation: "horizontal" | "vertical";
    setDimension: (dimension: number) => void
} 

export default function Resizer(props: Props) {
    const [mouseDown, setMouseDown] = createSignal(false)
    
    onMount(() => {
        document.addEventListener("mousemove", e => {
            if (!mouseDown()) return;
            const width = e.clientX - props.min
            props.setDimension(width)
        })
    })
    return (
        <div
            class="h-10 w-2 bg-orange-600 cursor-ew-resize absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-[height] z-50 rounded-sm"
            style={{
                left: props.min + props.length + "px",
            }}
            classList={{
                "h-screen": mouseDown()
            }}
            onMouseDown={e => {
                e.preventDefault()
                setMouseDown(true)
            }}
            onMouseUp={e => {
                e.preventDefault()
                setMouseDown(false)
            }}
        >

        </div>
    )
}