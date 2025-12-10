import { Index, Show } from "solid-js";
import { state } from "../../state";
import clickOutside from "../../lib/clickOutside";
import { SidePanelItem } from "./SidePanelItem";

import { createStore } from "solid-js/store";
import { Miniplayer } from "../Miniplayer";
import MoviesContextMenu from "../MoviesContextMenu";

false && clickOutside

export function SidePanel() {

    const [contextMenu, setContextMenu] = createStore({
        isOpen: false,
        x: 0,
        y: 0,
        close() {
            setContextMenu('isOpen', false)
        },
        data: {} as { title: string, path: string },
        selections: state.sidePanel.selections.getAll(),
    })

    return (
        <section
            class="bg-slate-950 overflow-x-hidden select-none shrink-0 droppable h-[calc(100vh - 4rem)] flex flex-col relative"
            style={{ width: state.sidePanel.width + "px" }}
            tabindex={0}
            onkeyup={e => {
                e.preventDefault();
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
                class="overflow-y-auto overflow-x-hidden droppable shrink"
                use:clickOutside={state.sidePanel.selections.clearSelections}
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
                    contextMenu={{ ...contextMenu, selections: state.sidePanel.selections.getAll() }}
                    isMainPanel={false}
                />
            </Show>
            <Miniplayer />
        </section>
    );
}