import { TopBar } from "./components/TopBar/TopBar";
import { JSXElement, createRenderEffect, on, onCleanup, onMount } from "solid-js";
import { SidePanel } from "./components/sidePanel/SidePanel";
import { state } from "./state";
import { BottomBar } from "./components/BottomBar";
import { Tree } from "./components/Tree/Tree";
import Resizer from "./components/Resizer";
import { handleKeyup, handleResize } from "./events";
import { useLocation } from "@solidjs/router";
import { readSettings } from "./readSettings";
import "~/events/close"

function App(props: { children?: JSXElement }) {
    const location = useLocation()
    
    createRenderEffect(on(() => location.pathname, () => {
        state.setGridApi(undefined)
    }))

    onMount(() => {
        document.addEventListener('keyup', handleKeyup);
        window.addEventListener("resize", handleResize);
        readSettings()
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