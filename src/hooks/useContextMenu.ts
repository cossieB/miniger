import { createStore } from "solid-js/store";

export function useContextMenu<T>(data: T) {
    const [contextMenu, setContextMenu] = createStore({
        isOpen: false,
        x: 0,
        y: 0,
        data,
        close: () => setContextMenu({isOpen: false}),
        open: (menu: {data: T, x: number, y: number}) => setContextMenu({
            x: menu.x,
            y: menu.y,
            isOpen: true,
            data: menu.data
        })
    })

    return {contextMenu, setContextMenu}
}