import { Suspense, createResource } from "solid-js";
import GridTable from "../components/Table";
import { getActors } from "../api/data";
import {countryList} from "../countryList";
import { action, useAction } from "@solidjs/router";
import Database from "@tauri-apps/plugin-sql";

const updateActor = action(async (field: string, value: string, actorId: string) => {
    const db = await Database.load("sqlite:mngr.db");
    await db.select(`UPDATE actor SET ${field} = $1 WHERE actor_id = $2`, [value, actorId])
})

export default function Actors() {
    const [actors] = createResource(() => getActors())
    const updateActorAction = useAction(updateActor)
    return (
        <Suspense>
            <GridTable
                rowData={actors()}
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
        </Suspense>
    )
}