import { useLocation } from "@solidjs/router";
import { TrashSvg } from "../../icons";
import { state } from "../../state";
import { Show } from "solid-js";
import { confirm } from "@tauri-apps/plugin-dialog";
import { deleteItems } from "../../api/mutations";

export function DeleteBtn() {
    const params = useLocation()
    const map: Record<string, string> = {
        "/movies": "film",
        "/actors": "actor",
        "/studios": "studio"
    }
    return (
        <Show when={["/movies", "/actors", "/studios"].includes(params.pathname)}>
            <TrashSvg
                onclick={async () => {
                    const gridApi = state.gridApi;
                    if (!gridApi) return;
                    const sel = gridApi.getSelectedRows()
                    const confirmed = await confirm(`Remove ${sel.length} item${sel.length != 1 ? "s" : ""} from the database?`);
                    if (confirmed) {
                        const table = map[params.pathname]; 
                        if (!table) {
                            console.error(`Received table, ${table}, which does not exist or hasn't been account for.`)
                            return state.status.setStatus("Could not delete items. Please try again")
                        }
                        try {
                            const ids = sel.map(item => item[table+"_id"]);
                            await deleteItems(ids, table) 
                            gridApi.applyTransaction({ 'remove': sel })
                        } catch (error: any) {
                            state.status.setStatus(error)
                        }
                    }
                }}
            />
        </Show>
    )

}