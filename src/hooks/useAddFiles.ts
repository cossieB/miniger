import { useAction } from "@solidjs/router";
import { invoke } from "@tauri-apps/api/core";
import { addFilesToDatabase } from "~/api/mutations";
import { state } from "~/state";
import { refetchFilms } from "~/utils/refetchFilms";
import { updateMetadata } from "~/utils/updateMetadata";

export function useAddFiles() {
    const addAction = useAction(addFilesToDatabase)
    
    return async function (files: Parameters<typeof addFilesToDatabase>[0]) {
        const res = await addAction(files.map(f => ({ path: f.path, title: f.title })))
        if (!res) return;
        // running these metadata and thumbnail processes sequentially to prevent PC slowdowns
        await updateMetadata(res),
        await refetchFilms()
        await invoke("generate_thumbnails", {
            videos: res
        })        
        state.status.setStatus("")
    }
}