import { updateStudio } from "~/api/mutations";
import { createAsync, useAction } from "@solidjs/router";
import { getStudios } from "~/api/data";
import { createAppColumnHelper, createAppTable } from "~/utils/createTable";
import type { TStudio } from "~/datatypes";
import { createSignal, Show } from "solid-js";
import type { RowSelectionState } from "@tanstack/solid-table";
import { state } from "~/state";
import { createStore } from "solid-js/store";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { TABLE_CELL_HEIGHT, TABLE_HEADER_HEIGHT } from "~/constants";
import { ContextMenu } from "~/components/ContextMenu/ContextMenu";
import { TableBody } from "~/components/table-wrapper/TableBody";
import { TableHeader } from "~/components/table-wrapper/TableHeader";
import { enc } from "~/utils/encodeDecode";
import styles from "~/components/table-wrapper/Table.module.css"

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
    // columnHelper.display({
    //     header: "Test",
    //     cell: (props) => <props.cell.LockedCell value={"skdsfjs"} />
    // })
])

export function StudiosTable() {
    let ref!: HTMLDivElement
    const editStudio = useAction(updateStudio);
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

    state.mainPanel.selectionsFn(() => table.getSelectedRowIds()
        .map(id => studios().find(s => s.studioId === Number(id))).filter(Boolean)
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
                    <ContextMenu.Link href={`/movies/studios/${enc({ display: contextMenu.data.selectedName, id: contextMenu.data.selectedId })}`}> Go To Movies </ContextMenu.Link>
                </ContextMenu>
            </Show>
        </div>
    )
}