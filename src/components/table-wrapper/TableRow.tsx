import { type RowData, type Row, FlexRender } from "@tanstack/solid-table"
import type { VirtualItem } from "@tanstack/solid-virtual"
import { batch } from "solid-js"
import { For } from "solid-js/web"
import type { useMoviesContextMenu } from "~/hooks/useMoviesContextMenu"
import type { AppTableFeatures } from "~/utils/createTable"

type Props<T extends RowData> = {
    virtualRow: VirtualItem
    i: number
    rows: Row<AppTableFeatures, T>[]
    deselectAll: () => void
    setContextMenu?: ReturnType<typeof useMoviesContextMenu>['setContextMenu']
}

export function TableRow<T extends RowData>(props: Props<T>) {

    const row = () => props.rows[props.virtualRow.index]

    return (
        <tr
            class="hover:bg-zinc-900/60"
            style={{
                transform: `translateY(${props.virtualRow.start - props.i * props.virtualRow.size}px)`
            }}
            onClick={e => {
                batch(() => {
                    if (!e.ctrlKey)
                        props.deselectAll()
                    row().getToggleSelectedHandler()(e)
                })
            }}
            classList={{ "bg-zinc-700!": row().getIsSelected() }}
            onContextMenu={e => {
                e.preventDefault();
                batch(() => {
                    if (!e.ctrlKey) props.deselectAll()
                    row().toggleSelected(true);
                })
                props.setContextMenu?.({
                    isOpen: true,
                    data: {
                        ...row().original as any
                    },
                    x: e.clientX,
                    y: e.clientY
                })
            }}
        >
            <For each={row().getAllCells()}>
                {(cell) => (
                    <td>
                        <FlexRender cell={cell} />
                    </td>
                )}
            </For>
        </tr>
    )
}