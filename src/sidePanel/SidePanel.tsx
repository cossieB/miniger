import { For } from "solid-js";
import { setState, state } from "../state";
import clickOutside from "../lib/clickOutside";
import { SidePanelItem } from "./SidePanelItem";
false && clickOutside

export function SidePanel() {
    return (
        <section
            class="bg-gray-800 flex-1 basis-14 overflow-x-hidden select-none"
            use:clickOutside={() => {
                state.sidePanel.selections.clear();
                setState('sidePanel', 'lastSelection', 0)
            }}
        >
            <ul class="overflow-y-scroll overflow-x-hidden"
                style={{ height: "calc(100vh - 4rem)" }}
            >
                <For each={state.sidePanel.list}>
                    {(path, i) => <SidePanelItem path={path} i={i} />}
                </For>
                <SidePanelItem path={{ path: "", title: "" }} i={() => state.sidePanel.list.length} />
            </ul>
        </section>
    );
}
