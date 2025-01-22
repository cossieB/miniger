import { TopBar } from "./components/TopBar/TopBar";
import { JSXElement, createEffect, onCleanup, onMount } from "solid-js";
import { resolveResource } from "@tauri-apps/api/path";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { SidePanel } from "./components/sidePanel/SidePanel";
import { state } from "./state";
import { db } from ".";
import { BottomBar } from "./components/BottomBar";
import { Tree } from "./components/Tree/Tree";
import Resizer from "./components/Resizer";

function App(props: { children?: JSXElement }) {
    createEffect(() => {
        if (!db()) return;
        (async function () {
            try {
                const script = await readTextFile(await resolveResource("./schema.sql"));
                db()!.execute(script)
            }
            catch (error) {
                console.error(error)
            }
        })()
    })
    function handleKeyup(e: KeyboardEvent) {
        e.preventDefault();
        if (e.key == 'Delete') {
            state.sidePanel.deleteSelections()
        }
        if (e.key == "a" && e.ctrlKey) {
            for (let i = 0; i < state.sidePanel.list.length; i++) {
                state.sidePanel.selections.add(i)
            }
        }
    }
    onMount(() => {
        document.addEventListener('keyup', handleKeyup);
        window.addEventListener("resize", handleResize)
    })
    onCleanup(() => {
        document.removeEventListener("keyup", handleKeyup);
        window.removeEventListener("resize", handleResize)
    })

    return (
        <div oncontextmenu={e => e.preventDefault()} class="h-screen w-screen text-white">
            <TopBar />
            <div class="w-screen flex relative" style={{ height: "calc(100vh - 4rem" }}>
                <Tree />
                <Resizer
                    min={0}
                    setDimension={state.tree.setWidth}
                    length={state.tree.width}
                    orientation="horizontal"
                />
                <main class="overflow-hidden bg-slate-900" style={{ width: state.mainPanel.width + "px" }}>
                    {props.children}
                </main>
                <Resizer
                    min={state.tree.width}
                    setDimension={state.mainPanel.setWidth}
                    length={state.mainPanel.width}
                    orientation="horizontal"
                />
                <SidePanel />
            </div>
            <BottomBar />
        </div>
    );
}

function handleResize() {
    const width = window.innerWidth - state.tree.width - 208
    state.mainPanel.setWidth(width);
}

export default App;