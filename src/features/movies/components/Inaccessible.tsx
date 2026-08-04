import { createAsync, useAction } from "@solidjs/router";
import type { RowSelectionState } from "@tanstack/solid-table";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { createSignal, Show } from "solid-js";
import { TABLE_CELL_HEIGHT, TABLE_HEADER_HEIGHT } from "~/constants";
import { createAppColumnHelper, createAppTable } from "~/utils/createTable";
import styles from "~/components/tables/Table.module.css"
import { TableBody } from "~/components/tables/TableBody";
import { TableHeader } from "~/components/tables/TableHeader";
import { Find } from "~/components/tables/FindCell";
import { getInaccessible, deleteFilmsByIds } from "../api";
import { confirm } from "@tauri-apps/plugin-dialog";
import { createStore } from "solid-js/store";
import { ContextMenu } from "~/components/context-menu/ContextMenu";
import type { UnwrapAsyncSignal } from "~/lib/utilityTypes";
import { Trash2Icon } from "lucide-solid";

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
    type TData = UnwrapAsyncSignal<typeof movies>[number]
    const deleteFilms = useAction(deleteFilmsByIds)

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

    const handleDelete = async () => {
        const selections = table.getSelectedRowIds().map(Number)
        if (selections.length === 0) return
        const confirmed = await confirm(`Permanently delete ${selections.length} film${selections.length != 1 ? "s" : ""} from the database?`, { kind: "warning" });
        if (!confirmed) return;
        await deleteFilms(selections)
        table.toggleAllRowsSelected(false);
        setContextMenu({isOpen: false})   
    }

    const [contextMenu, setContextMenu] = createStore({
        isOpen: false,
        x: 0,
        y: 0,
        data: null as TData | null
    })

    return (
        <div
            ref={ref}
            class={`${styles.table} scrollable`}
            tabIndex={-1}
            onkeyup={async e => {
                if (e.key == "Escape")
                    return table.toggleAllRowsSelected(false)
                if (e.ctrlKey && e.key == "a") {
                    return table.toggleAllRowsSelected(true)
                }
                if (e.key === "Delete") {
                    await handleDelete()
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
                        <TableBody<TData>
                            virtualizer={virtualizer}
                            handleRightClick={menu => setContextMenu(menu)}
                        />
                    </table>
                </table.AppTable>
            </div>
            <Show when={contextMenu.isOpen}>
                <ContextMenu pos={contextMenu} close={() => setContextMenu('isOpen', false)} >
                    <ContextMenu.Item
                        onClick={handleDelete}
                        icon={<Trash2Icon />}
                        style={{
                            color: "var(--danger-500)"
                        }}
                    >
                        Delete Selected
                    </ContextMenu.Item>
                </ContextMenu>
            </Show>
        </div>
    );
}

