import { JSX } from "solid-js"
import clickOutside from "../lib/clickOutside"
import { Portal } from "solid-js/web"
false && clickOutside

type Props = {
    close: () => void
    children: JSX.Element
    pos: {
        x: number,
        y: number,
    }
}

export function ContextMenu(props: Props) {
    return (
        <Portal>
            <div
                use:clickOutside={props.close}
                class="absolute px-5 bg-slate-800 text-white"
                style={{
                    left: props.pos.x + "px",
                    top: props.pos.y + "px",
                }}
            >
                <ul>
                    {props.children}
                </ul>
            </div>
        </Portal>
    )
}

type ContextMenuProps = {
    children: JSX.Element
    onClick: () => void
} & JSX.HTMLAttributes<HTMLLIElement>

function ContextMenuItem(props: ContextMenuProps) {
    return (
        <li onclick={props.onClick} {...props}>
            {props.children}
        </li>
    )
}

ContextMenu.Item = ContextMenuItem