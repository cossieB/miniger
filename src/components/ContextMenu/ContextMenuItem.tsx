import { type JSX, splitProps } from "solid-js";

type ContextMenuProps = {
    children: JSX.Element;
    onClick: () => void;
    ref?: HTMLLIElement | (() => HTMLLIElement | undefined);
    icon?: JSX.Element;
} & JSX.HTMLAttributes<HTMLLIElement>;

export function ContextMenuItem(props: ContextMenuProps) {
        const [partial, others] = splitProps(props, ['icon']);
    return (
        <li
            class="flex items-center h-8 p-2 hover:bg-slate-500"
            {...others}
        >
            <span class="w-8"> {partial.icon} </span>
            {props.children}
        </li>
    );
}
