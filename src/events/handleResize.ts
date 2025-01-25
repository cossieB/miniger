import { state } from "../state";

export function handleResize() {
    // Make panels take up same proportion of screen space when window gets resized
    const tree = state.tree.width / state.windowDimensions.width * window.innerWidth;
    const side = state.sidePanel.width / state.windowDimensions.width * window.innerWidth;

    // Update values in state object
    state.windowDimensions.set({height: window.innerHeight, width: window.innerWidth});
    state.tree.setWidth(tree)
    state.sidePanel.setWidth(side)
}