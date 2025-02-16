import { getCurrentWindow } from "@tauri-apps/api/window";
import { BaseDirectory, writeTextFile,  } from "@tauri-apps/plugin-fs";
import { unwrap } from "solid-js/store";
import { Settings } from "~/readSettings";
import { state } from "~/state";

const window = getCurrentWindow();


window.listen("tauri://close-requested", async e => {
    const data: Settings = {
        list: unwrap(state.sidePanel.list),
        sidePanelWidth: unwrap(state.sidePanel.width),
        treeWidth: unwrap(state.tree.width)
    };
    await writeTextFile("settings.json", JSON.stringify(data), {
        baseDir: BaseDirectory.AppData
    });
    window.destroy();
})