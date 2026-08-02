import { Show } from "solid-js";
import styles from "./Table.module.css"

export function SortIcon(props: {
    direction: false | "asc" | "desc";
    sortable: boolean;
}) {
    return (
        <Show when={props.sortable}>
            <span class={styles.sorter}>
                <span classList={{ [styles.active]: props.direction === "asc" }}               >
                    ▲
                </span>
                <span classList={{ [styles.active]: props.direction === "desc" }}               >
                    ▼
                </span>
            </span>
        </Show>
    );
}