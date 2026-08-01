import { CirclePlusIcon } from "lucide-solid";
import { type Accessor, createSignal, onCleanup } from "solid-js";
import styles from "./HoldClickBtn.module.css"

type Props = {
    action: () => Promise<unknown>
    input: Accessor<string>
    clearInput: () => void
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
            style={{ "--time": percentage() }}
            onmousedown={e => {
                t = setInterval(async () => {
                    if (time() > 0)
                        return setTime(prev => prev - 25)

                    clearInterval(t)
                    t = undefined;
                    setTime(start)
                    await props.action()
                    props.clearInput()
                }, 25)
            }}
            onmouseup={e => {
                window.clearInterval(t)
                t = undefined;
                setTime(start)
            }}
        >
            <span>
                <CirclePlusIcon />&nbsp;
                Hold to add<span>&nbsp;{props.input()}&nbsp;</span>to the database
            </span>
        </button>
    )
}