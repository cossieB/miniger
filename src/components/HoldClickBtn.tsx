import { createSignal, type JSX, onCleanup } from "solid-js";
import styles from "./HoldClickBtn.module.css"

type Props = {
    action: () => Promise<unknown>
    label: JSX.Element
    type?: "danger"
}

const start = 1000

export function HoldClickBtn(props: Props) {
    const [time, setTime] = createSignal(start)
    const percentage = () => time() / start * 100;
    let t: number | undefined;
    onCleanup(() => {
        clearInterval(t)
    })
    return (
        <button
            class={styles.btn}
            data-type={props.type}
            type="button"
            style={{ "--time": percentage() }}
            onmousedown={e => {
                t = setInterval(async () => {
                    if (time() > 0)
                        return setTime(prev => prev - 25)

                    clearInterval(t)
                    t = undefined;
                    setTime(start)
                    await props.action()
                }, 25)
            }}
            onmouseup={e => {
                window.clearInterval(t)
                t = undefined;
                setTime(start)
            }}
        >
            <span>
                {props.label}
            </span>
        </button>
    )
}