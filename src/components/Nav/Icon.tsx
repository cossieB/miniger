import { type JSX } from "solid-js";
import styles from "~/windows/MainWindow.module.css"

export function Icon(props: JSX.HTMLAttributes<HTMLSpanElement>) {
    return (
        <span class={styles.parent} {...props}>
            {props.children}
        </span>
    );
}
