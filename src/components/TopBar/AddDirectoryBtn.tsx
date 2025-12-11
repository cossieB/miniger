import { addDirectoriesToDatabase } from "../../api/mutations";
import { useAction } from "@solidjs/router";
import { addFolderToSidebar, readDirectories } from "../../utils/readDirectories";
import { FolderInputIcon, FolderOpenIcon } from "lucide-solid";

export function AddDirectoryBtn() {
    return (
        <button
            title="Open Folder"
            onclick={addFolderToSidebar}
        >
            <FolderOpenIcon />
        </button>
    )
}

export function AddDirectoryToDatabase() {
    const addAction = useAction(addDirectoriesToDatabase)
    return (
        <button
            title="Add Folder To Database"
            onClick={async () => {
                const files = await readDirectories()
                files && await addAction(files)
            }}
        >
            <FolderInputIcon />
        </button>
    )
}
