import { createStore } from "solid-js/store"
import type { MovieTableData } from "~/types"

export function useMoviesContextMenu() {
    const [contextMenu, setContextMenu] = createStore({
        isOpen: false,
        x: 0,
        y: 0,
        close() {
            setContextMenu('isOpen', false)
        },
        data: {} as MovieTableData,
        selections: [] as MovieTableData[]
    })
    return { contextMenu, setContextMenu }
}