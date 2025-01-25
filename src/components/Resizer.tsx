import { createSignal, onMount } from "solid-js";

type Props = {
    min: number;
    max: number;
    length: number
    pivot: "left" | "right" 
    setDimension: (dimension: number) => void
} 

export default function Resizer(props: Props) {
    const [mouseDown, setMouseDown] = createSignal(false)
    const style = () => {
        if (props.pivot === "right") 
            return {
                left: props.min + props.length + "px",
            }
        else 
            return {
                left: props.max - props.length + "px",
            }
    }
    
    onMount(() => {
        document.addEventListener("mousemove", e => {
            if (!mouseDown()) return;
            let width = 0;
            if (props.pivot === "right") {
                width = e.clientX - props.min

            }
            if (props.pivot === "left"){
                width = props.max - e.clientX
            }
            props.setDimension(width)
        })
    })
    return (
        <div
            class="h-10 w-2 bg-orange-600 cursor-ew-resize absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-[height] z-50 rounded-sm"
            style={style()}
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