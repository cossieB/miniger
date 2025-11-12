import { createSignal, Show, Suspense } from "solid-js";
import { getActors } from "../api/data";
import { countryList } from "../countryList";
import { createAsync, useAction } from "@solidjs/router";
import { ContextMenu } from "../components/ContextMenu/ContextMenu";
import { createStore } from "solid-js/store";
import { AgGridSolidRef } from "ag-grid-solid";
import { addActor, editActor } from "../api/mutations";
import { ImageEditor } from "~/components/CellEditors/ImageEditor";
import { TActor } from "~/datatypes";
import { fixPinnedRowHeight, useAdded, useFilter } from "~/utils/pinnedUtils";
import { PinnedRowButtons } from "~/components/PinnedRowButtons";
import { GridWrapper } from "~/components/GridWrapper";

export default function Actors() {
    // let ref!: AgGridSolidRef
    let [ref, setRef] = createSignal<AgGridSolidRef>()
    const updateActorAction = useAction(editActor)
    const addActorAction = useAction(addActor)
    const actors = createAsync(() => getActors())

    const [contextMenu, setContextMenu] = createStore({
        isOpen: false,
        selectedId: -1,
        selectedName: "",
        pos: { x: 0, y: 0 },
    })
    const [input, setInput] = createStore<Omit<TActor, 'actorId'>>({
        name: "",
        dob: null,
        gender: null,
        image: null,
        nationality: null
    })

    useFilter(ref, 'name', () => input.name)

    const setAdded = useAdded(actors, 'actorId', ref)

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
                <GridWrapper
                    ref={setRef}
                    rowData={actors()}
                    rowSelection="multiple"
                    getRowId={params => params.data.actorId.toString()}
                    additionalSetup={fixPinnedRowHeight}
                    onCellContextMenu={params => {
                        setContextMenu({
                            isOpen: true,
                            pos: {
                                x: (params.event as MouseEvent).clientX,
                                y: (params.event as MouseEvent).clientY,
                            },
                            selectedId: params.data!.actorId,
                            selectedName: params.data!.name,
                        })
                    }}

                    defaultColDef={{
                        onCellValueChanged: (params) => {
                            if (!params.colDef.field || !params.node) return;
                            if (!params.node.rowPinned) {
                                updateActorAction({[params.colDef.field]: params.newValue, actorId: params.data!.actorId})
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
                        },
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
                    }, {
                        field: 'appearances',
                        editable: false
                    }]}

                />
                <Show when={contextMenu.isOpen}>
                    <ContextMenu pos={contextMenu.pos} close={() => setContextMenu('isOpen', false)} >
                        <ContextMenu.Link href={`/movies/actors/${contextMenu.selectedId}?${contextMenu.selectedId}=${contextMenu.selectedName}`}> Go To Movies </ContextMenu.Link>
                        <ContextMenu.Link href={`/costars/${contextMenu.selectedId}?${contextMenu.selectedId}=${contextMenu.selectedName}`} >See Co-stars</ContextMenu.Link>
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
