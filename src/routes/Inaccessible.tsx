import { Suspense, onCleanup, onMount } from "solid-js";
import AgGridSolid from "ag-grid-solid";
import { GridApi, ICellEditorParams } from "ag-grid-community";
import { confirm, open,  } from "@tauri-apps/plugin-dialog";
import { getInaccessible } from "../api/data";
import { createAsync, useAction } from "@solidjs/router";
import { editFilm, removeByPaths } from "../api/mutations";
import videoExtensions from "~/videoExtensions.json"
import { SearchSvg } from "~/icons";

export default function Inaccessible() {
    const removeAction = useAction(removeByPaths)
    const data = createAsync(() => getInaccessible())
    let gridApi!: GridApi<any>

    async function del() {
        const selection = gridApi.getSelectedRows()
        if (selection.length == 0) return
        const confirmed = await confirm(`Remove ${selection.length} file(s) from database?`);
        if (confirmed) {
            await removeAction(selection);
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
                    getRowId={params => params.data.path}
                    rowSelection="multiple"
                    onColumnHeaderContextMenu={e => {
                        console.log(e)
                    }}
                    rowData={data()}
                    columnDefs={[{
                        checkboxSelection: true,
                        headerCheckboxSelection: true,
                        width: 50,
                        suppressSizeToFit: true,
                    }, {
                        field: "title",
                    }, {
                        field: 'path'
                    }, {
                        editable: true,
                        singleClickEdit: true,
                        cellEditor: Find,
                        width: 50,
                        cellRenderer: () => (
                            <div class="h-full flex items-center" title="Find this file" aria-label="Find this file">
                                <SearchSvg />
                            </div>
                        )
                    }]}
                />
            </div>
        </Suspense>
    )
}

function Find(props: ICellEditorParams) {
    const action = useAction(editFilm)
    onMount(async () => {
        const sel = await open({
            filters: [{
                extensions: videoExtensions,
                name: "Video Files", 
            }]
        })
        if (!sel) return props.stopEditing()
        await action("path", sel, props.data.film_id, [getInaccessible.key])
        props.stopEditing()
    })
    return null
}