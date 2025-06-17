import { AddFolderSvg, OpenFolderSvg } from "../../icons";
import { addDirectoriesToDatabase } from "../../api/mutations";
import { useAction } from "@solidjs/router";
import { addFolderToSidebar, readDirectories } from "../../utils/readDirectories";
import { state } from "~/state";

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
                state.status.setStatus("Scanning for new files")
                const files = await readDirectories()
                files && await addAction(files)
                state.status.setStatus("Done", true)
            }}
        />
    )
}
