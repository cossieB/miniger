import { TopBar } from "./components/TopBar/TopBar";
import { JSXElement, createEffect, onCleanup, onMount } from "solid-js";
import { resolveResource } from "@tauri-apps/api/path";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { SidePanel } from "./components/sidePanel/SidePanel";
import { setState, state } from "./state";
import { db } from ".";
import { BottomBar } from "./components/BottomBar";
import { Tree } from "./components/Tree/Tree";

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
            setState('sidePanel', prev => ({
                list: prev.list.filter((_item, i) => !state.sidePanel.selections.has(i)),
                lastSelection: -1
            }))
            state.sidePanel.selections.clear()
        }
        if (e.key == "a" && e.ctrlKey) {
            for (let i = 0; i < state.sidePanel.list.length; i++) {
                state.sidePanel.selections.add(i)
            }
        }
    }
    onMount(() => {
        document.addEventListener('keyup', handleKeyup);
    })
    onCleanup(() => {
        document.removeEventListener("keyup", handleKeyup);
    })

    return (
        <div oncontextmenu={e => e.preventDefault()} class="h-screen w-screen text-white">
            <TopBar />
            <div class="w-screen flex" style={{height: "calc(100vh - 4rem"}}>
                <Tree />
                {/* <Nav /> */}
                <main class="basis-96 flex-[3] overflow-hidden bg-slate-900">
                    {props.children}
                </main>
                <SidePanel />
            </div>
            <BottomBar />
        </div>
    );
}

export default App;