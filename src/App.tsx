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
import { handleKeyup, handleResize } from "./events";

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
                    pivot="right"
                    max={window.innerWidth}
                />
                <main class="overflow-hidden bg-slate-900" style={{ width: state.mainPanel.width() + "px" }}>
                    {props.children}
                </main>
                <Resizer
                    min={state.tree.width}
                    setDimension={state.sidePanel.setWidth}
                    length={state.sidePanel.width}
                    pivot="left"
                    max={state.windowDimensions.width}
                />
                <SidePanel />
            </div>
            <BottomBar />
        </div>
    );
}

export default App;