import { A, createAsync } from "@solidjs/router";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { createStore } from "solid-js/store";
import { TABLE_CELL_HEIGHT, TABLE_HEADER_HEIGHT } from "~/constants";
import type { allPairings } from "~/repositories/actorsRepository";
import { createAppColumnHelper, createAppTable } from "~/utils/createTable";
import { enc } from "~/utils/encodeDecode";
import styles from "~/components/tables/Table.module.css"
import { Show } from "solid-js";
import { TableBody } from "~/components/tables/TableBody";
import { TableHeader } from "~/components/tables/TableHeader";
import { ContextMenu } from "~/components/context-menu/ContextMenu";

type P = Awaited<ReturnType<typeof allPairings>>

const columnHelper = createAppColumnHelper<P[number]>()

const columns = columnHelper.columns([
    columnHelper.accessor("actorA", {
        header: "Actor",
        cell: props => <props.cell.LockedCell />
    }),
    columnHelper.accessor("actorB", {
        header: "Co-Star",
        cell: props => <props.cell.LockedCell />
    }),
    columnHelper.accessor("together", {
        header: "Movies",
        cell: props => <props.cell.LockedCell style={{"text-align": "right"}} />
    }),
    columnHelper.display({
        id: "link",
        cell: props => {
            return (
                <A
                    class="flexCenter"
                    style={{
                        height: TABLE_CELL_HEIGHT + "px",
                        width: props.column.getSize() + "px",
                        "text-align": "center",
                        "white-space": "nowrap",
                        overflow: "hidden",
                        "text-overflow": "ellipsis"
                    }}
                    href={`/movies/actors/${enc({ id: props.row.original.actorAid, display: props.row.original.actorA })}/${enc({ id: props.row.original.actorBid, display: props.row.original.actorB })}`}
                >
                    View Movies
                </A>
            )
        }
    })
])

type Props = {
    fetcher(): ReturnType<typeof allPairings>
}

export function CostarsTable(props: Props) {
    const data = createAsync(() => props.fetcher(), { initialValue: [] });
    let ref!: HTMLDivElement

    const table = createAppTable<P[number]>({
        key: "costars",
        get data() {
            return data()
        },
        columns,
        enableRowSelection: false,
    })

    const virtualizer = createVirtualizer({
        get count() {
            return data().length
        },
        estimateSize: () => TABLE_CELL_HEIGHT,
        getScrollElement: () => ref,
        overscan: 20
    })
    const [contextMenu, setContextMenu] = createStore({
        isOpen: false,
        x: 0,
        y: 0,
        data: {
            actorAid: -1,
            actorBid: -1,
            actorA: "",
            actorB: "",
        }
    })
    return (
        <div
            ref={ref}
            class={`${styles.table} scrollable`}
            tabIndex={-1}
        >
            <div
                style={{
                    height: (virtualizer.getTotalSize() + TABLE_HEADER_HEIGHT) + "px",
                }}
            >
                <table.AppTable >
                    <table>
                        <TableHeader />
                        <TableBody<ReturnType<typeof data>[number]>
                            virtualizer={virtualizer}
                            handleRightClick={menu => setContextMenu({
                                ...menu,
                                data: {
                                    ...menu.data
                                }
                            })}
                        />
                    </table>
                </table.AppTable>
            </div>
            <Show when={contextMenu.isOpen}>
                <ContextMenu pos={contextMenu} close={() => setContextMenu('isOpen', false)} >
                    <ContextMenu.Link href={`/movies/actors/${enc({id: contextMenu.data.actorAid, display: contextMenu.data.actorA})}`}> <span class="font-bold whitespace-pre">{contextMenu.data.actorA} </span>Movies </ContextMenu.Link>
                    <ContextMenu.Link href={`/movies/actors/${enc({id: contextMenu.data.actorBid, display: contextMenu.data.actorB})}`}> <span class="font-bold whitespace-pre">{contextMenu.data.actorB} </span>Movies </ContextMenu.Link>
                </ContextMenu>
            </Show>
        </div>
    )
}