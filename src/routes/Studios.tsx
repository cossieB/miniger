import { createSignal, Show, Suspense } from "solid-js";
import { getStudios } from "../api/data";
import { createStore } from "solid-js/store";
import { ContextMenu } from "../components/ContextMenu/ContextMenu";
import AgGridSolid, { AgGridSolidRef } from "ag-grid-solid";
import { state } from "../state";
import { createStudio, updateStudio } from "../api/mutations";
import { createAsync, useAction } from "@solidjs/router";
import { fixPinnedRowHeight, useAdded, useFilter } from "~/utils/pinnedUtils";
import { PinnedRowButtons } from "~/components/PinnedRowButtons";

export default function Studios() {
    const studios = createAsync(() => getStudios())
    const updateAction = useAction(updateStudio)
    const addStudioAction = useAction(createStudio)
    let [ref, setRef] = createSignal<AgGridSolidRef>()
    const [contextMenu, setContextMenu] = createStore({
        isOpen: false,
        selectedId: -1,
        pos: { x: 0, y: 0 },
    })
    const [input, setInput] = createStore({
        name: "",
        website: null as string | null,
    })

    useFilter(ref, 'name', () => input.name)
    const setAdded = useAdded(studios, 'studio_id', ref)
    function reset() {
        ref()?.api.setFilterModel(null);
        ref()?.api.setGridOption("pinnedBottomRowData", [{ name: "Add Studio..." }]);
        setInput({
            name: "",
            website: null,
        });
    }

    return (
        <Suspense>
            <div
                id='gridContainer'
                class='ag-theme-alpine-dark h-full relative'
            >
                <AgGridSolid
                    ref={setRef}
                    rowData={studios()}
                    getRowId={params => params.data.studio_id}
                    onGridReady={params => {
                        state.setGridApi(params.api as any)
                        fixPinnedRowHeight()
                    }}
                    rowSelection="multiple"
                    defaultColDef={{
                        editable: true,
                        sortable: true,
                        suppressKeyboardEvent: ({ event }) => event.key === "Delete",
                        onCellValueChanged: params => {
                            if (!params.colDef.field || !params.node) return;
                            if (!params.node.rowPinned) {
                                updateAction(params.colDef.field, params.newValue, params.data.studio_id)
                                return;
                            }
                            const field: any = params.colDef.field;
                            setInput(field, params.newValue)
                        }
                    }}
                    columnDefs={[{
                        field: 'name',
                        filter: true
                    }, {
                        field: "website"
                    }]}
                    pinnedBottomRowData={[{
                        name: "Add Studio..."
                    }]}
                    getRowStyle={({ node }) => node.rowPinned ? { 'font-weight': 'bold', 'font-style': 'italic' } : undefined}
                />
                <Show when={contextMenu.isOpen}>
                    <ContextMenu pos={contextMenu.pos} close={() => setContextMenu('isOpen', false)} >
                        <ContextMenu.Link href={`/movies/actors/${contextMenu.selectedId}`}> Go To Movies </ContextMenu.Link>
                    </ContextMenu>
                </Show>
                <PinnedRowButtons
                    input={input}
                    setAdded={setAdded}
                    key="name"
                    reset={reset}
                    addAction={addStudioAction}
                />
            </div>
        </Suspense>
    )
}