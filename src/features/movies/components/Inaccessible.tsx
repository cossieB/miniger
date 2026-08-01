import { createAsync } from "@solidjs/router";
import type { RowSelectionState } from "@tanstack/solid-table";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { createSignal } from "solid-js";
import { getInaccessible } from "~/api/data";
import { TABLE_CELL_HEIGHT, TABLE_HEADER_HEIGHT } from "~/constants";
import { state } from "~/state";
import { createAppColumnHelper, createAppTable } from "~/utils/createTable";
import styles from "~/components/table-wrapper/Table.module.css"
import { TableBody } from "~/components/table-wrapper/TableBody";
import { TableHeader } from "~/components/table-wrapper/TableHeader";
import type { MovieData } from "~/types";
import { Find } from "~/components/table-wrapper/FindCell";


const columnHelper = createAppColumnHelper<{ title: string, path: string, filmId: number }>();

const columns = columnHelper.columns([
    columnHelper.accessor("title", {
        cell: props => <props.cell.LockedCell />,
        size: 300
    }),
    columnHelper.accessor("path", {
        cell: props => <props.cell.LockedCell />,
        size: 500
    }),
    columnHelper.display({
        cell: Find,
        size: 50,
        id: "find",
    })
])

export default function Inaccessible() {
    let ref!: HTMLDivElement
    const movies = createAsync(() => getInaccessible(), { initialValue: [] });

    const [rowSelection, setRowSelection] = createSignal<RowSelectionState>({})

    const virtualizer = createVirtualizer({
        get count() {
            return movies().length
        },
        estimateSize: () => TABLE_CELL_HEIGHT,
        getScrollElement: () => ref,
        overscan: 20
    })

    const table = createAppTable({
        getRowId: row => row.filmId.toString(),
        key: "inaccess",
        get data() {
            return movies()
        },
        columns,
        enableSorting: false,
        state: {
            get rowSelection() {
                return rowSelection()
            }
        },
        onRowSelectionChange: setRowSelection,
        defaultColumn: {
            enableResizing: true,
        }
    })

    state.mainPanel.selectionsFn(() => table.getSelectedRowIds()
        .map(id => movies().find(m => m.filmId === Number(id))).filter(Boolean)
    );
    return (
        <div
            ref={ref}
            class={`${styles.table} scrollable`}
            tabIndex={-1}
            onkeyup={e => {
                if (e.key == "Escape")
                    return table.toggleAllRowsSelected(false)
                if (e.ctrlKey && e.key == "a") {
                    return table.toggleAllRowsSelected(true)
                }
                if (e.key === "Delete") {
                    document.getElementById("topbar-delete-btn")?.click()
                }
            }}
        >
            <div
                style={{
                    height: (virtualizer.getTotalSize() + TABLE_HEADER_HEIGHT) + "px",
                }}
            >
                <table.AppTable >
                    <table>
                        <TableHeader />
                        <TableBody<MovieData[number]>
                            virtualizer={virtualizer}
                        />
                    </table>
                </table.AppTable>
            </div>
        </div>
    );
}

