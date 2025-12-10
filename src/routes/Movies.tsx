import { createAsync, useAction } from "@solidjs/router"
import type { ITooltipParams } from "ag-grid-community"
import { createMemo, Suspense, Show, createUniqueId, For } from "solid-js"
import { createStore } from "solid-js/store"
import { state } from "../state"
import { AgActorSelector } from "../components/CellEditors/ActorCellEditor/ActorSelector"
import { AgStudioSelector } from "~/components/CellEditors/StudioSelector/AgStudioSelector"
import MoviesContextMenu from "../components/MoviesContextMenu"
import { editFilm } from "../api/mutations"
import { ActorItem2 } from "~/components/CellEditors/ActorCellEditor/ActorItem"
import { GridWrapper } from "~/components/GridWrapper"
import { type DetailedDbFilm } from "~/repositories/filmsRepository"
import { AgTagSelector } from "~/components/CellEditors/TagSelector"
import type { FfprobeMetadata } from "~/utils/updateMetadata"
import { secondsToTime } from "~/utils/secondsToTime"

type Props = {
    fetcher(): Promise<DetailedDbFilm[] | undefined>
}

export function Movies(props: Props) {
    const films = createAsync(() => props.fetcher())

    const updateFilmAction = useAction(editFilm)

    const data = createMemo(() => {
        if (!films()) return undefined
        return films()!.map((film => ({
            ...film,
            tags: JSON.parse(film.tags),
            actors: JSON.parse(film.actors),
            rowId: createUniqueId(),
            isOnDb: true,
            metadata: film.metadata ? JSON.parse(film.metadata) as FfprobeMetadata["metadata"] : null
        })))
    })
    
    type MovieTableData = NonNullable<ReturnType<typeof data>>[number]

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
        <Suspense>
            <div
                id='gridContainer'
                class='ag-theme-alpine-dark h-full relative'
            >
                <GridWrapper
                    gridId={location.pathname}
                    getRowId={params => params.data.filmId.toString()}
                    rowSelection="multiple"
                    rowData={data()}
                    onSelectionChanged={(params) => {
                        const selection = params.api.getSelectedRows();
                        state.mainPanel.setSelectedItems(selection)
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
                            updateFilmAction({title: params.newValue, filmId: params.data.filmId})
                        },
                        tooltipField: 'title'
                    }, {
                        field: "studioName",
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
                        valueGetter: param => param.data?.metadata?.format.duration,
                        valueFormatter: param => {
                            if (!param.value) return "";
                            return secondsToTime(param.value)
                        }
                    },
                    {
                        headerName: "Size",
                        valueGetter: param => param.data?.metadata?.format.size
                    },
                    {
                        headerName: "Bit Rate",
                        valueGetter: param => param.data?.metadata?.format.bit_rate
                    },
                    {
                        headerName: "Format",                        
                        valueGetter: param => {
                            return param.data?.metadata?.streams.find(x => x.codec_type == "video")?.codec_name
                        }
                    },
                    {
                        headerName: "Resolution",
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
        </Suspense>
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

