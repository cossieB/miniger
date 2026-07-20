import { useAction } from "@solidjs/router";
import { addFilesToDatabase } from "~/api/mutations";
import { updateMetadata } from "~/utils/updateMetadata";

export function useAddFiles() {
    const addAction = useAction(addFilesToDatabase)
    
    return async function (files: Parameters<typeof addFilesToDatabase>[0]) {
        const res = await addAction(files.map(f => ({ path: f.path, title: f.title })))
        if (!res?.length) return;
        await updateMetadata(res)    
    }
}