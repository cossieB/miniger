import { useAction, useLocation } from "@solidjs/router";
import { state } from "../../state";
import { Show } from "solid-js";
import { confirm } from "@tauri-apps/plugin-dialog";
import { deleteItems } from "../../api/mutations";
import { Trash2Icon } from "lucide-solid";

const map = {
    "movies": ["filmId", "film"],
    "actors": ["actorId", "actor"],
    "studios": ["studioId", "studio"]
} as const

export function DeleteBtn() {
    const deleteAction = useAction(deleteItems)
    const params = useLocation()

    const segment1 = () => params.pathname.split("/")[1] as "movies" | "actors" | "studios"

    return (
        <Show when={/^\/(?!.*costar)(movies|actors|studios)/.test(params.pathname)}>
            <button
                id="topbar-delete-btn"
                title="Delete selected items"
                onclick={async () => {
                    const sel = state.mainPanel.getSelections();

                    if (sel.length === 0) return;

                    const confirmed = await confirm(`Remove ${sel.length} item${sel.length != 1 ? "s" : ""} from the database?`, { kind: "warning" });
                    if (!confirmed) return;

                    const table = map[segment1()][1];
                    if (!table) {
                        console.error(`Received table, ${table}, which does not exist or hasn't been accounted for.`)
                        return state.status.setStatus("Could not delete items. Please try again")
                    }
                    try {
                        const ids = sel.map(item => item[table + "Id"]);
                        await deleteAction(ids, table)
                    }
                    catch (error: any) {
                        state.status.setStatus(error)
                    }
                }}
            >
                <Trash2Icon
                    // classList={{ 'text-zinc-500': state.mainPanel.getSelections().length == 0 }}  
                />
            </button>
        </Show>
    )
}