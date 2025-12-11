import { type JSX, splitProps } from "solid-js";
import { A } from "@solidjs/router";

export function ContextMenuLink(props: JSX.HTMLAttributes<HTMLLIElement> & { href: string; icon?: JSX.Element }) {
    const [partial, others] = splitProps(props, ['href', 'icon']);
    return (
        <li
            {...others}
            class="flex items-center hover:bg-slate-500 relative"
        >
            <A class="w-full flex items-center h-8 p-2" href={partial.href}>
                <span class="w-8"> {partial.icon} </span>
                {props.children}
            </A>
        </li>
    );
}
