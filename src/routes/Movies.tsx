import { useAction } from "@solidjs/router"
import { Show, Suspense, createMemo, createResource } from "solid-js"
import { getActorFilms, getFilms } from "../api/data"
import { MySelectEditor } from "../components/CellEditors/MySelectEditor"
import { Actor } from "../datatypes"
import { ActorSelector, actors } from "../components/CellEditors/ActorCellEditor/ActorSelector"
import { updateTag } from "../api/actions"
import { ContextMenu } from "../components/ContextMenu"
import { createStore } from "solid-js/store"
import { GridApi } from "ag-grid-community"
import AgGridSolid from "ag-grid-solid"
import { setState, state } from "../state"

export const [films, { refetch: refetchFilms }] = createResource(async () => getFilms())

export function Movies() {
    const [contextMenu, setContextMenu] = createStore({
        isOpen: false,
        x: 0,
        y: 0,
        close() {
            setContextMenu('isOpen', false)
        },
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

    function add() {
        const selection = gridApi.getSelectedRows()
        if (selection.length == 0) return
        const mapped = selection.map(m => ({
            title: m.title,
            path: m.path,
        }))
        state.sidePanel.push(mapped)
    }

    return (
        <Suspense fallback={<p>Loading Database</p>}>
            <div
                id='gridContainer'
                class='ag-theme-alpine-dark h-full relative'
                onContextMenu={(e) => {
                    e.preventDefault();
                    return false
                }}
            >
                <AgGridSolid
                    onGridReady={params => gridApi = params.api}
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
                    columnDefs={[{
                        field: 'title',
                        filter: true,
                        editable: true,
                    }, {
                        field: "studio_name",
                        editable: true,
                        headerName: "Studio",
                        cellEditor: MySelectEditor,
                        onCellContextMenu: params => {
                            setContextMenu({
                                isOpen: true,
                                x: (params.event as MouseEvent).clientX,
                                y: (params.event as MouseEvent).clientY,
                            })
                        }
                    }, {
                        field: "actors",
                        valueFormatter: (params: any) => params.value.map((x: any) => x.name).join(", "),
                        filter: true,
                        editable: true,
                        cellEditor: ActorSelector,
                        cellEditorPopup: true,
                        cellEditorPopupPosition: "under",
                        onCellContextMenu: params => {
                            setContextMenu({
                                isOpen: true,
                                x: (params.event as MouseEvent).clientX,
                                y: (params.event as MouseEvent).clientY,
                            })
                        }
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
                    <ContextMenu close={contextMenu.close} pos={{ x: contextMenu.x, y: contextMenu.y }} >
                        <ContextMenu.Item
                            onClick={() => {
                                add();
                                contextMenu.close();
                            }}
                        >
                            Add To Playlist
                        </ContextMenu.Item>
                    </ContextMenu>
                </Show>
            </div>
        </Suspense>
    )
}

