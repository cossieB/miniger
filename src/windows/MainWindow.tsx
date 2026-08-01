import { TopBar } from "../components/TopBar/TopBar";
import { type JSXElement, onCleanup, onMount } from "solid-js";
import { SidePanel } from "../components/sidePanel/SidePanel";
import { state } from "../state";
import { BottomBar } from "../components/BottomBar";
import Resizer from "~/components/Resizer";
import { handleResize } from "../events";
import { useBeforeLeave } from "@solidjs/router";
import { Nav } from "../components/Nav/Nav";
import { useWatchJson } from "../readSettings";
import "~/events/mainWindow"
import { BOTTOM_BAR_HEIGHT, TOP_BAR_HEIGHT } from "~/constants";
import styles from "./MainWindow.module.css"

function App(props: { children?: JSXElement }) {
    const abortController = new AbortController
    useWatchJson()
    useBeforeLeave(() => {
        state.mainPanel.selectionsFn(() => [])
    })

    onMount(() => {
        window.addEventListener("resize", handleResize, {signal: abortController.signal});
    })
    onCleanup(() => {
        abortController.abort()
    })

    return (
        <div oncontextmenu={e => e.preventDefault()} class={styles.app}>
            <TopBar />
            <div 
                style={{
                    height: (state.windowDimensions.height - TOP_BAR_HEIGHT - BOTTOM_BAR_HEIGHT) + "px"
                }}
            >
                <Nav />
                <Resizer                    
                    displacement={state.tree.width}
                    onMove={(x) => {
                        state.tree.setWidth(x)
                    }}
                    minDisplacement={50}
                    maxDisplacement={state.windowDimensions.width - state.sidePanel.width - 600}
                />
                <main style={{ width: state.mainPanel.width() + "px" }}>
                    {props.children}
                </main>
                <Resizer
                    displacement={state.tree.width + state.mainPanel.width()}
                    onMove={(x) => {
                        state.sidePanel.setWidth(window.innerWidth - x)
                    }}
                    minDisplacement={state.tree.width + 600}
                    maxDisplacement={state.windowDimensions.width - 50}
                />
                <SidePanel />
            </div>
            <BottomBar />
        </div>
    );
}

export default App;