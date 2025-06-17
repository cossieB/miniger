import { JSX, Show, createEffect, createSignal, on, untrack } from "solid-js";
import { ChevronRight } from "../../icons";
import { useContextMenuContext } from "./useContextMenuContext";
import { Menu } from "./Menu";
import { ContextMenuItem } from "./ContextMenuItem";

export function ContextSubMenu(props: { label: string; children: JSX.Element; }) {
    const [showMenu, setShowMenu] = createSignal(false);
    const position = useContextMenuContext();
    const [y, setY] = createSignal(position.y);
    const [x, setX] = createSignal(position.width)

    let [parentItem, setParentItem] = createSignal<HTMLLIElement | undefined>()
    let [subMenu, setSubmenu] = createSignal<HTMLDivElement | undefined>()

    let timerId = -1


    createEffect(on(showMenu, () => {
        setY(prev => parentItem()?.offsetTop ?? prev);
        if (!parentItem() || !subMenu()) return
        const rect = subMenu()!.getBoundingClientRect();
        const h = rect.top + rect.height;

        if (h > window.innerHeight) {
            const diff = h - window.innerHeight;
            setY(untrack(y) - diff);
        }
        setX(position.width);
        subMenu()!.style.opacity = "1";
        const w = position.x + position.width + subMenu()!.clientLeft + subMenu()!.clientWidth;
        if (w > window.innerWidth) {
            setX(-position.width)
        }
    }));

    return (
        <>
            <ContextMenuItem
                ref={setParentItem}
                onClick={() => {
                    setShowMenu(p => !p);
                    clearTimeout(timerId);
                    timerId = -1;
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
                        ref={setSubmenu}
                    >
                        {props.children}
                    </Menu>
                </Show>
            </ContextMenuItem>
        </>
    );
}
