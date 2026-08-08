import { batch, Index, Show } from "solid-js";
import { state } from "~/state";
import { SidePanelItem } from "./SidePanelItem";
import { createStore } from "solid-js/store";
import { BOTTOM_BAR_HEIGHT, TOP_BAR_HEIGHT } from "~/constants";
import styles from "./SidePanel.module.css"
import { Miniplayer } from "~/components/Miniplayer";
import Resizer from "~/components/Resizer";
import MoviesContextMenu from "~/features/movies/components/MoviesContextMenu";
import clickOutside from "~/lib/clickOutside";
import { sep } from "@tauri-apps/api/path";
import { parsePlaylistContent } from "~/utils/parsePlaylist";

false && clickOutside

export function SidePanel() {

    const [contextMenu, setContextMenu] = createStore({
        isOpen: false,
        x: 0,
        y: 0,
        close() {
            setContextMenu('isOpen', false)
        },
        data: {} as { title: string, path: string, rowId: string },
    })

    return (
        <section
            class={`${styles.sidepanel} droppable scrollable`}
            style={{
                width: state.sidePanel.width + "px",
                height: (state.windowDimensions.height - TOP_BAR_HEIGHT - BOTTOM_BAR_HEIGHT) + "px"
            }}
            tabIndex={0}
            onKeyUp={e => {
                e.preventDefault();
                if (e.key == "Escape")
                    return state.sidePanel.selections.clearSelections()
                if (e.key == 'Delete') {
                    state.sidePanel.selections.deleteSelections()
                }

                if (e.key == "a" && e.ctrlKey) {
                    for (let i = 0; i < state.sidePanel.list.length; i++) {
                        state.sidePanel.selections.add(i)
                    }
                }
            }}
            onDragOver={e => e.preventDefault()}
            onDrop={async e => {
                e.preventDefault();
                e.currentTarget.classList.remove(styles.dragover)
                const files = Array.from(e.dataTransfer?.files ?? []).filter(f => /\.(m3u8?|pls|asx|mpcpl)$/i.test(f.name));
                if (files.length === 0) return;

                const parsedPathArrays = await Promise.all(files.map(async (file) => {
                    const text = await file.text();
                    return parsePlaylistContent(text, file.name);
                }));

                const extractedPaths: string[] = parsedPathArrays.flat();
                batch(() => {
                    const i = state.sidePanel.lastDraggedOver
                    state.sidePanel.setLastDraggedOver(-1)
                    state.sidePanel.insertAt(i, extractedPaths.map(path => ({
                        path,
                        title: path.slice(path.lastIndexOf(sep()) + 1, path.lastIndexOf("."))
                    })));
                })
            }}
            onDragLeave={e => {
                e.currentTarget.classList.remove(styles.dragover)
            }}
            onDragEnter={e => {
                e.currentTarget.classList.add(styles.dragover)
            }}
        >
            <ul
                class="droppable"
            >
                <Index each={state.sidePanel.list}>
                    {(data, i) =>
                        <SidePanelItem
                            data={data()}
                            i={i}
                            draggable
                            oncontextmenu={e => {
                                setContextMenu({
                                    isOpen: true,
                                    x: e.clientX,
                                    y: e.clientY,
                                    data: data()
                                })
                            }}
                        />}
                </Index>
                <SidePanelItem
                    data={{
                        filmId: -1,
                        path: "",
                        title: "",
                        rowId: "",
                        isSelected: false,
                        lastDraggedOver: false,
                        selectedLast: false
                    }}
                    i={state.sidePanel.list.length}
                    draggable={false}
                />
            </ul>
            <Show when={contextMenu.isOpen}>
                <MoviesContextMenu
                    contextMenu={contextMenu}
                    isMainPanel={false}
                    getSelectedFilms={() => state.sidePanel.selections.getAll()}
                />
            </Show>
            <div class={styles.miniplayerWrapper}>
                <Show when={!!state.miniplayer.video}>
                    <Resizer
                        vertical
                        displacement={state.windowDimensions.height - state.miniplayer.height - BOTTOM_BAR_HEIGHT - TOP_BAR_HEIGHT}
                        maxDisplacement={state.windowDimensions.height - BOTTOM_BAR_HEIGHT - 50}
                        minDisplacement={TOP_BAR_HEIGHT + 50}
                        onMove={displacement => {
                            state.miniplayer.setHeight(state.windowDimensions.height - displacement - BOTTOM_BAR_HEIGHT)
                        }}
                    />
                    <Miniplayer />
                </Show>
            </div>
        </section>
    );
}

