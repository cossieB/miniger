import { type JSX, createContext, onMount } from "solid-js"
import clickOutside from "../../lib/clickOutside"
import { Portal } from "solid-js/web"
import { ContextSubMenu } from "./ContextSubMenu"
import { ContextMenuLink } from "./ContextMenuLink"
import { ContextMenuItem } from "./ContextMenuItem"
import { Menu } from "./Menu"
import { createStore } from "solid-js/store"
import { ContextMenuDivider } from "./ContextMenuDivider"
false && clickOutside

export type Props = {
    close: () => void
    children: JSX.Element
    pos: {
        x: number,
        y: number,
    },
    attach?: HTMLElement
    ref?: HTMLDivElement | ((el: HTMLDivElement) => void) | undefined
}

type Ctx = {
    x: number
    y: number
    width: number
}

export const ContextMenuContext = createContext<Ctx | null>(null)

export function ContextMenu(props: Props) {    
    let ref!: HTMLDivElement
    const [position, setPosition] = createStore({
        x: props.pos.x,
        y: props.pos.y,
        width: 0
    })

    onMount(() => {
        const rect = ref.getBoundingClientRect();
          
        setPosition('width', ref.clientWidth);
        // shift menu when close the the right and bottom edges of the window
        if (rect.right > window.innerWidth)
            setPosition({
                x: window.innerWidth - rect.width
            })
        if (rect.bottom > window.innerHeight)
            setPosition({
                y: window.innerHeight - rect.height
            })
    })

    return (
        <ContextMenuContext.Provider value={position}>
            <Portal mount={props.attach}>
                <Menu ref={ref} {...props} pos={position} />
            </Portal>
        </ContextMenuContext.Provider>
    )
}

ContextMenu.Item = ContextMenuItem
ContextMenu.SubMenu = ContextSubMenu
ContextMenu.Link = ContextMenuLink
ContextMenu.Divider = ContextMenuDivider