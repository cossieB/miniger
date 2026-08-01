import { onCleanup } from "solid-js";
import styles from "~/windows/MainWindow.module.css"

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
            class={styles.resizer}
            classList={{
                [styles.vertical]: !!props.vertical
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