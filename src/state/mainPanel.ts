import { createStore } from "solid-js/store";
import { sidePanel } from "./sidePanel";
import { tree } from "./tree";
import { windowDimensions } from "./windowDimension";

export const [mainPanel, setMainpanel] = createStore({
    width: () => windowDimensions.width - tree.width - sidePanel.width,
    selectedIds: [] as number[],
    setSelectedIds: (selectedItems: number[]) => {
        setMainpanel({selectedIds: selectedItems})
    }
})