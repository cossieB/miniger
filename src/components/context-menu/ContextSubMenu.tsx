import { type JSX, Show, createEffect, createSignal, on } from "solid-js";
import { useContextMenuContext } from "./useContextMenuContext";
import { Menu } from "./Menu";
import { ContextMenuItem } from "./ContextMenuItem";
import { ChevronRightIcon } from "lucide-solid";

type Props = {
    label: string;
    children: JSX.Element;
    icon?: JSX.Element;
};

export function ContextSubMenu(props: Props) {
    const [showMenu, setShowMenu] = createSignal(false);
    const position = useContextMenuContext();
    const [y, setY] = createSignal(position.y);
    const [x, setX] = createSignal(position.width)

    let [parentItem, setParentItem] = createSignal<HTMLLIElement | undefined>()
    let [subMenu, setSubmenu] = createSignal<HTMLDivElement | undefined>()

    let timerId = -1

    createEffect(on(() => [parentItem(), subMenu()] as const, ([parent, sub]) => {

        if (!parent || !sub) return;
        const parentRect = parent.getBoundingClientRect()
        const subRect = sub.getBoundingClientRect();

        const w = parentRect.right + subRect.width;
        if (w < window.innerWidth) {
            setX(parentRect.right)
        }
        else {
            setX(parentRect.left - subRect.width)
        }

        const h = parentRect.top + subRect.height
        if (h < window.innerHeight) {
            setY(parentRect.top)
        }
        else {
            setY(parentRect.bottom - subRect.height)
        }
    }));

    return (
        <ContextMenuItem
            ref={setParentItem}
            onClick={() => {
                setShowMenu(p => !p);
                clearTimeout(timerId);
                timerId = -1;
            }}
            onMouseEnter={() => {
                clearTimeout(timerId)
                timerId = setTimeout(() => setShowMenu(true), 400);
            }}
            onMouseLeave={() => {
                clearTimeout(timerId);
                timerId = setTimeout(() => setShowMenu(false), 400);
            }}
            icon={props.icon}

        >
            <span>{props.label} </span>
            <span style={{ "margin-left": "auto" }}><ChevronRightIcon /></span>
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
    );
}
