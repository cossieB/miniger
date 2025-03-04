import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { state } from "../state";
import extensions from "~/videoExtensions.json"
import { sep } from "@tauri-apps/api/path";
import { createUniqueId } from "solid-js";

export async function loadPlaylist() {
    const selection = await open({
        title: "Select a playlist",
        filters: [{
            name: "Playlist files",
            extensions: ["m3u", "pls", "mpcpl", "asx"]
        }]
    });

    if (!selection) return;
    try {
        const fileList: { title: string; path: string; }[] = await invoke("read_playlist", {
            playlist: selection
        });
        state.sidePanel.setFiles(fileList.map(f => ({
            ...f, 
            rowId: createUniqueId(),
            isSelected: false,
            selectedLast: false,
            lastDraggedOver: false
        })));
    }
    catch (error) {
        state.status.setStatus(error as string);
    }
};

export async function loadVideos() {
    const selection = await open({
        title: "Select Videos",
        multiple: true,
        filters: [{
            name: "Video Files",
            extensions
        }]
    })
    if (!selection?.length) return;
    const files = selection.map(f => ({
        path: f,
        title: f.slice(f.lastIndexOf(sep()) + 1),
        rowId: createUniqueId(),
        isSelected: false,
        selectedLast: false,
        lastDraggedOver: false
    }))
    state.sidePanel.setFiles(files);
}