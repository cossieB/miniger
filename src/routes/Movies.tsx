import { createAsync, useAction } from "@solidjs/router"
import { GridApi, ITooltipParams } from "ag-grid-community"
import AgGridSolid from "ag-grid-solid"
import { createMemo, Suspense, Show, createUniqueId, For } from "solid-js"
import { createStore } from "solid-js/store"
import { type DetailedDbFilm } from "../datatypes"
import { state } from "../state"
import { ActorSelector } from "../components/CellEditors/ActorCellEditor/ActorSelector"
import { MySelectEditor } from "../components/CellEditors/MySelectEditor"
import MoviesContextMenu from "../components/MoviesContextMenu"
import { editFilm, updateTag } from "../api/mutations"
import { ActorItem2 } from "~/components/CellEditors/ActorCellEditor/ActorItem"

type Props = {
    fetcher(): Promise<DetailedDbFilm[] | undefined>
}

export function Movies(props: Props) {
    const films = createAsync(() => props.fetcher())
    const updateTagAction = useAction(updateTag)
    const updateFilmAction = useAction(editFilm)

    let gridApi!: GridApi

    const data = createMemo(() => {
        if (!films()) return undefined
        return films()!.map((film => ({
            ...film,
            tags: JSON.parse(film.tags),
            actors: JSON.parse(film.actors),
            rowId: createUniqueId(),
            isOnDb: true,
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
                <AgGridSolid
                    onGridReady={params => {
                        (gridApi as any) = params.api
                        state.setGridApi(gridApi);
                    }}
                    getRowId={params => params.data.path}
                    rowSelection="multiple"
                    rowData={data()}
                    onSelectionChanged={() => {
                        const selection = gridApi.getSelectedRows();
                        state.mainPanel.setSelectedItems(selection)
                    }}
                    onCellContextMenu={params => {
                        setContextMenu({
                            isOpen: true,
                            x: (params.event as MouseEvent).clientX,
                            y: (params.event as MouseEvent).clientY,
                            data: params.data,
                            selections: gridApi.getSelectedRows(),
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
                            updateFilmAction('title', params.newValue, params.data.film_id)
                        },
                        tooltipField: 'title'
                    }, {
                        field: "studio_name",
                        editable: true,
                        headerName: "Studio",
                        cellEditor: MySelectEditor,
                        cellEditorPopup: true,
                        valueSetter: (params) => {
                            const value = JSON.parse(params.newValue);
                            if (value.name === "") return false;
                            params.data.studio_name = value.name == "Unknown" ? "" : value.name
                            params.data.studio_id = value.id
                            return true
                        }
                    }, {
                        field: "actors",
                        valueFormatter: params => params.value.map((x: any) => x.name).join(", "),
                        filter: true,
                        editable: true,
                        cellEditor: ActorSelector,
                        cellEditorPopup: true,
                        cellEditorPopupPosition: "over",
                        tooltipComponentParams: {
                            delay: 7
                        },
                        tooltipValueGetter: params => params.value.map((x: any) => x.name).join(", "),
                        tooltipComponent: Tooltip
                    }, {
                        field: "release_date",
                        headerName: "Release Date",
                        editable: true,
                        cellEditor: "agDateStringCellEditor",
                        onCellValueChanged: params => updateFilmAction('release_date', params.newValue, params.data.film_id)
                    }, {
                        field: "tags",
                        editable: true,
                        onCellValueChanged: async params => {
                            try {
                                const arr = (params.newValue as string[]).filter(x => !!x) // remove empty strings
                                await updateTagAction(params.data.film_id, arr);
                            }
                            catch (error) {

                            }
                        },
                        valueParser: params => params.newValue.trim().split(/\s*[,;]+\s*/)
                    }, {
                        field: "path",
                    }, {
                        field: "date_added",
                        headerName: "Date Added",
                        valueFormatter: param => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: "medium" }).format(new Date(param.value + " UTC"))
                    }]}
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