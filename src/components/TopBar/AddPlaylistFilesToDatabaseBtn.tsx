import { useAction } from "@solidjs/router";
import { addDirectoriesToDatabase } from "~/api/mutations";
import { AddToDatabaseSvg } from "~/icons";
import { state } from "~/state";


export function AddPlaylistFilesToDatabaseBtn() {
    const addAction = useAction(addDirectoriesToDatabase)
    return <AddToDatabaseSvg
        title="Add to database"
        classList={{ 'fill-zinc-500': state.sidePanel.list.length == 0 }}
        onclick={async () => {
            const files = state.sidePanel.list
            if (files.length == 0) return
            await addAction(files)
        }} />;
}

