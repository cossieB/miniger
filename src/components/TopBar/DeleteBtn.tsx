import { useAction, useLocation } from "@solidjs/router";
import { TrashSvg } from "../../icons";
import { state } from "../../state";
import { Show } from "solid-js";
import { confirm } from "@tauri-apps/plugin-dialog";
import { deleteItems } from "../../api/mutations";

export function DeleteBtn() {
    const deleteAction = useAction(deleteItems)
    const params = useLocation()

    const map: Record<string, string> = {
        "movies": "film",
        "actors": "actor",
        "studios": "studio"
    }
    const segment1 = () => params.pathname.split("/")[1]

    return (
        <Show when={/^\/(?!.*costar)(movies|actors|studios)/.test(params.pathname)}>
            <button
                id="topbar-delete-btn"
                title="Delete selected items"
                onclick={async () => {
                    const gridApi = state.gridApi;
                    if (!gridApi) return;

                    const sel = gridApi.getSelectedRows()
                    if (sel.length === 0) return;

                    const confirmed = await confirm(`Remove ${sel.length} item${sel.length != 1 ? "s" : ""} from the database?`, { kind: "warning" });
                    if (!confirmed) return;

                    const table = map[segment1()];
                    if (!table) {
                        console.error(`Received table, ${table}, which does not exist or hasn't been accounted for.`)
                        return state.status.setStatus("Could not delete items. Please try again")
                    }
                    try {
                        const ids = sel.map(item => item[table + "_id"]);
                        await deleteAction(ids, table)
                    }
                    catch (error: any) {
                        state.status.setStatus(error)
                    }
                }}
            >
                <TrashSvg />
            </button>
        </Show>
    )
}