import styles from "~/windows/MainWindow.module.css"

type Props = {
    displacement: number;
    minDisplacement: number
    maxDisplacement: number
    onMove: (displacement: number) => void
    vertical?: boolean
}

export default function Resizer(props: Props) {
    let isDragging = false

    const handleMouseMove = (e: PointerEvent) => {
        if (!isDragging) return;
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
            onPointerDown={e => {
                isDragging = true
                e.currentTarget.setPointerCapture(e.pointerId)
            }}
            onPointerUp={e => {
                isDragging = false
                e.currentTarget.releasePointerCapture(e.pointerId);
            }}
            onPointerMove={handleMouseMove}
            onPointerCancel={e => {              
                isDragging = false;
                e.currentTarget.releasePointerCapture(e.pointerId);
            }}
            style={{
                [props.vertical ? "top" : "left"]: props.displacement + "px"
            }}
        />
    )
}