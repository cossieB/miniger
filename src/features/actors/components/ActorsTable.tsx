import { useAction, createAsync } from "@solidjs/router";
import type { RowSelectionState } from "@tanstack/solid-table";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { createSignal, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { TABLE_CELL_HEIGHT, TABLE_HEADER_HEIGHT } from "~/constants";
import type { TActor } from "~/datatypes";
import { createAppTable } from "~/utils/createTable";
import { enc } from "~/utils/encodeDecode";
import { columns } from "./columns";
import styles from "~/components/tables/Table.module.css"
import { editActor, getActors, removeActors } from "../api";
import { TableBody } from "~/components/tables/TableBody";
import { TableHeader } from "~/components/tables/TableHeader";
import { ContextMenu } from "~/components/context-menu/ContextMenu";
import { confirm } from "@tauri-apps/plugin-dialog";
import { DramaIcon, FilmIcon, PencilIcon, TrashIcon } from "lucide-solid";
import { state } from "~/state";

export function ActorsTable() {
    let ref!: HTMLDivElement
    const del = useAction(removeActors)
    const updateActor = useAction(editActor);
    const actors = createAsync(() => getActors(), { initialValue: [] });
    const virtualizer = createVirtualizer({
        get count() {
            return actors().length
        },
        estimateSize: () => TABLE_CELL_HEIGHT,
        getScrollElement: () => ref,
        overscan: 20
    })
    const [rowSelection, setRowSelection] = createSignal<RowSelectionState>({})
    const table = createAppTable<TActor & { appearances: number | bigint | string }>({
        getRowId: row => row.actorId.toString(),
        key: "actors",
        get data() {
            return actors()
        },
        columns,
        state: {
            get rowSelection() {
                return rowSelection()
            }
        },
        onRowSelectionChange: setRowSelection,
        meta: {
            updateActor
        }
    })

    const handleDelete = async () => {
        const selections = table.getSelectedRowIds().map(Number);
        if (selections.length === 0) return;
        const confirmed = await confirm(`Permanently delete ${selections.length} actors from database?`, {
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
                        <TableBody<ReturnType<typeof actors>[number]>
                            virtualizer={virtualizer}
                            handleRightClick={menu => setContextMenu({
                                ...menu,
                                data: {
                                    selectedId: menu.data.actorId,
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
                        href={`/movies/actors/${enc({ display: contextMenu.data.selectedName, id: contextMenu.data.selectedId })}`}
                    >
                        Go To Movies
                    </ContextMenu.Link>
                    <ContextMenu.Link
                    icon={<DramaIcon />}
                        href={`/costars/${enc({ display: contextMenu.data.selectedName, id: contextMenu.data.selectedId })}`}
                    >
                        See Co-stars
                    </ContextMenu.Link>
                    <ContextMenu.Item
                        icon={<PencilIcon />}
                        onClick={() => state.dialog.openDialog({type: "actor", data: {actorId: contextMenu.data.selectedId}})}
                    >
                        Edit
                    </ContextMenu.Item>
                    <ContextMenu.Divider />
                    <ContextMenu.Item
                        icon={<TrashIcon />}
                        style={{
                            color: "var(--danger-500)"
                        }}
                        onClick={handleDelete}
                    >
                        Remove From Database
                    </ContextMenu.Item>
                </ContextMenu>
            </Show>
        </div>
    )
}