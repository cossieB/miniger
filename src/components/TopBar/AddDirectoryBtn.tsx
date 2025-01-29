import { AddFolderSvg } from "../../icons";
import { state } from "../../state";
import { addDirectoriesToDatabase } from "../../api/mutations";
import { readDirectories } from "../../utils/readDirectories";

export function AddDirectoryBtn() {
    return <AddFolderSvg
        title="Open Folder"
        onclick={async () => {
            const files = await readDirectories()
            state.sidePanel.setFiles(files);
        }} />;
}

export function AddDirectoryToDatabase() {
    return (
        <AddFolderSvg
            title="Add Folder To Database"
            class="ml-auto"
            onClick={addDirectoriesToDatabase}
        />
    )
}