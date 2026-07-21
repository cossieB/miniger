import { createSignal } from "solid-js"
import { state } from "~/state"

export function useMovieGridDimensions() {
    const cellHeight = 180
    const cellWidth = cellHeight * 16 / 9
    const columns = () => Math.floor(state.mainPanel.width() / cellWidth)
    const [_parentRef, setParentRef] = createSignal<HTMLDivElement>()

    return {
        cellHeight,
        cellWidth,
        columns,
        setParentRef
    }
}