import { Index, Show } from "solid-js";
import { state } from "../../state";
import clickOutside from "../../lib/clickOutside";
import { SidePanelItem } from "./SidePanelItem";
import { ContextMenu } from "../ContextMenu/ContextMenu";
import { MoviesMenu } from "../MoviesContextMenu";
import { createStore } from "solid-js/store";
import { Miniplayer } from "../Miniplayer";

false && clickOutside

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
            class="bg-slate-950 overflow-x-hidden select-none shrink-0 droppable h-[calc(100vh - 4rem)] flex flex-col"
            style={{ width: state.sidePanel.width + "px" }}
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
                <ContextMenu close={contextMenu.close} pos={{ x: contextMenu.x, y: contextMenu.y }}>
                    <MoviesMenu data={contextMenu.data} />
                </ContextMenu>
            </Show>
            <Show when={state.miniplayer}>
                <Miniplayer />
            </Show>
        </section>
    );
}