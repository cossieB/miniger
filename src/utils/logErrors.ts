import { BaseDirectory, writeTextFile } from "@tauri-apps/plugin-fs";

export async function logException(error: unknown, func: string) {
    const data: string[] = [
        new Date().toISOString(),
        String(error),
        func
    ]
    writeTextFile("errors.txt", data.join("\t"), {
        append: true,
        baseDir: BaseDirectory.AppData,        
    })
}
