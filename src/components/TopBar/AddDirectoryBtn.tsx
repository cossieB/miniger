import { AddFolderSvg } from "../../icons";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { PlaylistFile, setState, state } from "../../state";
import Database from "@tauri-apps/plugin-sql";
import { reload } from "@solidjs/router";
import { filmCache } from "../../caches/films";

export function AddDirectoryBtn() {
    return <AddFolderSvg
        title="Open Folder"
        onclick={async () => {
            const files = await readDirectories()
            setState('sidePanel', 'list', files);
        }} />;
}

export function AddDirectoryToDatabase() {
    return (
        <AddFolderSvg
            title="Add Folder To Database"
            class="ml-auto"
            onClick={async () => {
                const files = await readDirectories()
                const db = await Database.load("sqlite:mngr.db");
                try {
                    await db.select("BEGIN")
                    for (const file of files) {
                        await db.select("INSERT INTO film (title, path) VALUES ($1, $2) ON CONFLICT(path) DO NOTHING", [file.title, file.path])
                    }
                    await db.select("COMMIT")
                    state.status.setStatus("Successfully added files")
                    reload()
                } 
                catch (error) {
                    console.log(error);
                    await db.select("ROLLBACK")
                }
            }}
        />
    )
}

async function readDirectories() {
    const directories = await open({ directory: true, multiple: true });
    if (directories == null) return [];
    const files: PlaylistFile[] = []
    for (const directory of directories) {
        const t: {title: string, path: string}[] = await invoke('load_directory', { path: directory });
        for (const file of t) {
            const cached = filmCache[file.path]
            if (!cached) 
            files.push({
                ...file,
                studio_name: "",
                actors: [],
                tags: ''
            })
            else
                files.push(cached)
        }
    }
    return files;
}
