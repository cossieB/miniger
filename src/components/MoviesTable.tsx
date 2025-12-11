import { createStore } from "solid-js/store";
import { GridWrapper } from "./GridWrapper";
import { state } from "~/state";
import { For, Show } from "solid-js";
import MoviesContextMenu from "./MoviesContextMenu";
import { secondsToTime } from "~/utils/secondsToTime";
import { AgTagSelector } from "./CellEditors/TagSelector";
import { useAction } from "@solidjs/router";
import { editFilm } from "~/api/mutations";
import { AgActorSelector } from "./CellEditors/ActorCellEditor/ActorSelector";
import { AgStudioSelector } from "./CellEditors/StudioSelector/AgStudioSelector";
import type { ITooltipParams } from "ag-grid-community";
import { ActorItem2 } from "./CellEditors/ActorCellEditor/ActorItem";
import type { MovieData, MovieTableData } from "~/types";

export function MoviesTable(props: { data: MovieData }) {
    const updateFilmAction = useAction(editFilm)

    const [contextMenu, setContextMenu] = createStore({
        isOpen: false,
        x: 0,
        y: 0,
        close() {
            setContextMenu('isOpen', false)
        },
        data: {} as MovieTableData,
        selections: [] as MovieTableData[]
    })
    return (
        <div
            id='gridContainer'
            class='ag-theme-alpine-dark h-full relative'
        >
            <GridWrapper
                gridId={location.pathname}
                getRowId={params => params.data.filmId.toString()}
                rowSelection="multiple"
                autoSizeStrategy={{
                    type: "fitCellContents",
                    colIds: ["length", "size", "bitrate", "format", "res", "release", "studio"],
                    skipHeader: true
                }}
                rowData={props.data}
                onSelectionChanged={(params) => {
                    const selection = params.api.getSelectedRows();
                    state.mainPanel.setSelectedIds(selection.map(x => (x.filmId)))
                }}
                onCellContextMenu={params => {
                    setContextMenu({
                        isOpen: true,
                        x: (params.event as MouseEvent).clientX,
                        y: (params.event as MouseEvent).clientY,
                        data: params.data,
                        selections: params.api.getSelectedRows(),
                    })
                }}
                defaultColDef={{
                    suppressKeyboardEvent: ({ event }) => event.key === "Delete",
                }}
                onCellKeyDown={params => {
                    if (!params.event) return
                    const e = params.event as KeyboardEvent
                    if (e.key === "a" && e.ctrlKey) {
                        params.api.selectAll()
                    }
                }}
                columnDefs={[{
                    field: 'title',
                    filter: true,
                    editable: true,
                    onCellValueChanged: async (params) => {
                        updateFilmAction({ title: params.newValue, filmId: params.data.filmId })
                    },
                    tooltipField: 'title'
                }, {
                    field: "studioName",
                    colId: "studio",
                    editable: true,
                    headerName: "Studio",
                    cellEditor: AgStudioSelector,
                    cellEditorPopup: true,
                    valueSetter: (params) => {
                        const value = JSON.parse(params.newValue);
                        if (value.name === "") return false;
                        params.data.studioName = value.name == "Unknown" ? "" : value.name
                        params.data.studioId = value.id
                        return true
                    }
                }, {
                    field: "actors",
                    valueFormatter: params => params.value.map((x: any) => x.name).join(", "),
                    filter: true,
                    editable: true,
                    cellEditor: AgActorSelector,
                    cellEditorPopup: true,
                    cellEditorPopupPosition: "over",
                    tooltipComponentParams: {
                        delay: 7
                    },
                    tooltipValueGetter: params => params.value.map((x: any) => x.name).join(", "),
                    tooltipComponent: Tooltip
                }, {
                    field: "releaseDate",
                    colId: "release",
                    editable: true,
                    cellEditor: "agDateStringCellEditor",
                    onCellValueChanged: params => updateFilmAction({
                        releaseDate: params.newValue,
                        filmId: params.data.filmId
                    })
                }, {
                    field: "tags",
                    editable: true,
                    cellEditor: AgTagSelector,
                    cellEditorPopupPosition: "over",
                    cellEditorPopup: true,
                    valueFormatter: params => params.value.join(", "),
                }, {
                    field: "path",
                }, {
                    field: "dateAdded",
                    valueFormatter: param => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: "medium" }).format(new Date(param.value + " UTC"))
                },
                {
                    headerName: "Length",
                    colId: "length",
                    valueGetter: param => param.data?.metadata?.format.duration,
                    valueFormatter: param => {
                        if (!param.value) return "";
                        return secondsToTime(param.value)
                    }
                },
                {
                    headerName: "Size",
                    colId: "size",
                    valueGetter: param => param.data?.metadata?.format.size,
                    valueFormatter: param => param.value ? new Intl.NumberFormat(undefined, {useGrouping: true}).format(param.value) : "",
                    cellClass: "text-right"
                },
                {
                    headerName: "Bit Rate",
                    colId: "bitrate",
                    valueGetter: param => param.data?.metadata?.format.bit_rate,
                    valueFormatter: param => param.value ? new Intl.NumberFormat(undefined, {useGrouping: true}).format(param.value) : "",
                    cellClass: "text-right"
                },
                {
                    headerName: "Format",
                    colId: "format",
                    valueGetter: param => {
                        return param.data?.metadata?.streams.find(x => x.codec_type == "video")?.codec_name
                    },
                },
                {
                    headerName: "Resolution",
                    colId: "res",
                    valueGetter: param => {
                        const videoStream = param.data?.metadata?.streams.find(x => x.codec_type == "video")
                        if (!videoStream) return null
                        return `${videoStream.width}x${videoStream.height}`
                    }
                }
                ]}
            />
            <Show when={contextMenu.isOpen}>
                <MoviesContextMenu isMainPanel contextMenu={contextMenu} />
            </Show>
        </div>
    )
}

function Tooltip(params: ITooltipParams) {
    return (
        <ul class="grid text-center max-h-[50vh] overflow-auto max-w-[50vw]  actorsList">
            <For each={params.data.actors}>
                {actor => <ActorItem2 actor={actor} />}
            </For>
        </ul>
    )
}

