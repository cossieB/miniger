import { For, Show } from "solid-js";
import { state } from "../../state";
import clickOutside from "../../lib/clickOutside";
import { SidePanelItem } from "./SidePanelItem";
import { ContextMenu } from "../ContextMenu/ContextMenu";
import { MoviesMenu } from "../MoviesContextMenu";
import { createStore } from "solid-js/store";
import { listen } from "@tauri-apps/api/event";
import videoExtensions from "../../videoExtensions.json"
import { invoke } from "@tauri-apps/api/core";
import { processPlaylist } from "../TopBar/getFilmDetails";

false && clickOutside

type E = {
    paths: string[];
    position: {
        x: number;
        y: number;
    }
}

listen<E>("tauri://drag-drop", async event => {
    const pos = event.payload.position
    const target = document.elementFromPoint(pos.x, pos.y);
    const elem = target?.closest(".droppable") as HTMLElement | null;
    if (!elem) return;

    const files = event.payload.paths
    for (const path of files) {
        let idx = path.lastIndexOf(".")
        if (idx < 0) 
            idx = path.length
        
        const extension = path.slice(idx + 1);
        if (!extension) continue;
        
        if (["mpcpl", "asx", "m3u", "pls"].includes(extension)) {
            const fileList: { title: string; path: string; }[] = await invoke("read_playlist", {
                playlist: path
            });
            const playlist = await processPlaylist(fileList)
            const i = Number(elem.dataset.i)
            state.sidePanel.insertAt(i, playlist)
        }
        if (videoExtensions.includes(extension)) {

        }
    }


})

export function SidePanel() {
    const [contextMenu, setContextMenu] = createStore({
        isOpen: false,
        x: 0,
        y: 0,
        close() {
            setContextMenu('isOpen', false)
        },
        data: {} as Parameters<typeof MoviesMenu>[0]['data'],
    })
    return (
        <section
            class="bg-gray-800 overflow-x-hidden select-none shrink-0"
            style={{ width: window.innerWidth - state.mainPanel.width - state.tree.width + "px" }}
            use:clickOutside={state.sidePanel.clearSelections}
        >
            <ul
                class="overflow-y-auto overflow-x-hidden droppable"
                style={{ height: "calc(100vh - 4rem)" }}
            >
                <For each={state.sidePanel.list}>
                    {(data, i) =>
                        <SidePanelItem
                            data={data}
                            i={i}
                            oncontextmenu={e => {
                                setContextMenu({
                                    isOpen: true,
                                    x: e.clientX,
                                    y: e.clientY,
                                    data: {
                                        studio_id: null,
                                        release_date: null,
                                        ...data,
                                    }
                                })
                            }}
                        />}
                </For>
                <SidePanelItem data={{ path: "", title: "", actors: [], tags: [], studio_name: "" }} i={() => state.sidePanel.list.length} />
            </ul>
            <Show when={contextMenu.isOpen}>
                <ContextMenu close={contextMenu.close} pos={{ x: contextMenu.x, y: contextMenu.y }}>
                    <MoviesMenu data={contextMenu.data} />
                </ContextMenu>
            </Show>
        </section>
    );
}
