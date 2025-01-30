import { AddFolderSvg } from "../../icons";
import { state } from "../../state";
import { addDirectoriesToDatabase } from "../../api/mutations";
import { readDirectories } from "../../utils/readDirectories";
import { useAction } from "@solidjs/router";

export function AddDirectoryBtn() {
    return <AddFolderSvg
        title="Open Folder"
        onclick={async () => {
            const files = await readDirectories()
            state.sidePanel.setFiles(files);
        }} />;
}

export function AddDirectoryToDatabase() {
    const addAction = useAction(addDirectoriesToDatabase)
    return (
        <AddFolderSvg
            title="Add Folder To Database"
            class="ml-auto"
            onClick={addAction}
        />
    )
}