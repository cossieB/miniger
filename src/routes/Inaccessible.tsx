import Database from "@tauri-apps/plugin-sql";
import { Suspense, onCleanup, onMount } from "solid-js";
import AgGridSolid from "ag-grid-solid";
import { GridApi } from "ag-grid-community";
import { confirm } from "@tauri-apps/plugin-dialog";
import { getInaccessible } from "../api/data";
import { createAsync } from "@solidjs/router";

export default function Inaccessible() {
    const data = createAsync(() => getInaccessible())
    let gridApi!: GridApi<any>

    async function del() {
        const selection = gridApi.getSelectedRows()
        if (selection.length == 0) return
        const confirmed = await confirm(`Remove ${selection.length} file(s) from database?`);
        if (confirmed) {
            const db = await Database.load("sqlite:mngr.db")
            await db.select("BEGIN")
            try {
                for (const film of selection) 
                    await db.select("DELETE FROM film WHERE path = $1", [film.path])
                await db.select("COMMIT")
            } 
            catch (error) {
                console.error(error)
                await db.select("ROLLBACK")
            }
        }
    }

    async function handleKeyup(e: KeyboardEvent) {
        if (e.key === "Delete") {
            await del()
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
            <div id='gridContainer' class='ag-theme-alpine-dark h-full relative' >
                <button onclick={del} class="absolute right-10 top-1 h-10 bg-red-600 p-3 rounded-sm z-50">
                    Delete Selected
                </button>
                <AgGridSolid
                    onGridReady={params => ((gridApi as any) = params.api)}
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