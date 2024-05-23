import { JSX } from "solid-js";

type ContextMenuProps = {
    children: JSX.Element;
    onClick: () => void;
    ref?: HTMLLIElement;
} & JSX.HTMLAttributes<HTMLLIElement>;

export function ContextMenuItem(props: ContextMenuProps) {
    return (
        <li
            ref={props.ref}
            class="flex items-center justify-between h-8 p-2 hover:bg-slate-500"
            onclick={props.onClick}
            {...props}
        >
            {props.children}
        </li>
    );
}
