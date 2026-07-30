import { useAction, createAsync } from "@solidjs/router";
import type { RowSelectionState } from "@tanstack/solid-table";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { createSignal, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { getActors } from "~/api/data";
import { editActor } from "~/api/mutations";
import { ContextMenu } from "~/components/ContextMenu/ContextMenu";
import { TableBody } from "~/components/table-wrapper/TableBody";
import { TableHeader } from "~/components/table-wrapper/TableHeader";
import { TABLE_CELL_HEIGHT, TABLE_HEADER_HEIGHT } from "~/constants";
import type { TActor } from "~/datatypes";
import { state } from "~/state";
import { createAppTable } from "~/utils/createTable";
import { enc } from "~/utils/encodeDecode";
import { columns } from "./columns";
import styles from "~/components/table-wrapper/Table.module.css"

export function ActorsTable() {
    let ref!: HTMLDivElement
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
    const table = createAppTable<TActor & {appearances: number | bigint | string}>({
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

    state.mainPanel.selectionsFn(() => table.getSelectedRowIds()
        .map(id => actors().find(a => a.actorId === Number(id))).filter(Boolean)
    );

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
                         <ContextMenu.Link href={`/movies/actors/${enc({display: contextMenu.data.selectedName, id: contextMenu.data.selectedId})}`}> Go To Movies </ContextMenu.Link>
                         <ContextMenu.Link href={`/costars/${enc({display: contextMenu.data.selectedName, id: contextMenu.data.selectedId})}`} >See Co-stars</ContextMenu.Link>
                </ContextMenu>
            </Show>
        </div>
    )
}