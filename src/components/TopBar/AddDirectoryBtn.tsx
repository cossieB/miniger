import { AddFolderSvg, OpenFolderSvg } from "../../icons";
import { addDirectoriesToDatabase } from "../../api/mutations";
import { useAction } from "@solidjs/router";
import { addFolderToSidebar, readDirectories } from "../../utils/readDirectories";

export function AddDirectoryBtn() {
    return <OpenFolderSvg
        title="Open Folder"
        onclick={addFolderToSidebar} />;
}

export function AddDirectoryToDatabase() {
    const addAction = useAction(addDirectoriesToDatabase)
    return (
        <AddFolderSvg
            title="Add Folder To Database"
            onClick={async () => {
                const files = await readDirectories()
                files && addAction(files)
            }}
        />
    )
}
