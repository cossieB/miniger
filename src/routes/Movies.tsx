import { useAction, useIsRouting, useParams } from "@solidjs/router"
import { GridApi } from "ag-grid-community"
import AgGridSolid from "ag-grid-solid"
import { createResource, createMemo, Suspense, Show, createEffect } from "solid-js"
import { createStore } from "solid-js/store"
import { updateTag } from "../api/actions"
import { getActorFilms } from "../api/data"
import { Film, Actor } from "../datatypes"
import { setState } from "../state"
import { actors, ActorSelector } from "../components/CellEditors/ActorCellEditor/ActorSelector"
import { MySelectEditor } from "../components/CellEditors/MySelectEditor"
import MoviesContextMenu from "../components/MoviesContextMenu"

type Props = {
    fetcher(): Promise<(Film & {
        studio_name: string | null
        tags: string | null
    })[] | undefined>
}

export function Movies(props: Props) {
    const isRouting = useIsRouting()
    const params = useParams()
    const [films] = createResource(() => [params.tag, params.studioId, params.actorId], () => props.fetcher())

    createEffect(() => {
        if (isRouting())
            setContextMenu('isOpen', false)
    })

    const [contextMenu, setContextMenu] = createStore({
        isOpen: false,
        x: 0,
        y: 0,
        close() {
            setContextMenu('isOpen', false)
        },
        data: {} as NonNullable<ReturnType<typeof data>>[number],
        selections : [] as NonNullable<ReturnType<typeof data>>[number][]
    })
    const [actorsFilms] = createResource(async () => getActorFilms())

    let gridApi: GridApi

    const map = createMemo(() => {
        const m = new Map<number, Actor>()
        if (!actors()) return m;
        for (const actor of actors()!) {
            m.set(actor.actor_id, actor)
        }
        return m
    })

    const data = createMemo(() => {
        if (!films() || !actorsFilms()) return undefined;
        return films()!.map(f => ({
            ...f,
            actors: actorsFilms()!.filter(af => af.film_id === f.film_id).map(af => map().get(af.actor_id)!)
        }))
    })

    const updateTagAction = useAction(updateTag)

    return (
        <Suspense>
            <div
                id='gridContainer'
                class='ag-theme-alpine-dark h-full relative'
                onContextMenu={(e) => {
                    e.preventDefault();
                    return false
                }}
            >
                <AgGridSolid
                    onGridReady={params => (gridApi = params.api)}
                    rowSelection="multiple"
                    rowData={data()}
                    onSelectionChanged={() => {
                        const selection = gridApi.getSelectedRows()
                        const mapped = selection.map(m => ({
                            title: m.title,
                            path: m.path,
                        }))
                        setState('mainPanel', 'selectedItems', mapped)
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
                    columnDefs={[{
                        field: 'title',
                        filter: true,
                        editable: true,
                    }, {
                        field: "studio_name",
                        editable: true,
                        headerName: "Studio",
                        cellEditor: MySelectEditor,
                        cellEditorPopup: true,                       

                    }, {
                        field: "actors",
                        valueFormatter: (params: any) => params.value.map((x: any) => x.name).join(", "),
                        filter: true,
                        editable: true,
                        cellEditor: ActorSelector,
                        cellEditorPopup: true,
                        cellEditorPopupPosition: "under",
                    }, {
                        field: "release_date",
                        headerName: "Release Date"
                    }, {
                        field: "tags",
                        editable: true,
                        onCellValueChanged: async (params: any) => {
                            updateTagAction(params.data.film_id, params.newValue.trim().split(/\s*[;,]\s*/))
                        }
                    }, {
                        field: "path"
                    }]}
                />
                <Show when={contextMenu.isOpen}>
                    <MoviesContextMenu contextMenu={contextMenu} />
                </Show>
            </div>
        </Suspense>
    )
}
