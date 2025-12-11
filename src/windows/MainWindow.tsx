import { TopBar } from "../components/TopBar/TopBar";
import { type JSXElement, onCleanup, onMount } from "solid-js";
import { SidePanel } from "../components/sidePanel/SidePanel";
import { state } from "../state";
import { BottomBar } from "../components/BottomBar";
import Resizer from "../components/Resizer";
import { handleResize } from "../events";
import { useBeforeLeave } from "@solidjs/router";
import { Nav } from "../components/Nav/Nav";
import { useWatchJson } from "../readSettings";
import "~/events/mainWindow"

function App(props: { children?: JSXElement }) {
    useWatchJson()
    useBeforeLeave(() => {
        state.getSelections = () => []
    })

    onMount(() => {
        window.addEventListener("resize", handleResize);
    })
    onCleanup(() => {
        window.removeEventListener("resize", handleResize)
    })

    return (
        <div oncontextmenu={e => e.preventDefault()} class="h-screen w-screen text-white">
            <TopBar />
            <div class="w-screen flex relative h-[calc(100%-4rem)]" >
                <Nav />
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