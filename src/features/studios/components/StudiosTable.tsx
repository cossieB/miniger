import { createAsync, useAction } from "@solidjs/router";
import { createAppColumnHelper, createAppTable } from "~/utils/createTable";
import type { TStudio } from "~/datatypes";
import { createSignal, Show } from "solid-js";
import type { RowSelectionState } from "@tanstack/solid-table";
import { createStore } from "solid-js/store";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { TABLE_CELL_HEIGHT, TABLE_HEADER_HEIGHT } from "~/constants";
import { ContextMenu } from "~/components/context-menu/ContextMenu";
import { TableBody } from "~/components/tables/TableBody";
import { TableHeader } from "~/components/tables/TableHeader";
import { enc } from "~/utils/encodeDecode";
import styles from "~/components/tables/Table.module.css"
import { deleteStudios, getStudios, updateStudio } from "../api";
import { confirm } from "@tauri-apps/plugin-dialog";
import { FilmIcon, PencilIcon, TrashIcon } from "lucide-solid";
import { state } from "~/state";

const columnHelper = createAppColumnHelper<TStudio>()

export const columns = columnHelper.columns([
    columnHelper.accessor("name", {
        size: 300,
        cell: props => <props.cell.TextCell onUpdate={async name => {
            props.table.options.meta?.editStudio!({
                studioId: props.row.original.studioId,
                name
            })
        }} />
    }),
    columnHelper.accessor("website", {
        size: 300,
        cell: props => <props.cell.TextCell onUpdate={async website => {
            props.table.options.meta?.editStudio!({
                studioId: props.row.original.studioId,
                website
            })
        }} />
    }),
])

export function StudiosTable() {
    let ref!: HTMLDivElement
    const editStudio = useAction(updateStudio);
    const del = useAction(deleteStudios)
    const studios = createAsync(() => getStudios(), { initialValue: [] });
    const virtualizer = createVirtualizer({
        get count() {
            return studios().length
        },
        estimateSize: () => TABLE_CELL_HEIGHT,
        getScrollElement: () => ref,
        overscan: 20
    })
    const [rowSelection, setRowSelection] = createSignal<RowSelectionState>({})
    const table = createAppTable<TStudio>({
        getRowId: row => row.studioId.toString(),
        key: "studios",
        get data() {
            return studios()
        },
        columns,
        state: {
            get rowSelection() {
                return rowSelection()
            }
        },
        onRowSelectionChange: setRowSelection,
        meta: {
            editStudio
        }
    })

    const handleDelete = async () => {
        const selections = table.getSelectedRowIds().map(Number);
        if (selections.length === 0) return;
        const confirmed = await confirm(`Permanently delete ${selections.length} studios from database?`, {
            kind: "warning",
            title: "Delete",
        })
        if (!confirmed) return;
        await del(selections)
        table.toggleAllRowsSelected(false);
        setContextMenu({isOpen: false})        
    }

    const [contextMenu, setContextMenu] = createStore({
        isOpen: false,
        x: 0,
        y: 0,
        data: {
            selectedId: -1,
            selectedName: "",
        }
    })

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
                if (e.key == "Delete")
                    return handleDelete()
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
                        <TableBody<ReturnType<typeof studios>[number]>
                            virtualizer={virtualizer}
                            handleRightClick={menu => setContextMenu({
                                ...menu,
                                data: {
                                    selectedId: menu.data.studioId,
                                    selectedName: menu.data.name
                                }
                            })}
                        />
                    </table>
                </table.AppTable>
            </div>
            <Show when={contextMenu.isOpen}>
                <ContextMenu pos={contextMenu} close={() => setContextMenu('isOpen', false)} >
                    <ContextMenu.Link
                        icon={<FilmIcon />}
                        href={`/movies/studios/${enc({ display: contextMenu.data.selectedName, id: contextMenu.data.selectedId })}`}
                    >
                        Go To Movies
                    </ContextMenu.Link>
                    <ContextMenu.Item
                        onClick={() => state.dialog.openDialog({type: "studio", data: {studioId: contextMenu.data.selectedId}})}
                        icon={<PencilIcon />}
                    >
                        Edit
                    </ContextMenu.Item>
                    <ContextMenu.Divider />
                    <ContextMenu.Item
                        icon={<TrashIcon />}
                        class="danger"
                        onClick={handleDelete}
                    >
                        Remove From Database
                    </ContextMenu.Item>
                </ContextMenu>
            </Show>
        </div>
    )
}