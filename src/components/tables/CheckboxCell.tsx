import { createSignal, type ComponentProps, splitProps } from "solid-js"
import { TABLE_CELL_HEIGHT } from "~/constants"
import { useCellContext } from "~/utils/createTable"
import styles from "./Cells.module.css"

type Props = {
    onUpdate: (val: boolean) => Promise<void>
} & ComponentProps<"input">

export function CheckboxCell(props: Props) {
    const [local, inputProps] = splitProps(props, ["onUpdate"])
    const cell = useCellContext<boolean>();
    const [loading, setLoading] = createSignal(false)
    const [startingVal, setStartingVal] = createSignal(cell.getValue()) //local state to prevent table resorting on update
    const [value, setValue] = createSignal(cell.getValue())
    let inputRef!: HTMLInputElement
    let isCancelled = false

    const handleSave = async () => {
        if (isCancelled || loading()) return

        const newValue = inputRef.checked

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
    }

    return (
        <div
            class={styles.cellWrapper}
            style={{
                width: `${cell.column.getSize()}px`,
                height: `${TABLE_CELL_HEIGHT}px`
            }}
        >
            <input
                {...inputProps}
                ref={inputRef}
                checked={value()}
                disabled={loading()}
                class={styles.textInput}
                onChange={handleSave}
                onKeyDown={e => {
                    if (e.key === "Enter") {
                        inputRef.blur()
                    }
                    if (e.key === "Escape") {
                        isCancelled = true
                        setValue(startingVal())
                    }
                }}
            />
        </div>
    )
}