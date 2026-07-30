import type { Virtualizer } from "@tanstack/solid-virtual";
import columns from "lucide-solid/icons/columns";
import { Show, For, batch, createMemo } from "solid-js";
import { useTableContext } from "~/utils/createTable";

type Props<T extends object> = {
    virtualizer: Virtualizer<HTMLDivElement, Element>
    handleRightClick?: (data: {
        x: number,
        y: number,
        isOpen: boolean,
        data: T
    }) => void
}

export function TableBody<TData extends object>(props: Props<TData>) {
    const table = useTableContext()
    const rows = createMemo(() => table.getRowModel().rows)
    const deselectAll = () => table.toggleAllRowsSelected(false);
    return (
        <tbody class="relative">
            <Show
                when={table.getRowModel().rows.length > 0}
                fallback={
                    <tr>
                        <td
                            colSpan={columns.length}
                            class="px-4 py-10 text-center text-zinc-600"
                        >
                            Nothing to show.
                        </td>
                    </tr>
                }
            >
                <For each={props.virtualizer.getVirtualItems()}>
                    {(virtualRow, i) => {
                        const row = () => rows()[virtualRow.index]

                        return (
                            <tr
                                class="hover:bg-zinc-900/60"
                                style={{
                                    position: 'absolute',
                                    transform: `translateY(${virtualRow.start}px)`,
                                    width: '100%',
                                }}
                                onClick={e => {
                                    batch(() => {
                                        if (!e.ctrlKey)
                                            deselectAll()
                                        row()?.getToggleSelectedHandler()(e)
                                    })
                                }}
                                classList={{ "bg-zinc-700!": row().getIsSelected() }}
                                onContextMenu={e => {
                                    e.preventDefault();
                                    batch(() => {
                                        if (!row()?.getIsSelected() && !e.ctrlKey)
                                            deselectAll()
                                        row()?.toggleSelected(true);
                                    })
                                    props.handleRightClick?.({
                                        isOpen: true,
                                        data: {
                                            ...row().original as any
                                        },
                                        x: e.clientX,
                                        y: e.clientY
                                    })
                                }}
                            >
                                <For each={row()?.getAllCells()}>
                                    {(cell) => (
                                        <table.AppCell cell={cell}>
                                            {cell => (
                                                <td>
                                                    <cell.FlexRender />
                                                </td>
                                            )}
                                        </table.AppCell>
                                    )}
                                </For>
                            </tr>
                        )
                    }}
                </For>
            </Show>
        </tbody>
    )
}