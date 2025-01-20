import { Show, Suspense } from "solid-js";
import { getActors } from "../api/data";
import { countryList } from "../countryList";
import { action, createAsync, useAction } from "@solidjs/router";
import Database from "@tauri-apps/plugin-sql";
import { ContextMenu } from "../components/ContextMenu/ContextMenu";
import { createStore } from "solid-js/store";
import AgGridSolid from "ag-grid-solid";

const updateActor = action(async (field: string, value: string, actorId: string) => {
    const db = await Database.load("sqlite:mngr.db");
    await db.select(`UPDATE actor SET ${field} = $1 WHERE actor_id = $2`, [value, actorId])
})

export default function Actors() {
    const actors = createAsync(() => getActors())
    const [contextMenu, setContextMenu] = createStore({
        isOpen: false,
        selectedId: -1,
        pos: { x: 0, y: 0 },
    })
    const updateActorAction = useAction(updateActor)
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
                            updateActorAction(params.colDef.field, params.newValue, params.data.actor_id)
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