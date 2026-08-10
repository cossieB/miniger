import { Show, createEffect, createSignal } from "solid-js";
import type { MovieData } from "~/types";
import { type RowSelectionState } from "@tanstack/solid-table";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { TABLE_CELL_HEIGHT, TABLE_HEADER_HEIGHT } from "~/constants";
import { createAppTable } from "~/utils/createTable";
import { columns } from "./columns";
import { useMoviesContextMenu } from "~/features/movies/hooks/useMoviesContextMenu";
import { useAction } from "@solidjs/router";
import styles from "~/components/tables/Table.module.css"
import MoviesContextMenu from "~/features/movies/components/MoviesContextMenu";
import { TableBody } from "~/components/tables/TableBody";
import { TableHeader } from "~/components/tables/TableHeader";
import { editFilm } from "../../api";
import type { SortCriterion } from "../../utils/sort";
import { movieGridSort, setMovieGridSort } from "../../contexts/MovieDataContext";
import { useMovieDataContext } from "../../hooks/useMovieDataContext";

export function MoviesTable() {
    const {data} = useMovieDataContext()
    let ref!: HTMLDivElement
    const updateFilm = useAction(editFilm)
    const virtualizer = createVirtualizer({
        get count() {
            return data().length
        },
        estimateSize: () => TABLE_CELL_HEIGHT,
        getScrollElement: () => ref,
        overscan: 20
    })
    const [rowSelection, setRowSelection] = createSignal<RowSelectionState>({})

    const table = createAppTable<MovieData[number]>({
        key: "movies",
        get data() {
            return data();
        },
        getRowId: row => String(row.filmId),
        columns,
        state: {
            get rowSelection() {
                return rowSelection()
            },
            get sorting() {
                return movieGridSort()
            }
        },

        enableSorting: true,
        defaultColumn: {
            size: 250,
            minSize: 25,
            enableResizing: true
        },
        onSortingChange: setMovieGridSort,
        onRowSelectionChange: setRowSelection,
        columnResizeMode: "onChange",
        columnResizeDirection: "ltr",
        enableRowRangeSelection: true,
        meta: {
            updateFilm
        }
    });
createEffect(() => {
    const sorting = table.atoms.sorting.get();
    setMovieGridSort(sorting as SortCriterion[])
})
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
                    getSelectedFilms={() => table.getSelectedRowIds().map(rowId => data().find(film => film.filmId === Number(rowId))!).filter(Boolean)}
                />
            </Show>
        </div>
    );
}

