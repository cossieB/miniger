import { JSX, splitProps } from "solid-js";
import { A } from "@solidjs/router";

export function ContextMenuLink(props: JSX.HTMLAttributes<HTMLLIElement> & { href: string; icon?: JSX.Element }) {
    const [partial, others] = splitProps(props, ['href', 'icon']);
    return (
        <li
            {...others}
            class="flex items-center h-8 p-2 hover:bg-slate-500 relative"
        >
            <A class="w-full h-full flex items-center" href={partial.href}>
                <span class="w-6"> {partial.icon} </span>
                {props.children}
            </A>
        </li>
    );
}
