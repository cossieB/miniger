import { FlexRender } from "@tanstack/solid-table";
import { For } from "solid-js";
import { TABLE_HEADER_HEIGHT } from "~/constants";
import { SortIcon } from "./SortIcon";
import { useTableContext } from "~/utils/createTable";

export function TableHeader() {
    const table = useTableContext()
    return (
        <thead class="sticky top-0 z-10 bg-zinc-900">
            <For each={table.getHeaderGroups()}>
                {(headerGroup) => (
                    <tr style={{
                        height: TABLE_HEADER_HEIGHT + "px"
                    }}>
                        <For each={headerGroup.headers}>
                            {(header) => (
                                <th
                                    class="whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-zinc-500 overflow-hidden truncate text-ellipsis"
                                    classList={{
                                        "cursor-pointer select-none hover:text-zinc-300": header.column.getCanSort(),
                                    }}

                                    onClick={header.column.getToggleSortingHandler()}
                                >
                                    <div
                                        class="flex h-full justify-center items-center gap-1.5 relative"
                                        style={{
                                            width: header.getSize() + "px",
                                            height: TABLE_HEADER_HEIGHT + "px"
                                        }}
                                    >
                                        <FlexRender header={header} />
                                        <SortIcon
                                            sortable={header.column.getCanSort()}
                                            direction={header.column.getIsSorted()}
                                        />
                                        <div
                                            class="h-1/2 w-0.5 bg-zinc-500 absolute right-0 top-1/2 -translate-y-1/2 cursor-ew-resize"
                                            onClick={e => {
                                                e.stopPropagation()
                                            }}
                                            onPointerDown={e => {
                                                e.currentTarget.setPointerCapture(e.pointerId)
                                                header.getResizeHandler()(e)
                                            }} 
                                        />
                                    </div>
                                </th>
                            )}
                        </For>
                    </tr>
                )}
            </For>
        </thead>
    )
}