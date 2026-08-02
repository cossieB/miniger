import { Index, Show } from "solid-js";
import { state } from "../../state";
import clickOutside from "../../lib/clickOutside";
import { SidePanelItem } from "./SidePanelItem";
import { createStore } from "solid-js/store";
import { Miniplayer, Thumbnail } from "../Miniplayer";
import MoviesContextMenu from "../MoviesContextMenu";
import Resizer from "../Resizer";
import { BOTTOM_BAR_HEIGHT, TOP_BAR_HEIGHT } from "~/constants";
import styles from "./SidePanel.module.css"

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
            tabindex={0}
            onkeyup={e => {
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
                <Thumbnail />
            </div>
        </section>
    );
}

