import { Show, Suspense, createResource } from "solid-js";
import { getStudios } from "../api/data";
import { createStore } from "solid-js/store";
import { ContextMenu } from "../components/ContextMenu/ContextMenu";
import AgGridSolid from "ag-grid-solid";
import { action, useAction } from "@solidjs/router";
import Database from "@tauri-apps/plugin-sql";

const updateStudio = action(async (field: string, value: string, studioId: number) => {
    const db = await Database.load("sqlite:mngr.db");
    await db.select(`UPDATE studio SET ${field} = $1 WHERE studio_id = $2`, [value, studioId])
})

export default function Studios() {
    const updateStudioAction = useAction(updateStudio)
    const [studios] = createResource(() => getStudios())
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
                    rowData={studios()}
                    defaultColDef={{
                        editable: true,
                        sortable: true,
                        onCellValueChanged: params => {
                            if (!params.colDef.field) return;
                            updateStudioAction(params.colDef.field, params.newValue, params.data.studio_id)
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