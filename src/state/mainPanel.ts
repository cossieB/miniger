import { createStore } from "solid-js/store";
import type { PlaylistFile } from "~/state";
import { sidePanel } from "./sidePanel";
import { tree } from "./tree";
import { windowDimensions } from "./windowDimension";

export const [mainPanel, setMainpanel] = createStore({
    width: () => windowDimensions.width - tree.width - sidePanel.width,
    selectedItems: [] as PlaylistFile[],
    setSelectedItems: (selectedItems: PlaylistFile[]) => {
        setMainpanel({selectedItems})
    }
})