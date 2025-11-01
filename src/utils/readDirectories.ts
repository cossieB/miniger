import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { PlaylistFile, state } from "../state";

export async function readDirectories(dirs?: string[]) {
    let directories = dirs;

    if (!directories) {
        const selections = await open({ directory: true, multiple: true });
        if (selections == null) return null;
        directories = selections;
    }
    state.status.setStatus("Scanning for new files")
    const files: PlaylistFile[] = []

    for (const directory of directories) {
        const fileList: { title: string, path: string }[] = await invoke('load_directory', { path: directory });
        for (const file of fileList) {
            files.push(file)
        }
    }
    state.status.setStatus("✓ Scanning for new files", true)
    return files;
}

export async function addFolderToSidebar() {
    const files = await readDirectories();
    files && state.sidePanel.setFiles(files);
};
