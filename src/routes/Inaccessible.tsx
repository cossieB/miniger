import { invoke } from "@tauri-apps/api/core";
import Database from "@tauri-apps/plugin-sql";
import { Suspense, createResource, onCleanup, onMount } from "solid-js";
import AgGridSolid from "ag-grid-solid";
import { GridApi } from "ag-grid-community";
import { confirm } from "@tauri-apps/plugin-dialog";

export default function Inaccessible() {
    const [data, {refetch}] = createResource<{ title: string, path: string }[]>(async () => {
        const db = await Database.load("sqlite:mngr.db");
        const films = await db.select("SELECT title, path FROM film")
        return await invoke('get_inaccessible', { playlist: films }) 
    })
    let gridApi: GridApi<any>

    async function handleKeyup(e: KeyboardEvent) {
        if (e.key === "Delete") {
            const selection = gridApi.getSelectedRows()
            if (selection.length == 0) return
            const confirmed = await confirm(`Delete ${selection.length} files?`);
            if (confirmed) {
                const db = await Database.load("sqlite:mngr.db")
                await db.select("BEGIN")
                try {
                    const promises = selection.map(film => db.select("DELETE FROM film WHERE path = $1", [film.path]))
                    await Promise.all(promises)
                    await db.select("COMMIT")
                    await refetch()
                } catch (error) {
                    console.error(error)
                    await db.select("ROLLBACK")
                }
            }
        }
    }

    onMount(() => {
        document.addEventListener('keyup', handleKeyup)
    })
    onCleanup(() => {
        document.removeEventListener("keyup", handleKeyup)
    })
    return (
        <Suspense>
            <div id='gridContainer' class='ag-theme-alpine-dark h-full' >
                <AgGridSolid
                    onGridReady={params => gridApi = params.api}
                    rowSelection="multiple"
                    onCellContextMenu={e => {
                        console.log(e)
                    }}
                    onColumnHeaderContextMenu={e => {
                        console.log(e)
                    }}
                    rowData={data()}
                    columnDefs={[{
                        checkboxSelection: true,
                        headerCheckboxSelection: true,
                        width: 150,
                        suppressSizeToFit: true,
                    }, {
                        field: "title",
                    }, {
                        field: 'path'
                    }]}
                />
            </div>
        </Suspense>
    )
}