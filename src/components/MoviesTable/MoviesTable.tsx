import { For, Show, createMemo, createSignal, createUniqueId } from "solid-js";
import type { MovieData } from "~/types";
import { type SortingState, type Row, type RowSelectionState, FlexRender } from "@tanstack/solid-table";
import { createVirtualizer, type VirtualItem } from "@tanstack/solid-virtual";
import { TABLE_CELL_HEIGHT, TABLE_HEADER_HEIGHT } from "~/constants";
import { createAppTable, type AppTableFeatures } from "~/utils/createTable";
import { columns } from "./columns";
import { SortIcon } from "../SortIcon";
import { state } from "~/state";
import { type SidepanelFile } from "~/state";

const [sorting, setSorting] = createSignal<SortingState>([]);

export function MoviesTable(props: { data: MovieData }) {
    let ref!: HTMLDivElement

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
    
    const rows = createMemo(() => table.getRowModel().rows);
        
    return (
        <div ref={ref} class="w-full h-full overflow-scroll rounded-lg  bg-zinc-950 relative scrollable">
            <div
                style={{
                    height: (virtualizer.getTotalSize() + TABLE_HEADER_HEIGHT) + "px",
                }}
            >
                <table class="border-collapse text-left text-sm">
                    <thead class="sticky top-0 z-10 bg-zinc-900">
                        <For each={table.getHeaderGroups()}>
                            {(headerGroup) => (
                                <tr style={{
                                    height: TABLE_HEADER_HEIGHT + "px"
                                }}>
                                    <For each={headerGroup.headers}>
                                        {(header) => (
                                            <th
                                                class="whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-zinc-500"
                                                classList={{
                                                    "cursor-pointer select-none hover:text-zinc-300": header.column.getCanSort(),
                                                }}

                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                <div
                                                    class="flex h-full justify-center items-center gap-1.5"
                                                    style={{
                                                        width: header.getSize() + "px"
                                                    }}
                                                >
                                                    <FlexRender header={header} />
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
                            <For each={virtualizer.getVirtualItems()}>
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

export function TableRow(props: { virtualRow: VirtualItem, i: number, rows: Row<AppTableFeatures, MovieData[number]>[] }) {

    const row = () => props.rows[props.virtualRow.index]
    
    return (
        <tr
            class="hover:bg-zinc-900/60"
            style={{
                transform: `translateY(${props.virtualRow.start - props.i * props.virtualRow.size
                    }px)`
            }}
            onClick={row().getToggleSelectedHandler({
                selectChildren: false
            })}
            classList={{ "bg-zinc-800!": row().getIsSelected() }}
        >
            <For each={row().getAllCells()}>
                {(cell) => (
                    <td>
                        <FlexRender cell={cell} />
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
