import { Show, Suspense } from "solid-js";
import { getActors } from "../api/data";
import { countryList } from "../countryList";
import { createAsync } from "@solidjs/router";
import { ContextMenu } from "../components/ContextMenu/ContextMenu";
import { createStore } from "solid-js/store";
import AgGridSolid from "ag-grid-solid";
import { updateActor } from "../api/mutations";

export default function Actors() {
    const actors = createAsync(() => getActors())
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
                onContextMenu={(e) => {
                    e.preventDefault();
                    return false
                }}
            >
                <AgGridSolid
                    rowData={actors()}
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
                            if (!params.colDef.field) return;
                            updateActor(params.colDef.field, params.newValue, params.data.actor_id)
                        },
                        editable: true
                    }}
                    columnDefs={[{
                        field: 'name',
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
                        field: 'image'
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