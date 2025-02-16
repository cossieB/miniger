import { JSX, Show, createEffect, createSignal, on } from "solid-js";
import { ChevronRight } from "../../icons";
import { useContextMenuContext } from "./useContextMenuContext";
import { Menu } from "./Menu";
import { ContextMenuItem } from "./ContextMenuItem";

export function ContextSubMenu(props: { label: string; children: JSX.Element; }) {
    const [showMenu, setShowMenu] = createSignal(false);
    const position = useContextMenuContext();
    const [y, setY] = createSignal(position.y);
    const [x, setX] = createSignal(position.width)

    let ref: HTMLLIElement | undefined;
    let timerId: NodeJS.Timeout | undefined;
    let sub: HTMLDivElement | undefined

    createEffect(() => {
        if (ref) {
            setY(ref.offsetTop);
        }
    });
    createEffect(on(() => showMenu(),() => {
        setX(position.width);
        if (sub) {
            const w = position.x + position.width + sub.clientLeft + sub.clientWidth;
            if (w > window.innerWidth) {
                setX( -position.width)
            }
        }
    }))

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
                        pos={{ x: x(), y: y() }}
                        close={() => setShowMenu(false)}
                        ref={sub}
                    >
                        {props.children}
                    </Menu>
                </Show>
            </ContextMenuItem>
        </>
    );
}
