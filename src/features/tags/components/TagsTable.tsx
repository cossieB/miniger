import { createAppColumnHelper, createAppTable } from "~/utils/createTable";
import { getTags } from "../api";
import { createAsync } from "@solidjs/router";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { TABLE_CELL_HEIGHT, TABLE_HEADER_HEIGHT } from "~/constants";
import { TableHeader } from "~/components/tables/TableHeader";
import { TableBody } from "~/components/tables/TableBody";
import styles from "~/components/tables/Table.module.css"
import { createStore } from "solid-js/store";
import { Show } from "solid-js";
import { ContextMenu } from "~/components/context-menu/ContextMenu";
import { FilmIcon } from "lucide-solid";

type TData = {
    tag: string;
    films: number;
};

const columnHelper = createAppColumnHelper<TData>();

const columns = columnHelper.columns([
    columnHelper.accessor("tag", {
        cell: props => <props.cell.LockedCell />,
        size: 200
    }),
    columnHelper.accessor("films", {
        cell: props => <props.cell.LockedCell style={{ "text-align": "right" }} />,
        size: 100
    }),
])

export function TagsTable() {
    let ref!: HTMLDivElement
    const tags = createAsync(() => getTags(), { initialValue: [] })

    const virtualizer = createVirtualizer({
        get count() {
            return tags().length
        },
        estimateSize: () => TABLE_CELL_HEIGHT,
        getScrollElement: () => ref,
        overscan: 20
    })

    const table = createAppTable({
        getRowId: row => row.tag,
        key: "tags",
        get data() {
            return tags()
        },
        columns,
        enableRowSelection: false,
        defaultColumn: {
            enableResizing: false,
        }
    })
    const [contextMenu, setContextMenu] = createStore({
        isOpen: false,
        x: 0,
        y: 0,
        data: {
            tag: ""
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
                        <TableBody<TData>
                            virtualizer={virtualizer}
                            handleRightClick={menu => setContextMenu(menu)}
                        />
                    </table>
                </table.AppTable>
            </div>
            <Show when={contextMenu.isOpen}>
                <ContextMenu pos={contextMenu} close={() => setContextMenu('isOpen', false)} >
                    <ContextMenu.Link
                        href={`/movies/tags/${contextMenu.data.tag}`}
                        icon={<FilmIcon />}
                    >
                        Go to movies
                    </ContextMenu.Link>
                </ContextMenu>
            </Show>            
        </div>
    )
}