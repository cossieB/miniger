import { createAsync, useAction } from "@solidjs/router";
import type { RowSelectionState } from "@tanstack/solid-table";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { createSignal } from "solid-js";
import { getInaccessible } from "~/api/data";
import { TABLE_CELL_HEIGHT, TABLE_HEADER_HEIGHT } from "~/constants";
import { state } from "~/state";
import { createAppColumnHelper, createAppTable, useCellContext } from "~/utils/createTable";
import styles from "~/components/table-wrapper/Table.module.css"
import { TableBody } from "~/components/table-wrapper/TableBody";
import { TableHeader } from "~/components/table-wrapper/TableHeader";
import type { MovieData } from "~/types";
import { editFilm } from "~/api/mutations";
import { open, } from "@tauri-apps/plugin-dialog";
import videoExtensions from "~/videoExtensions.json"
import { SearchIcon } from "lucide-solid";

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
            class={styles.table}
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

function Find() {
    const action = useAction(editFilm)
    const cell = useCellContext()

    return (
        <div
            style={{
                width: `${cell.column.getSize()}px`,
                height: `${TABLE_CELL_HEIGHT}px`,
            }}
            class="flexCenter"
        >
            <button
                title="Find file"
                onClick={async () => {
                    const sel = await open({
                        filters: [{
                            extensions: videoExtensions,
                            name: "Video Files",
                        }]
                    })
                    if (!sel) return;
                    await action({ path: sel, filmId: cell.row.original.filmId }, [getInaccessible.key])
                }}
            >
                <SearchIcon />
            </button>
        </div>
    )
}