import { AddFolderSvg } from "../../icons";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { setState } from "../../state";


export function AddDirectoryBtn() {
    return <AddFolderSvg
        title="Open Folder"
        onclick={async () => {
            const directory = await open({ directory: true });
            if (!directory) return;
            const t: { title: string; path: string; }[] = await invoke('load_directory', { path: directory });
            setState('sidePanel', 'list', t);
        }} />;
}
