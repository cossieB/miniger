import { type JSX, splitProps } from "solid-js";
import { A } from "@solidjs/router";
import styles from "./ContextMenu.module.css"

export function ContextMenuLink(props: JSX.HTMLAttributes<HTMLLIElement> & { href: string; icon?: JSX.Element }) {
    const [partial, others] = splitProps(props, ['href', 'icon']);
    return (
        <li
            {...others}
            class={`${styles.link} ${others.class ?? ""}`}
        >
            <span class={styles.icon}> {partial.icon} </span>
            {props.children}
            <A href={partial.href} />
        </li>
    );
}
