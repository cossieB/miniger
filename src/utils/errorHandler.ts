import { BaseDirectory, writeTextFile } from "@tauri-apps/plugin-fs";
import { state } from "~/state";

export async function errorHandler(error: unknown, message?: string) {
    state.status.setStatus(message ?? String(error))
    writeTextFile("errors.txt", String(error), {
        append: true,
        baseDir: BaseDirectory.AppData
    })
}