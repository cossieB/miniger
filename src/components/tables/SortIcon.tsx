import { Show } from "solid-js";
import styles from "./Table.module.css"

export function SortIcon(props: {
    desc: undefined | boolean;
    sortable: boolean;
}) {
    return (
        <Show when={props.sortable}>
            <span class={styles.sorter}>
                <span classList={{ [styles.active]: props.desc === false }}               >
                    ▲
                </span>
                <span classList={{ [styles.active]: props.desc === true }}               >
                    ▼
                </span>
            </span>
        </Show>
    );
}