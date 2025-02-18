import { readTextFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import { state } from "./state";
import {getAllWindows} from "@tauri-apps/api/window"

export async function readSettings() {
    try {
        const content = await readTextFile("settings.json", {
            baseDir: BaseDirectory.AppData
        })
        
        const settings = JSON.parse(content) as Settings;
        
        state.sidePanel.setFiles(settings.list ?? [])
        state.tree.setWidth(settings.treeWidth ?? state.tree.width)
        state.sidePanel.setWidth(settings.sidePanelWidth ?? state.sidePanel.width)
    } catch (error) {}
    
    finally {
        const windows = await getAllWindows()
        const mainWindow = windows.find(window => window.label === "main")!
        const splash = windows.find(window => window.label === "splash")!
        await splash.destroy();
        await mainWindow.show()
    }
}

export type Settings = {
    list: typeof state['sidePanel']['list'],
    sidePanelWidth: number,
    treeWidth: number,
}