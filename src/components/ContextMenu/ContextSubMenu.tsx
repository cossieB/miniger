import { JSX, Show, createEffect, createSignal } from "solid-js";
import { ChevronRight } from "../../icons";
import { useContextMenuContext } from "./useContextMenuContext";
import { Menu } from "./Menu";
import { ContextMenuItem } from "./ContextMenuItem";

export function ContextSubMenu(props: { label: string; children: JSX.Element; }) {
    const [showMenu, setShowMenu] = createSignal(false);
    const position = useContextMenuContext();
    const [y, setY] = createSignal(position.y);

    let ref: HTMLLIElement | undefined;
    let timerId: number | undefined;

    createEffect(() => {
        if (ref) {
            setY(ref.offsetTop);
        }
    });

    return (
        <>
            <ContextMenuItem
                ref={ref}
                onClick={() => {
                    setShowMenu(p => !p);
                    clearTimeout(timerId);
                    timerId = undefined;
                }}
                onMouseEnter={() => {
                    timerId = setTimeout(() => setShowMenu(true), 250);
                }}
                onMouseLeave={() => {
                    clearTimeout(timerId);
                    timerId = setTimeout(() => setShowMenu(false), 250);
                }}

            >
                <span>{props.label} </span>
                <ChevronRight />
                <Show when={showMenu()}>
                    <Menu
                        pos={{ x: position.width(), y: y() }}
                        close={() => setShowMenu(false)}
                    >
                        {props.children}
                    </Menu>
                </Show>
            </ContextMenuItem>
        </>
    );
}
