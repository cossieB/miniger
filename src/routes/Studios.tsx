import { Show, Suspense } from "solid-js";
import { getStudios } from "../api/data";
import { createStore } from "solid-js/store";
import { ContextMenu } from "../components/ContextMenu/ContextMenu";
import AgGridSolid from "ag-grid-solid";
import { state } from "../state";
import { updateStudio } from "../api/mutations";
import { createAsync, useAction } from "@solidjs/router";

export default function Studios() {
    const studios = createAsync(() => getStudios())
    const updateAction = useAction(updateStudio)
    const [contextMenu, setContextMenu] = createStore({
        isOpen: false,
        selectedId: -1,
        pos: { x: 0, y: 0 },
    })
    return (
        <Suspense>
            <div
                id='gridContainer'
                class='ag-theme-alpine-dark h-full relative'
            >
                <AgGridSolid
                    rowData={studios()}
                    getRowId={params => params.data.studio_id}
                    onGridReady={params => {
                        state.setGridApi(params.api as any)
                    }}
                    rowSelection="multiple"
                    defaultColDef={{
                        editable: true,
                        sortable: true,
                        suppressKeyboardEvent: ({event}) => event.key === "Delete",
                        onCellValueChanged: params => {
                            if (!params.colDef.field) return;
                            updateAction(params.colDef.field, params.newValue, params.data.studio_id)
                        }
                    }}
                    columnDefs={[{
                        field: 'name',
                    }, {
                        field: "website"
                    }]}

                />
                <Show when={contextMenu.isOpen}>
                    <ContextMenu pos={contextMenu.pos} close={() => setContextMenu('isOpen', false)} >
                        <ContextMenu.Link href={`/movies/actors/${contextMenu.selectedId}`}> Go To Movies </ContextMenu.Link>
                    </ContextMenu>
                </Show>
            </div>
        </Suspense>
    )
}