import { For, Show, createEffect, createMemo, createSignal, untrack } from "solid-js";
import type { MovieData } from "~/types";
import {
    createSolidTable,
    getCoreRowModel,
    getSortedRowModel,
    createColumnHelper,
    flexRender,
    type SortingState,
    type Table,
    type RowModel,
    type Row,
} from "@tanstack/solid-table";
import { createVirtualizer, type VirtualItem } from "@tanstack/solid-virtual";
import { TABLE_CELL_HEIGHT, TABLE_HEADER_HEIGHT } from "~/constants";
import { unwrap } from "solid-js/store";



function formatDate(value: string | null) {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
    });
}

const columnHelper = createColumnHelper<MovieData[number]>();

const columns = [
    columnHelper.accessor("title", {
        header: "Title",
        enableResizing: true,
        size: 600,
        cell: (info) => (
            <div
                class="flex flex-col px-2 justify-center overflow-hidden "
                style={{
                    width: info.column.getSize() + "px"
                }}
            >
                <span class="font-medium text-zinc-100 truncate text-ellipsis">
                    {info.getValue()}
                </span>
                <span class="text-xs text-zinc-500 truncate ">
                    {info.row.original.path}
                </span>
            </div>
        ),
    }),
    columnHelper.accessor("studioName", {
        header: "Studio",
        size: 150,
        enableSorting: false,
        cell: (info) => (
            <div
                class="text-zinc-400 px-2"
                style={{
                    width: info.column.getSize() + "px"
                }}
            >
                {info.getValue() ?? "—"}
            </div>
        ),
    }),
    columnHelper.accessor("actors", {
        header: "Cast",
        enableSorting: false,
        cell: (info) => {
            const actors = info.row.original.actors;
            return (
                <div class="flex flex-wrap gap-1 items-center"
                    style={{
                        width: info.column.getSize() + "px",
                        height: TABLE_CELL_HEIGHT + "px"
                    }}
                >

                    <For each={actors.slice(0, 3)}>
                        {(actor) => (
                            <span class="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300 grow-0 h-min">
                                {actor.name}
                            </span>
                        )}
                    </For>
                    <Show when={actors.length > 3}>
                        <span class="rounded-full bg-zinc-800/60 px-2 py-0.5 text-xs text-zinc-500">
                            +{actors.length - 3}
                        </span>
                    </Show>
                </div>
            );
        },
    }),
    columnHelper.accessor("tags", {
        header: "Tags",
        enableSorting: false,
        cell: (info) => {
            const tags = info.getValue();
            return (
                <div
                    class="flex flex-wrap items-center"
                    style={{
                        width: info.column.getSize() + "px",
                        height: TABLE_CELL_HEIGHT + "px"
                    }}
                >
                    <Show
                        when={tags.length > 0}
                        fallback={<span class="text-zinc-600">—</span>}
                    >
                        <For each={tags}>
                            {(tag) => (
                                <span class="rounded border border-amber-500/30 px-1.5 py-0.5 text-[11px] uppercase tracking-wide text-amber-400/90 grow-0 h-min">
                                    {tag}
                                </span>
                            )}
                        </For>
                    </Show>
                </div>
            );
        },
    }),
    columnHelper.accessor("releaseDate", {
        header: "Released",
        size: 100,
        cell: (info) => (
            <div
                class="font-mono text-sm text-zinc-400"
                style={{
                    width: info.column.getSize() + "px",

                }}
            >
                {formatDate(info.getValue())}
            </div>
        ),
    }),
    columnHelper.accessor("dateAdded", {
        header: "Added",
        size: 175,
        cell: (info) => (
            <div
                class="font-mono text-sm text-zinc-500"
                style={{
                    width: info.column.getSize() + "px",

                }}
            >
                {info.getValue()}
            </div>
        ),
    }),
]


function SortIcon(props: {
    direction: false | "asc" | "desc";
    sortable: boolean;
}) {
    if (!props.sortable) return null;
    return (
        <span class="inline-flex w-3 flex-col leading-none text-[8px]">
            <span
                class={
                    props.direction === "asc"
                        ? "text-amber-400"
                        : "text-zinc-600"
                }
            >
                ▲
            </span>
            <span
                class={
                    props.direction === "desc"
                        ? "text-amber-400"
                        : "text-zinc-600"
                }
            >
                ▼
            </span>
        </span>
    );
}

export function MoviesTable(props: { data: MovieData }) {
    console.log(props.data.length)
    let ref!: HTMLDivElement
    const data = () => props.data

    const virtualizer = createMemo(() => createVirtualizer({
        count: data().length,
        estimateSize: () => TABLE_CELL_HEIGHT,
        getScrollElement: () => ref,        
    }))
    const [sorting, setSorting] = createSignal<SortingState>([
        { id: "title", desc: false },
    ]);

    const table = createSolidTable({
        get data() {
            return data();
        },
        columns,
        state: {
            get sorting() {
                return sorting();
            },
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        defaultColumn: {
            size: 250,
            minSize: 50,
            enableResizing: true
        },
        columnResizeMode: "onChange",
        columnResizeDirection: "ltr"
    });

    const rows = createMemo(() => table.getRowModel().rows); createEffect(() => console.log(unwrap(rows())))

    return (
        <div ref={ref} class="w-full h-full overflow-scroll rounded-lg border border-zinc-800 bg-zinc-950 relative">
            <div
                style={{
                    height: (virtualizer().getTotalSize() + TABLE_HEADER_HEIGHT) + "px",
                }}
            >
                <table class="border-collapse text-left text-sm">
                    <thead class="sticky top-0 z-10 bg-zinc-900">
                        <For each={table.getHeaderGroups()}>
                            {(headerGroup) => (
                                <tr class="border-b border-zinc-800">
                                    <For each={headerGroup.headers}>
                                        {(header) => (
                                            <th
                                                class="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500"
                                                classList={{
                                                    "cursor-pointer select-none hover:text-zinc-300": header.column.getCanSort(),
                                                }}
                                                style={{
                                                    width: header.getSize() + "px"
                                                }}
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                <div class="flex items-center gap-1.5">
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    <SortIcon
                                                        sortable={header.column.getCanSort()}
                                                        direction={header.column.getIsSorted()}
                                                    />
                                                </div>
                                            </th>
                                        )}
                                    </For>
                                </tr>
                            )}
                        </For>
                    </thead>
                    <tbody>
                        <Show
                            when={table.getRowModel().rows.length > 0}
                            fallback={
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        class="px-4 py-10 text-center text-zinc-600"
                                    >
                                        Nothing to show.
                                    </td>
                                </tr>
                            }
                        >
                            <For each={virtualizer().getVirtualItems()}>
                                {(virtualRow, i) => (
                                    <TableRow
                                        i={i()}
                                        rows={rows()}
                                        virtualRow={virtualRow}
                                    />
                                )}
                            </For>
                        </Show>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function TableRow(props: { virtualRow: VirtualItem, i: number, rows: Row<MovieData[number]>[] }) {
    
    const row = () => props.rows[props.virtualRow.index]

    return (
        <tr
            class="border-b border-zinc-900 hover:bg-zinc-900/60"
            style={{
                transform: `translateY(${
                      props.virtualRow.start - props.i * props.virtualRow.size
                    }px)`
            }}
        >
            <For each={row().getVisibleCells()}>
                {(cell) => (
                    <td>
                        {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                        )}
                    </td>
                )}
            </For>
        </tr>
    )
}

// export function MoviesTable(props: { data: MovieData }) {
//     const updateFilmAction = useAction(editFilm)

//     const [contextMenu, setContextMenu] = createStore({
//         isOpen: false,
//         x: 0,
//         y: 0,
//         close() {
//             setContextMenu('isOpen', false)
//         },
//         data: {} as MovieTableData,
//         selections: [] as MovieTableData[]
//     })
//     return (
//         <div
//             id='gridContainer'
//             class='ag-theme-alpine-dark h-full relative'
//         >
//             <GridWrapper
//                 gridId={location.pathname}
//                 getRowId={params => params.data.filmId.toString()}
//                 rowSelection="multiple"
//                 autoSizeStrategy={{
//                     type: "fitCellContents",
//                     colIds: ["length", "size", "bitrate", "format", "res", "release", "studio"],
//                     skipHeader: true
//                 }}
//                 rowData={props.data}
//                 onSelectionChanged={(params) => {
//                     // const selection = params.api.getSelectedRows();
//                     // state.mainPanel.setSelectedIds(selection.map(x => (x.filmId)))
//                 }}
//                 onCellContextMenu={params => {
//                     setContextMenu({
//                         isOpen: true,
//                         x: (params.event as MouseEvent).clientX,
//                         y: (params.event as MouseEvent).clientY,
//                         data: params.data,
//                         selections: params.api.getSelectedRows(),
//                     })
//                 }}
//                 defaultColDef={{
//                     suppressKeyboardEvent: ({ event }) => event.key === "Delete",
//                 }}
//                 onCellKeyDown={params => {
//                     if (!params.event) return
//                     const e = params.event as KeyboardEvent
//                     if (e.key === "a" && e.ctrlKey) {
//                         params.api.selectAll()
//                     }
//                 }}
//                 columnDefs={[{
//                     field: 'title',
//                     filter: true,
//                     editable: true,
//                     onCellValueChanged: async (params) => {
//                         updateFilmAction({ title: params.newValue, filmId: params.data.filmId })
//                     },
//                     tooltipField: 'title'
//                 }, {
//                     field: "studioName",
//                     colId: "studio",
//                     editable: true,
//                     headerName: "Studio",
//                     cellEditor: AgStudioSelector,
//                     cellEditorPopup: true,
//                     valueSetter: (params) => {
//                         const value = JSON.parse(params.newValue);
//                         if (value.name === "") return false;
//                         params.data.studioName = value.name == "Unknown" ? "" : value.name
//                         params.data.studioId = value.id
//                         return true
//                     }
//                 }, {
//                     field: "actors",
//                     valueFormatter: params => params.value.map((x: any) => x.name).join(", "),
//                     filter: true,
//                     editable: true,
//                     cellEditor: AgActorSelector,
//                     cellEditorPopup: true,
//                     cellEditorPopupPosition: "over",
//                     tooltipComponentParams: {
//                         delay: 7
//                     },
//                     tooltipValueGetter: params => params.value.map((x: any) => x.name).join(", "),
//                     tooltipComponent: Tooltip
//                 }, {
//                     field: "releaseDate",
//                     colId: "release",
//                     editable: true,
//                     cellEditor: "agDateStringCellEditor",
//                     onCellValueChanged: params => updateFilmAction({
//                         releaseDate: params.newValue ?? null,
//                         filmId: params.data.filmId
//                     })
//                 }, {
//                     field: "tags",
//                     editable: true,
//                     cellEditor: AgTagSelector,
//                     cellEditorPopupPosition: "over",
//                     cellEditorPopup: true,
//                     valueFormatter: params => params.value.join(", "),
//                 }, {
//                     field: "path",
//                 }, {
//                     field: "dateAdded",
//                     valueFormatter: param => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: "medium" }).format(new Date(param.value + " UTC"))
//                 },
//                 {
//                     headerName: "Length",
//                     colId: "length",
//                     valueGetter: param => param.data?.metadata?.format.duration,
//                     cellStyle: {
//                         "text-align": "right"
//                     },
//                     valueFormatter: param => {
//                         if (!param.value) return "";
//                         return secondsToTime(param.value)
//                     }
//                 },
//                 {
//                     headerName: "Size",
//                     colId: "size",
//                     valueGetter: param => param.data?.metadata?.format.size,
//                     valueFormatter: param => param.value ? new Intl.NumberFormat(undefined, {useGrouping: true}).format(param.value) : "",
//                     cellClass: "text-right"
//                 },
//                 {
//                     headerName: "Bit Rate",
//                     colId: "bitrate",
//                     valueGetter: param => param.data?.metadata?.format.bit_rate,
//                     valueFormatter: param => param.value ? new Intl.NumberFormat(undefined, {useGrouping: true}).format(param.value) : "",
//                     cellClass: "text-right"
//                 },
//                 {
//                     headerName: "Format",
//                     colId: "format",
//                     valueGetter: param => {
//                         return param.data?.metadata?.streams.find(x => x.codec_type == "video")?.codec_name
//                     },
//                 },
//                 {
//                     headerName: "Resolution",
//                     colId: "res",
//                     valueGetter: param => {
//                         const videoStream = param.data?.metadata?.streams.find(x => x.codec_type == "video")
//                         if (!videoStream) return null
//                         return `${videoStream.width}x${videoStream.height}`
//                     }
//                 }
//                 ]}
//             />
//             <Show when={contextMenu.isOpen}>
//                 <MoviesContextMenu isMainPanel contextMenu={contextMenu} />
//             </Show>
//         </div>
//     )
// }

// function Tooltip(params: ITooltipParams) {
//     return (
//         <ul class="grid text-center max-h-[50vh] overflow-auto max-w-[50vw]  actorsList">
//             <For each={params.data.actors}>
//                 {actor => <ActorItem2 actor={actor} />}
//             </For>
//         </ul>
//     )
// }
