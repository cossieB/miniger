import { Accessor, For } from "solid-js";
import { setState, state } from "./state";
import clickOutside from "./lib/clickOutside";
false && clickOutside

export function SidePanel() {
    return (
        <section
            class="bg-gray-800 flex-1 basis-14 overflow-x-hidden select-none"
            use:clickOutside={() => {
                state.sidePanel.selections.clear();
                setState('sidePanel', 'lastSelection', 0)
            }}
            onDragEnter={e => {
                e.preventDefault();
                (e.target as HTMLElement).classList.add("bg-slate-500")
            }}
            ondrop={e => {
                e.preventDefault();
                (e.target as HTMLElement).classList.remove("bg-slate-500")
            }}
            ondragover={e => e.preventDefault()}
            ondragleave={e => {
                e.preventDefault();
                (e.target as HTMLElement).classList.remove("bg-slate-500")
            }}
        >
            <ul class="overflow-y-scroll overflow-x-hidden"
                style={{
                    height: "calc(100vh - 4rem)"
                }}
            >
                <For each={state.sidePanel.list}>
                    {(path, i) => <SidePanelItem path={path} i={i} />}
                </For>
            </ul>
        </section>
    );
}
type P = {
    path: typeof state['sidePanel']['list'][number],
    i: Accessor<number>
}
function SidePanelItem(props: P) {
    const isSelected = () => state.sidePanel.selections.has(props.i())
    return (
        <li

            class={"text-ellipsis text-nowrap overflow-hidden p-1 cursor-default hover:bg-slate-700"}
            classList={{ "!bg-slate-500": isSelected() }}
            onClick={e => {
                e.preventDefault();
                if (!e.ctrlKey) {
                    state.sidePanel.selections.clear()
                }
                if (e.shiftKey) {
                    const [min, max] = [Math.min(props.i(), state.sidePanel.lastSelection), Math.max(props.i(), state.sidePanel.lastSelection)]
                    for (let i = min; i <= max; i++) {
                        state.sidePanel.selections.add(i)
                    }
                }
                state.sidePanel.selections.add(props.i());
                setState('sidePanel', 'lastSelection', props.i())
            }}
        >
            {props.path.title}
        </li>
    )
}