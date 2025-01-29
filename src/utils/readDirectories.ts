import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { getFilmCache, getFilmDetails } from "../components/TopBar/getFilmDetails";
import { PlaylistFile } from "../state";

export async function readDirectories() {
    const directories = await open({ directory: true, multiple: true });
    if (directories == null) return [];
    
    const files: PlaylistFile[] = []

    const cache = await getFilmCache();

    for (const directory of directories) {
        const fileList: { title: string, path: string }[] = await invoke('load_directory', { path: directory });
        const f = getFilmDetails(fileList, cache)
        files.push(...f)
    }
    return files;
}