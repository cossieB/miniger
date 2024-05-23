import { JSX, splitProps } from "solid-js";
import { A } from "@solidjs/router";

export function ContextMenuLink(props: JSX.HTMLAttributes<HTMLLIElement> & { href: string; }) {
    const [anchor, others] = splitProps(props, ['href']);
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
    );
}
