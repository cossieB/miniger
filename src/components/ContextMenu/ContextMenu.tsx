import { Accessor, JSX, createContext, createSignal, onMount } from "solid-js"
import clickOutside from "../../lib/clickOutside"
import { Portal } from "solid-js/web"
import { ContextSubMenu } from "./ContextSubMenu"
import { ContextMenuLink } from "./ContextMenuLink"
import { ContextMenuItem } from "./ContextMenuItem"
import { Menu } from "./Menu"
false && clickOutside

export type Props = {
    close: () => void
    children: JSX.Element
    pos: {
        x: number,
        y: number,
    },
    attach?: HTMLElement
    ref?: HTMLDivElement
}

type Ctx = {
    x: number
    y: number
    width: Accessor<number>
}

export const ContextMenuContext = createContext<Ctx | null>(null)

export function ContextMenu(props: Props) {
    let ref!: HTMLDivElement
    const [width, setWidth] = createSignal(0)

    onMount(() => {
        setWidth(ref.clientWidth);
    })

    return (
        <ContextMenuContext.Provider value={{ ...props.pos, width }}>
            <Portal mount={props.attach}>
                <Menu ref={ref} {...props} />
            </Portal>
        </ContextMenuContext.Provider>
    )
}

ContextMenu.Item = ContextMenuItem
ContextMenu.SubMenu = ContextSubMenu
ContextMenu.Link = ContextMenuLink