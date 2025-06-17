import { createSignal, Show, Suspense } from "solid-js";
import { getActors } from "../api/data";
import { countryList } from "../countryList";
import { createAsync, useAction } from "@solidjs/router";
import { ContextMenu } from "../components/ContextMenu/ContextMenu";
import { createStore } from "solid-js/store";
import AgGridSolid, { AgGridSolidRef } from "ag-grid-solid";
import { addActor, updateActor } from "../api/mutations";
import { state } from "../state";
import { ImageEditor } from "~/components/CellEditors/ImageEditor";
import { Actor } from "~/datatypes";
import { fixPinnedRowHeight, useAdded, useFilter } from "~/utils/pinnedUtils";
import { PinnedRowButtons } from "~/components/PinnedRowButtons";

export default function Actors() {
    // let ref!: AgGridSolidRef
    let [ref, setRef] = createSignal<AgGridSolidRef>()
    const updateActorAction = useAction(updateActor)
    const addActorAction = useAction(addActor)
    const actors = createAsync(() => getActors())

    const [contextMenu, setContextMenu] = createStore({
        isOpen: false,
        selectedId: -1,
        selectedName: "",
        pos: { x: 0, y: 0 },
    })
    const [input, setInput] = createStore<Omit<Actor, 'actor_id'>>({
        name: "",
        dob: null,
        gender: null,
        image: null,
        nationality: null
    })

    useFilter(ref, 'name', () => input.name)

    const setAdded = useAdded(actors, 'actor_id', ref)

    function reset() {
        ref()?.api.setFilterModel(null);
        ref()?.api.setGridOption("pinnedBottomRowData", [{ name: "Add Actor..." }]);
        setInput({
            name: "",
            dob: null,
            gender: null,
            image: null,
            nationality: null
        });
    }

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
                    ref={setRef}
                    rowData={actors()}
                    rowSelection="multiple"
                    getRowId={params => params.data.actor_id}
                    onGridReady={params => {
                        state.setGridApi(params.api as any)
                        fixPinnedRowHeight()
                    }}
                    onCellContextMenu={params => {
                        setContextMenu({
                            isOpen: true,
                            pos: {
                                x: (params.event as MouseEvent).clientX,
                                y: (params.event as MouseEvent).clientY,
                            },
                            selectedId: params.data.actor_id,
                            selectedName: params.data.name,
                        })
                    }}
                    defaultColDef={{
                        onCellValueChanged: params => {
                            if (!params.colDef.field || !params.node) return;
                            if (!params.node.rowPinned) {
                                updateActorAction(params.colDef.field, params.newValue, params.data.actor_id)
                                return
                            }
                            const field: any = params.colDef.field
                            setInput(field, params.newValue)
                        },
                        editable: true,
                        suppressKeyboardEvent: ({ event }) => event.key === "Delete",
                    }}
                    pinnedBottomRowData={[{
                        name: "Add Actor..."
                    }]}
                    getRowStyle={({ node }) => node.rowPinned ? { 'font-weight': 'bold', 'font-style': 'italic' } : undefined}
                    columnDefs={[{
                        field: 'name',
                        filter: true
                    }, {
                        field: 'gender',
                        filter: true,
                        cellEditor: 'agSelectCellEditor',
                        cellEditorParams: {
                            values: ["M", "F"]
                        }

                    }, {
                        field: 'dob',
                        cellEditor: "agDateStringCellEditor",
                    }, {
                        field: 'nationality',
                        filter: true,
                        cellEditor: 'agSelectCellEditor',
                        cellEditorParams: {
                            values: countryList
                        }
                    }, {
                        field: 'image',
                        cellEditor: ImageEditor,
                        cellEditorPopup: true,
                    }]}

                />
                <Show when={contextMenu.isOpen}>
                    <ContextMenu pos={contextMenu.pos} close={() => setContextMenu('isOpen', false)} >
                        <ContextMenu.Link href={`/movies/actors/${contextMenu.selectedId}?${contextMenu.selectedId}=${contextMenu.selectedName}`}> Go To Movies </ContextMenu.Link>
                    </ContextMenu>
                </Show>
                <PinnedRowButtons
                    addAction={addActorAction}
                    input={input}
                    key="name"
                    reset={reset}
                    setAdded={setAdded}
                />
            </div>
        </Suspense>
    )
}
