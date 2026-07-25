import { addFolderToSidebar, readDirectories } from "../../utils/readDirectories";
import { FolderInputIcon, FolderOpenIcon } from "lucide-solid";
import { useAddFiles } from "~/hooks/useAddFiles";

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
    const addAction = useAddFiles()
    return (
        <button
            title="Add Folder To Database"
            id="add-dir-btn"
            onClick={async () => {
                const files = await readDirectories()
                if (!files) return;
                await addAction(files)                
            }}
        >
            <FolderInputIcon />
        </button>
    )
}