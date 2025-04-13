import { createEffect, createSignal, on, Show, Suspense } from "solid-js";
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
import { Portal } from "solid-js/web";

export default function Actors() {
    let ref!: AgGridSolidRef
    const updateActorAction = useAction(updateActor)
    const addActorAction = useAction(addActor)
    const actors = createAsync(() => getActors())

    const [contextMenu, setContextMenu] = createStore({
        isOpen: false,
        selectedId: -1,
        pos: { x: 0, y: 0 },
    })
    const [input, setInput] = createStore<Omit<Actor, 'actor_id'>>({
        name: "",
        dob: null,
        gender: null,
        image: null,
        nationality: null
    })

    createEffect(on(() => input.name, () => {
        if (!ref) return;

        ref.api.setFilterModel({
            name: {
                filterType: "text",
                type: "includes",
                filter: input.name
            }
        })
    }))

    const [added, setAdded] = createSignal<number>()
    createEffect(() => {
        if (!added()) return
        const idx = actors()?.findIndex(a => a.actor_id === added());
        if (!idx || idx === -1) return;
        ref.api.ensureIndexVisible(idx, "middle");
        const node = ref.api.getRowNode(added()!.toString())
        if (!node) return
        ref.api.setNodesSelected({
            newValue: true,
            nodes: [node]
        })
        setAdded()
    })

    function reset() {
        ref.api.setFilterModel(null);
        ref.api.setGridOption("pinnedBottomRowData", [{ name: "Add Actor..." }]);
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
                    ref={ref}
                    rowData={actors()}
                    rowSelection="multiple"
                    getRowId={params => params.data.actor_id}
                    onGridReady={params => {
                        state.setGridApi(params.api as any)

                        // Fix bug with AG Grid library that sets height of pinned rows to 0
                        document.querySelectorAll<HTMLDivElement>(".ag-floating-bottom, .ag-floating-top").forEach(el => {
                            el.style.height = "42px"
                            el.style.flexShrink = "0"
                        })
                    }}
                    onCellContextMenu={params => {
                        setContextMenu({
                            isOpen: true,
                            pos: {
                                x: (params.event as MouseEvent).clientX,
                                y: (params.event as MouseEvent).clientY,
                            },
                            selectedId: params.data.actor_id
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
                        <ContextMenu.Link href={`/movies/actors/${contextMenu.selectedId}`}> Go To Movies </ContextMenu.Link>
                    </ContextMenu>
                </Show>
                <Show when={input.name} >
                    <Portal mount={document.querySelector('section')!} >
                        <div class="z-[999] absolute bottom-0 w-full h-10 text-white flex">
                            <button
                                class="bg-orange-600 rounded-lg flex-1"
                                style={{ width: state.sidePanel.width + "px" }}
                                onclick={async () => {
                                    const actor = await addActorAction(input);
                                    reset();
                                    setAdded(actor.actor_id)
                                }}
                            >
                                SAVE
                            </button>
                            <button class="bg-red-600 rounded-lg flex-1" onclick={reset}>
                                RESET
                            </button>
                        </div>
                    </Portal>
                </Show>
            </div>
        </Suspense>
    )
}