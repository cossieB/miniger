import { AddFolderSvg } from "../../icons";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { setState, state } from "../../state";
import Database from "@tauri-apps/plugin-sql";
import { reload } from "@solidjs/router";

type FileInfo = {
    title: string;
    path: string;
};
export function AddDirectoryBtn() {
    return <AddFolderSvg
        title="Open Folder"
        onclick={async () => {
            const directory = await open({ directory: true });
            if (!directory) return;
            const t: FileInfo[] = await invoke('load_directory', { path: directory });
            setState('sidePanel', 'list', t);
        }} />;
}

export function AddDirectoryToDatabase() {
    return (
        <AddFolderSvg
            title="Add Folder To Database"
            class="ml-auto"
            onClick={async () => {
                const directories = await open({ directory: true, multiple: true });
                if (directories == null) return;
                const files: FileInfo[] = []
                for (const directory of directories) {
                    const t: FileInfo[] = await invoke('load_directory', { path: directory });
                    files.push(...t);
                }
                console.log(files);
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