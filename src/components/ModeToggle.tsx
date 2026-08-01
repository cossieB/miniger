import type { LucideProps } from "lucide-solid";
import { For, type JSXElement } from "solid-js";
import { Dynamic, Portal } from "solid-js/web";
import titleCase from "~/lib/titleCase";
import { setActiveView } from "~/routes/Movies";
import styles from "./ModeToggle.module.css"

export type P = {
    modes: {
        label: string
        icon: (props: LucideProps) => JSXElement
    }[]
}

export function ModeToggle(props: P) {
    return (
        <Portal>
            <div class={styles.toggle}>
                <ul>
                    <For each={props.modes}>
                        {(mode, i) => <li
                            title={titleCase(mode.label + " view")}
                            onclick={() => setActiveView(i())}
                        >
                            <Dynamic component={mode.icon} />
                        </li>}
                    </For>
                </ul>
            </div>
        </Portal>
    );
}
