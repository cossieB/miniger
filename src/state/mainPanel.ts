import { createStore } from "solid-js/store";
import { sidePanel } from "./sidePanel";
import { tree } from "./tree";
import { windowDimensions } from "./windowDimension";

export const [mainPanel, setMainpanel] = createStore({
    width: () => windowDimensions.width - tree.width - sidePanel.width,

    getSelections: () => [] as any[],
    selectionsFn: (cb: () => any[]) => {
        setMainpanel({
            getSelections: cb
        })
    }
})