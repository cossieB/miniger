import { useAction } from "@solidjs/router";
import { DatabaseIcon } from "lucide-solid";
import { addDirectoriesToDatabase } from "~/api/mutations";
import { state } from "~/state";


export function AddPlaylistFilesToDatabaseBtn() {
    const addAction = useAction(addDirectoriesToDatabase)
    return (
        <button
            title="Add to database"
            onclick={async () => {
                const files = state.sidePanel.list
                if (files.length == 0) return
                await addAction(files)
            }}
        >
            <DatabaseIcon
                classList={{ 'fill-zinc-500': state.sidePanel.list.length == 0 }}
            />
        </button>
    )
}

