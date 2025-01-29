import { AddToDatabaseSvg } from "../../icons";
import { state } from "../../state";
import { addPlaylistFilesToDatabase } from "../../api/mutations";

export function AddPlaylistFilesToDatabaseBtn() {
    return <AddToDatabaseSvg
        title="Add to database"
        classList={{ 'fill-zinc-500': state.sidePanel.list.length == 0 }}
        onclick={async () => {
            if (state.sidePanel.list.length == 0) return
            await addPlaylistFilesToDatabase()
        }} />;
}

