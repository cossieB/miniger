import { createEffect, createSignal, Show, type ComponentProps, splitProps, type JSX } from "solid-js"
import { TABLE_CELL_HEIGHT } from "~/constants"
import { useCellContext } from "~/utils/createTable"
import styles from "./Cells.module.css"

type Props = {
    onUpdate: (val: string) => Promise<void>
} & ComponentProps<"input">

export function TextCell(props: Props) {
    const [local, inputProps] = splitProps(props, ["onUpdate"])

    const cell = useCellContext<string>()
    const [edit, setEdit] = createSignal(false)
    const [loading, setLoading] = createSignal(false)
    const [startingVal, setStartingVal] = createSignal(cell.getValue()) //local state to prevent table resorting on update
    const [value, setValue] = createSignal(cell.getValue())
    let inputRef!: HTMLInputElement
    let isCancelled = false

    createEffect(() => {
        if (edit()) {
            isCancelled = false
            inputRef.focus()
            inputRef.select()
        }
    })

    const handleSave = async () => {
        if (isCancelled || loading()) return

        const newValue = inputRef.value

        if (newValue == startingVal()) return
        try {
            setLoading(true)
            await local.onUpdate(newValue)
            setStartingVal(newValue)
        }
        catch (error) {
            console.error("Failed to commit cell update:", error)
            setValue(startingVal())
        }
        finally {
            setLoading(false)
        }

        setEdit(false)
    }

    return (
        <div
            class={styles.cellWrapper}
            style={{
                width: `${cell.column.getSize()}px`,
                height: `${TABLE_CELL_HEIGHT}px`
            }}
            onDblClick={() => setEdit(true)}
        >
            <Show
                when={edit()}
                fallback={
                    <button class={styles.triggerButton}>

                    <span class={styles.textValue}>
                        {value()}
                    </span>
                    </button>
                }
            >
                <input
                    {...inputProps}
                    ref={inputRef}
                    value={value()}
                    oninput={e => setValue(e.currentTarget.value)}
                    disabled={loading()}
                    class={styles.textInput}
                    onBlur={handleSave}
                    onKeyDown={e => {
                        if (e.key === "Enter") {
                            inputRef.blur()
                        }
                        if (e.key === "Escape") {
                            isCancelled = true
                            setValue(startingVal())
                            setEdit(false)
                        }
                    }}
                />
            </Show>
        </div>
    )
}

export function LockedCell(props: { value?: string | null, class?: string, style?: JSX.CSSProperties }) {
    const cell = useCellContext<string>()
    return (
        <div
            class={`${styles.lockedCell} ${props.class ?? ""}`}
            style={{
                ...props.style,
                height: `${TABLE_CELL_HEIGHT}px`,
                width: cell.column.getSize() + "px"
            }}
        >
            {props.value ?? cell.getValue()}
        </div>
    )
}