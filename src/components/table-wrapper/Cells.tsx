import { createEffect, createSignal, type JSX, Show, type ComponentProps, splitProps } from "solid-js"
import { useCellContext } from "~/utils/createTable"

type Props = {
    onUpdate: (val: string) => Promise<void>
} & ComponentProps<"input">

export function TextCell(props: Props) {
    const [local, inputProps] = splitProps(props, ["onUpdate"])
    
    const cell = useCellContext<string>()
    const [edit, setEdit] = createSignal(false)
    const [loading, setLoading] = createSignal(false)
    
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
        const oldValue = cell.getValue()

        if (newValue !== oldValue) {
            try {
                setLoading(true)
                await local.onUpdate(newValue)
            } catch (error) {
                console.error("Failed to commit cell update:", error)
            } finally {
                setLoading(false)
            }
        }
        
        setEdit(false)
    }

    return (
        <div
            class="flex flex-col px-2 justify-center overflow-hidden"
            style={{
                width: `${cell.column.getSize()}px`
            }}
        >
            <Show
                when={edit()}
                fallback={
                    <span
                        class="font-medium text-zinc-100 truncate text-ellipsis outline-0 cursor-pointer"
                        onDblClick={() => setEdit(true)}
                    >
                        {cell.getValue()}
                    </span>
                }
            >
                <input
                    {...inputProps}
                    ref={inputRef}
                    value={cell.getValue()}
                    disabled={loading()}
                    class="font-medium text-zinc-100 truncate text-ellipsis outline-0 bg-transparent disabled:opacity-50"
                    onBlur={handleSave}
                    onKeyDown={e => {
                        if (e.key === "Enter") {
                            inputRef.blur()
                        }
                        if (e.key === "Escape") {
                            isCancelled = true
                            setEdit(false)
                        }
                    }}
                />
            </Show>
        </div>
    )
}

export function LockedCell(props: {value?: string | null, class?: string, style?: JSX.CSSProperties}) {
    const cell = useCellContext<string>()
    return (
        <div
            class={"flex flex-col px-2 justify-center overflow-hidden text-zinc-500 truncate " + (props.class ?? "")}
            style={{
                ...props.style,
                width: cell.column.getSize() + "px"
            }}
        >
            {props.value ?? cell.getValue()}
        </div>
    )
}

