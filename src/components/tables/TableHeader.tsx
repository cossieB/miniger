import { FlexRender } from "@tanstack/solid-table";
import { For } from "solid-js";
import { TABLE_HEADER_HEIGHT } from "~/constants";
import { SortIcon } from "./SortIcon";
import { useTableContext } from "~/utils/createTable";
import styles from "./Table.module.css"

export function TableHeader() {
    const table = useTableContext()
    return (
        <thead>
            <For each={table.getHeaderGroups()}>
                {(headerGroup) => (
                    <tr style={{
                        height: TABLE_HEADER_HEIGHT + "px"
                    }}>
                        <For each={headerGroup.headers}>
                            {(header) => (
                                <th
                                    classList={{
                                        [styles.sortable]: header.column.getCanSort(),
                                    }}

                                    onClick={header.column.getToggleSortingHandler()}
                                >
                                    <div
                                        class={styles.headerWrapper}
                                        style={{
                                            width: header.getSize() + "px",
                                            height: TABLE_HEADER_HEIGHT + "px"
                                        }}
                                    >
                                        <FlexRender header={header} />
                                        <SortIcon
                                            sortable={header.column.getCanSort()}
                                            desc={header.column.getIsSorted() === false ? undefined : header.column.getIsSorted()  === "desc"}
                                        />
                                        <div
                                            class={styles.slider}
                                            onClick={e => {
                                                e.stopPropagation()
                                            }}
                                            onPointerDown={e => {
                                                e.currentTarget.setPointerCapture(e.pointerId)
                                                header.getResizeHandler()(e)
                                            }} 
                                            onPointerUp={e => {
                                                e.currentTarget.releasePointerCapture(e.pointerId)
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