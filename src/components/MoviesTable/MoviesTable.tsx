import { Show, createSignal, createUniqueId } from "solid-js";
import type { MovieData } from "~/types";
import { type SortingState, type RowSelectionState } from "@tanstack/solid-table";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { TABLE_CELL_HEIGHT, TABLE_HEADER_HEIGHT } from "~/constants";
import { createAppTable } from "~/utils/createTable";
import { columns } from "./columns";
import { state } from "~/state";
import { type SidepanelFile } from "~/state";
import { TableHeader } from "../table-wrapper/TableHeader";
import MoviesContextMenu from "../MoviesContextMenu";
import { useMoviesContextMenu } from "~/hooks/useMoviesContextMenu";
import { TableBody } from "../table-wrapper/TableBody";
import { useAction } from "@solidjs/router";
import { editFilm } from "~/api/mutations";
import styles from "~/components/table-wrapper/Table.module.css"

const [sorting, setSorting] = createSignal<SortingState>([]);

export function MoviesTable(props: { data: MovieData }) {
    let ref!: HTMLDivElement
    const updateFilm = useAction(editFilm)
    const virtualizer = createVirtualizer({
        get count() {
            return props.data.length
        },
        estimateSize: () => TABLE_CELL_HEIGHT,
        getScrollElement: () => ref,
        overscan: 20
    })
    const [rowSelection, setRowSelection] = createSignal<RowSelectionState>({})

    const table = createAppTable<MovieData[number]>({
        key: "movies",
        get data() {
            return props.data;
        },
        getRowId: row => String(row.filmId),
        columns,
        state: {
            get sorting() {
                return sorting();
            },
            get rowSelection() {
                return rowSelection()
            }
        },
        onSortingChange: setSorting,
        enableSorting: true,
        defaultColumn: {
            size: 250,
            minSize: 25,
            enableResizing: true
        },
        onRowSelectionChange: setRowSelection,
        columnResizeMode: "onChange",
        columnResizeDirection: "ltr",
        enableRowRangeSelection: true,
        meta: {
            updateFilm
        }
    });

    state.mainPanel.selectionsFn(() => table.getSelectedRowIds().map((id): SidepanelFile | undefined => {
        const file = props.data.find(film => film.filmId === Number(id))
        if (file) return {
            ...file,
            isSelected: false,
            lastDraggedOver: false,
            selectedLast: false,
            rowId: createUniqueId()
        }
    }).filter(Boolean))

    const { contextMenu, setContextMenu } = useMoviesContextMenu()
    
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
                            handleRightClick={data => setContextMenu(data)}
                        />                        
                    </table>
                </table.AppTable>
            </div>
            <Show when={contextMenu.isOpen}>
                <MoviesContextMenu
                    contextMenu={contextMenu}
                    isMainPanel
                />
            </Show>
        </div>
    );
}

