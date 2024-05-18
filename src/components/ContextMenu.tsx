import { Accessor, JSX, Show, createContext, createEffect, createSignal, onMount, splitProps, useContext } from "solid-js"
import clickOutside from "../lib/clickOutside"
import { Portal } from "solid-js/web"
import { A } from "@solidjs/router"
false && clickOutside

type Props = {
    close: () => void
    children: JSX.Element
    pos: {
        x: number,
        y: number,
    }
}

type Ctx = {
    x: number
    y: number
    width: Accessor<number>
}

const ContextMenuContext = createContext<Ctx | null>(null)

export function ContextMenu(props: Props) {
    let ref!: HTMLDivElement
    const [width, setWidth] = createSignal(0)

    onMount(() => {
        setWidth(ref.clientWidth);
    })

    return (
        <ContextMenuContext.Provider value={{ ...props.pos, width }}>
            <Portal>
                <div
                    ref={ref}
                    use:clickOutside={props.close}
                    class="absolute bg-slate-800 text-white rounded-md border-2 border-slate-400"
                    style={{
                        left: props.pos.x + "px",
                        top: props.pos.y + "px",
                    }}
                >
                    <ul class="min-w-52 ">
                        {props.children}
                    </ul>
                </div>
            </Portal>
        </ContextMenuContext.Provider>
    )
}

function useContextMenuContext() {
    const position = useContext(ContextMenuContext)
    if (!position)
        throw new Error("This component has to be a child of ContextMenu")
    return position
}

function ContextSubMenu(props: { label: string, children: JSX.Element }) {
    const [showMenu, setShowMenu] = createSignal(false)
    const position = useContextMenuContext()
    const [y, setY] = createSignal(position.y)
    let ref: HTMLLIElement | undefined

    createEffect(() => {
        console.log(ref?.getBoundingClientRect()?.top, ref?.offsetTop, ref?.clientTop)
        if (ref) {
            setY(ref.getBoundingClientRect()?.top ?? 0)
        }
    })

    return (
        <>
            <ContextMenuItem ref={ref} onClick={() => setShowMenu(p => !p)} >
                <span>{props.label} </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-right" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708" />
                </svg>

            </ContextMenuItem>
            <Show when={showMenu()} >
                <ContextMenu
                    pos={{ x: position.x + position.width() + 5, y: y() + 5 }}
                    close={() => setShowMenu(false)}
                >
                    {props.children}
                </ContextMenu>
            </Show>
        </>
    )
}

type ContextMenuProps = {
    children: JSX.Element
    onClick: () => void
    ref?: HTMLLIElement
} & JSX.HTMLAttributes<HTMLLIElement>

function ContextMenuItem(props: ContextMenuProps) {
    return (
        <li
            ref={props.ref}
            class="flex items-center justify-between h-8 p-2 hover:bg-slate-500"
            onclick={props.onClick}
            {...props}
        >
            {props.children}
        </li>
    )
}

function ContextMenuLink(props: JSX.HTMLAttributes<HTMLLIElement> & { href: string }) {
    const [anchor, others] = splitProps(props, ['href'])
    return (
        <A href={anchor.href}>
            <li
                {...others}
                ref={props.ref}
                class="flex items-center justify-between h-8 p-2 hover:bg-slate-500"
            >
                {props.children}
            </li>
        </A>
    )
}

ContextMenu.Item = ContextMenuItem
ContextMenu.SubMenu = ContextSubMenu
ContextMenu.Link = ContextMenuLink