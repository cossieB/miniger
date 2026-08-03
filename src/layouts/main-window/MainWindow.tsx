import { type JSXElement, onCleanup, onMount } from "solid-js";
import Resizer from "~/components/Resizer";
import "~/events/mainWindow"
import { BOTTOM_BAR_HEIGHT, TOP_BAR_HEIGHT } from "~/constants";
import styles from "./MainWindow.module.css"
import { handleResize } from "~/events";
import { useWatchJson } from "~/hooks/useStorage";
import { state } from "~/state";
import { BottomBar } from "./BottomBar";
import { Nav } from "./nav/Nav";
import { SidePanel } from "./sidepanel/SidePanel";
import { TopBar } from "./top-bar/TopBar";
import { Dialog } from "~/components/dialog/Dialog";

function App(props: { children?: JSXElement }) {
    const abortController = new AbortController
    useWatchJson()

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
            <Dialog />
        </div>
    );
}

export default App;