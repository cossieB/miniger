import { DatabaseIcon } from "lucide-solid";
import { useAddFiles } from "~/features/movies/hooks/useAddFiles";
import { state } from "~/state";

export function AddPlaylistFilesToDatabaseBtn() {
    const addAction = useAddFiles()
    return (
        <button
            title="Add to database"
            onclick={async () => {
                const files = state.sidePanel.list
                if (files.length == 0) return
                await addAction(files.map(f => ({ path: f.path, title: f.title })))
            }}
        >
            <DatabaseIcon
                classList={{ 'fill-zinc-500': state.sidePanel.list.length == 0 }}
            />
        </button>
    )
}

