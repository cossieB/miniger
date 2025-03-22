import { createResource, Index } from "solid-js"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { state } from "~/state"
import { SidePanelItem } from "./sidePanel/SidePanelItem"
import "~/events/drop"

const window = getCurrentWindow();

const unlisten = window.listen<typeof state['sidePanel']['list']>("sidepanel-files", e => {
    const list = e.payload
    state.sidePanel.setFiles(list)
})

window.onCloseRequested(async () => {
    (await unlisten)()
    window.destroy()
})


export function DragDrop() {

    createResource(() => {
        getCurrentWindow().emitTo("main", "drop_ready")
    })

    return (
        <div
            class="bg-slate-950 w-screen h-screen text-white overflow-y-scroll"
            tabIndex={0}
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
            <div
                class="w-full flex justify-end"
            >
                <button
                    class="bg-orange-500 rounded-sm p-1"
                    onclick={async () => {
                        (await unlisten)()
                        await window.emitTo("main", "files-dropped", state.sidePanel.list)
                        window.destroy()
                    }}
                >
                    DONE
                </button>
            </div>
            <ul class="overflow-y-auto overflow-x-hidden droppable shrink" id="drop-list">
                <Index each={state.sidePanel.list}>
                    {(data, i) =>
                        <SidePanelItem
                            data={data()}
                            i={i}
                        />
                    }
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
        </div>

    )
}