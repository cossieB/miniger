import { type JSX, splitProps } from "solid-js";
import styles from "./ContextMenu.module.css"

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
            {...others}
            class={`${styles.item} ${others.class ?? ""}`}
        >
            <span class={styles.icon} > {partial.icon} </span>
            {props.children}
        </li>
    );
}
