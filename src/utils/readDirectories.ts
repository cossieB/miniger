import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { getFilmCache, getFilmDetails } from "../components/TopBar/getFilmDetails";
import { PlaylistFile, state } from "../state";

export async function readDirectories(dirs?: string[]) {
    let directories = dirs;
    
    if (!directories) {
        const selections = await open({ directory: true, multiple: true });
        if (selections == null) return null;
        directories = selections;
    }
    
    const files: PlaylistFile[] = []

    const cache = await getFilmCache();

    for (const directory of directories) {
        const fileList: { title: string, path: string }[] = await invoke('load_directory', { path: directory });
        const f = getFilmDetails(fileList, cache)
        files.push(...f)
    }
    return files;
}

export async function addFolderToSidebar() {
    const files = await readDirectories();
    files && state.sidePanel.setFiles(files);
};
