import { appDataDir, sep } from "@tauri-apps/api/path";
import { writeFile } from "@tauri-apps/plugin-fs";
import { state } from "~/state";

export async function saveImg(file: File) {
    const d = await appDataDir()
    const dir = d + sep() + "images" + sep()
    const timestamp = Date.now().toString();
    const fileType = file.name.slice(file.name.lastIndexOf("."));
    const fileName = timestamp + fileType
    const path = `${dir}${fileName}`
    try {
        const buffer = await file.arrayBuffer()
        const uint8array = new Uint8Array(buffer);
        await writeFile(path, uint8array)
        return fileName
    }
    catch (error) {
        state.status.setStatus("Error updating image: " + String(error))
        return null
    }
}